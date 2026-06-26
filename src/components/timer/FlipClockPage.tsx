"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { themes, type ThemeId, applyThemeVars } from "@/lib/themes";
import { useWakeLock } from "@/hooks/useWakeLock";
import { FlipTime, formatWallClock, formatFlipDuration } from "@/components/timer/FlipDigit";
import { cn } from "@/lib/utils";

type ClockMode = "wall" | "countdown";

const FLIP_THEME_KEY = "saadhak-flip-theme";

export function FlipClockPage() {
  const searchParams = useSearchParams();
  const initialSeconds = parseInt(searchParams.get("seconds") ?? "0", 10);

  const [mode, setMode] = useState<ClockMode>(initialSeconds > 0 ? "countdown" : "wall");
  const [themeId, setThemeId] = useState<ThemeId>("cosmic");
  const [now, setNow] = useState(new Date());
  const [seconds, setSeconds] = useState(initialSeconds > 0 ? initialSeconds : 25 * 60);
  const [initialCountdown] = useState(initialSeconds > 0 ? initialSeconds : 25 * 60);
  const [running, setRunning] = useState(false);
  const [screensaver, setScreensaver] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  useWakeLock(screensaver);

  useEffect(() => {
    const saved = localStorage.getItem(FLIP_THEME_KEY) as ThemeId | null;
    if (saved && themes.some((t) => t.id === saved)) setThemeId(saved);
  }, []);

  useEffect(() => {
    applyThemeVars(themeId);
    localStorage.setItem(FLIP_THEME_KEY, themeId);
  }, [themeId]);

  useEffect(() => {
    if (mode !== "wall") return;
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, [mode]);

  useEffect(() => {
    if (!running || mode !== "countdown") return;
    const tick = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [running, mode]);

  const enterScreensaver = useCallback(async () => {
    setScreensaver(true);
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      /* user denied */
    }
  }, []);

  const exitScreensaver = useCallback(async () => {
    setScreensaver(false);
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement) setScreensaver(false);
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const bumpControls = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (screensaver) {
      hideTimer.current = setTimeout(() => setShowControls(false), 4000);
    }
  };

  useEffect(() => {
    if (screensaver) {
      setShowControls(true);
      hideTimer.current = setTimeout(() => setShowControls(false), 4000);
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [screensaver]);

  const displayTime =
    mode === "wall" ? formatWallClock(now) : formatFlipDuration(seconds);

  return (
    <div
      className={cn(
        "flip-clock-page",
        screensaver && "flip-clock-page--screensaver"
      )}
      onMouseMove={bumpControls}
      onClick={bumpControls}
    >
      <div className="flip-clock-page__glow" />

      <div className="flip-clock-page__clock">
        <FlipTime time={displayTime} />
        {mode === "wall" && (
          <p className="flip-clock-page__date">
            {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
        )}
        {mode === "countdown" && seconds === 0 && (
          <p className="flip-clock-page__done">Session complete</p>
        )}
      </div>

      <div
        className={cn(
          "flip-clock-page__controls",
          screensaver && !showControls && "flip-clock-page__controls--hidden"
        )}
      >
        {!screensaver && (
          <Link href="/" className="flip-clock-page__back">
            Back to timer
          </Link>
        )}

        <div className="flip-clock-page__toolbar">
          <div className="flip-clock-page__modes">
            <button
              onClick={() => setMode("wall")}
              className={cn("pill", mode === "wall" && "pill-active")}
            >
              Clock
            </button>
            <button
              onClick={() => setMode("countdown")}
              className={cn("pill", mode === "countdown" && "pill-active")}
            >
              Timer
            </button>
          </div>

          {mode === "countdown" && (
            <div className="flip-clock-page__timer-btns">
              <button onClick={() => setRunning((r) => !r)} className="btn-primary text-xs">
                {running ? "Pause" : "Start"}
              </button>
              <button
                onClick={() => {
                  setRunning(false);
                  setSeconds(initialCountdown);
                }}
                className="btn-secondary text-xs"
              >
                Reset
              </button>
            </div>
          )}

          <div className="flip-clock-page__themes">
            {themes.map((t) => (
              <button
                key={t.id}
                title={t.name}
                onClick={() => setThemeId(t.id)}
                className={cn(
                  "flip-clock-page__theme-swatch",
                  themeId === t.id && "flip-clock-page__theme-swatch--active"
                )}
                style={{ background: t.preview }}
              />
            ))}
          </div>

          {screensaver ? (
            <button onClick={exitScreensaver} className="btn-secondary text-xs">
              Exit fullscreen
            </button>
          ) : (
            <button onClick={enterScreensaver} className="btn-primary text-xs">
              Fullscreen screensaver
            </button>
          )}
        </div>

        <p className="flip-clock-page__hint">
          Fullscreen keeps your display awake — perfect for a desk clock on a second screen.
        </p>
      </div>
    </div>
  );
}
