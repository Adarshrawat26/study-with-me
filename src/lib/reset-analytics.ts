import { prisma } from "@/lib/prisma";

/** Wipe study history and stats so dashboard analytics start from zero. */
export async function resetUserAnalytics(userId: string) {
  await prisma.$transaction([
    prisma.studySession.deleteMany({ where: { userId } }),
    prisma.goal.updateMany({
      where: { userId },
      data: { progress: 0 },
    }),
    prisma.habit.updateMany({
      where: { userId },
      data: { streak: 0, completedAt: [] },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        totalHours: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastStudiedAt: null,
        plantStage: 0,
        plantXP: 0,
      },
    }),
    prisma.onlinePresence.deleteMany({ where: { userId } }),
  ]);
}

/** Reset analytics for every user (admin / local dev script). */
export async function resetAllAnalytics() {
  await prisma.$transaction([
    prisma.studySession.deleteMany(),
    prisma.goal.updateMany({ data: { progress: 0 } }),
    prisma.habit.updateMany({ data: { streak: 0, completedAt: [] } }),
    prisma.user.updateMany({
      data: {
        totalHours: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastStudiedAt: null,
        plantStage: 0,
        plantXP: 0,
      },
    }),
    prisma.onlinePresence.deleteMany(),
  ]);
}
