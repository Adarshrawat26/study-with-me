import { Timer } from "@/components/timer/Timer";
import type { ExamTimerSlug } from "@/lib/exam-timers";
import { EXAM_TIMERS } from "@/lib/exam-timers";

export function ExamTimerPage({ exam }: { exam: ExamTimerSlug }) {
  const config = EXAM_TIMERS[exam];
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="relative z-[1] border-b border-[var(--border)] bg-[var(--surface)]/70 py-4 text-center backdrop-blur-sm">
        <h1 className="font-heading text-xl font-bold">{config.title}</h1>
        <p className="text-sm text-[var(--text-muted)]">{config.label}</p>
      </div>
      <Timer initialMode="countdown" initialDuration={config.duration} presetLabel={config.label} />
    </div>
  );
}
