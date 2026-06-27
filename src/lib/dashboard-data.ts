import {
  startOfDay,
  startOfWeek,
  subDays,
  endOfDay,
  eachDayOfInterval,
  format,
  isAfter,
  isSameDay,
} from "date-fns";
import { prisma } from "@/lib/prisma";
import { PLANT_STAGES } from "@/lib/utils";
import { computeGoalProgressHours } from "@/lib/goal-progress";
import { ensureUserDefaults } from "@/lib/user-defaults";
import type { DashboardData, GoalItem, WeeklyDayData } from "@/types/dashboard";

function minutesFromSeconds(seconds: number) {
  return Math.floor(seconds / 60);
}

function getPlantStageName(stage: number) {
  return PLANT_STAGES[stage]?.name ?? "Seed";
}

function getNextStageXP(stage: number) {
  const next = PLANT_STAGES[stage + 1];
  if (!next) return null;
  return Math.round(next.minHours * 60);
}

export async function getDashboardData(
  userId: string,
  userName: string | null | undefined
): Promise<DashboardData> {
  await ensureUserDefaults(userId);

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfDay(
    new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
  );
  const sevenDaysAgo = subDays(todayStart, 6);
  const fourteenDaysAgo = subDays(now, 14);
  const thirtyDaysAgo = subDays(now, 30);
  const heatmapYear = now.getFullYear();
  const yearStart = new Date(heatmapYear, 0, 1);
  const yearEnd = new Date(heatmapYear, 11, 31, 23, 59, 59);

  const [
    user,
    todaySessions,
    weekSessions,
    last7DaysSessions,
    sessionCount,
    pomodoroCount,
    last30DaysSessions,
    allSessionsForHeatmap,
    olderSessionCount,
    labelsRaw,
    goalsRaw,
    totalUsers,
    weeklyLeaderboardUsers,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        totalHours: true,
        isPremium: true,
        plantStage: true,
        plantXP: true,
        lastStudiedAt: true,
      },
    }),
    prisma.studySession.findMany({
      where: { userId, createdAt: { gte: todayStart } },
      select: { duration: true },
    }),
    prisma.studySession.findMany({
      where: { userId, createdAt: { gte: weekStart, lte: weekEnd } },
      select: { duration: true, createdAt: true, labelId: true },
    }),
    prisma.studySession.findMany({
      where: { userId, createdAt: { gte: sevenDaysAgo, lte: now } },
      select: { duration: true, createdAt: true },
    }),
    prisma.studySession.count({ where: { userId } }),
    prisma.studySession.count({ where: { userId, mode: "pomodoro" } }),
    prisma.studySession.findMany({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
      select: { duration: true, createdAt: true },
    }),
    prisma.studySession.findMany({
      where: {
        userId,
        createdAt: { gte: yearStart, lte: yearEnd },
      },
      select: { duration: true, createdAt: true },
    }),
    prisma.studySession.count({
      where: { userId, createdAt: { lt: fourteenDaysAgo } },
    }),
    prisma.label.findMany({
      where: { userId },
      include: { studySessions: { select: { duration: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.user.count(),
    prisma.user.findMany({
      select: {
        id: true,
        studySessions: {
          where: { createdAt: { gte: weekStart } },
          select: { duration: true },
        },
      },
    }),
  ]);

  if (!user) throw new Error("User not found");

  const isPremium = user.isPremium;
  const recentCutoff = isPremium ? subDays(now, 730) : fourteenDaysAgo;

  const recentSessions = await prisma.studySession.findMany({
    where: { userId, createdAt: { gte: recentCutoff } },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { label: true },
  });

  const todayMinutes = minutesFromSeconds(
    todaySessions.reduce((s, x) => s + x.duration, 0)
  );

  const dailyTotals = new Map<string, number>();
  last7DaysSessions.forEach((s) => {
    const key = format(startOfDay(s.createdAt), "yyyy-MM-dd");
    dailyTotals.set(key, (dailyTotals.get(key) ?? 0) + s.duration);
  });
  const dailyAvgMinutes =
    dailyTotals.size > 0
      ? minutesFromSeconds(
          Array.from(dailyTotals.values()).reduce((a, b) => a + b, 0) / dailyTotals.size
        )
      : 0;

  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weeklyData: WeeklyDayData[] = weekDays.map((date) => {
    const daySessions = weekSessions.filter((s) => isSameDay(s.createdAt, date));
    const seconds = daySessions.reduce((sum, s) => sum + s.duration, 0);
    return {
      day: format(date, "EEE"),
      minutes: minutesFromSeconds(seconds),
      isToday: isSameDay(date, now),
      isFuture: isAfter(date, now) && !isSameDay(date, now),
    };
  });

  const weekTotalHours =
    Math.round(
      (weekSessions.reduce((s, x) => s + x.duration, 0) / 3600) * 10
    ) / 10;

  const labelBreakdown = labelsRaw
    .map((label) => {
      const weekSeconds = weekSessions
        .filter((s) => s.labelId === label.id)
        .reduce((sum, s) => sum + s.duration, 0);
      return {
        labelId: label.id,
        name: label.name,
        color: label.color,
        totalMinutes: minutesFromSeconds(weekSeconds),
      };
    })
    .filter((l) => l.totalMinutes > 0);

  const totalLabelMinutes = labelsRaw.reduce(
    (sum, l) => sum + l.studySessions.reduce((s, ss) => s + ss.duration, 0),
    0
  );

  const labels = labelsRaw.map((label) => {
    const totalMinutes = minutesFromSeconds(
      label.studySessions.reduce((s, ss) => s + ss.duration, 0)
    );
    return {
      id: label.id,
      name: label.name,
      color: label.color,
      totalMinutes,
      proportion: totalLabelMinutes > 0 ? totalMinutes / totalLabelMinutes : 0,
    };
  });

  const ranked = weeklyLeaderboardUsers
    .map((u) => ({
      id: u.id,
      hours: u.studySessions.reduce((s, ss) => s + ss.duration, 0) / 3600,
    }))
    .sort((a, b) => b.hours - a.hours);

  const weeklyRank = ranked.findIndex((u) => u.id === userId) + 1;
  const weeklyHours =
    Math.round((ranked.find((u) => u.id === userId)?.hours ?? 0) * 10) / 10;
  const rankIndex = ranked.findIndex((u) => u.id === userId);
  const userAbove = rankIndex > 0 ? ranked[rankIndex - 1] : null;
  const hoursToNextRank = userAbove
    ? Math.max(0, Math.round((userAbove.hours - weeklyHours) * 10) / 10)
    : null;
  const topPercent =
    totalUsers > 0 ? Math.max(1, Math.round((weeklyRank / totalUsers) * 100)) : 100;

  const primaryGoal = goalsRaw[0];
  const dailyGoalMinutes = primaryGoal
    ? Math.round((primaryGoal.targetHrs / 7) * 60)
    : null;

  const goals: GoalItem[] = await Promise.all(
    goalsRaw.map(async (g) => {
      const progress = await computeGoalProgressHours(userId, g);
      const isCompleted = progress >= g.targetHrs;
      const isOverdue = g.deadline ? g.deadline < now && !isCompleted : false;
      return {
        id: g.id,
        title: g.title,
        targetHrs: g.targetHrs,
        progress,
        deadline: g.deadline?.toISOString() ?? null,
        isCompleted,
        isOverdue,
      };
    })
  );

  const heatmapMap = new Map<string, number>();
  allSessionsForHeatmap.forEach((s) => {
    const key = format(s.createdAt, "yyyy-MM-dd");
    heatmapMap.set(key, (heatmapMap.get(key) ?? 0) + minutesFromSeconds(s.duration));
  });

  const heatmapData = Array.from(heatmapMap.entries()).map(([date, minutes]) => ({
    date,
    minutes,
  }));

  const heatmapTotalHours =
    Math.round(
      (allSessionsForHeatmap.reduce((s, x) => s + x.duration, 0) / 3600) * 10
    ) / 10;
  const heatmapActiveDays = heatmapMap.size;

  const daysSinceStudy = user.lastStudiedAt
    ? Math.floor((now.getTime() - user.lastStudiedAt.getTime()) / (86400000))
    : 999;

  const last30TotalSeconds = last30DaysSessions.reduce((s, x) => s + x.duration, 0);
  const activeDays30 = new Set(
    last30DaysSessions.map((s) => format(s.createdAt, "yyyy-MM-dd"))
  ).size;
  const dailyAvg30Days =
    activeDays30 > 0
      ? Math.round((last30TotalSeconds / 3600 / activeDays30) * 10) / 10
      : 0;

  return {
    userName: userName ?? "Student",
    isPremium,
    todayMinutes,
    dailyAvgMinutes,
    dailyGoalMinutes,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    isNewRecord: user.currentStreak > 0 && user.currentStreak >= user.longestStreak,
    rank: {
      weeklyRank: weeklyRank || totalUsers,
      totalUsers,
      topPercent,
      hoursToNextRank,
      weeklyHours,
    },
    plantStage: user.plantStage,
    plantXP: user.plantXP,
    plantStageName: getPlantStageName(user.plantStage),
    nextStageXP: getNextStageXP(user.plantStage),
    lastStudiedAt: user.lastStudiedAt?.toISOString() ?? null,
    isWilting: daysSinceStudy >= 2,
    weeklyData,
    weekTotalHours,
    labelBreakdown,
    labels,
    recentSessions: recentSessions.map((s) => ({
      id: s.id,
      duration: s.duration,
      mode: s.mode,
      createdAt: s.createdAt.toISOString(),
      label: s.label ? { name: s.label.name, color: s.label.color } : null,
    })),
    hasOlderSessions: !isPremium && olderSessionCount > 0,
    goals,
    heatmapData,
    heatmapYear,
    heatmapTotalHours,
    heatmapActiveDays,
    allTime: {
      totalHours: Math.round(user.totalHours * 10) / 10,
      totalSessions: sessionCount,
      totalPomodoros: pomodoroCount,
      dailyAvg30Days,
    },
  };
}

export function getGreeting(name: string) {
  const hour = new Date().getHours();
  const time =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${time}, ${name.split(" ")[0]}`;
}

export function formatMinutesHm(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function formatSessionDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${Math.max(1, diffMins)} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  return format(date, "MMM d");
}
