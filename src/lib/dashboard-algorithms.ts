import {
  format,
  startOfDay,
  startOfWeek,
  max as maxDate,
  eachDayOfInterval,
  isSameDay,
  isAfter,
} from "date-fns";
import type { GoalItem, WeeklyDayData } from "@/types/dashboard";

/** Minimal session fields for in-memory aggregation (single DB fetch). */
export interface SessionSlice {
  duration: number;
  createdAt: Date;
  labelId?: string | null;
}

export interface DashboardBounds {
  todayStart: Date;
  weekStart: Date;
  weekEnd: Date;
  sevenDaysAgo: Date;
  thirtyDaysAgo: Date;
  yearStart: Date;
}

export interface DashboardAggregates {
  todaySeconds: number;
  weekSeconds: number;
  weekDaySeconds: Map<string, number>;
  last7DayKeys: Map<string, number>;
  last30DaySeconds: number;
  last30ActiveDays: Set<string>;
  yearActiveDays: Set<string>;
  labelWeekSeconds: Map<string, number>;
}

/**
 * Single O(n) pass over sessions — replaces multiple DB queries + nested filters.
 */
export function aggregateSessions(
  sessions: SessionSlice[],
  bounds: DashboardBounds
): DashboardAggregates {
  const weekDaySeconds = new Map<string, number>();
  const last7DayKeys = new Map<string, number>();
  const labelWeekSeconds = new Map<string, number>();
  const last30ActiveDays = new Set<string>();
  const yearActiveDays = new Set<string>();

  let todaySeconds = 0;
  let weekSeconds = 0;
  let last30DaySeconds = 0;

  const todayMs = bounds.todayStart.getTime();
  const weekStartMs = bounds.weekStart.getTime();
  const weekEndMs = bounds.weekEnd.getTime();
  const sevenMs = bounds.sevenDaysAgo.getTime();
  const thirtyMs = bounds.thirtyDaysAgo.getTime();
  const yearMs = bounds.yearStart.getTime();

  for (const s of sessions) {
    const t = s.createdAt.getTime();
    const dayKey = format(startOfDay(s.createdAt), "yyyy-MM-dd");
    const dur = s.duration;

    if (t >= todayMs) todaySeconds += dur;

    if (t >= weekStartMs && t <= weekEndMs) {
      weekSeconds += dur;
      weekDaySeconds.set(dayKey, (weekDaySeconds.get(dayKey) ?? 0) + dur);
      if (s.labelId) {
        labelWeekSeconds.set(
          s.labelId,
          (labelWeekSeconds.get(s.labelId) ?? 0) + dur
        );
      }
    }

    if (t >= sevenMs) {
      last7DayKeys.set(dayKey, (last7DayKeys.get(dayKey) ?? 0) + dur);
    }

    if (t >= thirtyMs) {
      last30DaySeconds += dur;
      last30ActiveDays.add(dayKey);
    }

    if (t >= yearMs) yearActiveDays.add(dayKey);
  }

  return {
    todaySeconds,
    weekSeconds,
    weekDaySeconds,
    last7DayKeys,
    last30DaySeconds,
    last30ActiveDays,
    yearActiveDays,
    labelWeekSeconds,
  };
}

export function buildWeeklyData(
  weekStart: Date,
  weekEnd: Date,
  now: Date,
  weekDaySeconds: Map<string, number>
): WeeklyDayData[] {
  return eachDayOfInterval({ start: weekStart, end: weekEnd }).map((date) => {
    const key = format(startOfDay(date), "yyyy-MM-dd");
    return {
      day: format(date, "EEE"),
      minutes: Math.floor((weekDaySeconds.get(key) ?? 0) / 60),
      isToday: isSameDay(date, now),
      isFuture: isAfter(date, now) && !isSameDay(date, now),
    };
  });
}

export function dailyAverageMinutes(last7DayKeys: Map<string, number>): number {
  if (last7DayKeys.size === 0) return 0;
  let total = 0;
  last7DayKeys.forEach((sec) => {
    total += sec;
  });
  return Math.floor(total / 60 / last7DayKeys.size);
}

/** Batch goal progress — O(goals × weekSessions) in memory, one DB read. */
export function computeGoalsProgressBatch(
  goals: Array<{
    id: string;
    title: string;
    targetHrs: number;
    deadline: Date | null;
    createdAt: Date;
  }>,
  weekSessions: SessionSlice[],
  now: Date
): GoalItem[] {
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  return goals.map((goal) => {
    const periodStart = maxDate([goal.createdAt, weekStart]);
    const periodMs = periodStart.getTime();
    let seconds = 0;
    for (const s of weekSessions) {
      if (s.createdAt.getTime() >= periodMs) seconds += s.duration;
    }
    const progress =
      Math.round(Math.min(seconds / 3600, goal.targetHrs) * 10) / 10;
    const isCompleted = progress >= goal.targetHrs;
    const isOverdue =
      goal.deadline != null && goal.deadline < now && !isCompleted;

    return {
      id: goal.id,
      title: goal.title,
      targetHrs: goal.targetHrs,
      progress,
      deadline: goal.deadline?.toISOString() ?? null,
      isCompleted,
      isOverdue,
    };
  });
}

export function partitionGoals(goals: GoalItem[]) {
  let completed = 0;
  let active = 0;
  let pending = 0;
  for (const g of goals) {
    if (g.isCompleted) completed++;
    else if (g.isOverdue) pending++;
    else active++;
  }
  return { completed, active, pending };
}

export function roundHours(seconds: number): number {
  return Math.round((seconds / 3600) * 10) / 10;
}
