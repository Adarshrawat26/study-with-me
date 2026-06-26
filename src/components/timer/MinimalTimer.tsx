"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDuration } from "@/lib/utils";
import { TimerSceneBackground } from "@/components/timer/scenes/TimerSceneBackground";
import {
  TIMER_SCENES,
  SCENE_STORAGE_KEY,
  sceneToAudio,
  type TimerSceneId,
} from "@/lib/timer-scenes";
import { useAmbientAudio } from "@/hooks/useAmbientAudio";
import { useMotivationalQuote } from "@/hooks/useMotivationalQuote";
import { cn } from "@/lib/utils";

/** Distraction-free minimalist timer — large digits, no clutter. */
export function MinimalTimer({ defaultMinutes = 25 }: { defaultMinutes?: number }) {
  const [seconds, setSeconds] = useState(defaultMinutes * 60);
  const [initialSeconds, setInitialSeconds] = useState(defaultMinutes * 60);
  const [running, setRunning] = useState(false);
  const [muted, setMuted] = useState(false);
  const [scene, setScene] = useState<TimerSceneId>("none");
  const [showPanel, setShowPanel] = useState(false);
  const quote = useMotivationalQuote();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useAmbientAudio(sceneToAudio(scene), muted);

  useEffect(() => {
    const saved = localStorage.getItem(SCENE_STORAGE_KEY) as TimerSceneId | null;
    if (saved && TIMER_SCENES.some((s) => s.id === saved)) setScene(saved);
  }, []);

  const tick = useCallback(() => {
    setSeconds((s) => {
      if (s <= 1) {
        setRunning(false);
        return 0;
      }
      return s - 1;
    });
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, tick]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") { e.preventDefault(); setRunning((r) => !r); }
      if (e.code === "KeyR") { setRunning(false); setSeconds(initialSeconds); }
      if (e.code === "KeyM") setMuted((m) => !m);
      if (e.code === "Escape") setShowPanel(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [initialSeconds]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full">
      <TimerSceneBackground scene={scene} />

      <div className="relative z-[1] flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 max-w-md text-center text-sm text-[var(--text-muted)]"
        >
          &ldquo;{quote}&rdquo;
        </motion.p>

        <motion.div
          key={seconds}
          initial={{ scale: 0.98, opacity: 0.9 }}
          animate={{ scale: 1, opacity: 1 }}
          className="minimal-timer-display"
        >
          {formatDuration(seconds)}
        </motion.div>

        <div className="mt-10 flex gap-3">
          <button
            onClick={() => setRunning((r) => !r)}
            className="btn-primary min-w-[100px]"
          >
            {running ? "Pause" : "Start"}
          </button>
          <button
            onClick={() => { setRunning(false); setSeconds(initialSeconds); }}
            className="btn-secondary"
          >
            Reset
          </button>
        </div>

        <button
          onClick={() => setShowPanel((p) => !p)}
          className="mt-8 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          {showPanel ? "Hide options" : "Options"}
        </button>

        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 w-full max-w-md glass-card p-5"
          >
            <label className="stat-label mb-2 block">Duration (minutes)</label>
            <input
              type="number"
              min={1}
              max={180}
              value={Math.floor(initialSeconds / 60)}
              onChange={(e) => {
                const m = parseInt(e.target.value) || 25;
                setInitialSeconds(m * 60);
                if (!running) setSeconds(m * 60);
              }}
              className="input-field mb-4"
            />
            <p className="stat-label mb-2">Scene</p>
            <div className="flex flex-wrap justify-center gap-2">
              {TIMER_SCENES.filter((s) => s.id !== "none").map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => {
                    const next = scene === id ? "none" : id;
                    setScene(next);
                    localStorage.setItem(SCENE_STORAGE_KEY, next);
                  }}
                  className={cn("pill text-xs", scene === id && "pill-active")}
                >
                  {label}
                </button>
              ))}
            </div>
            {sceneToAudio(scene) && (
              <button onClick={() => setMuted((m) => !m)} className="mt-3 text-xs text-[var(--text-muted)]">
                {muted ? "Unmute" : "Mute"}
              </button>
            )}
          </motion.div>
        )}

        <p className="mt-6 text-xs text-[var(--text-muted)]">
          Space start/pause · R reset · M mute
        </p>
      </div>
    </div>
  );
}

export function FocusPageClient() {
  return (
    <div>
      <div className="border-b border-[var(--border-subtle)] bg-[var(--surface)]/60 px-5 py-3 text-center backdrop-blur-sm">
        <h1 className="font-heading text-lg font-semibold">Focus mode</h1>
        <p className="text-xs text-[var(--text-muted)]">Distraction-free · no account needed</p>
      </div>
      <MinimalTimer defaultMinutes={50} />
      <div className="pb-8 text-center">
        <Link href="/flip-clock" className="text-sm text-[var(--primary)] hover:underline">
          Open flip clock screensaver
        </Link>
      </div>
    </div>
  );
}
