import Link from "next/link";
import { EXAM_TIMER_LIST } from "@/lib/exam-timers";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ExamsIndexPage() {
  const indian = EXAM_TIMER_LIST.filter((e) =>
    ["jee-timer", "neet-timer", "upsc-timer", "cat-timer", "gate-timer"].includes(e.slug)
  );
  const general = EXAM_TIMER_LIST.filter((e) => !indian.includes(e));

  return (
    <div className="page-shell-narrow">
      <PageHeader
        title="Exam timers"
        subtitle="Preset countdown timers — free, no account needed"
      />

      <section className="mb-10">
        <h2 className="section-title mb-4">International & general</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {general.map((exam) => (
            <Link
              key={exam.slug}
              href={`/${exam.slug}`}
              className="glass-card p-5 transition-colors hover:border-[var(--primary)]/40"
            >
              <h3 className="font-heading font-semibold">{exam.title}</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{exam.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title mb-4">Indian competitive exams</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {indian.map((exam) => (
            <Link
              key={exam.slug}
              href={`/${exam.slug}`}
              className="glass-card p-5 transition-colors hover:border-[var(--primary)]/40"
            >
              <h3 className="font-heading font-semibold">{exam.title}</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{exam.label}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
