"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import {
  DAY_LABELS,
  getWeekDates,
  dateKey,
  jsDayToTarget,
} from "@/lib/habits";
import { cn } from "@/lib/utils";

interface Habit {
  id: string;
  name: string;
  targetDays: number[];
  completedAt: string[];
  streak: number;
  weekPercent: number;
}

const HABIT_TEMPLATES = [
  { name: "Morning study block", days: [1, 2, 3, 4, 5], icon: "🌅" },
  { name: "Evening revision", days: [1, 2, 3, 4, 5], icon: "🌙" },
  { name: "Read for 30 minutes", days: [1, 2, 3, 4, 5, 6, 7], icon: "📖" },
  { name: "Phone-free focus", days: [1, 2, 3, 4, 5], icon: "📵" },
  { name: "Practice problems", days: [1, 3, 5], icon: "✏️" },
];

const ACCENT_COLORS = [
  "#7C3AED",
  "#EC4899",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#6366F1",
];

function habitAccent(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
}

function habitIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("read")) return "📖";
  if (lower.includes("morning")) return "🌅";
  if (lower.includes("evening") || lower.includes("night")) return "🌙";
  if (lower.includes("phone")) return "📵";
  if (lower.includes("exercise") || lower.includes("walk")) return "🏃";
  if (lower.includes("meditat")) return "🧘";
  if (lower.includes("water")) return "💧";
  if (lower.includes("journal")) return "📝";
  return name.charAt(0).toUpperCase() || "✓";
}

function ProgressRing({
  percent,
  color,
  size = "md",
}: {
  percent: number;
  color: string;
  size?: "sm" | "md";
}) {
  const r = size === "sm" ? 14 : 20;
  const dim = size === "sm" ? 36 : 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} className="absolute -rotate-90">
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth="3"
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="text-[10px] font-bold tabular-nums">{percent}%</span>
    </div>
  );
}

