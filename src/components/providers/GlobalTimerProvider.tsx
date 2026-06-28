"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { MiniTimerWidget } from "@/components/timer/MiniTimerWidget";
import { useSaveStudySession } from "@/hooks/useSaveStudySession";
import {
  canSaveSession,
  getElapsedStudySeconds,
  type StudySessionMode,
} from "@/lib/study-session";
import {
  defaultMiniTimerState,
  hasStoredTimerState,
  isMiniFloatingEnabled,
  readMiniTimerState,
  setMiniFloatingEnabled,
  subscribeMiniTimer,
  writeMiniTimerState,
  type MiniTimerMode,
  type MiniTimerState,
} from "@/lib/mini-timer-store";

interface GlobalTimerContextValue {
  mounted: boolean;
  state: MiniTimerState;
  toggle: () => void;
  reset: () => void;
  saveAndReset: () => Promise<boolean>;
  stopAndSave: () => Promise<void>;
  setMode: (mode: MiniTimerMode) => void;
  setDuration: (seconds: number) => void;
  setWorkDuration: (seconds: number) => void;
  setBreakDuration: (seconds: number) => void;
  setAutoStartBreaks: (value: boolean) => void;
  setSelectedLabel: (labelId: string | null) => void;
  applySettings: (settings: {
    defaultMode: string;
    defaultDuration: number;
    workDuration: number;
    breakDuration: number;
    autoStartBreaks: boolean;
  }) => void;
  elapsedSeconds: number;
  showSave: boolean;
  isSignedIn: boolean;
  floating: boolean;
  enableFloating: () => void;
  disableFloating: () => void;
}

const GlobalTimerContext = createContext<GlobalTimerContextValue | null>(null);

const HIDDEN_ROUTES = ["/embed", "/mini", "/flip-clock"];
const TIMER_HOME = "/";

