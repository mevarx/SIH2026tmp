import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { TaskMessage } from '../../types/task';
import { MessageItem } from './MessageItem';

interface ChatFeedProps {
  messages: TaskMessage[];
  onSelectPromptChip: (prompt: string) => void;
  onOpenSandbox?: () => void;
  onRunCode?: (code: string) => void;
}

const SUGGESTED_PROMPTS = [
  'Verify loopback network firewall and check for outbound egress leaks.',
  'Analyze the defense procurement PDF and summarize core compliance rules.',
  'Run a sandboxed Python script to calculate cryptographic entropy within jail limits.',
  'Orchestrate a multi-step agent investigation into unauthorized container file access.',
];

export function ChatFeed({
  messages,
  onSelectPromptChip,
  onOpenSandbox,
  onRunCode,
}: ChatFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 w-full overflow-y-auto px-4 sm:px-8 py-6 flex flex-col bg-[var(--bg-surface-quiet)]"
    >
      <div className="mx-auto w-full max-w-3xl flex-1 flex flex-col justify-start">
        {messages.length === 0 ? (
          /* Empty state: 3-4 plain suggested-prompt chips per PRD Section 4.4 */
          <div className="my-auto flex flex-col items-center justify-center text-center py-12">
            <div className="h-9 w-9 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent)] mb-4">
              <Sparkles size={18} />
            </div>

            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">
              Sovereign Console
            </h2>
            <p className="text-xs text-[var(--text-muted)] max-w-md mb-8">
              Select a suggested task or type a query into the composer below.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl text-left">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPromptChip(prompt)}
                  className="p-3 rounded-[var(--radius-md)] bg-[var(--bg-surface)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] leading-relaxed transition-all cursor-pointer select-none group"
                >
                  <span className="text-[var(--text-primary)] font-medium block mb-1">
                    {idx === 0 && 'Audit Air-Gap Telemetry'}
                    {idx === 1 && 'Query Knowledge Base'}
                    {idx === 2 && 'Execute Sandboxed Script'}
                    {idx === 3 && 'Autonomous Multi-Step Agent'}
                  </span>
                  <span className="text-[11px] line-clamp-2">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onOpenSandbox={onOpenSandbox}
              onRunCode={onRunCode}
            />
          ))
        )}
      </div>
    </div>
  );
}
