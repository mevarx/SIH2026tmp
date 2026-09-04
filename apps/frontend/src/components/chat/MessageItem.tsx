import { User, Shield, FileText } from 'lucide-react';
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

  // Helper to parse code blocks in markdown: ```language ... ```
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const firstLineBreak = part.indexOf('\n');
        const language = part.slice(3, firstLineBreak).trim() || 'text';
        const code = part.slice(firstLineBreak + 1, -3);
        return (
          <CodeBlock
            key={idx}
            language={language}
            code={code}
            onRunInSandbox={language.includes('py') || language.includes('sh') ? onRunCode : undefined}
          />
        );
      }
      return (
        <span key={idx} className="whitespace-pre-wrap leading-relaxed">
          {part}
        </span>
      );
    });
  };

  return (
    <div
      className={`w-full py-4 flex gap-3 text-sm ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && (
        <div className="h-6 w-6 rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent)] shrink-0 mt-0.5">
          <Shield size={13} />
        </div>
      )}

      <div
        className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
          isUser ? 'items-end' : 'items-start flex-1'
        }`}
      >
        {/* Attached file chip in user bubble */}
        {isUser && message.attachment && (
          <div className="mb-2 flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            <FileText size={12} className="text-[var(--accent)]" />
            <span className="font-medium text-[var(--text-primary)]">{message.attachment.filename}</span>
            <span className="text-[10px]">({Math.round(message.attachment.fileSize / 1024)} KB)</span>
            {message.attachment.ocrApplied && (
              <span className="text-[10px] px-1 py-0.2 rounded bg-[var(--accent-muted)] text-[var(--accent)] font-semibold">
                OCR
              </span>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-[var(--radius-lg)] px-4 py-3 leading-relaxed text-sm ${
            isUser
              ? 'bg-[var(--bg-surface)] border border-[var(--border-medium)] text-[var(--text-primary)]'
              : 'text-[var(--text-primary)] w-full'
          }`}
        >
          {/* Reasoning Chain (<think>) before content if present */}
          {message.reasoning && (
            <ReasoningAccordion reasoning={message.reasoning} />
          )}

          {/* Tool Invocations if present */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="my-2 flex flex-col gap-1">
              {message.toolCalls.map((tool, idx) => (
                <ToolExecutionCard key={idx} tool={tool} onOpenSandbox={onOpenSandbox} />
              ))}
            </div>
          )}

          {/* Primary Text Content */}
          <div className="text-[13.5px] leading-relaxed">
            {renderFormattedContent(message.content)}
          </div>

          {/* Live Typewriter Caret while streaming */}
          {message.status === 'running' && (
            <span className="inline-block h-3.5 w-1.5 ml-1 bg-[var(--accent)] animate-pulse" />
          )}
        </div>

        {/* Message Meta Footer */}
        <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--text-muted)] px-1">
          <span>{message.timestamp}</span>
          {message.durationMs && (
            <span>• {(message.durationMs / 1000).toFixed(2)}s</span>
          )}
          {message.taskId && (
            <span className="font-mono truncate max-w-[120px] text-[var(--text-muted)]">
              • id:{message.taskId}
            </span>
          )}
        </div>
      </div>

      {isUser && (
        <div className="h-6 w-6 rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] shrink-0 mt-0.5">
          <User size={13} />
        </div>
      )}
    </div>
  );
}
