import { startOfWeek, max as maxDate } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  computeGoalsProgressBatch,
  type SessionSlice,
} from "@/lib/dashboard-algorithms";

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

/** Batch sync — one session query for all goals instead of N aggregates. */
export async function syncAllGoalProgress(userId: string) {
  const goals = await prisma.goal.findMany({ where: { userId } });
  if (goals.length === 0) return;

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const sessions: SessionSlice[] = await prisma.studySession.findMany({
    where: { userId, createdAt: { gte: weekStart } },
    select: { duration: true, createdAt: true },
  });

  const computed = computeGoalsProgressBatch(goals, sessions, new Date());

  await prisma.$transaction(
    computed.map((g) =>
      prisma.goal.update({
        where: { id: g.id },
        data: { progress: g.progress },
      })
    )
  );
}
