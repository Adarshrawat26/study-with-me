export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** JS Sunday=0 → Mon=1 … Sun=7 */
export function jsDayToTarget(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

export function dateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function calculateHabitStreak(
  targetDays: number[],
  completedAt: Date[]
): number {
  const completed = new Set(completedAt.map(dateKey));
  let streak = 0;
  const check = new Date();
  check.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const dayNum = jsDayToTarget(check.getDay());
    if (targetDays.includes(dayNum)) {
      if (completed.has(dateKey(check))) {
        streak++;
      } else {
        break;
      }
    }
    check.setDate(check.getDate() - 1);
  }
  return streak;
}

export function weekProgress(
  targetDays: number[],
  completedAt: Date[]
): { done: number; total: number } {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const completed = new Set(completedAt.map(dateKey));
  let done = 0;
  let total = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dayNum = jsDayToTarget(d.getDay());
    if (targetDays.includes(dayNum)) {
      total++;
      if (completed.has(dateKey(d))) done++;
    }
  }
  return { done, total };
}

export function getWeekDates(): { date: Date; dayNum: number; label: string }[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dayNum = jsDayToTarget(date.getDay());
    return { date, dayNum, label: DAY_LABELS[i] };
  });
}
