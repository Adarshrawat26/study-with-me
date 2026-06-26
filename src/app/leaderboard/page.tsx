"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/PageHeader";

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  hours: number;
  streak: number;
  isPremium: boolean;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [period, setPeriod] = useState<"weekly" | "alltime">("weekly");
  const [search, setSearch] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);

  useEffect(() => {
    fetch(`/api/leaderboard?period=${period}&search=${search}`)
      .then((r) => r.json())
      .then((d) => {
        setLeaderboard(d.leaderboard ?? []);
        setCurrentUser(d.currentUser ?? null);
      });
  }, [period, search]);

  const rankLabel = (rank: number) => {
    if (rank === 1) return "1st";
    if (rank === 2) return "2nd";
    if (rank === 3) return "3rd";
    return `#${rank}`;
  };

  return (
    <div className="page-shell-narrow">
      <PageHeader title="Rankings" subtitle="Study hours leaderboard" />

      <div className="mb-8 flex flex-wrap gap-3">
        <div className="flex rounded-[var(--radius)] border border-[var(--border-subtle)] p-1">
          {(["weekly", "alltime"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-[calc(var(--radius)-4px)] px-4 py-2 text-sm font-medium capitalize ${
                period === p ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)]"
              }`}
            >
              {p === "alltime" ? "All time" : "Weekly"}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name…"
          className="input-field min-w-[200px] flex-1"
        />
      </div>

      {currentUser && !leaderboard.find((u) => u.id === currentUser.id) && (
        <div className="mb-4 glass-card border-[var(--primary)]/30 px-5 py-4 text-sm">
          Your rank: <strong>{rankLabel(currentUser.rank)}</strong>
          <span className="text-[var(--text-muted)]"> · {currentUser.hours}h · {currentUser.streak}d streak</span>
        </div>
      )}

      <div className="space-y-2">
        {leaderboard.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className={`glass-card flex items-center gap-4 px-5 py-4 ${
              user.id === session?.user?.id ? "border-[var(--primary)]/40" : ""
            }`}
          >
            <span className={`w-10 text-sm font-semibold tabular-nums ${user.rank <= 3 ? "text-[var(--warning)]" : "text-[var(--text-muted)]"}`}>
              {rankLabel(user.rank)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{user.name}</span>
                {user.isPremium && <span className="badge-pro">Pro</span>}
              </div>
              <span className="text-xs text-[var(--text-muted)]">{user.streak} day streak</span>
            </div>
            <span className="font-heading text-lg font-semibold tabular-nums">{user.hours}h</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
