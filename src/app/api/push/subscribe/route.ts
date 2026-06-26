import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const data = subscribeSchema.parse(body);

  await prisma.pushSubscription.upsert({
    where: { endpoint: data.endpoint },
    update: {
      userId: session.user.id,
      p256dh: data.keys.p256dh,
      auth: data.keys.auth,
    },
    create: {
      userId: session.user.id,
      endpoint: data.endpoint,
      p256dh: data.keys.p256dh,
      auth: data.keys.auth,
    },
  });

  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: { pushEnabled: true },
    create: { userId: session.user.id, pushEnabled: true },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const endpoint = new URL(req.url).searchParams.get("endpoint");
  if (endpoint) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId: session.user.id },
    });
  } else {
    await prisma.pushSubscription.deleteMany({
      where: { userId: session.user.id },
    });
  }

  await prisma.userSettings.updateMany({
    where: { userId: session.user.id },
    data: { pushEnabled: false },
  });

  return NextResponse.json({ ok: true });
}
