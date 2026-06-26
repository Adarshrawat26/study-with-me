import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FREE_LIMITS, PREMIUM_LIMITS } from "@/lib/utils";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const labels = await prisma.label.findMany({
    where: { userId: session.user.id },
    include: {
      studySessions: { select: { duration: true } },
    },
    orderBy: { name: "asc" },
  });

  const enriched = labels.map((l) => ({
    id: l.id,
    name: l.name,
    color: l.color,
    totalHours:
      Math.round(
        (l.studySessions.reduce((sum, s) => sum + s.duration, 0) / 3600) * 10
      ) / 10,
  }));

  return NextResponse.json({ labels: enriched });
}

const createSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPremium: true },
  });

  const count = await prisma.label.count({
    where: { userId: session.user.id },
  });

  const limit = user?.isPremium ? PREMIUM_LIMITS.labels : FREE_LIMITS.labels;
  if (count >= limit) {
    return NextResponse.json(
      { error: `Label limit reached (${limit}). Upgrade to Premium.` },
      { status: 403 }
    );
  }

  const body = await req.json();
  const data = createSchema.parse(body);

  const label = await prisma.label.create({
    data: { userId: session.user.id, ...data },
  });

  return NextResponse.json({ label });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.label.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
