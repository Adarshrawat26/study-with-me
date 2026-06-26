export const EXAM_TIMERS = {
  "jee-timer": {
    title: "JEE Mains / Advanced",
    duration: 3 * 60 * 60,
    label: "JEE — 3 hour session · Physics, Chemistry, Mathematics",
  },
  "neet-timer": {
    title: "NEET",
    duration: 3 * 60 * 60 + 20 * 60,
    label: "NEET — 3h 20min · Physics, Chemistry, Biology",
  },
  "upsc-timer": {
    title: "UPSC",
    duration: 3 * 60 * 60,
    label: "UPSC — Flexible study session",
  },
  "cat-timer": {
    title: "CAT",
    duration: 2 * 60 * 60,
    label: "CAT — 2 hours · VARC, DILR, QA sections",
  },
  "gate-timer": {
    title: "GATE",
    duration: 3 * 60 * 60,
    label: "GATE — 3 hour session",
  },
  "sat-timer": {
    title: "SAT",
    duration: 3 * 60 * 60,
    label: "SAT — 3 hour digital exam simulation",
  },
  "act-timer": {
    title: "ACT",
    duration: 2 * 60 * 60 + 55 * 60,
    label: "ACT — 2h 55min full test timing",
  },
  "ap-timer": {
    title: "AP Exam",
    duration: 3 * 60 * 60,
    label: "AP — 3 hour exam block",
  },
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

export type ExamTimerSlug = keyof typeof EXAM_TIMERS;

export const EXAM_TIMER_LIST = Object.entries(EXAM_TIMERS).map(([slug, config]) => ({
  slug: slug as ExamTimerSlug,
  ...config,
}));
