"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatDuration } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useMotivationalQuote } from "@/hooks/useMotivationalQuote";
import { useGlobalTimer } from "@/components/providers/GlobalTimerProvider";
import type { MiniTimerMode } from "@/lib/mini-timer-store";

interface Label {
  id: string;
  name: string;
  color: string;
}

interface TimerProps {
  initialMode?: MiniTimerMode;
  initialDuration?: number;
  presetLabel?: string;
}

const QUICK_DURATIONS = [
  { label: "15m", seconds: 15 * 60 },
  { label: "25m", seconds: 25 * 60 },
  { label: "45m", seconds: 45 * 60 },
  { label: "1h", seconds: 60 * 60 },
  { label: "2h", seconds: 2 * 60 * 60 },
];

export function Timer({
  initialMode = "pomodoro",
  initialDuration = 25 * 60,
  presetLabel,
}: TimerProps) {
  const { data: session } = useSession();
  const quote = useMotivationalQuote();

  const {
    state,
    toggle,
    reset,
    stopAndSave,
    setMode,
    setDuration,
    setWorkDuration,
    setBreakDuration,
    setAutoStartBreaks,
    setSelectedLabel,
    applySettings,
    elapsedSeconds,
    showSave,
    enableFloating,
  } = useGlobalTimer();

  const {
    mode,
    seconds,
    initialSeconds,
    isRunning,
    isBreak,
    workDuration,
    breakDuration,
    autoStartBreaks,
    selectedLabel,
  } = state;

  const [labels, setLabels] = useState<Label[]>([]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings;
        if (!s) return;
        if (initialMode === "pomodoro" && initialDuration === 25 * 60) {
          applySettings(s);
        }
      })
      .catch(() => {});
  }, [session, initialMode, initialDuration, applySettings]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/onboarding", { method: "POST" }).catch(() => {});
    fetch("/api/labels")
      .then((r) => r.json())
      .then((data) => setLabels(data.labels ?? []))
      .catch(() => {});
  }, [session]);

  const toggleTimer = useCallback(() => toggle(), [toggle]);

  const resetTimer = useCallback(() => reset(), [reset]);

  const switchMode = (newMode: MiniTimerMode) => {
    if (newMode === "countdown" && initialDuration !== 25 * 60) {
      setMode(newMode);
      setDuration(initialDuration);
      return;
    }
    setMode(newMode);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        toggleTimer();
      }
      if (e.code === "KeyR") resetTimer();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleTimer, resetTimer]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full">
      <div className="relative z-[1] mx-auto flex w-full max-w-xl flex-col items-center px-5 py-12">
        <div className="timer-panel">
          <div className="mb-10 flex w-full max-w-sm rounded-[var(--radius)] border border-[var(--border-subtle)] bg-[var(--surface)] p-1">
            {(["pomodoro", "stopwatch", "countdown", "focus"] as MiniTimerMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={cn(
                  "flex-1 rounded-[calc(var(--radius)-4px)] py-2.5 text-sm font-medium capitalize transition-all",
                  mode === m
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                )}
              >
                {m}
              </button>
            ))}
          </div>

          {mode === "pomodoro" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--text-muted)]"
            >
              <label className="flex items-center gap-2">
                Work
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={Math.floor(workDuration / 60)}
                  onChange={(e) => {
                    const mins = parseInt(e.target.value) || 25;
                    setWorkDuration(mins * 60);
                  }}
                  className="input-field w-16 text-center"
                />
                min
              </label>
              <label className="flex items-center gap-2">
                Break
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={Math.floor(breakDuration / 60)}
                  onChange={(e) => {
                    const mins = parseInt(e.target.value) || 5;
                    setBreakDuration(mins * 60);
                  }}
                  className="input-field w-16 text-center"
                />
                min
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoStartBreaks}
                  onChange={(e) => setAutoStartBreaks(e.target.checked)}
                  className="accent-[var(--primary)]"
                />
                Auto-start breaks
              </label>
            </motion.div>
          )}

          <AnimatePresence>
            {isBreak && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 w-full text-center text-xs font-medium uppercase tracking-widest text-secondary"
              >
                Break time
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div
            key={seconds}
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            className="timer-display mb-8"
          >
            {formatDuration(seconds)}
          </motion.div>

          {mode !== "stopwatch" && (
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {QUICK_DURATIONS.map(({ label, seconds: secs }) => (
                <button
                  key={label}
                  onClick={() => setDuration(secs)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-xs font-medium transition-all active:scale-95",
                    initialSeconds === secs
                      ? "border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)]"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]/50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            <motion.button whileTap={{ scale: 0.97 }} onClick={resetTimer} className="btn-secondary px-5 py-3">
              Reset
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={toggleTimer}
              className="min-w-[120px] rounded-[var(--radius)] bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] px-8 py-3.5 text-sm font-semibold text-white"
            >
              {isRunning ? "Pause" : "Start"}
            </motion.button>

            {showSave && (
              <motion.button whileTap={{ scale: 0.97 }} onClick={stopAndSave} className="btn-secondary px-5 py-3 text-xs">
                Save {elapsedSeconds >= 60 ? `(${Math.floor(elapsedSeconds / 60)}m)` : ""}
              </motion.button>
            )}
          </div>

          {session && labels.length > 0 && (
            <div className="mb-8 w-full max-w-xs">
              <label className="stat-label mb-2 block text-center">Subject</label>
              <select
                value={selectedLabel ?? ""}
                onChange={(e) => setSelectedLabel(e.target.value || null)}
                className="input-field text-sm"
              >
                <option value="">No label</option>
                {labels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <p className="mb-6 max-w-sm text-center text-sm leading-relaxed text-[var(--text-muted)]">
            &ldquo;{quote}&rdquo;
          </p>

          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={enableFloating}
              className="text-xs font-medium text-pink-500 underline-offset-4 hover:text-pink-400 hover:underline"
            >
              Mini mode — float on any page
            </button>
            <Link href="/mini" className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
              Embed on other sites →
            </Link>
          </div>

          <div className="mt-8 w-full border-t border-[var(--border-subtle)] pt-6">
            <p className="stat-label mb-3">Free tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/flip-clock" className="pill text-xs">
                Flip clock
              </Link>
              <Link href="/focus" className="pill text-xs">
                Focus mode
              </Link>
              <Link href="/study-with-me" className="pill text-xs">
                Study with me
              </Link>
              <Link href="/exams" className="pill text-xs">
                Exam timers
              </Link>
            </div>
          </div>

          {presetLabel && <p className="mt-6 text-sm text-[var(--primary)]">{presetLabel}</p>}
        </div>
      </div>
    </div>
  );
}
