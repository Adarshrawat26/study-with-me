import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/web-push";

export async function GET(req: Request) {
  return POST(req);
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const usersNeedingReminder = await prisma.user.findMany({
    where: {
      OR: [
        { lastStudiedAt: null },
        { lastStudiedAt: { lt: todayStart } },
      ],
      settings: { pushEnabled: true },
    },
    include: {
      pushSubscriptions: true,
    },
  });

  let sent = 0;

  for (const user of usersNeedingReminder) {
    for (const sub of user.pushSubscriptions) {
      try {
        const ok = await sendPushNotification(sub, {
          title: "Keep your streak alive! 🔥",
          body: `Hey ${user.name ?? "there"}, you haven't studied today. Don't break your ${user.currentStreak}-day streak!`,
          url: "/",
        });
        if (ok) sent++;
      } catch {
        // Remove invalid subscriptions
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      }
    }
  }

  return NextResponse.json({ sent, users: usersNeedingReminder.length });
}
