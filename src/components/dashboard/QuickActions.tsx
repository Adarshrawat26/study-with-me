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
                  ? "rounded-xl bg-gradient-to-r from-pink-500 to-pink-400 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-200 transition hover:from-pink-400 hover:to-pink-300"
                  : "rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm font-medium text-[var(--text)] transition hover:border-pink-300 hover:bg-pink-100"
              }
            >
              <span className="mr-2 opacity-80">{item.icon}</span>
              {item.label}
            </motion.button>
          ))}
        </div>
      </DashboardCard>

      {showHabitGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pink-950/20 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-pink-200 bg-white p-6 shadow-2xl shadow-pink-100">
            <h3 className="font-heading text-lg font-semibold text-[var(--text)]">Habits are Premium</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Upgrade to track weekly habits and build streaks.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowHabitGate(false)}
                className="flex-1 rounded-xl border border-pink-200 py-2.5 text-sm text-[var(--text-muted)] transition hover:bg-pink-50"
              >
                Cancel
              </button>
              <Link
                href="/pricing"
                className="flex-1 rounded-xl bg-pink-500 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-pink-400"
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
