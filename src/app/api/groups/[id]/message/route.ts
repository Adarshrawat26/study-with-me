import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPusherServer } from "@/lib/pusher-server";
import { z } from "zod";

const messageSchema = z.object({
  content: z.string().min(1).max(2000),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const after = searchParams.get("after");

  const messages = await prisma.message.findMany({
    where: {
      groupId: params.id,
      ...(after ? { createdAt: { gt: new Date(after) } } : {}),
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json({ messages });
}

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

  if (!member) {
    return NextResponse.json({ error: "Not a group member" }, { status: 403 });
  }

  const body = await req.json();
  const { content } = messageSchema.parse(body);

  const message = await prisma.message.create({
    data: {
      groupId: params.id,
      userId: session.user.id,
      content,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  const pusher = getPusherServer();
  if (pusher) {
    await pusher.trigger(`group-${params.id}`, "new-message", message);
  }

  return NextResponse.json({ message });
}
