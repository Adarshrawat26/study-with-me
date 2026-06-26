import { startOfWeek, max as maxDate } from "date-fns";
import { prisma } from "@/lib/prisma";

type GoalRecord = {
  id: string;
  createdAt: Date;
  deadline: Date | null;
  targetHrs: number;
};

export function getGoalPeriodStart(goal: GoalRecord, now = new Date()) {
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  return maxDate([goal.createdAt, weekStart]);
}

export async function computeGoalProgressHours(
  userId: string,
  goal: GoalRecord
): Promise<number> {
  const periodStart = getGoalPeriodStart(goal);
  const agg = await prisma.studySession.aggregate({
    where: {
      userId,
      createdAt: { gte: periodStart },
    },
    _sum: { duration: true },
  });
  const hours = (agg._sum.duration ?? 0) / 3600;
  return Math.round(Math.min(hours, goal.targetHrs) * 10) / 10;
}

export async function syncAllGoalProgress(userId: string) {
  const goals = await prisma.goal.findMany({ where: { userId } });
  await Promise.all(
    goals.map(async (goal) => {
      const progress = await computeGoalProgressHours(userId, goal);
      await prisma.goal.update({
        where: { id: goal.id },
        data: { progress },
      });
    })
  );
}
