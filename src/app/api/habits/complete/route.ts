import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateHabitStreak,
  dateKey,
  weekProgress,
} from "@/lib/habits";
import { hasPremiumAccess } from "@/lib/premium-access";
import { z } from "zod";

const completeSchema = z.object({
  habitId: z.string(),
  date: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPremium: true, email: true },
  });

  if (
    !hasPremiumAccess({
      id: session.user.id,
      email: user?.email ?? session.user.email,
      isPremium: user?.isPremium,
    })
  ) {
    return NextResponse.json({ error: "Premium required" }, { status: 403 });
  }

  const body = await req.json();
  const { habitId, date } = completeSchema.parse(body);

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: session.user.id },
  });

  if (!habit) {
    return NextResponse.json({ error: "Habit not found" }, { status: 404 });
  }

  const targetDate = date ? new Date(date) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  const key = dateKey(targetDate);

  const existingKeys = new Set(habit.completedAt.map(dateKey));
  let completedAt: Date[];

  if (existingKeys.has(key)) {
    // Toggle off
    completedAt = habit.completedAt.filter((d) => dateKey(d) !== key);
  } else {
    completedAt = [...habit.completedAt, targetDate];
  }

  const streak = calculateHabitStreak(habit.targetDays, completedAt);
  const progress = weekProgress(habit.targetDays, completedAt);

  const updated = await prisma.habit.update({
    where: { id: habitId },
    data: { completedAt, streak },
  });

  const wasAdded = !existingKeys.has(key);

  return NextResponse.json({
    habit: {
      id: updated.id,
      name: updated.name,
      targetDays: updated.targetDays,
      completedAt: updated.completedAt.map(dateKey),
      streak: updated.streak,
      weekProgress: progress,
      weekPercent: progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0,
    },
    completed: wasAdded,
  });
}
