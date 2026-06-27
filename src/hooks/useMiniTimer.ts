"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  defaultMiniTimerState,
  readMiniTimerState,
  writeMiniTimerState,
  subscribeMiniTimer,
  type MiniTimerState,
  type MiniTimerMode,
} from "@/lib/mini-timer-store";

export function useMiniTimer() {
  const [state, setState] = useState<MiniTimerState>(defaultMiniTimerState);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    setState(readMiniTimerState());
    setMounted(true);
    return subscribeMiniTimer((msg) => {
      if (msg.type === "sync" && msg.state) {
        setState(msg.state);
      } else if (msg.type === "storage") {
        setState(readMiniTimerState());
      }
    });
  }, []);

  const persist = useCallback((next: MiniTimerState) => {
    setState(next);
    writeMiniTimerState(next);
  }, []);

  const toggle = useCallback(() => {
    persist({ ...stateRef.current, isRunning: !stateRef.current.isRunning });
  }, [persist]);

  const reset = useCallback(() => {
    const s = stateRef.current;
    persist({
      ...s,
      isRunning: false,
      isBreak: false,
      seconds: s.mode === "stopwatch" ? 0 : s.initialSeconds,
    });
  }, [persist]);

  const setMode = useCallback(
    (mode: MiniTimerMode) => {
      const s = stateRef.current;
      let seconds = s.initialSeconds;
      let initialSeconds = s.initialSeconds;
      if (mode === "stopwatch") {
        seconds = 0;
        initialSeconds = 0;
      } else if (mode === "focus") {
        seconds = 50 * 60;
        initialSeconds = 50 * 60;
      } else if (mode === "pomodoro") {
        seconds = s.workDuration;
        initialSeconds = s.workDuration;
      }
      persist({ ...s, mode, isRunning: false, isBreak: false, seconds, initialSeconds });
    },
    [persist]
  );

  useEffect(() => {
    if (!mounted || !state.isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const s = stateRef.current;
      if (s.mode === "stopwatch") {
        persist({ ...s, seconds: s.seconds + 1 });
        return;
      }
      if (s.seconds <= 1) {
        persist({ ...s, seconds: 0, isRunning: false });
        return;
      }
      persist({ ...s, seconds: s.seconds - 1 });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mounted, state.isRunning, state.mode, persist]);

  const syncFromFullTimer = useCallback(
    (payload: {
      seconds: number;
      initialSeconds: number;
      isRunning: boolean;
      mode: MiniTimerMode;
      isBreak: boolean;
      workDuration: number;
    }) => {
      persist({ ...payload, updatedAt: Date.now() });
    },
    [persist]
  );

  return {
    mounted,
    state,
    toggle,
    reset,
    setMode,
    syncFromFullTimer,
  };
}
