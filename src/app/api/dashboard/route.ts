import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWeekDates } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekDates = getWeekDates();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totalHours: true,
      currentStreak: true,
      longestStreak: true,
      isPremium: true,
    },
  });

  const todaySessions = await prisma.studySession.findMany({
    where: {
      userId,
      createdAt: { gte: todayStart },
    },
  });

  const todaySeconds = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  const weekData = await Promise.all(
    weekDates.map(async (date) => {
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const sessions = await prisma.studySession.findMany({
        where: {
          userId,
          createdAt: { gte: dayStart, lte: dayEnd },
        },
      });

      const hours = sessions.reduce((sum, s) => sum + s.duration, 0) / 3600;
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        hours: Math.round(hours * 10) / 10,
      };
    })
  );

  const recentSessions = await prisma.studySession.findMany({
    where: { userId },
    include: { label: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const labels = await prisma.label.findMany({
    where: { userId },
    include: {
      studySessions: {
        select: { duration: true },
      },
    },
  });

  const labelBreakdown = labels.map((label) => ({
    name: label.name,
    color: label.color,
    hours:
      Math.round(
        (label.studySessions.reduce((sum, s) => sum + s.duration, 0) / 3600) * 10
      ) / 10,
  }));

  // Heatmap data (last 365 days) — premium feature
  const yearAgo = new Date();
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);

  const yearSessions = user?.isPremium
    ? await prisma.studySession.findMany({
        where: { userId, createdAt: { gte: yearAgo } },
        select: { createdAt: true, duration: true },
      })
    : [];

  const heatmapMap = new Map<string, number>();
  yearSessions.forEach((s) => {
    const key = s.createdAt.toISOString().split("T")[0];
    heatmapMap.set(key, (heatmapMap.get(key) ?? 0) + s.duration);
  });

  return NextResponse.json({
    todayHours: Math.round((todaySeconds / 3600) * 10) / 10,
    currentStreak: user?.currentStreak ?? 0,
    longestStreak: user?.longestStreak ?? 0,
    totalHours: user?.totalHours ?? 0,
    weekData,
    recentSessions,
    labelBreakdown,
    heatmap: Object.fromEntries(heatmapMap),
    isPremium: user?.isPremium ?? false,
  });
}
