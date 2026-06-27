"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";
import { FREE_LIMITS, PREMIUM_LIMITS } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  targetHrs: number;
  progress: number;
  deadline: string | null;
}

export default function GoalsPage() {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [targetHrs, setTargetHrs] = useState(10);
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    fetch("/api/goals").then((r) => r.json()).then((d) => setGoals(d.goals ?? []));
  }, []);

  const createGoal = async () => {
    if (!title.trim()) return;
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, targetHrs, deadline: deadline || null }),
    });
    const data = await res.json();
    if (!res.ok) { toast(data.error ?? "Failed", "error"); return; }
    toast("Goal created", "success");
    setTitle("");
    setGoals((g) => [...g, data.goal]);
  };

  return (
    <div className="page-shell-narrow">
      <PageHeader title="Goals" subtitle="Set targets and track progress" />

      <div className="glass-card p-6">
        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal title" className="input-field" />
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="number" value={targetHrs} onChange={(e) => setTargetHrs(+e.target.value)} placeholder="Target hours" className="input-field" />
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input-field" />
          </div>
          <button onClick={createGoal} className="btn-primary">Add goal</button>
        </div>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Free: {FREE_LIMITS.goals} · Premium: {PREMIUM_LIMITS.goals}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {goals.length === 0 ? (
          <div className="glass-card p-10 text-center text-sm text-[var(--text-muted)]">No goals yet</div>
        ) : goals.map((goal) => {
          const pct = Math.min(100, (goal.progress / goal.targetHrs) * 100);
          const overdue = goal.deadline && new Date(goal.deadline) < new Date() && pct < 100;
          return (
            <motion.div key={goal.id} className={`glass-card p-5 ${overdue ? "border-red-500/40" : ""}`}>
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-medium">{goal.title}</h3>
                <span className="text-sm tabular-nums text-[var(--text-muted)]">{goal.progress.toFixed(1)} / {goal.targetHrs}h</span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                <div className="h-full rounded-full bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              {overdue && <p className="mt-2 text-xs text-red-400">Overdue</p>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
