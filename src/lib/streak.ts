import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANT_STAGES } from "@/lib/utils";

export async function updateUserStreak(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastStudied = user.lastStudiedAt
    ? new Date(
        user.lastStudiedAt.getFullYear(),
        user.lastStudiedAt.getMonth(),
        user.lastStudiedAt.getDate()
      )
    : null;

  let currentStreak = user.currentStreak;
  if (!lastStudied) {
    currentStreak = 1;
  } else {
    const diffDays = Math.floor(
      (today.getTime() - lastStudied.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) {
      // same day — keep streak
    } else if (diffDays === 1) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak,
      longestStreak: Math.max(user.longestStreak, currentStreak),
      lastStudiedAt: now,
    },
  });
}

export async function updatePlantProgress(userId: string, durationSeconds: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const hoursAdded = durationSeconds / 3600;
  const newTotalHours = user.totalHours + hoursAdded;
  const newXP = user.plantXP + Math.min(100, Math.floor(durationSeconds / 60));

  let newStage = user.plantStage;
  for (const stage of PLANT_STAGES) {
    if (newTotalHours >= stage.minHours) {
      newStage = stage.stage;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      totalHours: newTotalHours,
      plantXP: newXP,
      plantStage: newStage,
    },
  });
}

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user?.id) {
    throw new Error("Unauthorized");
  }
  return user;
}
