import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateHabitStreak,
  dateKey,
  DAY_LABELS,
  weekProgress,
} from "@/lib/habits";
import { hasPremiumAccess } from "@/lib/premium-access";
import { z } from "zod";

export async function GET() {
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

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  const enriched = habits.map((h) => {
    const progress = weekProgress(h.targetDays, h.completedAt);
    return {
      id: h.id,
      name: h.name,
      targetDays: h.targetDays,
      completedAt: h.completedAt.map((d) => dateKey(d)),
      streak: calculateHabitStreak(h.targetDays, h.completedAt),
      weekProgress: progress,
      weekPercent: progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0,
    };
  });

  return NextResponse.json({ habits: enriched, dayLabels: DAY_LABELS });
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  targetDays: z.array(z.number().min(1).max(7)).min(1),
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
  const data = createSchema.parse(body);

  const habit = await prisma.habit.create({
    data: {
      userId: session.user.id,
      name: data.name,
      targetDays: data.targetDays,
    },
  });

  return NextResponse.json({ habit });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.habit.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
