import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeGoalProgressHours } from "@/lib/goal-progress";
import { FREE_LIMITS, PREMIUM_LIMITS } from "@/lib/utils";
import { hasPremiumAccess } from "@/lib/premium-access";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const enriched = await Promise.all(
    goals.map(async (goal) => ({
      ...goal,
      progress: await computeGoalProgressHours(session.user.id!, goal),
    }))
  );

  return NextResponse.json({ goals: enriched });
}

const createSchema = z.object({
  title: z.string().min(1),
  targetHrs: z.number().min(0.5),
  deadline: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPremium: true, email: true },
  });
  const count = await prisma.goal.count({ where: { userId: session.user.id } });
  const isPremium = hasPremiumAccess({
    id: session.user.id,
    email: user?.email ?? session.user.email,
    isPremium: user?.isPremium,
  });
  const limit = isPremium ? PREMIUM_LIMITS.goals : FREE_LIMITS.goals;

  if (count >= limit) {
    return NextResponse.json({ error: `Goal limit reached (${limit})` }, { status: 403 });
  }

  const body = await req.json();
  const data = createSchema.parse(body);

  const goal = await prisma.goal.create({
    data: {
      userId: session.user.id,
      title: data.title,
      targetHrs: data.targetHrs,
      deadline: data.deadline ? new Date(data.deadline) : null,
    },
  });

  return NextResponse.json({ goal });
}