function StatPill({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)]/60 px-4 py-3 backdrop-blur-sm">
      <p className="stat-label">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{hint}</p>}
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
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  const weekDates = getWeekDates();
  const todayKey = dateKey(new Date());
  const todayDayNum = jsDayToTarget(new Date().getDay());

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

  const stats = useMemo(() => {
    const dueToday = habits.filter((h) => h.targetDays.includes(todayDayNum));
    const doneToday = dueToday.filter((h) => h.completedAt.includes(todayKey));
    const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
    let weekDone = 0;
    let weekTotal = 0;
    for (const h of habits) {
      for (const { dayNum, date } of weekDates) {
        if (!h.targetDays.includes(dayNum)) continue;
        weekTotal++;
        if (h.completedAt.includes(dateKey(date))) weekDone++;
      }
    }
    const weekPercent = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;
    return {
      dueToday: dueToday.length,
      doneToday: doneToday.length,
      bestStreak,
      weekPercent,
      weekDone,
      weekTotal,
    };
  }, [habits, todayDayNum, todayKey, weekDates]);

  const toggleDay = (day: number) => {
    setTargetDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const applyTemplate = (template: (typeof HABIT_TEMPLATES)[number]) => {
    setName(template.name);
    setTargetDays(template.days);
    setShowCreate(true);
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
    toast("New habit added — let's go!", "success");
    setName("");
    setTargetDays([1, 2, 3, 4, 5]);
    setShowCreate(false);
    fetchHabits();
  };

  const toggleComplete = async (habitId: string, date: string, habitName: string, streak: number) => {
    const res = await fetch("/api/habits/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, date }),
    });
    const data = await res.json();
    if (res.ok) {
      setHabits((prev) => prev.map((h) => (h.id === habitId ? data.habit : h)));
      if (data.completed) {
        setJustCompleted(`${habitId}-${date}`);
        setTimeout(() => setJustCompleted(null), 600);
        const newStreak = data.habit?.streak ?? streak + 1;
        toast(
          newStreak > 1
            ? `${habitName} done! 🔥 ${newStreak}-day streak`
            : `${habitName} checked off!`,
          "success"
        );
      }
    }
  };

  const deleteHabit = async (id: string) => {
    await fetch(`/api/habits?id=${id}`, { method: "DELETE" });
    setHabits((prev) => prev.filter((h) => h.id !== id));
    toast("Habit removed", "info");
  };

  if (!isPremium) {
    return (
      <div className="page-shell-narrow py-8">
        <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--primary-dim)] via-[var(--surface)] to-[var(--background)] p-8 text-center sm:p-12">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl"
          >
            ✅
          </motion.span>
          <h1 className="page-title mt-4">Build study habits that stick</h1>
          <p className="page-subtitle mx-auto mt-3 max-w-md">
            Track weekly routines, keep streaks alive, and watch your consistency grow — a Pro feature.
          </p>
          <div className="mx-auto mt-8 grid max-w-sm grid-cols-7 gap-1.5 opacity-60">
            {DAY_LABELS.map((d) => (
              <div key={d} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-[var(--text-muted)]">{d}</span>
                <div className="h-8 w-8 rounded-lg bg-[var(--primary)]/20" />
              </div>
            ))}
          </div>
          <Link href="/pricing" className="btn-primary mt-8 inline-flex">
            Unlock habits with Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell mx-auto max-w-3xl">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--primary-dim)]/40 via-[var(--surface)] to-[var(--background)] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--primary)]/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
              Weekly tracker
            </p>
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Your habits
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {stats.dueToday > 0
                ? stats.doneToday === stats.dueToday
                  ? "All done for today — amazing! 🎉"
                  : `${stats.doneToday}/${stats.dueToday} habits done today`
                : "No habits scheduled today — enjoy the break"}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary shrink-0 self-start"
          >
            + Add habit
          </button>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill label="Habits" value={habits.length} />
          <StatPill label="Today" value={`${stats.doneToday}/${stats.dueToday}`} hint="completed" />
          <StatPill
            label="Best streak"
            value={stats.bestStreak > 0 ? `${stats.bestStreak}d 🔥` : "—"}
          />
          <StatPill
            label="This week"
            value={`${stats.weekPercent}%`}
            hint={`${stats.weekDone}/${stats.weekTotal} checks`}
          />
        </div>
      </div>

      {/* Quick templates */}
      {!showCreate && habits.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Quick add
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {HABIT_TEMPLATES.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => applyTemplate(t)}
                className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface)]/50 px-3 py-1.5 text-xs font-medium transition hover:border-[var(--primary)] hover:bg-[var(--primary-dim)]"
              >
                <span>{t.icon}</span>
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-6 glass-card space-y-4 p-6"
          >
            <h2 className="section-title">New habit</h2>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Study 2 hours before bed"
              className="input-field"
              autoFocus
            />
            <div>
              <p className="mb-2 text-sm text-[var(--text-muted)]">Which days?</p>
              <div className="flex flex-wrap gap-2">
                {DAY_LABELS.map((label, i) => {
                  const dayNum = i + 1;
                  const selected = targetDays.includes(dayNum);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleDay(dayNum)}
                      className={cn(
                        "rounded-xl px-3.5 py-2 text-xs font-semibold transition-all",
                        selected
                          ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/25"
                          : "border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setTargetDays([1, 2, 3, 4, 5])} className="pill text-xs">
                Weekdays
              </button>
              <button type="button" onClick={() => setTargetDays([1, 2, 3, 4, 5, 6, 7])} className="pill text-xs">
                Every day
              </button>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={createHabit} className="btn-primary">
                Create habit
              </button>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setName("");
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habit list */}
      <div className="mt-8 space-y-4">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-36 animate-pulse rounded-2xl" />
          ))
        ) : habits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-8 text-center"
          >
            <span className="text-4xl">🎯</span>
            <h2 className="section-title mt-4">Start your first streak</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Small daily actions compound into big results. Pick a template or create your own.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {HABIT_TEMPLATES.slice(0, 3).map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-medium transition hover:border-[var(--primary)]"
                >
                  <span>{t.icon}</span>
                  {t.name}
                </button>
              ))}
            </div>
            <button onClick={() => setShowCreate(true)} className="btn-primary mt-6">
              Create custom habit
            </button>
          </motion.div>
        ) : (
          habits.map((habit, index) => {
            const accent = habitAccent(habit.name);
            const icon = habitIcon(habit.name);
            const isDueToday = habit.targetDays.includes(todayDayNum);
            const isDoneToday = habit.completedAt.includes(todayKey);

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card overflow-hidden rounded-2xl"
              >
                <div className="h-1" style={{ backgroundColor: accent }} />

                <div className="p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white shadow-sm"
                        style={{ backgroundColor: accent }}
                      >
                        {icon}
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold">{habit.name}</h3>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          {habit.streak > 0 && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-500">
                              🔥 {habit.streak} day{habit.streak !== 1 ? "s" : ""}
                            </span>
                          )}
                          {isDueToday && !isDoneToday && (
                            <span className="rounded-full bg-[var(--primary-dim)] px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)]">
                              Due today
                            </span>
                          )}
                          {isDueToday && isDoneToday && (
                            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                              Done today ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ProgressRing percent={habit.weekPercent} color={accent} size="sm" />
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="btn-ghost px-2 text-xs text-[var(--text-muted)] hover:text-red-400"
                        aria-label="Remove habit"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Week progress bar */}
                  <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-[var(--border)]/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${habit.weekPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: accent }}
                    />
                  </div>

                  {/* Weekly grid */}
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {weekDates.map(({ date, dayNum, label }) => {
                      const key = dateKey(date);
                      const isTarget = habit.targetDays.includes(dayNum);
                      const isDone = habit.completedAt.includes(key);
                      const isToday = key === todayKey;
                      const isFuture = date > new Date();
                      const popKey = `${habit.id}-${key}`;
                      const isPopping = justCompleted === popKey;

                      return (
                        <div key={key} className="flex flex-col items-center gap-1">
                          <span
                            className={cn(
                              "text-[10px] font-medium",
                              isToday ? "text-[var(--primary)]" : "text-[var(--text-muted)]"
                            )}
                          >
                            {label}
                          </span>
                          {isTarget ? (
                            <motion.button
                              type="button"
                              disabled={isFuture}
                              whileTap={!isFuture ? { scale: 0.88 } : undefined}
                              animate={isPopping ? { scale: [1, 1.2, 1] } : {}}
                              onClick={() =>
                                toggleComplete(habit.id, key, habit.name, habit.streak)
                              }
                              className={cn(
                                "relative flex h-10 w-full max-w-[44px] items-center justify-center rounded-xl text-sm font-bold transition-all sm:h-11",
                                isDone
                                  ? "text-white shadow-md"
                                  : "border-2 border-dashed border-[var(--border)] bg-[var(--surface)]/30 hover:border-[var(--primary)] hover:bg-[var(--primary-dim)]",
                                isToday && !isDone && "ring-2 ring-[var(--primary)]/40",
                                isFuture && "cursor-not-allowed opacity-30"
                              )}
                              style={isDone ? { backgroundColor: accent } : undefined}
                            >
                              {isDone ? "✓" : isToday ? "·" : ""}
                            </motion.button>
                          ) : (
                            <div className="h-10 w-full max-w-[44px] rounded-xl bg-[var(--border)]/20 sm:h-11" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {habits.length > 0 && stats.weekPercent === 100 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center text-sm font-medium text-[var(--primary)]"
        >
          Perfect week — you crushed every habit! 🏆
        </motion.p>
      )}
    </div>
  );
}
