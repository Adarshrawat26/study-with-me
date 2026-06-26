"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardCard, DashboardSectionHeader } from "./DashboardCard";

const ACTIONS = [
  { label: "Start timer", icon: "▶", href: "/", primary: true },
  { label: "Add habit", icon: "+", action: "habit" as const, primary: false },
  { label: "Leaderboard", icon: "🏆", href: "/leaderboard", primary: false },
  { label: "Find a group", icon: "👥", href: "/groups", primary: false },
];

export function QuickActions({ isPremium }: { isPremium: boolean }) {
  const router = useRouter();
  const [showHabitGate, setShowHabitGate] = useState(false);

  const handleClick = (item: (typeof ACTIONS)[number]) => {
    if ("action" in item && item.action === "habit") {
      if (isPremium) {
        router.push("/habits");
      } else {
        setShowHabitGate(true);
      }
      return;
    }
    if ("href" in item && item.href) router.push(item.href);
  };

  return (
    <>
      <DashboardCard>
        <DashboardSectionHeader title="Quick actions" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {ACTIONS.map((item) => (
            <motion.button
              key={item.label}
              type="button"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleClick(item)}
              className={
                item.primary
                  ? "rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-violet-400"
                  : "rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.08]"
              }
            >
              <span className="mr-2 opacity-80">{item.icon}</span>
              {item.label}
            </motion.button>
          ))}
        </div>
      </DashboardCard>

      {showHabitGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f0f14] p-6 shadow-2xl">
            <h3 className="font-heading text-lg font-semibold text-white">Habits are Premium</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Upgrade to track weekly habits and build streaks.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowHabitGate(false)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-zinc-400 transition hover:bg-white/5"
              >
                Cancel
              </button>
              <Link
                href="/pricing"
                className="flex-1 rounded-xl bg-violet-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                Upgrade
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
