import {
  startOfDay,
  startOfWeek,
  subDays,
  endOfDay,
  format,
} from "date-fns";
import { prisma } from "@/lib/prisma";
import { PLANT_STAGES } from "@/lib/utils";
import { ensureUserDefaults } from "@/lib/user-defaults";
import {
  aggregateSessions,
  buildWeeklyData,
  buildDailyChartData,
  buildMonthlyChartData,
  buildHeatmapData,
  averageSessionMinutes,
  computeGoalsProgressBatch,
  dailyAverageMinutes,
  roundHours,
  type SessionSlice,
} from "@/lib/dashboard-algorithms";
import type { DashboardData } from "@/types/dashboard";
import { hasPremiumAccess } from "@/lib/premium-access";

function getPlantStageName(stage: number) {
  return PLANT_STAGES[stage]?.name ?? "Seed";
}

function getNextStageXP(stage: number) {
  const next = PLANT_STAGES[stage + 1];
  if (!next) return null;
  return Math.round(next.minHours * 60);
}

async function fetchDashboardData(
  userId: string,
  userName: string | null | undefined
): Promise<DashboardData> {
  const now = new Date();
  const bounds = {
    todayStart: startOfDay(now),
    weekStart: startOfWeek(now, { weekStartsOn: 1 }),
    weekEnd: endOfDay(new Date(startOfWeek(now, { weekStartsOn: 1 }).getTime() + 6 * 86400000)),
    sevenDaysAgo: subDays(startOfDay(now), 6),
    thirtyDaysAgo: subDays(now, 30),
    yearStart: new Date(now.getFullYear(), 0, 1),
  };
  const fourteenDaysAgo = subDays(now, 14);
  const recentCutoff = fourteenDaysAgo;

  const [
    user,
    sessionCounts,
    yearSessions,
    recentSessions,
    goalsRaw,
    totalUsers,
    labelsRaw,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        totalHours: true,
        isPremium: true,
        email: true,
        plantStage: true,
        plantXP: true,
        lastStudiedAt: true,
      },
    }),
    Promise.all([
      prisma.studySession.count({ where: { userId } }),
      prisma.studySession.count({ where: { userId, mode: "pomodoro" } }),
      prisma.studySession.count({
        where: { userId, createdAt: { lt: fourteenDaysAgo } },
      }),
    ]),
    prisma.studySession.findMany({
      where: {
        userId,
        createdAt: { gte: bounds.yearStart, lte: now },
      },
      select: { duration: true, createdAt: true, labelId: true },
    }),
    prisma.studySession.findMany({
      where: { userId, createdAt: { gte: recentCutoff } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        duration: true,
        mode: true,
        createdAt: true,
        label: { select: { name: true, color: true } },
      },
    }),
    prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
    prisma.label.findMany({
      where: { userId },
      select: { id: true, name: true, color: true },
    }),
  ]);

  if (!user) throw new Error("User not found");

  const [sessionCount, pomodoroCount, olderSessionCount] = sessionCounts;
  const isPremium = hasPremiumAccess({
    id: userId,
    email: user.email,
    isPremium: user.isPremium,
  });

  const slices: SessionSlice[] = yearSessions;
  const agg = aggregateSessions(slices, bounds);

  const weekSessions = slices.filter(
    (s) =>
      s.createdAt >= bounds.weekStart && s.createdAt <= bounds.weekEnd
  );

  const weeklyData = buildWeeklyData(
    bounds.weekStart,
    bounds.weekEnd,
    now,
    agg.weekDaySeconds
  );
  const dailyChartData = buildDailyChartData(slices, bounds.todayStart, now);
  const monthlyChartData = buildMonthlyChartData(slices, now);
  const weekTotalHours = roundHours(agg.weekSeconds);
  const weeklyHours = weekTotalHours;
  const weeklyRank = 1;
  const topPercent = 50;
  const todayMinutes = Math.floor(agg.todaySeconds / 60);
  const dailyAvgMinutes = dailyAverageMinutes(agg.last7DayKeys);
  const goals = computeGoalsProgressBatch(goalsRaw, weekSessions, now);
  const primaryGoal = goalsRaw[0];
  const dailyGoalMinutes = primaryGoal
    ? Math.round((primaryGoal.targetHrs / 7) * 60)
    : null;

  const daysSinceStudy = user.lastStudiedAt
    ? Math.floor((now.getTime() - user.lastStudiedAt.getTime()) / 86400000)
    : 999;

  const dailyAvg30Days =
    agg.last30ActiveDays.size > 0
      ? Math.round(
          (agg.last30DaySeconds / 3600 / agg.last30ActiveDays.size) * 10
        ) / 10
      : 0;

  const labelBreakdown = labelsRaw
    .map((l) => ({
      labelId: l.id,
      name: l.name,
      color: l.color,
      totalMinutes: Math.floor((agg.labelWeekSeconds.get(l.id) ?? 0) / 60),
    }))
    .filter((l) => l.totalMinutes > 0)
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  const labelYearSeconds = new Map<string, number>();
  for (const s of slices) {
    if (s.labelId) {
      labelYearSeconds.set(
        s.labelId,
        (labelYearSeconds.get(s.labelId) ?? 0) + s.duration
      );
    }
  }
  const yearTotalLabelSec = Array.from(labelYearSeconds.values()).reduce(
    (a, b) => a + b,
    0
  );
  const labels = labelsRaw.map((l) => {
    const sec = labelYearSeconds.get(l.id) ?? 0;
    return {
      id: l.id,
      name: l.name,
      color: l.color,
      totalMinutes: Math.floor(sec / 60),
      proportion: yearTotalLabelSec > 0 ? sec / yearTotalLabelSec : 0,
    };
  });

  const heatmapData = buildHeatmapData(slices, bounds.yearStart);
  const avgSessionMinutes = averageSessionMinutes(slices, bounds.thirtyDaysAgo);

  return {
    userName: userName ?? "Student",
    isPremium,
    todayMinutes,
    dailyAvgMinutes,
    dailyGoalMinutes,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    isNewRecord:
      user.currentStreak > 0 && user.currentStreak >= user.longestStreak,
    rank: {
      weeklyRank: weeklyRank || totalUsers,
      totalUsers,
      topPercent,
      hoursToNextRank: null,
      weeklyHours,
    },
    plantStage: user.plantStage,
    plantXP: user.plantXP,
    plantStageName: getPlantStageName(user.plantStage),
    nextStageXP: getNextStageXP(user.plantStage),
    lastStudiedAt: user.lastStudiedAt?.toISOString() ?? null,
    isWilting: daysSinceStudy >= 2,
    weeklyData,
    dailyChartData,
    monthlyChartData,
    weekTotalHours,
    labelBreakdown,
    labels,
    avgSessionMinutes,
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
    heatmapYear: now.getFullYear(),
    heatmapTotalHours: roundHours(
      slices.reduce((sum, s) => sum + s.duration, 0)
    ),
    heatmapActiveDays: agg.yearActiveDays.size,
    allTime: {
      totalHours: Math.round(user.totalHours * 10) / 10,
      totalSessions: sessionCount,
      totalPomodoros: pomodoroCount,
      dailyAvg30Days,
    },
  };
}

export async function getDashboardData(
  userId: string,
  userName: string | null | undefined
): Promise<DashboardData> {
  await ensureUserDefaults(userId);
  return fetchDashboardData(userId, userName);
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
