import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncAllGoalProgress } from "@/lib/goal-progress";
import { updateUserStreak, updatePlantProgress } from "@/lib/streak";
import { z } from "zod";

const sessionSchema = z.object({
  duration: z.number().min(60),
  mode: z.enum(["pomodoro", "stopwatch", "countdown", "focus"]),
  labelId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = sessionSchema.parse(body);

    const studySession = await prisma.studySession.create({
      data: {
        userId: session.user.id,
        duration: data.duration,
        mode: data.mode,
        labelId: data.labelId ?? null,
      },
    });

    await updateUserStreak(session.user.id);
    await updatePlantProgress(session.user.id, data.duration);
    await syncAllGoalProgress(session.user.id);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        totalHours: true,
        currentStreak: true,
        longestStreak: true,
        plantStage: true,
        plantXP: true,
      },
    });

    revalidatePath("/dashboard");
    revalidateTag(`dashboard-${session.user.id}`);
    revalidatePath("/goals");
    revalidatePath("/study-plant");
    revalidatePath("/leaderboard");

    return NextResponse.json({ session: studySession, user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Session save error:", error);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const labelId = searchParams.get("labelId");

  const sessions = await prisma.studySession.findMany({
    where: {
      userId: session.user.id,
      ...(labelId ? { labelId } : {}),
    },
    include: { label: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ sessions });
}
