export type MiniTimerMode = "pomodoro" | "stopwatch" | "countdown" | "focus";

export interface MiniTimerState {
  seconds: number;
  initialSeconds: number;
  isRunning: boolean;
  mode: MiniTimerMode;
  isBreak: boolean;
  workDuration: number;
  breakDuration: number;
  autoStartBreaks: boolean;
  selectedLabel: string | null;
  updatedAt: number;
}

const STORAGE_KEY = "study-with-me-mini-timer";
const FLOATING_KEY = "study-with-me-mini-floating";

export const MINI_TIMER_CHANNEL = "study-with-me-mini-timer-sync";

export function defaultMiniTimerState(): MiniTimerState {
  return {
    seconds: 25 * 60,
    initialSeconds: 25 * 60,
    isRunning: false,
    mode: "pomodoro",
    isBreak: false,
    workDuration: 25 * 60,
    breakDuration: 5 * 60,
    autoStartBreaks: false,
    selectedLabel: null,
    updatedAt: Date.now(),
  };
}

function normalizeState(parsed: Partial<MiniTimerState>): MiniTimerState {
  const defaults = defaultMiniTimerState();
  return {
    seconds: typeof parsed.seconds === "number" ? parsed.seconds : defaults.seconds,
    initialSeconds:
      typeof parsed.initialSeconds === "number" ? parsed.initialSeconds : defaults.initialSeconds,
    isRunning: Boolean(parsed.isRunning),
    mode: parsed.mode ?? defaults.mode,
    isBreak: Boolean(parsed.isBreak),
    workDuration: typeof parsed.workDuration === "number" ? parsed.workDuration : defaults.workDuration,
    breakDuration:
      typeof parsed.breakDuration === "number" ? parsed.breakDuration : defaults.breakDuration,
    autoStartBreaks: Boolean(parsed.autoStartBreaks),
    selectedLabel: parsed.selectedLabel ?? null,
    updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
  };
}

export function readMiniTimerState(): MiniTimerState {
  if (typeof window === "undefined") return defaultMiniTimerState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultMiniTimerState();
    const parsed = normalizeState(JSON.parse(raw) as Partial<MiniTimerState>);

    if (parsed.isRunning && parsed.updatedAt) {
      const elapsed = Math.floor((Date.now() - parsed.updatedAt) / 1000);
      if (elapsed > 0) {
        if (parsed.mode === "stopwatch") {
          parsed.seconds += elapsed;
        } else {
          parsed.seconds = Math.max(0, parsed.seconds - elapsed);
        }
      }
    }
    parsed.updatedAt = Date.now();
    return parsed;
  } catch {
    return defaultMiniTimerState();
  }
}

export function writeMiniTimerState(state: MiniTimerState) {
  if (typeof window === "undefined") return;
  const payload = { ...state, updatedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  try {
    const channel = new BroadcastChannel(MINI_TIMER_CHANNEL);
    channel.postMessage({ type: "sync", state: payload });
    channel.close();
  } catch {
    /* BroadcastChannel unsupported */
  }
}

export function hasStoredTimerState(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function isMiniFloatingEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(FLOATING_KEY) === "true";
}

export function setMiniFloatingEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FLOATING_KEY, enabled ? "true" : "false");
  try {
    const channel = new BroadcastChannel(MINI_TIMER_CHANNEL);
    channel.postMessage({ type: "floating", enabled });
    channel.close();
  } catch {
    /* ignore */
  }
}

export function subscribeMiniTimer(callback: (msg: { type: string; state?: MiniTimerState; enabled?: boolean }) => void) {
  if (typeof window === "undefined") return () => {};
  const channel = new BroadcastChannel(MINI_TIMER_CHANNEL);
  channel.onmessage = (e) => callback(e.data);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === FLOATING_KEY) {
      callback({ type: "storage" });
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    channel.close();
    window.removeEventListener("storage", onStorage);
  };
}
