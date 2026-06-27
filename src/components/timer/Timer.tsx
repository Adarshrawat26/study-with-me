"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatDuration } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "next-auth/react";
import { useMotivationalQuote } from "@/hooks/useMotivationalQuote";
import { useMiniTimerFloating } from "@/components/providers/MiniTimerProvider";
import { writeMiniTimerState } from "@/lib/mini-timer-store";

type TimerMode = "pomodoro" | "stopwatch" | "countdown" | "focus";

interface Label {
  id: string;
  name: string;
  color: string;
}

interface TimerProps {
  initialMode?: TimerMode;
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
  const { toast } = useToast();

  const [mode, setMode] = useState<TimerMode>(initialMode);
  const [seconds, setSeconds] = useState(initialDuration);
  const [initialSeconds, setInitialSeconds] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [workDuration, setWorkDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const { enableFloating } = useMiniTimerFloating();
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const quote = useMotivationalQuote();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number>(0);

  // Load user timer defaults
  useEffect(() => {
    if (!session) return;
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings;
        if (!s) return;
        if (initialMode === "pomodoro" && initialDuration === 25 * 60) {
          setMode(s.defaultMode as TimerMode);
          setWorkDuration(s.workDuration ?? 1500);
          setBreakDuration(s.breakDuration ?? 300);
          setAutoStartBreaks(s.autoStartBreaks ?? false);
          const dur = s.defaultDuration ?? 1500;
          setSeconds(dur);
          setInitialSeconds(dur);
        }
      })
      .catch(() => {});
  }, [session, initialMode, initialDuration]);

  // Fetch labels for logged-in users
  useEffect(() => {
    if (!session) return;
    fetch("/api/onboarding", { method: "POST" }).catch(() => {});
    fetch("/api/labels")
      .then((r) => r.json())
      .then((data) => setLabels(data.labels ?? []))
      .catch(() => {});
  }, [session]);

  const saveSession = useCallback(
    async (duration: number) => {
      if (!session) {
        toast("Sign in to save your study sessions", "info");
        return;
      }
      if (duration < 60) {
        toast("Study at least 1 minute to save a session", "info");
        return;
      }
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            duration,
            mode,
            labelId: selectedLabel,
          }),
        });
        if (res.status === 401) {
          toast("Sign in to save sessions", "error");
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          toast(
            typeof data.error === "string" ? data.error : "Failed to save session",
            "error"
          );
          return;
        }
        toast("Session saved! Check your dashboard.", "success");
      } catch {
        toast("Failed to save session", "error");
      }
    },
    [session, mode, selectedLabel, toast]
  );

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    if (mode === "pomodoro") {
      if (!isBreak) {
        const studied = workDuration;
        saveSession(studied);
        setIsBreak(true);
        setSeconds(breakDuration);
        setInitialSeconds(breakDuration);
        if (autoStartBreaks) setIsRunning(true);
        toast("Work session complete! Take a break.", "info");
      } else {
        setIsBreak(false);
        setSeconds(workDuration);
        setInitialSeconds(workDuration);
        toast("Break over! Back to work.", "info");
      }
    } else if (mode === "countdown" || mode === "focus") {
      const studied = initialSeconds;
      saveSession(studied);
      toast("Countdown complete!", "success");
    }
  }, [mode, isBreak, workDuration, breakDuration, autoStartBreaks, initialSeconds, saveSession, toast]);

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (mode === "stopwatch") {
            return prev + 1;
          }
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, handleTimerComplete]);

  const toggleTimer = useCallback(() => {
    if (!isRunning && mode !== "stopwatch" && seconds === initialSeconds) {
      sessionStartRef.current = Date.now();
    }
    setIsRunning((r) => !r);
  }, [isRunning, mode, seconds, initialSeconds]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsBreak(false);
    if (mode === "stopwatch" && seconds >= 60) {
      saveSession(seconds);
    }
    setSeconds(mode === "stopwatch" ? 0 : initialSeconds);
  }, [mode, seconds, initialSeconds, saveSession]);

  const stopAndSave = useCallback(() => {
    if (mode === "stopwatch" && seconds >= 60) {
      saveSession(seconds);
    } else if (mode === "countdown" || mode === "focus") {
      const studied = initialSeconds - seconds;
      if (studied >= 60) saveSession(studied);
    } else if (mode === "pomodoro" && !isBreak) {
      const studied = workDuration - seconds;
      if (studied >= 60) saveSession(studied);
    }
    setIsRunning(false);
  }, [mode, isBreak, workDuration, seconds, initialSeconds, saveSession]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") { e.preventDefault(); toggleTimer(); }
      if (e.code === "KeyR") resetTimer();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleTimer, resetTimer]);

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setIsBreak(false);
    setMode(newMode);
    if (newMode === "stopwatch") {
      setSeconds(0);
      setInitialSeconds(0);
    } else if (newMode === "focus") {
      setSeconds(50 * 60);
      setInitialSeconds(50 * 60);
    } else if (newMode === "pomodoro") {
      setSeconds(workDuration);
      setInitialSeconds(workDuration);
    } else {
      setSeconds(initialDuration);
      setInitialSeconds(initialDuration);
    }
  };

  const setDuration = (secs: number) => {
    setSeconds(secs);
    setInitialSeconds(secs);
    setIsRunning(false);
    if (mode === "pomodoro") setWorkDuration(secs);
  };

  const enterMiniMode = useCallback(() => {
    writeMiniTimerState({
      seconds,
      initialSeconds,
      isRunning,
      mode,
      isBreak,
      workDuration,
      updatedAt: Date.now(),
    });
    enableFloating();
  }, [seconds, initialSeconds, isRunning, mode, isBreak, workDuration, enableFloating]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full">
      <div className="relative z-[1] mx-auto flex w-full max-w-xl flex-col items-center px-5 py-12">
        <div className="timer-panel">
          {/* Mode tabs */}
          <div className="mb-10 flex w-full max-w-sm rounded-[var(--radius)] border border-[var(--border-subtle)] bg-[var(--surface)] p-1">
        {(["pomodoro", "stopwatch", "countdown", "focus"] as TimerMode[]).map((m) => (
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

      {/* Pomodoro settings */}
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
                if (!isBreak) { setSeconds(mins * 60); setInitialSeconds(mins * 60); }
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
          <label className="flex items-center gap-2 cursor-pointer">
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

      {/* Break indicator */}
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

          {/* Timer display */}
          <motion.div
            key={seconds}
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            className="timer-display mb-8"
          >
            {formatDuration(seconds)}
          </motion.div>

      {/* Quick duration chips */}
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

          {/* Controls */}
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

        {session && isRunning && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={stopAndSave} className="btn-secondary px-5 py-3 text-xs">
            Save
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
              <option key={l.id} value={l.id}>{l.name}</option>
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
              onClick={enterMiniMode}
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
              <Link href="/flip-clock" className="pill text-xs">Flip clock</Link>
              <Link href="/focus" className="pill text-xs">Focus mode</Link>
              <Link href="/study-with-me" className="pill text-xs">Study with me</Link>
              <Link href="/exams" className="pill text-xs">Exam timers</Link>
            </div>
          </div>

          {presetLabel && (
            <p className="mt-6 text-sm text-[var(--primary)]">{presetLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}
