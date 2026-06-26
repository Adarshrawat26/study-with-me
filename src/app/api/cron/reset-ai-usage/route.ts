import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const result = await prisma.user.updateMany({
    where: { aiUsageReset: { lt: monthAgo } },
    data: { aiUsageCount: 0, aiUsageReset: new Date() },
  });

  return NextResponse.json({ reset: result.count });
}

export async function POST(req: Request) {
  return GET(req);
}
