"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";
import { DAY_LABELS, getWeekDates, dateKey } from "@/lib/habits";
import { cn } from "@/lib/utils";

interface Habit {
  id: string;
  name: string;
  targetDays: number[];
  completedAt: string[];
  streak: number;
  weekPercent: number;
}

function ProgressRing({ percent }: { percent: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <div className="relative flex h-11 w-11 items-center justify-center">
      <svg width="44" height="44" className="absolute -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="4"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span className="text-[9px] font-semibold">{percent}%</span>
    </div>
  );
}

export default function HabitsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const isPremium = session?.user?.isPremium;

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [targetDays, setTargetDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [showCreate, setShowCreate] = useState(false);

  const weekDates = getWeekDates();
  const todayKey = dateKey(new Date());

  const fetchHabits = () => {
    fetch("/api/habits")
      .then((r) => r.json())
      .then((d) => setHabits(d.habits ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isPremium) fetchHabits();
    else setLoading(false);
  }, [isPremium]);

  const toggleDay = (day: number) => {
    setTargetDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const createHabit = async () => {
    if (!name.trim() || targetDays.length === 0) return;
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, targetDays }),
    });
    if (!res.ok) {
      toast("Failed to create habit", "error");
      return;
    }
    toast("Habit created!", "success");
    setName("");
    setShowCreate(false);
    fetchHabits();
  };

  const toggleComplete = async (habitId: string, date: string) => {
    const res = await fetch("/api/habits/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, date }),
    });
    const data = await res.json();
    if (res.ok) {
      setHabits((prev) =>
        prev.map((h) => (h.id === habitId ? data.habit : h))
      );
      if (data.completed) toast("Habit completed!", "success");
    }
  };

  const deleteHabit = async (id: string) => {
    await fetch(`/api/habits?id=${id}`, { method: "DELETE" });
    setHabits((prev) => prev.filter((h) => h.id !== id));
    toast("Habit deleted", "info");
  };

  if (!isPremium) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
        <div className="glass-card max-w-md p-10">
          <h1 className="page-title">Habits</h1>
          <p className="page-subtitle mt-3">
            Weekly habit tracking with streaks and progress. Premium feature.
          </p>
          <Link href="/pricing" className="btn-primary mt-8 inline-flex">
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        title="Habits"
        subtitle="Track daily study routines"
        action={
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            Add habit
          </button>
        }
      />

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-6 glass-card space-y-4 p-6"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Habit name, e.g. Study 2 hours"
            className="input-field"
          />
          <div>
            <p className="mb-2 text-sm text-[var(--text-muted)]">Target days</p>
            <div className="flex flex-wrap gap-2">
              {DAY_LABELS.map((label, i) => {
                const dayNum = i + 1;
                return (
                  <button
                    key={label}
                    onClick={() => toggleDay(dayNum)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                      targetDays.includes(dayNum)
                        ? "bg-[var(--primary)] text-white"
                        : "border border-[var(--border)] text-[var(--text-muted)]"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createHabit} className="btn-primary">Create</button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </motion.div>
      )}

      <div className="mt-8 space-y-4">
        {loading ? (
          [1, 2].map((i) => <div key={i} className="glass-card h-24 animate-pulse" />)
        ) : habits.length === 0 ? (
          <div className="glass-card p-8 text-center text-[var(--text-muted)]">
            No habits yet. Create your first study habit!
          </div>
        ) : (
          habits.map((habit) => (
            <motion.div key={habit.id} className="glass-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ProgressRing percent={habit.weekPercent} />
                  <div>
                    <h3 className="font-medium">{habit.name}</h3>
                    <p className="text-xs text-[var(--text-muted)]">{habit.streak} day streak</p>
                  </div>
                </div>
                <button onClick={() => deleteHabit(habit.id)} className="btn-ghost text-xs text-red-400">
                  Remove
                </button>
              </div>

              {/* Weekly grid */}
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map(({ date, dayNum, label }) => {
                  const key = dateKey(date);
                  const isTarget = habit.targetDays.includes(dayNum);
                  const isDone = habit.completedAt.includes(key);
                  const isToday = key === todayKey;
                  const isFuture = date > new Date();

                  return (
                    <div key={key} className="flex flex-col items-center gap-1">
                      <span className="text-xs text-[var(--text-muted)]">{label}</span>
                      {isTarget ? (
                        <button
                          disabled={isFuture}
                          onClick={() => toggleComplete(habit.id, key)}
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-all",
                            isDone
                              ? "bg-success text-white"
                              : "border border-[var(--border)] hover:border-[var(--primary)]",
                            isToday && "ring-2 ring-[var(--primary)]/50",
                            isFuture && "cursor-not-allowed opacity-40"
                          )}
                        >
                          {isDone ? "Done" : ""}
                        </button>
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-[var(--border)]/30" />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
