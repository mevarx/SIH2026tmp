import { useState } from 'react';
import { User, Shield, FileText, Copy, Check, Lock, Sparkles } from 'lucide-react';
import { TaskMessage } from '../../types/task';
import { ReasoningAccordion } from './ReasoningAccordion';
import { ToolExecutionCard } from './ToolExecutionCard';
import { CodeBlock } from './CodeBlock';

interface MessageItemProps {
  message: TaskMessage;
  onOpenSandbox?: () => void;
  onRunCode?: (code: string) => void;
}

export function MessageItem({ message, onOpenSandbox, onRunCode }: MessageItemProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to parse markdown text, inline code, and code blocks
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    // Split by fenced code blocks: ```lang ... ```
    const segments = content.split(/(```[\s\S]*?```)/g);

    return segments.map((segment, segIdx) => {
      if (segment.startsWith('```') && segment.endsWith('```')) {
        const firstLineBreak = segment.indexOf('\n');
        const language = segment.slice(3, firstLineBreak).trim() || 'text';
        const code = segment.slice(firstLineBreak + 1, -3);
        return (
          <CodeBlock
            key={segIdx}
            language={language}
            code={code}
            onRunInSandbox={language.includes('py') || language.includes('sh') ? onRunCode : undefined}
          />
        );
      }

      // Format lines, bolding, inline code, headers, and bullet points
      const lines = segment.split('\n');
      return (
        <div key={segIdx} className="space-y-2">
          {lines.map((line, lineIdx) => {
            const trimmed = line.trim();
            if (!trimmed) {
              return <div key={lineIdx} className="h-1.5" />;
            }

            // Heading 2 or 3
            if (trimmed.startsWith('### ')) {
              return (
                <h4 key={lineIdx} className="text-sm font-semibold text-white tracking-tight mt-3 mb-1">
                  {formatInline(trimmed.slice(4))}
                </h4>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h3 key={lineIdx} className="text-base font-semibold text-white tracking-tight mt-4 mb-1.5 border-b border-white/5 pb-1">
                  {formatInline(trimmed.slice(3))}
                </h3>
              );
            }

            // Bullet points
            if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              return (
                <div key={lineIdx} className="flex items-start gap-2.5 pl-1.5 my-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0 mt-2" />
                  <span className="leading-relaxed text-white/90 text-[13.5px]">
                    {formatInline(trimmed.slice(2))}
                  </span>
                </div>
              );
            }

            return (
              <p key={lineIdx} className="leading-relaxed text-white/90 text-[13.5px]">
                {formatInline(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  // Helper for inline `code` and **bold**
  const formatInline = (text: string) => {
    // Split by inline code: `...`
    const parts = text.split(/(`[^`]+`)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={pIdx}
            className="px-1.5 py-0.5 rounded bg-white/[0.07] border border-white/10 font-mono text-xs text-[var(--accent)] select-all"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // Handle bold **text**
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return (
            <strong key={`${pIdx}-${bIdx}`} className="font-semibold text-white">
              {bPart.slice(2, -2)}
            </strong>
          );
        }
        return bPart;
      });
    });
  };

  return (
    <div
      className={`w-full py-5 flex gap-3 text-sm transition-all duration-200 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="h-7 w-7 rounded-[var(--radius-md)] bg-[#0E0F17] border border-white/10 flex items-center justify-center text-[var(--accent)] shadow-sm shrink-0 mt-0.5">
          <Shield size={14} />
        </div>
      )}

      <div
        className={`flex flex-col max-w-[88%] sm:max-w-[78%] ${
          isUser ? 'items-end' : 'items-start flex-1'
        }`}
      >
        {/* Attached file chip in user bubble */}
        {isUser && message.attachment && (
          <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] bg-[#0E0F17] border border-white/10 text-xs text-[var(--text-muted)] shadow-sm">
            <FileText size={13} className="text-[var(--accent)]" />
            <span className="font-medium text-white">{message.attachment.filename}</span>
            <span className="text-[10px] text-white/50">({Math.round(message.attachment.fileSize / 1024)} KB)</span>
            {message.attachment.ocrApplied && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--accent-muted)] text-[var(--accent)] font-semibold border border-[var(--accent-border)]">
                OCR
              </span>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-[var(--radius-lg)] transition-all ${
            isUser
              ? 'px-4 py-3 bg-[#0E0F17] border border-white/10 text-white shadow-sm'
              : 'px-5 py-4 bg-[#090A10] border border-white/[0.08] text-white w-full shadow-lg'
          }`}
        >
          {/* Header bar on Assistant responses matching Hero theme */}
          {!isUser && (
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white tracking-tight flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[var(--accent)]" />
                  <span>Sovereign Assistant</span>
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[rgba(var(--status-ok-rgb),0.1)] text-[var(--status-ok)] border border-[rgba(var(--status-ok-rgb),0.2)]">
                  <Lock size={10} />
                  <span>0 Egress</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {message.status === 'running' && (
                  <span className="text-[11px] text-[var(--accent)] flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-ping" />
                    <span>Streaming local reasoning...</span>
                  </span>
                )}
                <button
                  onClick={handleCopyMessage}
                  className="p-1 rounded text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title="Copy response"
                >
                  {copied ? <Check size={13} className="text-[var(--status-ok)]" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          )}

          {/* Reasoning Chain (<think>) before content */}
          {message.reasoning && (
            <ReasoningAccordion reasoning={message.reasoning} />
          )}

          {/* Tool Invocations if present */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="my-2.5 flex flex-col gap-1.5">
              {message.toolCalls.map((tool, idx) => (
                <ToolExecutionCard key={idx} tool={tool} onOpenSandbox={onOpenSandbox} />
              ))}
            </div>
          )}

          {/* Primary Text Content */}
          <div className="leading-relaxed">
            {renderFormattedContent(message.content)}
          </div>

          {/* Live Typewriter Caret while streaming */}
          {message.status === 'running' && (
            <span className="inline-block h-3.5 w-1.5 ml-1 bg-[var(--accent)] animate-pulse" />
          )}
        </div>

        {/* Message Meta Footer */}
        <div className="mt-1.5 flex items-center gap-2.5 text-[10px] text-white/40 px-1">
          <span>{message.timestamp}</span>
          {message.durationMs && (
            <span>• {(message.durationMs / 1000).toFixed(2)}s runtime</span>
          )}
          {message.taskId && (
            <span className="font-mono truncate max-w-[140px] text-white/40">
              • SHA-256: {message.taskId.slice(0, 10)}...
            </span>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="h-7 w-7 rounded-[var(--radius-md)] bg-[#0E0F17] border border-white/10 flex items-center justify-center text-white/70 shadow-sm shrink-0 mt-0.5">
          <User size={14} />
        </div>
      )}
    </div>
  );
}
