import Link from "next/link";
import { STUDY_PRESET_LIST } from "@/lib/study-presets";
import { PageHeader } from "@/components/layout/PageHeader";

export default function PresetsPage() {
  return (
    <div className="page-shell-narrow">
      <PageHeader
        title="Study presets"
        subtitle="Ready-made countdown timers — free, no account needed"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {STUDY_PRESET_LIST.map((preset) => (
          <Link
            key={preset.slug}
            href={`/${preset.slug}`}
            className="glass-card p-5 transition-colors hover:border-[var(--primary)]/40"
          >
            <h3 className="font-heading font-semibold">{preset.title}</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{preset.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
