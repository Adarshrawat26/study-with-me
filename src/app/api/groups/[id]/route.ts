import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPremiumAccess } from "@/lib/premium-access";
import { FREE_LIMITS, PREMIUM_LIMITS } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const group = await prisma.studyGroup.findUnique({
    where: { id: params.id },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              isPremium: true,
              email: true,
              totalHours: true,
              currentStreak: true,
              studySessions: {
                where: {
                  createdAt: {
                    gte: (() => {
                      const d = new Date();
                      d.setDate(d.getDate() - d.getDay());
                      d.setHours(0, 0, 0, 0);
                      return d;
                    })(),
                  },
                },
                select: { duration: true },
              },
            },
          },
        },
      },
      messages: {
        take: 50,
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const isMember = group.members.some((m) => m.userId === session.user!.id);

  const leaderboard = group.members
    .map((m) => ({
      id: m.user.id,
      name: m.user.name ?? "Anonymous",
      hours:
        Math.round(
          (m.user.studySessions.reduce((s, ss) => s + ss.duration, 0) / 3600) * 10
        ) / 10,
      streak: m.user.currentStreak,
      isPremium: hasPremiumAccess({
        id: m.user.id,
        email: m.user.email,
        isPremium: m.user.isPremium,
      }),
    }))
    .sort((a, b) => b.hours - a.hours);

  return NextResponse.json({
    group: {
      id: group.id,
      name: group.name,
      description: group.description,
      isPublic: group.isPublic,
      createdById: group.createdById,
    },
    members: group.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      role: m.role,
      isPremium: hasPremiumAccess({
        id: m.user.id,
        email: m.user.email,
        isPremium: m.user.isPremium,
      }),
    })),
    messages: group.messages,
    leaderboard,
    isMember,
  });
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: { userId: session.user.id, groupId: params.id },
    },
  });

  if (existing) {
    return NextResponse.json({ ok: true, alreadyMember: true });
  }

  const memberCount = await prisma.groupMember.count({
    where: { userId: session.user.id },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPremium: true, email: true },
  });

  const isPremium = hasPremiumAccess({
    id: session.user.id,
    email: user?.email ?? session.user.email,
    isPremium: user?.isPremium,
  });
  const limit = isPremium ? PREMIUM_LIMITS.groupsJoin : FREE_LIMITS.groupsJoin;
  if (memberCount >= limit) {
    return NextResponse.json(
      { error: `Group limit reached (${limit})` },
      { status: 403 }
    );
  }

  await prisma.groupMember.create({
    data: { userId: session.user.id, groupId: params.id },
  });

  return NextResponse.json({ ok: true });
}
