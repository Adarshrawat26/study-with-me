import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { z } from "zod";

const verifySchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  signature: z.string(),
  plan: z.enum(["monthly", "yearly"]).default("monthly"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const data = verifySchema.parse(body);

  if (!verifyRazorpaySignature(data.orderId, data.paymentId, data.signature)) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { isPremium: true },
  });

  return NextResponse.json({ success: true, isPremium: true });
}
