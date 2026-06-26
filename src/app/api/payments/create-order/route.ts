import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PLANS = {
  monthly: { amount: 29900, label: "Premium Monthly" },
  yearly: { amount: 149900, label: "Premium Yearly" },
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { error: "Razorpay not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env" },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const plan = (body.plan === "yearly" ? "yearly" : "monthly") as keyof typeof PLANS;
  const { amount } = PLANS[plan];

  try {
    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `saadhak_${session.user.id}_${Date.now()}`,
      notes: { plan, userId: session.user.id },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID,
      plan,
    });
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
