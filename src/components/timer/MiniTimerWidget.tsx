"use client";

import Link from "next/link";
import { formatDuration, cn } from "@/lib/utils";
import { useMiniTimer } from "@/hooks/useMiniTimer";

interface MiniTimerWidgetProps {
  /** Standalone embed page — no expand link, compact chrome */
  embed?: boolean;
  /** Called when user closes floating widget */
  onClose?: () => void;
  className?: string;
}

export function MiniTimerWidget({ embed = false, onClose, className }: MiniTimerWidgetProps) {
  const { mounted, state, toggle, reset } = useMiniTimer();

  if (!mounted) return null;

  const content = (
    <div
      className={cn(
        "flex items-center gap-2 sm:gap-3",
        embed ? "flex-col sm:flex-row" : "flex-row"
      )}
    >
      <div className="min-w-[4.5rem] text-center">
        <p className="font-heading text-xl font-semibold tabular-nums tracking-tight text-[var(--text)] sm:text-2xl">
          {formatDuration(state.seconds)}
        </p>
        {state.isRunning && (
          <span className="mt-0.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-pink-500" />
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={toggle}
          className="rounded-full bg-pink-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-pink-400"
        >
          {state.isRunning ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-pink-200 px-2.5 py-1.5 text-xs text-[var(--text-muted)] transition hover:bg-pink-50"
        >
          Reset
        </button>
        {!embed && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1.5 text-xs text-[var(--text-muted)] hover:bg-pink-50"
            title="Close mini timer"
          >
            ✕
          </button>
        )}
      </div>
      {!embed && (
        <Link
          href="/"
          className="hidden text-xs font-medium text-pink-500 hover:text-pink-400 sm:inline"
        >
          Expand
        </Link>
      )}
    </div>
  );

  if (embed) {
    return (
      <div
        className={cn(
          "flex min-h-[120px] items-center justify-center rounded-2xl border border-pink-100 bg-white p-4 shadow-lg shadow-pink-100/50",
          className
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "pointer-events-auto fixed bottom-24 right-4 z-[100] sm:bottom-8 sm:right-8",
        className
      )}
    >
      <div className="rounded-2xl border border-pink-100 bg-white/95 p-3 shadow-[0_8px_32px_rgba(236,72,153,0.15)] backdrop-blur-md ring-1 ring-white/80">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-pink-400">
          Study with me
        </p>
        {content}
      </div>
    </div>
  );
}
