import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resetUserAnalytics } from "@/lib/reset-analytics";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  if (!settings) {
    settings = await prisma.userSettings.create({
      data: { userId: session.user.id },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true },
  });

  return NextResponse.json({
    profile: { name: user?.name, email: user?.email, image: user?.image },
    settings,
  });
}

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  theme: z.string().optional(),
  fontSize: z.enum(["small", "medium", "large"]).optional(),
  darkMode: z.boolean().optional(),
  defaultMode: z.enum(["pomodoro", "stopwatch", "countdown", "focus"]).optional(),
  defaultDuration: z.number().min(60).max(7200).optional(),
  workDuration: z.number().min(60).max(10800).optional(),
  breakDuration: z.number().min(60).max(3600).optional(),
  autoStartBreaks: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const data = updateSchema.parse(body);

  if (data.name) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: data.name },
    });
  }

  const { name: _name, ...settingsData } = data;
  void _name;

  const settings = await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: settingsData,
    create: { userId: session.user.id, ...settingsData },
  });

  return NextResponse.json({ settings });
}

const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (body.action === "reset-analytics") {
    await resetUserAnalytics(session.user.id);
    revalidatePath("/dashboard");
    revalidatePath("/goals");
    revalidatePath("/study-plant");
    revalidatePath("/leaderboard");
    revalidatePath("/habits");
    return NextResponse.json({ ok: true, message: "Analytics reset" });
  }

  if (body.action === "change-password") {
    const { currentPassword, newPassword } = passwordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.password) {
      return NextResponse.json(
        { error: "Password login not enabled for this account" },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.delete({ where: { id: session.user.id } });
  return NextResponse.json({ ok: true });
}
