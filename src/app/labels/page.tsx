"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { formatHours } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";

interface LabelItem {
  id: string;
  name: string;
  color: string;
  totalHours: number;
}

const COLORS = ["#8B5CF6", "#22D3EE", "#34D399", "#FBBF24", "#F87171", "#F472B6", "#818CF8", "#A3E635"];

export default function LabelsPage() {
  const { toast } = useToast();
  const [labels, setLabels] = useState<LabelItem[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/labels")
      .then((r) => r.json())
      .then((d) => setLabels(d.labels ?? []))
      .finally(() => setLoading(false));
  }, []);

  const createLabel = async () => {
    if (!name.trim()) return;
    const tempId = `temp-${Date.now()}`;
    const optimistic: LabelItem = { id: tempId, name, color, totalHours: 0 };
    setLabels((prev) => [...prev, optimistic]);
    setName("");

    const res = await fetch("/api/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: optimistic.name, color: optimistic.color }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLabels((prev) => prev.filter((l) => l.id !== tempId));
      toast(data.error ?? "Failed to create label", "error");
      return;
    }
    setLabels((prev) =>
      prev.map((l) => (l.id === tempId ? { ...data.label, totalHours: 0 } : l))
    );
    toast("Label created", "success");
  };

  const deleteLabel = async (id: string) => {
    const backup = labels;
    setLabels((prev) => prev.filter((l) => l.id !== id));
    const res = await fetch(`/api/labels?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      setLabels(backup);
      toast("Failed to delete label", "error");
      return;
    }
    toast("Label deleted", "info");
  };

  return (
    <div className="page-shell-narrow">
      <PageHeader title="Labels" subtitle="Tag sessions by subject" />

      <div className="glass-card p-6">
        <p className="stat-label mb-4">New label</p>
        <div className="flex flex-wrap gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Physics, Organic Chemistry…"
            className="input-field min-w-[200px] flex-1"
          />
          <div className="flex gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-full transition-all ${color === c ? "ring-2 ring-[var(--text)] ring-offset-2 ring-offset-[var(--surface)]" : "opacity-70 hover:opacity-100"}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <button onClick={createLabel} className="btn-primary">Add</button>
        </div>
        <p className="mt-3 text-xs text-[var(--text-muted)]">Free: 3 · Premium: 50</p>
      </div>

      <div className="mt-6 space-y-2">
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className="glass-card h-14 animate-pulse" />)
        ) : labels.length === 0 ? (
          <div className="glass-card p-10 text-center text-sm text-[var(--text-muted)]">
            No labels yet
          </div>
        ) : (
          labels.map((label, i) => (
            <motion.div
              key={label.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card flex items-center justify-between px-5 py-4"
            >
              <div className="flex items-center gap-4">
                <span className="h-3 w-3 rounded-full" style={{ background: label.color }} />
                <div>
                  <p className="font-medium">{label.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{formatHours(label.totalHours)}</p>
                </div>
              </div>
              <button onClick={() => deleteLabel(label.id)} className="btn-ghost text-xs text-red-400">
                Remove
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
