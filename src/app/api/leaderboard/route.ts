import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPremiumAccess } from "@/lib/premium-access";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "weekly";
  const search = searchParams.get("search") ?? "";

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const session = await auth();
  const currentUserId = session?.user?.id;

  const users = await prisma.user.findMany({
    where: search
      ? { name: { contains: search, mode: "insensitive" } }
      : {},
    select: {
      id: true,
      name: true,
      image: true,
      totalHours: true,
      currentStreak: true,
      isPremium: true,
      email: true,
      studySessions: period === "weekly"
        ? {
            where: { createdAt: { gte: weekStart } },
            select: { duration: true },
          }
        : { select: { duration: true } },
    },
    take: 100,
  });

  const ranked = users
    .map((u) => ({
      id: u.id,
      name: u.name ?? "Anonymous",
      image: u.image,
      hours:
        Math.round(
          (period === "weekly"
            ? u.studySessions.reduce((s, ss) => s + ss.duration, 0)
            : u.totalHours * 3600) / 3600 * 10
        ) / 10,
      streak: u.currentStreak,
      isPremium: hasPremiumAccess({
        id: u.id,
        email: u.email,
        isPremium: u.isPremium,
      }),
    }))
    .sort((a, b) => b.hours - a.hours)
    .map((u, i) => ({ ...u, rank: i + 1 }));

  const top50 = ranked.slice(0, 50);
  const currentUserRank = currentUserId
    ? ranked.find((u) => u.id === currentUserId)
    : null;

  return NextResponse.json({ leaderboard: top50, currentUser: currentUserRank });
}
