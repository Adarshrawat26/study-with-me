"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: [
      "Basic timer (all modes)",
      "5 subject labels",
      "10 study goals",
      "Join up to 3 study groups",
      "AI chat only · 10 prompts/month",
      "14-day dashboard history",
      "Leaderboard & plant growth",
    ],
    cta: "Current Plan",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "₹299",
    period: "/month",
    yearly: "₹1,499/year (save 55%)",
    features: [
      "Everything in Free",
      "50 labels & 50 goals",
      "Create up to 10 groups · join 30",
      "All AI modes · 500 prompts/month",
      "Full-year history & monthly analytics",
      "Heatmap, habits & full stats export",
      "Premium badge & priority support",
    ],
    cta: "Upgrade Now",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Everything in Premium",
      "Coaching institute dashboard",
      "Bulk student accounts",
      "Custom branding",
      "Analytics & reports",
      "Dedicated support",
    ],
    cta: "Contact Us",
    highlighted: false,
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const handleUpgrade = async (plan: "monthly" | "yearly") => {
    if (!session) {
      window.location.href = "/auth/signin?callbackUrl=/pricing";
      return;
    }

    setLoading(plan);

    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (data.error) {
        toast(data.error, "error");
        setLoading(null);
        return;
      }

      if (!razorpayReady || !window.Razorpay) {
        toast("Payment gateway loading — try again in a moment", "info");
        setLoading(null);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Study with me",
        description: plan === "yearly" ? "Premium Yearly Plan" : "Premium Monthly Plan",
        order_id: data.orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              plan,
            }),
          });

          if (verifyRes.ok) {
            toast("Welcome to Premium!", "success");
            window.location.href = "/dashboard";
          } else {
            toast("Payment verification failed", "error");
          }
          setLoading(null);
        },
        prefill: {
          name: session.user?.name ?? "",
          email: session.user?.email ?? "",
        },
        theme: { color: "#7C3AED" },
        modal: {
          ondismiss: () => setLoading(null),
        },
      });

      rzp.open();
    } catch {
      toast("Payment service unavailable", "error");
      setLoading(null);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayReady(true)}
      />

      <div className="page-shell">
        <PageHeader
          title="Plans"
          subtitle="Built for Indian students · UPI, cards & netbanking accepted"
        />
        <p className="-mt-4 mb-10 text-center text-sm text-success">7-day money-back guarantee</p>

        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`glass-card relative p-8 ${
                plan.highlighted ? "border-[var(--primary)] ring-1 ring-[var(--primary)]/40" : ""
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--primary)] px-3 py-0.5 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <div className="mb-6">
                {plan.highlighted && <span className="badge-pro mb-2 inline-block">Pro</span>}
                <h2 className="font-heading text-xl font-bold">{plan.name}</h2>
                <div className="mt-2">
                  <span className="font-heading text-4xl font-bold">{plan.price}</span>
                  <span className="text-[var(--text-muted)]">{plan.period}</span>
                </div>
                {plan.yearly && <p className="mt-1 text-xs text-success">{plan.yearly}</p>}
              </div>
              <ul className="mb-8 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.highlighted ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleUpgrade("monthly")}
                    disabled={!!loading}
                    className="btn-primary w-full"
                  >
                    {loading === "monthly" ? "Processing…" : `${plan.cta} — Monthly`}
                  </button>
                  <button
                    onClick={() => handleUpgrade("yearly")}
                    disabled={!!loading}
                    className="btn-secondary w-full"
                  >
                    {loading === "yearly" ? "Processing…" : "Yearly — ₹1,499"}
                  </button>
                </div>
              ) : plan.name === "Free" ? (
                <Link href="/" className="btn-secondary block w-full text-center">
                  {plan.cta}
                </Link>
              ) : (
                <button className="btn-secondary w-full">{plan.cta}</button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
