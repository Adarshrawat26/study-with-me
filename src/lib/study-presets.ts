export const STUDY_PRESETS = {
  "homework-timer": {
    title: "Homework",
    duration: 60 * 60,
    label: "Homework — 1 hour focused session",
  },
  "adhd-timer": {
    title: "ADHD Focus",
    duration: 15 * 60,
    label: "ADHD — 15 min micro-focus sprint",
  },
  "focus-timer": {
    title: "Deep Focus",
    duration: 50 * 60,
    label: "Focus — 50 min deep work block",
  },
} as const;

export type StudyPresetSlug = keyof typeof STUDY_PRESETS;

export const STUDY_PRESET_LIST = Object.entries(STUDY_PRESETS).map(([slug, config]) => ({
  slug: slug as StudyPresetSlug,
  ...config,
}));
