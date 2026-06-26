import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPusherServer } from "@/lib/pusher-server";
import {
  getOrCreateGroupTimer,
  serializeTimer,
  computeRemaining,
} from "@/lib/group-timer";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await getOrCreateGroupTimer(params.id);
  const timer = await prisma.groupTimer.findUnique({ where: { groupId: params.id } });
  if (!timer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ timer: serializeTimer(timer) });
}

const actionSchema = z.object({
  action: z.enum(["start", "pause", "reset"]),
  duration: z.number().min(60).max(7200).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const member = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: { userId: session.user.id, groupId: params.id },
    },
  });

  if (!member || member.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await req.json();
  const { action, duration } = actionSchema.parse(body);

  await getOrCreateGroupTimer(params.id);
  let timer = await prisma.groupTimer.findUnique({ where: { groupId: params.id } });
  if (!timer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "start") {
    const dur = duration ?? timer.duration;
    timer = await prisma.groupTimer.update({
      where: { groupId: params.id },
      data: {
        duration: dur,
        remaining: dur,
        isRunning: true,
        startedAt: new Date(),
        startedById: session.user.id,
      },
    });
  } else if (action === "pause") {
    const effective = computeRemaining(timer.remaining, timer.isRunning, timer.startedAt);
    timer = await prisma.groupTimer.update({
      where: { groupId: params.id },
      data: {
        remaining: effective,
        isRunning: false,
        startedAt: null,
      },
    });
  } else if (action === "reset") {
    timer = await prisma.groupTimer.update({
      where: { groupId: params.id },
      data: {
        remaining: timer.duration,
        isRunning: false,
        startedAt: null,
      },
    });
  }

  const serialized = serializeTimer(timer);

  const pusher = getPusherServer();
  if (pusher) {
    await pusher.trigger(`group-${params.id}`, "timer-update", serialized);
  }

  return NextResponse.json({ timer: serialized });
}
