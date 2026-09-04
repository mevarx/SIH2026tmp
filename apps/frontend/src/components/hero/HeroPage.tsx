import { ArrowRight, Database, Layers, Terminal, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { HeroBackground } from './HeroBackground';

interface HeroPageProps {
  onEnter: () => void;
}

export function HeroPage({ onEnter }: HeroPageProps) {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-y-auto bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Isolated swappable hero background */}
      <HeroBackground variant="network-grid" />

      {/* Main Centered Hero Viewport */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 pt-24 pb-16 flex flex-col items-center text-center">
        {/* Headline + One-line subhead per PRD Section 3.2 (No eyebrow label, no tracked-out caps) */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] max-w-3xl leading-[1.12]">
          Sovereign intelligence for high-stakes environments.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[var(--text-muted)] max-w-2xl font-normal leading-relaxed">
          Local reasoning, hybrid document retrieval, and sandboxed execution running entirely inside your perimeter.
        </p>

        {/* Primary CTA + Single Live Credibility Stat */}
        <div className="mt-10 flex flex-col items-center gap-8">
          <Button
            variant="accent"
            size="lg"
            onClick={onEnter}
            className="px-8 py-3.5 text-base font-semibold rounded-[var(--radius-lg)] shadow-lg hover:shadow-[0_0_30px_rgba(76,201,192,0.35)] transition-all cursor-pointer"
          >
            <span>Enter Workbench</span>
            <ArrowRight size={18} />
          </Button>

          {/* Single live credibility stat — large counter, not a badge wall */}
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] font-mono">
              0
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium mt-1">
              outbound requests, always
            </span>
          </div>
        </div>
      </div>

      {/* Below the fold: 4 capability entries without card boxes, whitespace separated per PRD Section 3.2 */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-20 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-left">
          <div className="flex flex-col">
            <div className="text-[var(--text-muted)] mb-3">
              <Database size={20} strokeWidth={1.5} />
            </div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">
              Hybrid Retrieval
            </h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed font-normal">
              Combines dense vectors and BM25 keywords over sensitive local documents.
            </p>
          </div>

          <div className="flex flex-col">
            <div className="text-[var(--text-muted)] mb-3">
              <Layers size={20} strokeWidth={1.5} />
            </div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">
              Autonomous Agency
            </h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed font-normal">
              Multi-step reasoning loops with deterministic tool checks and self-correction.
            </p>
          </div>

          <div className="flex flex-col">
            <div className="text-[var(--text-muted)] mb-3">
              <Terminal size={20} strokeWidth={1.5} />
            </div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">
              Docker Sandbox Jail
            </h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed font-normal">
              Executes code inside hardware-constrained containers with zero network access.
            </p>
          </div>

          <div className="flex flex-col">
            <div className="text-[var(--text-muted)] mb-3">
              <Shield size={20} strokeWidth={1.5} />
            </div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">
              Cryptographic Audit
            </h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed font-normal">
              Immutable SHA-256 event log guaranteeing transparent chain of custody.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
