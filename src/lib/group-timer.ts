import { prisma } from "@/lib/prisma";

export interface GroupTimerState {
  duration: number;
  remaining: number;
  isRunning: boolean;
  startedAt: string | null;
  startedById: string | null;
}

export function computeRemaining(
  remaining: number,
  isRunning: boolean,
  startedAt: Date | null
): number {
  if (!isRunning || !startedAt) return remaining;
  const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
  return Math.max(0, remaining - elapsed);
}

export function serializeTimer(timer: {
  duration: number;
  remaining: number;
  isRunning: boolean;
  startedAt: Date | null;
  startedById: string | null;
}): GroupTimerState {
  return {
    duration: timer.duration,
    remaining: computeRemaining(timer.remaining, timer.isRunning, timer.startedAt),
    isRunning: timer.isRunning,
    startedAt: timer.startedAt?.toISOString() ?? null,
    startedById: timer.startedById,
  };
}

export async function getOrCreateGroupTimer(groupId: string) {
  let timer = await prisma.groupTimer.findUnique({ where: { groupId } });
  if (!timer) {
    timer = await prisma.groupTimer.create({
      data: { groupId },
    });
  }
  return timer;
}

export async function syncTimerRemaining(groupId: string) {
  const timer = await prisma.groupTimer.findUnique({ where: { groupId } });
  if (!timer || !timer.isRunning || !timer.startedAt) return timer;

  const effective = computeRemaining(timer.remaining, timer.isRunning, timer.startedAt);
  if (effective <= 0) {
    return prisma.groupTimer.update({
      where: { groupId },
      data: { remaining: 0, isRunning: false, startedAt: null },
    });
  }
  return timer;
}
