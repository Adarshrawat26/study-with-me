"use client";

import { useEffect, useRef } from "react";

/** Keeps the screen awake while enabled (e.g. flip-clock screensaver). */
export function useWakeLock(enabled: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || !("wakeLock" in navigator)) {
      return;
    }

    let cancelled = false;

    const acquire = async () => {
      try {
        if (cancelled) return;
        lockRef.current = await navigator.wakeLock.request("screen");
      } catch {
        /* unsupported or denied */
      }
    };

    acquire();

    const onVisibility = () => {
      if (document.visibilityState === "visible" && enabled) acquire();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      lockRef.current?.release().catch(() => {});
      lockRef.current = null;
    };
  }, [enabled]);
}
