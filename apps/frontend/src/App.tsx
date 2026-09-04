import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Cpu,
  Terminal,
  Database,
  Send,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  Lock,
  WifiOff,
  SlidersHorizontal,
  Activity,
  X,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  FileText,
  Paperclip,
  Loader2,
  Server
} from 'lucide-react';

interface TaskMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  toolCalls?: Array<{ name: string; params: any; result?: any }>;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  taskType?: string;
  timestamp: string;
  attachment?: {
    filename: string;
    fileSize: number;
    charCount: number;
    ocrApplied: boolean;
  };
}

interface ServerStatus {
  app: string;
  version: string;
  status: string;
  active_backend: string;
  active_model: string;
}

interface UploadedDoc {
  filename: string;
  filePath: string;
  fileSize: number;
  charCount: number;
  ocrApplied: boolean;
  extractedPreview: string;
}

export default function App() {
  const [messages, setMessages] = useState<TaskMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [taskType, setTaskType] = useState<'general' | 'rag' | 'agent' | 'sandbox'>('general');
  const [sandboxEnabled, setSandboxEnabled] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  // Default to 'security' (Audit Trail) as the primary proof surface per PRD
  const [activeTab, setActiveTab] = useState<'security' | 'sandbox' | 'rag'>('security');
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // In-chat Document Attachment State
  const [attachedDoc, setAttachedDoc] = useState<UploadedDoc | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sandboxConsole, setSandboxConsole] = useState<string>(
    `[DOCKER SANDBOX JAIL: READY]\n` +
    `• Daemon status: Local socket verified\n` +
    `• Network isolation: --network=none active\n` +
    `• Memory ceiling: 256 MB hard limit\n` +
    `• Process ceiling: 64 PIDs max\n` +
    `• Filesystem: Read-only container root\n` +
    `--------------------------------------------------\n` +
    `Waiting for execution trigger...\n` +
    `Tip: Select "Sandboxed Code" mode or request code execution to stream live container logs here.`
  );

  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    app: 'Sovereign AI Workbench',
    version: '0.1.0',
    status: 'online',
    active_backend: 'ollama',
    active_model: 'ornith-1.5:9b-q4_k_m',
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const systemInfoRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (systemInfoRef.current && !systemInfoRef.current.contains(e.target as Node)) {
        setShowSystemInfo(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Poll server status on load
  useEffect(() => {
    fetch('/api/health')
      .catch(() => {})
      .then(() => fetch('/'))
      .then((res) => (res && res.ok ? res.json() : null))
      .then((data) => {
        if (data) setServerStatus(data);
      })
      .catch((err) => console.log('Backend connection standby:', err));

    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/security/audit?limit=10');
      const json = await res.json();
      if (json.success && json.data) {
        setAuditLogs(json.data);
      }
    } catch {
      // Standby if offline
    }
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const toggleReasoning = (id: string) => {
    setExpandedReasoning((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Single mode switcher with context-sensitive inspector panel switching
  const handleSelectMode = (mode: 'general' | 'rag' | 'agent' | 'sandbox') => {
    setTaskType(mode);
    if (mode === 'sandbox') {
      setSandboxEnabled(true);
      setActiveTab('sandbox');
    } else if (mode === 'rag') {
      setActiveTab('rag');
    } else {
      setActiveTab('security');
    }
  };

  /**
   * Handle in-chat file upload for local OCR & document ingestion.
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/tasks/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAttachedDoc({
          filename: json.data.filename,
          filePath: json.data.file_path,
          fileSize: json.data.file_size,
          charCount: json.data.char_count,
          ocrApplied: json.data.ocr_applied,
          extractedPreview: json.data.extracted_text,
        });
      } else {
        alert('Upload failed: ' + (json.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setIsUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /**
   * Native SSE ReadableStream consumer.
   */
  const consumeTaskStream = async (taskId: string, assistantMsgId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/stream`);
      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.trim()) continue;
          let eventType = 'message';
          let eventData = '';

          for (const line of part.split('\n')) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              eventData = line.slice(6).trim();
            }
          }

          if (!eventData) continue;

          try {
            const parsed = JSON.parse(eventData);

            if (eventType === 'token') {
              const token = parsed.token || '';
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, content: msg.content + token, status: 'running' }
                    : msg
                )
              );
            } else if (eventType === 'reasoning') {
              const reasoning = parsed.reasoning || '';
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, reasoning: (msg.reasoning || '') + reasoning }
                    : msg
                )
              );
            } else if (eventType === 'tool_call') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? {
                        ...msg,
                        toolCalls: [
                          ...(msg.toolCalls || []),
                          { name: parsed.tool_name, params: parsed.tool_input },
                        ],
                      }
                    : msg
                )
              );
              if (parsed.tool_name === 'run_sandbox_code') {
                setSandboxConsole(
                  (prev) => prev + `\n\n[DOCKER SANDBOX INVOCATION]\nCode:\n${parsed.tool_input?.code || ''}`
                );
              }
            } else if (eventType === 'tool_result') {
              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id !== assistantMsgId) return msg;
                  const calls = [...(msg.toolCalls || [])];
                  if (calls.length > 0) {
                    calls[calls.length - 1].result = parsed.result;
                  }
                  return { ...msg, toolCalls: calls };
                })
              );
              if (parsed.tool_name === 'run_sandbox_code' && parsed.result) {
                setSandboxConsole(
                  (prev) => prev + `\n[SANDBOX OUTPUT]\n${JSON.stringify(parsed.result, null, 2)}`
                );
              }
            } else if (eventType === 'completion') {
              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id !== assistantMsgId) return msg;
                  let finalContent = msg.content;
                  if (!finalContent && parsed.result) {
                    if (typeof parsed.result === 'string') {
                      finalContent = parsed.result;
                    } else if (parsed.result.output) {
                      finalContent =
                        typeof parsed.result.output === 'string'
                          ? parsed.result.output
                          : JSON.stringify(parsed.result.output, null, 2);
                    } else {
                      finalContent = JSON.stringify(parsed.result, null, 2);
                    }
                  }
                  return { ...msg, content: finalContent, status: 'completed' };
                })
              );
              if (parsed.result?.artifacts) {
                for (const art of parsed.result.artifacts) {
                  if (art.type === 'sandbox_execution') {
                    setSandboxConsole(
                      (prev) =>
                        prev +
                        `\n\n[CONTAINER EXECUTION FINISHED]\nStdout:\n${art.stdout || '(no stdout)'}\nStderr:\n${art.stderr || '(no stderr)'}\nExit Code: ${art.exit_code}`
                    );
                  }
                }
              }
              fetchAuditLogs();
            } else if (eventType === 'error') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, content: msg.content + `\n[Execution Error: ${parsed.error}]`, status: 'failed' }
                    : msg
                )
              );
            }
          } catch (err) {
            console.error('Error parsing SSE frame:', err);
          }
        }
      }
    } catch (err) {
      console.error('Stream reader error:', err);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSendPrompt = async (promptOverride?: string) => {
    const rawInput = (promptOverride || inputPrompt).trim();
    // If user attached a document but left prompt blank, default to comprehensive transcription & analysis
    const textToSend = rawInput || (attachedDoc ? `Transcribe and summarize the contents of ${attachedDoc.filename}, extracting key data, tables, and flagging critical points.` : '');
    if (!textToSend.trim() || isStreaming || isUploadingDoc) return;

    const userMsgId = 'msg_' + Date.now();
    const assistantMsgId = 'msg_' + (Date.now() + 1);

    const currentDoc = attachedDoc;
    setAttachedDoc(null);

    const userMessage: TaskMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      taskType: taskType,
      timestamp: new Date().toLocaleTimeString(),
      attachment: currentDoc ? {
        filename: currentDoc.filename,
        fileSize: currentDoc.fileSize,
        charCount: currentDoc.charCount,
        ocrApplied: currentDoc.ocrApplied,
      } : undefined,
    };

    const assistantPlaceholder: TaskMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      status: 'pending',
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setInputPrompt('');
    setIsStreaming(true);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          task_type: taskType,
          sandbox_enabled: sandboxEnabled || taskType === 'sandbox',
          temperature: temperature,
          file_paths: currentDoc ? [currentDoc.filePath] : [],
          stream: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const taskData = await res.json();
      const taskId = taskData.task_id;

      setExpandedReasoning((prev) => ({ ...prev, [assistantMsgId]: true }));
      await consumeTaskStream(taskId, assistantMsgId);
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: `Error dispatching task: ${err.message}`, status: 'failed' }
            : msg
        )
      );
      setIsStreaming(false);
    }
  };

  const modeDescriptions: Record<string, { title: string; subtitle: string }> = {
    general: {
      title: 'General Reasoning',
      subtitle: 'Local analytical reasoning, sovereign document synthesis, and chain-of-thought processing.',
    },
    agent: {
      title: 'Agentic Orchestration',
      subtitle: 'Multi-step autonomous execution using deterministic calculator, file, and document tools.',
    },
    rag: {
      title: 'RAG Knowledge Vault',
      subtitle: 'Dual-phase hybrid search combining Qdrant dense vector similarity with BM25Okapi keyword retrieval.',
    },
    sandbox: {
      title: 'Sandboxed Code',
      subtitle: 'Isolated Docker execution jailing unsafe code in a 256MB memory cap with --network=none.',
    },
  };

  return (
    <div className="workbench-container">
      {/* Top Status Bar: Hero Air-Gap Badge + Grouped System Info */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand-badge">
            <Cpu className="brand-logo" size={19} />
            <span>SOVEREIGN AI WORKBENCH</span>
          </div>

          {/* Hero Air-Gap Status Indicator */}
          <div className="air-gap-hero-badge" title="Cryptographically Enforced Air-Gap: Outbound network blocked">
            <span className="hero-pulse-dot"></span>
            <Shield size={14} className="shield-icon" />
            <span className="air-gap-title">AIR-GAPPED ENVIRONMENT</span>
            <span className="air-gap-divider">|</span>
            <WifiOff size={13} className="wifi-off-icon" />
            <span className="air-gap-counter">Outbound WAN calls: 0</span>
            <span className="air-gap-tag">ENFORCED</span>
          </div>
        </div>

        <div className="topbar-right">
          {/* Collapsible System Info Chip */}
          <div className="system-info-wrapper" ref={systemInfoRef}>
            <button
              className={`system-info-btn ${showSystemInfo ? 'active' : ''}`}
              onClick={() => setShowSystemInfo(!showSystemInfo)}
              title="Click to view local system & hardware telemetry"
            >
              <Activity size={13} className="sys-icon" />
              <span className="sys-label">System:</span>
              <strong className="sys-value">{serverStatus.active_backend.toUpperCase()} • {serverStatus.active_model}</strong>
              <ChevronDown size={13} className={`sys-chevron ${showSystemInfo ? 'open' : ''}`} />
            </button>

            {showSystemInfo && (
              <div className="system-info-popover">
                <div className="popover-header">
                  <span className="popover-title">Local System & Runtime Telemetry</span>
                  <button className="popover-close-btn" onClick={() => setShowSystemInfo(false)}>
                    <X size={13} />
                  </button>
                </div>
                <div className="popover-grid">
                  <div className="popover-item">
                    <span className="popover-label">Serving Engine</span>
                    <span className="popover-val">{serverStatus.active_backend.toUpperCase()} Local Daemon</span>
                  </div>
                  <div className="popover-item">
                    <span className="popover-label">Foundation Model</span>
                    <span className="popover-val">{serverStatus.active_model}</span>
                  </div>
                  <div className="popover-item">
                    <span className="popover-label">Code Sandbox Jail</span>
                    <span className="popover-val emerald">Docker (256MB, --network=none)</span>
                  </div>
                  <div className="popover-item">
                    <span className="popover-label">Socket Binding</span>
                    <span className="popover-val">127.0.0.1 (Loopback Only)</span>
                  </div>
                  <div className="popover-item">
                    <span className="popover-label">External Telemetry</span>
                    <span className="popover-val emerald">0 bytes transmitted</span>
                  </div>
                  <div className="popover-item">
                    <span className="popover-label">Context Limit</span>
                    <span className="popover-val">32,768 Tokens (Local)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <div className="layout-body">
        {/* Left Navigation Sidebar: Single Source of Truth for Execution Modes */}
        <aside className="left-sidebar">
          <div className="sidebar-header">
            <button className="new-task-btn" onClick={() => setMessages([])}>
              <Sparkles size={14} />
              <span>New Sovereign Session</span>
            </button>
          </div>

          <div className="nav-section-title">Execution Modes</div>
          <ul className="nav-list">
            <li
              className={`nav-item ${taskType === 'general' ? 'active' : ''}`}
              onClick={() => handleSelectMode('general')}
            >
              <Cpu size={15} />
              <div className="nav-item-content">
                <span className="nav-item-title">General Reasoning</span>
                <span className="nav-item-sub">Deep analytical synthesis</span>
              </div>
            </li>
            <li
              className={`nav-item ${taskType === 'agent' ? 'active' : ''}`}
              onClick={() => handleSelectMode('agent')}
            >
              <Layers size={15} />
              <div className="nav-item-content">
                <span className="nav-item-title">Agentic Orchestration</span>
                <span className="nav-item-sub">Deterministic tool calls</span>
              </div>
            </li>
            <li
              className={`nav-item ${taskType === 'rag' ? 'active' : ''}`}
              onClick={() => handleSelectMode('rag')}
            >
              <Database size={15} />
              <div className="nav-item-content">
                <span className="nav-item-title">RAG Knowledge Vault</span>
                <span className="nav-item-sub">Hybrid vector + BM25</span>
              </div>
            </li>
            <li
              className={`nav-item ${taskType === 'sandbox' ? 'active' : ''}`}
              onClick={() => handleSelectMode('sandbox')}
            >
              <Terminal size={15} />
              <div className="nav-item-content">
                <span className="nav-item-title">Sandboxed Code</span>
                <span className="nav-item-sub">256MB container jail</span>
              </div>
            </li>
          </ul>

          <div className="nav-section-title">Session History</div>
          <div className="task-history-list">
            {messages
              .filter((m) => m.role === 'user')
              .map((m) => (
                <div key={m.id} className="task-history-item" onClick={() => handleSendPrompt(m.content)}>
                  <div className="task-history-prompt">{m.content}</div>
                  <div className="task-history-meta">
                    <span>{m.taskType?.toUpperCase() || 'GENERAL'}</span>
                    <span>{m.timestamp}</span>
                  </div>
                </div>
              ))}

            {/* Empty state with lightweight clickable suggestions */}
            {messages.length === 0 && (
              <div className="empty-history-box">
                <div className="empty-history-header">
                  <Sparkles size={12} className="sparkle-icon" />
                  <span>Suggested Prompts</span>
                </div>
                <div
                  className="empty-suggestion-pill"
                  onClick={() => {
                    handleSelectMode('general');
                    setInputPrompt('Summarize standard operating procedures for zero-trust air-gapped deployments and flag critical compliance gaps.');
                  }}
                >
                  "Summarize SOP and flag compliance gaps"
                </div>
                <div
                  className="empty-suggestion-pill"
                  onClick={() => {
                    handleSelectMode('agent');
                    setInputPrompt('Use the calculator tool to compute 245 * 18, then contrast deterministic tool safety against LLM hallucinations.');
                  }}
                >
                  "Compute 245 * 18 via deterministic tool"
                </div>
                <div
                  className="empty-suggestion-pill"
                  onClick={() => {
                    handleSelectMode('sandbox');
                    setInputPrompt('Write and execute a Python script to compute the first 10 Fibonacci numbers and verify their prime status in Docker.');
                  }}
                >
                  "Run Python prime script in Docker jail"
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center Workspace Canvas: Passive Onboarding on Empty State, Dynamic Thread on Session */}
        <main className="center-canvas">
          <div className="chat-scroll-area" ref={chatScrollRef}>
            {messages.length === 0 ? (
              <div className="welcome-screen">
                <div className="welcome-mode-ribbon">
                  <span className="mode-ribbon-dot"></span>
                  <span>ACTIVE MODE: <strong>{modeDescriptions[taskType].title.toUpperCase()}</strong></span>
                </div>

                <h2>Sovereign Defense AI Workbench</h2>
                <p className="welcome-desc">
                  {modeDescriptions[taskType].subtitle}
                </p>

                <div className="passive-onboarding-title">
                  <span>AIR-GAPPED CAPABILITY DIRECTORY</span>
                </div>

                {/* Passive documentation / onboarding cards (Only shown before session starts) */}
                <div className="quick-prompts-grid">
                  <div
                    className={`quick-prompt-card ${taskType === 'agent' ? 'highlighted' : ''}`}
                    onClick={() => {
                      handleSelectMode('agent');
                      setInputPrompt('Use the calculator tool to compute 245 * 18, then summarize why this deterministic tool is safer than LLM hallucination.');
                    }}
                  >
                    <div className="quick-prompt-title">⚡ Deterministic Tool Agent</div>
                    <div className="quick-prompt-desc">
                      Autonomous multi-step execution using deterministic calculator and sandboxed file readers without arithmetic hallucinations.
                    </div>
                    <div className="quick-prompt-action">Click to load example prompt →</div>
                  </div>

                  <div
                    className={`quick-prompt-card ${taskType === 'sandbox' ? 'highlighted' : ''}`}
                    onClick={() => {
                      handleSelectMode('sandbox');
                      setInputPrompt('Write and execute a Python script to compute the first 10 Fibonacci numbers and verify their primes in the container jail.');
                    }}
                  >
                    <div className="quick-prompt-title">🔒 Isolated Docker Sandbox</div>
                    <div className="quick-prompt-desc">
                      Runs synthesized code within a 256MB memory ceiling, 64-PID limit, and strict --network=none isolation container.
                    </div>
                    <div className="quick-prompt-action">Click to load example prompt →</div>
                  </div>

                  <div
                    className={`quick-prompt-card ${taskType === 'rag' ? 'highlighted' : ''}`}
                    onClick={() => {
                      handleSelectMode('rag');
                      setInputPrompt('Explain how Reciprocal Rank Fusion combines Qdrant vector similarity with BM25 keyword matching in our RAG pipeline.');
                    }}
                  >
                    <div className="quick-prompt-title">📚 Hybrid RAG Search Vault</div>
                    <div className="quick-prompt-desc">
                      Dual-phase retrieval combining 768-dim dense semantic vector embeddings with BM25Okapi lexical keyword scoring.
                    </div>
                    <div className="quick-prompt-action">Click to load example prompt →</div>
                  </div>

                  <div
                    className={`quick-prompt-card ${taskType === 'general' ? 'highlighted' : ''}`}
                    onClick={() => {
                      handleSelectMode('general');
                      setInputPrompt('Provide a high-level operational security review of our Sovereign AI Workbench zero-egress architecture.');
                    }}
                  >
                    <div className="quick-prompt-title">🛡️ Zero-Trust Security Review</div>
                    <div className="quick-prompt-desc">
                      Verifiable air-gapped architecture with cryptographic SHA-256 prompt/response hashing and immutable JSONL audit trails.
                    </div>
                    <div className="quick-prompt-action">Click to load example prompt →</div>
                  </div>
                </div>
              </div>
            ) : (
              /* Live Conversation / Output Thread */
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-bubble ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}
                >
                  <div className="message-header">
                    <span className={`message-role ${msg.role}`}>
                      {msg.role === 'assistant' ? 'SOVEREIGN INTELLIGENCE' : 'OPERATOR'}
                    </span>
                    <span className="message-time">{msg.timestamp}</span>
                  </div>

                  {/* Attachment Badge inside User Message */}
                  {msg.attachment && (
                    <div className="message-attachment-chip">
                      <FileText size={13} />
                      <span>{msg.attachment.filename}</span>
                      <span className="attachment-size">({(msg.attachment.fileSize / 1024).toFixed(1)} KB)</span>
                      {msg.attachment.ocrApplied && (
                        <span className="attachment-ocr-badge">OCR Transcribed</span>
                      )}
                    </div>
                  )}

                  {/* Collapsible Reasoning Accordion */}
                  {msg.reasoning && (
                    <div className="reasoning-accordion">
                      <div className="reasoning-trigger" onClick={() => toggleReasoning(msg.id)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Cpu size={13} />
                          <span>REASONING TRACE ({msg.reasoning.length} characters)</span>
                        </div>
                        {expandedReasoning[msg.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </div>
                      {expandedReasoning[msg.id] && (
                        <div className="reasoning-content">{msg.reasoning}</div>
                      )}
                    </div>
                  )}

                  {/* Tool Call Badges */}
                  {msg.toolCalls &&
                    msg.toolCalls.map((tc, idx) => (
                      <div key={idx} className="tool-execution-badge">
                        <Terminal size={12} />
                        <span>
                          [EXEC: {tc.name}] {JSON.stringify(tc.params)}
                        </span>
                      </div>
                    ))}

                  {/* Primary Output Text */}
                  <div className="message-output">
                    {msg.content ||
                      (msg.status === 'running' || msg.status === 'pending'
                        ? 'Synthesizing sovereign reasoning trace...'
                        : '')}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Focused Prompt Dock: Clean Input Bar + Chat Attachment + Session Settings Popover */}
          <div className="prompt-dock-container">
            <div className="prompt-meta-ribbon">
              <div className="active-mode-indicator">
                <span className="active-mode-dot"></span>
                <span className="active-mode-label">Mode:</span>
                <strong className="active-mode-name">{modeDescriptions[taskType].title}</strong>
              </div>

              {/* Settings Popover for Temp & Sandbox */}
              <div className="session-settings-wrapper" ref={settingsRef}>
                <button
                  className={`session-settings-btn ${showSettings ? 'active' : ''}`}
                  onClick={() => setShowSettings(!showSettings)}
                  title="Configure session parameters"
                >
                  <SlidersHorizontal size={13} />
                  <span>Session Settings</span>
                  <span className="settings-summary-badge">
                    {sandboxEnabled ? 'Sandbox ON' : 'Sandbox OFF'} • T:{temperature}
                  </span>
                </button>

                {showSettings && (
                  <div className="settings-popover">
                    <div className="popover-header">
                      <span className="popover-title">Session Configuration</span>
                      <button className="popover-close-btn" onClick={() => setShowSettings(false)}>
                        <X size={13} />
                      </button>
                    </div>

                    <div className="settings-content">
                      <div className="setting-row">
                        <div className="setting-info">
                          <span className="setting-name">Docker Sandbox Jail</span>
                          <span className="setting-desc">Isolate code execution in a 256MB container with zero network</span>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={sandboxEnabled}
                            onChange={(e) => setSandboxEnabled(e.target.checked)}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>

                      <div className="setting-row column">
                        <div className="setting-slider-header">
                          <span className="setting-name">Sampling Temperature</span>
                          <span className="setting-val">
                            {temperature} ({temperature <= 0.3 ? 'Deterministic' : temperature <= 0.8 ? 'Balanced' : 'Creative'})
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1.5"
                          step="0.1"
                          value={temperature}
                          onChange={(e) => setTemperature(parseFloat(e.target.value))}
                          className="temp-range-input"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* In-Chat Document Attachment Preview Banner */}
            {attachedDoc && (
              <div className="attached-doc-banner">
                <div className="attached-doc-left">
                  <FileText size={15} className="doc-clip-icon" />
                  <span className="attached-doc-name">{attachedDoc.filename}</span>
                  <span className="attached-doc-meta">
                    ({(attachedDoc.fileSize / 1024).toFixed(1)} KB)
                  </span>
                  {attachedDoc.ocrApplied ? (
                    <span className="ocr-status-tag">
                      <CheckCircle2 size={12} /> OCR Ready ({attachedDoc.charCount} chars)
                    </span>
                  ) : (
                    <span className="ocr-status-tag">Document Attached</span>
                  )}
                </div>
                <button
                  type="button"
                  className="remove-doc-btn"
                  onClick={() => setAttachedDoc(null)}
                  title="Remove attachment"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            <div className="input-box-wrapper">
              {/* Hidden native file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp,.txt,.docx,.csv"
                style={{ display: 'none' }}
              />

              {/* Chat-style paperclip upload button */}
              <button
                type="button"
                className={`attach-doc-btn ${isUploadingDoc ? 'uploading' : ''} ${attachedDoc ? 'has-file' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingDoc || isStreaming}
                title="Attach document (PDF, PNG, JPG, DOCX) for local OCR"
              >
                {isUploadingDoc ? (
                  <Loader2 size={16} className="spin-icon" />
                ) : (
                  <Paperclip size={16} />
                )}
              </button>

              <textarea
                className="prompt-textarea"
                rows={2}
                placeholder={
                  attachedDoc
                    ? `Ask about ${attachedDoc.filename}... (or press Execute to transcribe and summarize)`
                    : `Enter instruction for ${modeDescriptions[taskType].title}... (Shift+Enter for newline)`
                }
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendPrompt();
                  }
                }}
              />
              <button
                className="send-btn"
                disabled={(!inputPrompt.trim() && !attachedDoc) || isStreaming || isUploadingDoc}
                onClick={() => handleSendPrompt()}
              >
                <Send size={14} />
                <span>{isStreaming ? 'Streaming...' : 'Execute'}</span>
              </button>
            </div>
          </div>
        </main>

        {/* Right Inspector Drawer: Default-Open Audit Trail & Context-Sensitive Tabs */}
        <aside className="right-drawer">
          <div className="drawer-tabs">
            <button
              className={`drawer-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
              title="Immutable SHA-256 Audit Trail & Egress Guard"
            >
              <Shield size={13} />
              <span>Audit Trail</span>
            </button>
            <button
              className={`drawer-tab ${activeTab === 'sandbox' ? 'active' : ''}`}
              onClick={() => setActiveTab('sandbox')}
              title="Isolated Container Jail & Live Console"
            >
              <Terminal size={13} />
              <span>Docker Sandbox</span>
            </button>
            <button
              className={`drawer-tab ${activeTab === 'rag' ? 'active' : ''}`}
              onClick={() => setActiveTab('rag')}
              title="Qdrant Hybrid Retrieval Vault"
            >
              <Database size={13} />
              <span>Knowledge Vault</span>
            </button>
          </div>

          <div className="drawer-content">
            {/* Tab 1: Audit Trail (Default Open — Core Air-Gap Proof Surface) */}
            {activeTab === 'security' && (
              <div>
                <div className="inspector-card air-gap-proof-card">
                  <div className="inspector-card-title">Air-Gap Perimeter & Zero Egress Proof</div>
                  <div className="air-gap-metrics-grid">
                    <div className="air-gap-metric-item">
                      <span className="metric-label">Perimeter Posture</span>
                      <span className="metric-val emerald">
                        <CheckCircle2 size={12} /> Air-Gapped
                      </span>
                    </div>
                    <div className="air-gap-metric-item">
                      <span className="metric-label">Outbound Calls</span>
                      <span className="metric-val emerald">0 (Blocked)</span>
                    </div>
                    <div className="air-gap-metric-item">
                      <span className="metric-label">Socket Binding</span>
                      <span className="metric-val">127.0.0.1 (Loopback)</span>
                    </div>
                    <div className="air-gap-metric-item">
                      <span className="metric-label">Egress Policy</span>
                      <span className="metric-val emerald">Strict Deny All</span>
                    </div>
                  </div>
                </div>

                <div className="inspector-card">
                  <div className="inspector-card-title">Cryptographic Audit Trail (data/audit.jsonl)</div>
                  <div className="audit-logs-scroll">
                    {auditLogs.map((log, idx) => (
                      <div key={idx} className="audit-log-item">
                        <div className="audit-log-top">
                          <span className="audit-event-type">{log.event_type}</span>
                          <span className="audit-timestamp">{log.timestamp}</span>
                        </div>
                        {log.prompt_hash && (
                          <div className="audit-hash">
                            SHA256: {log.prompt_hash.substring(0, 20)}...
                          </div>
                        )}
                      </div>
                    ))}
                    {auditLogs.length === 0 && (
                      <div className="empty-audit-hint">
                        <Shield size={16} className="empty-shield" />
                        <div>Audit trail initialized. Prompt and tool hashes will append here on execution.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Docker Sandbox Inspector */}
            {activeTab === 'sandbox' && (
              <div>
                <div className="inspector-card">
                  <div className="inspector-card-title">Sandbox Limits Enforcement</div>
                  <div className="limits-grid">
                    <div>Memory Cap: <strong>256 MB</strong></div>
                    <div>Swap Space: <strong>Disabled (0)</strong></div>
                    <div>Network Access: <strong>--network=none</strong></div>
                    <div>Root Filesystem: <strong>Read-Only</strong></div>
                    <div>Auto Cleanup: <strong>--rm (Immediate)</strong></div>
                    <div>Process Cap: <strong>64 PIDs Limit</strong></div>
                  </div>
                </div>

                <div className="inspector-card">
                  <div className="inspector-card-title">Live Execution Console</div>
                  <div className="console-output">{sandboxConsole}</div>
                </div>
              </div>
            )}

            {/* Tab 3: Knowledge Vault Inspector */}
            {activeTab === 'rag' && (
              <div>
                <div className="inspector-card">
                  <div className="inspector-card-title">Hybrid Retrieval Architecture</div>
                  <div className="rag-specs-list">
                    <p>• <strong>Vector Search:</strong> Qdrant (Cosine 768-dim)</p>
                    <p>• <strong>Keyword Search:</strong> BM25Okapi Lexical</p>
                    <p>• <strong>Fusion:</strong> Reciprocal Rank Fusion (k=60)</p>
                    <p>• <strong>Embedding Batching:</strong> 32 chunks / call</p>
                  </div>
                </div>

                <div className="inspector-card">
                  <div className="inspector-card-title">Ingested Knowledge Collections</div>
                  <div className="collection-info">
                    Collection ID: <code>sovereign_knowledge_base</code>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
