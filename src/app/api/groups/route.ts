import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const groups = await prisma.studyGroup.findMany({
    where: { isPublic: true },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ groups });
}

const createSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  isPublic: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const data = createSchema.parse(body);

  const group = await prisma.studyGroup.create({
    data: {
      name: data.name,
      description: data.description,
      isPublic: data.isPublic,
      createdById: session.user.id,
      members: {
        create: { userId: session.user.id, role: "admin" },
      },
    },
    include: { _count: { select: { members: true } } },
  });

  return NextResponse.json({ group });
}
