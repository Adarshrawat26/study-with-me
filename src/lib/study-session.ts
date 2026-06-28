export const MIN_SESSION_SECONDS = 60;

export type StudySessionMode = "pomodoro" | "stopwatch" | "countdown" | "focus";

export interface TimerSnapshot {
  mode: StudySessionMode;
  seconds: number;
  initialSeconds: number;
  isBreak?: boolean;
}

/** Elapsed study seconds for the current timer state (breaks excluded). */
export function getElapsedStudySeconds(snapshot: TimerSnapshot): number {
  const { mode, seconds, initialSeconds, isBreak } = snapshot;

  if (mode === "stopwatch") return seconds;
  if (isBreak) return 0;
  return Math.max(0, initialSeconds - seconds);
}

export function canSaveSession(snapshot: TimerSnapshot): boolean {
  return getElapsedStudySeconds(snapshot) >= MIN_SESSION_SECONDS;
}