export function GlobalTimerProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { saveSession, isSignedIn } = useSaveStudySession();

  const [state, setState] = useState<MiniTimerState>(defaultMiniTimerState);
  const [mounted, setMounted] = useState(false);
  const [floating, setFloating] = useState(false);
  const [autoFloating, setAutoFloating] = useState(false);

  const stateRef = useRef(state);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const persist = useCallback((next: MiniTimerState) => {
    setState(next);
    writeMiniTimerState(next);
  }, []);

  useEffect(() => {
    setState(readMiniTimerState());
    setFloating(isMiniFloatingEnabled());
    setMounted(true);

    return subscribeMiniTimer((msg) => {
      if (msg.type === "sync" && msg.state) {
        setState(msg.state);
      } else if (msg.type === "storage") {
        setState(readMiniTimerState());
        setFloating(isMiniFloatingEnabled());
      } else if (msg.type === "floating" && typeof msg.enabled === "boolean") {
        setFloating(msg.enabled);
      }
    });
  }, []);

  const handleComplete = useCallback(
    (s: MiniTimerState): MiniTimerState => {
      if (s.mode === "pomodoro") {
        if (!s.isBreak) {
          if (isSignedIn) {
            void saveSession(s.workDuration, "pomodoro", { labelId: s.selectedLabel });
          }
          const next: MiniTimerState = {
            ...s,
            isRunning: s.autoStartBreaks,
            isBreak: true,
            seconds: s.breakDuration,
            initialSeconds: s.breakDuration,
          };
          return next;
        }
        return {
          ...s,
          isRunning: false,
          isBreak: false,
          seconds: s.workDuration,
          initialSeconds: s.workDuration,
        };
      }

      if (s.mode === "countdown" || s.mode === "focus") {
        if (isSignedIn) {
          void saveSession(s.initialSeconds, s.mode, { labelId: s.selectedLabel });
        }
        return { ...s, isRunning: false, seconds: 0 };
      }

      return { ...s, isRunning: false };
    },
    [isSignedIn, saveSession]
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
        persist(handleComplete({ ...s, seconds: 0 }));
        return;
      }
      persist({ ...s, seconds: s.seconds - 1 });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mounted, state.isRunning, state.mode, persist, handleComplete]);

  useEffect(() => {
    const stopOnClose = () => {
      const s = stateRef.current;
      if (s.isRunning) {
        writeMiniTimerState({ ...s, isRunning: false });
      }
    };
    window.addEventListener("beforeunload", stopOnClose);
    return () => {
      window.removeEventListener("beforeunload", stopOnClose);
    };
  }, []);

  const hidden = HIDDEN_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );
  const onTimerHome = pathname === TIMER_HOME;

  useEffect(() => {
    if (!mounted || hidden) return;
    if (state.isRunning && !onTimerHome) {
      setAutoFloating(true);
      setMiniFloatingEnabled(true);
      setFloating(true);
    }
  }, [mounted, hidden, onTimerHome, state.isRunning]);

  const enableFloating = useCallback(() => {
    setAutoFloating(false);
    setMiniFloatingEnabled(true);
    setFloating(true);
  }, []);

  const disableFloating = useCallback(() => {
    setAutoFloating(false);
    setMiniFloatingEnabled(false);
    setFloating(false);
  }, []);

  const toggle = useCallback(() => {
    persist({ ...stateRef.current, isRunning: !stateRef.current.isRunning });
  }, [persist]);

  const resetAfterSave = useCallback((s: MiniTimerState): MiniTimerState => {
    if (s.mode === "stopwatch") {
      return { ...s, isRunning: false, isBreak: false, seconds: 0, initialSeconds: 0 };
    }
    if (s.mode === "pomodoro" && !s.isBreak) {
      return {
        ...s,
        isRunning: false,
        seconds: s.workDuration,
        initialSeconds: s.workDuration,
      };
    }
    return { ...s, isRunning: false, isBreak: false, seconds: s.initialSeconds };
  }, []);

  const reset = useCallback(() => {
    const s = stateRef.current;
    const snapshot = {
      mode: s.mode as StudySessionMode,
      seconds: s.seconds,
      initialSeconds: s.initialSeconds,
      isBreak: s.isBreak,
    };
    if (s.mode === "stopwatch" && canSaveSession(snapshot)) {
      void saveSession(s.seconds, "stopwatch", { labelId: s.selectedLabel });
    }
    persist(resetAfterSave(s));
  }, [persist, saveSession, resetAfterSave]);

  const saveAndReset = useCallback(async () => {
    const s = stateRef.current;
    const snapshot = {
      mode: s.mode as StudySessionMode,
      seconds: s.seconds,
      initialSeconds: s.initialSeconds,
      isBreak: s.isBreak,
    };
    if (!canSaveSession(snapshot)) return false;

    const elapsed = getElapsedStudySeconds(snapshot);
    const saved = await saveSession(elapsed, s.mode as StudySessionMode, {
      labelId: s.selectedLabel,
    });
    if (!saved) return false;

    persist(resetAfterSave(s));
    return true;
  }, [persist, saveSession, resetAfterSave]);

  const stopAndSave = useCallback(async () => {
    await saveAndReset();
  }, [saveAndReset]);

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

  const setDuration = useCallback(
    (secs: number) => {
      const s = stateRef.current;
      persist({
        ...s,
        seconds: secs,
        initialSeconds: secs,
        isRunning: false,
        workDuration: s.mode === "pomodoro" ? secs : s.workDuration,
      });
    },
    [persist]
  );

  const setWorkDuration = useCallback(
    (secs: number) => {
      const s = stateRef.current;
      if (!s.isBreak) {
        persist({ ...s, workDuration: secs, seconds: secs, initialSeconds: secs });
      } else {
        persist({ ...s, workDuration: secs });
      }
    },
    [persist]
  );

  const setBreakDuration = useCallback(
    (secs: number) => {
      persist({ ...stateRef.current, breakDuration: secs });
    },
    [persist]
  );

  const setAutoStartBreaks = useCallback(
    (value: boolean) => {
      persist({ ...stateRef.current, autoStartBreaks: value });
    },
    [persist]
  );

  const setSelectedLabel = useCallback(
    (labelId: string | null) => {
      persist({ ...stateRef.current, selectedLabel: labelId });
    },
    [persist]
  );

  const applySettings = useCallback(
    (settings: {
      defaultMode: string;
      defaultDuration: number;
      workDuration: number;
      breakDuration: number;
      autoStartBreaks: boolean;
    }) => {
      if (hasStoredTimerState()) return;
      const dur = settings.defaultDuration ?? 1500;
      persist({
        ...defaultMiniTimerState(),
        mode: settings.defaultMode as MiniTimerMode,
        workDuration: settings.workDuration ?? 1500,
        breakDuration: settings.breakDuration ?? 300,
        autoStartBreaks: settings.autoStartBreaks ?? false,
        seconds: dur,
        initialSeconds: dur,
      });
    },
    [persist]
  );

  const elapsedSeconds = getElapsedStudySeconds({
    mode: state.mode as StudySessionMode,
    seconds: state.seconds,
    initialSeconds: state.initialSeconds,
    isBreak: state.isBreak,
  });

  const showSave =
    isSignedIn &&
    canSaveSession({
      mode: state.mode as StudySessionMode,
      seconds: state.seconds,
      initialSeconds: state.initialSeconds,
      isBreak: state.isBreak,
    });

  const showFloating =
    mounted && floating && !hidden && (autoFloating ? !onTimerHome : true);

  return (
    <GlobalTimerContext.Provider
      value={{
        mounted,
        state,
        toggle,
        reset,
        saveAndReset,
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
        isSignedIn,
        floating,
        enableFloating,
        disableFloating,
      }}
    >
      {children}
      {showFloating && (
        <MiniTimerWidget onClose={disableFloating} />
      )}
    </GlobalTimerContext.Provider>
  );
}

export function useGlobalTimer() {
  const ctx = useContext(GlobalTimerContext);
  if (!ctx) throw new Error("useGlobalTimer must be used within GlobalTimerProvider");
  return ctx;
}

/** @deprecated use useGlobalTimer */
export function useMiniTimerFloating() {
  const { floating, enableFloating, disableFloating } = useGlobalTimer();
  return { floating, enableFloating, disableFloating };
}
