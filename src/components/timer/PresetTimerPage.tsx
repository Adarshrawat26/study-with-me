import { Timer } from "@/components/timer/Timer";
import type { StudyPresetSlug } from "@/lib/study-presets";
import { STUDY_PRESETS } from "@/lib/study-presets";

export function PresetTimerPage({ preset }: { preset: StudyPresetSlug }) {
  const config = STUDY_PRESETS[preset];
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
