"use client";

import { motion } from "framer-motion";
import { themes } from "@/lib/themes";
import { useTheme } from "@/components/providers/ThemeProvider";
import { PageHeader } from "@/components/layout/PageHeader";

export default function AppearancePage() {
  const { theme, setTheme, darkMode, setDarkMode, fontSize, setFontSize } = useTheme();

  return (
    <div className="page-shell">
      <PageHeader title="Appearance" subtitle="Themes and display preferences" />

      <p className="stat-label mb-4">Color theme</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {themes.map((t) => (
          <motion.button
            key={t.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTheme(t.id)}
            className={`glass-card overflow-hidden p-4 text-left transition-all ${
              theme === t.id ? "border-[var(--primary)] ring-1 ring-[var(--primary)]/40" : ""
            }`}
          >
            <div className="mb-3 h-14 rounded-[calc(var(--radius)-4px)]" style={{ background: t.preview }} />
            <p className="font-medium">{t.name}</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">{t.description}</p>
          </motion.button>
        ))}
      </div>

      <div className="mt-10 glass-card p-6">
        <p className="section-title mb-6">Display</p>
        <div className="space-y-6">
          <label className="flex items-center justify-between">
            <span className="text-sm">Dark mode</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative h-7 w-12 rounded-full transition-colors ${darkMode ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`}
            >
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${darkMode ? "left-5" : "left-0.5"}`} />
            </button>
          </label>
          <div>
            <span className="text-sm text-[var(--text-muted)]">Font size</span>
            <div className="mt-3 flex gap-2">
              {(["small", "medium", "large"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`pill capitalize ${fontSize === size ? "pill-active" : "text-[var(--text-muted)]"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
