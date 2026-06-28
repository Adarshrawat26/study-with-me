function formatHm(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

interface DonezoStatCardsProps {
  totalSessions: number;
  totalHours: number;
  todayMinutes: number;
  dailyAvgMinutes: number;
  completedGoals: number;
  activeGoals: number;
  pendingGoals: number;
  currentStreak: number;
}

function StatCard({
  icon,
  label,
  value,
  hint,
  badge,
  hero,
}: {
  icon: string;
  label: string;
  value: string;
  hint: string;
  badge?: string;
  hero?: boolean;
}) {
  if (hero) {
    return (
      <div className="donezo-stat-hero relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#BE185D] via-[#9D174D] to-[#831843] p-4 text-white shadow-lg shadow-pink-200/40 sm:p-5">
        <div className="donezo-wave-pattern pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl">
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-pink-100">{label}</p>
              {badge && (
                <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium">
                  {badge}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">{value}</p>
            <p className="mt-1 text-sm text-pink-200">{hint}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="donezo-stat-card rounded-2xl border border-pink-100/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-2xl">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-pink-900/70">{label}</p>
          <p className="mt-0.5 text-3xl font-bold tabular-nums text-[#831843] sm:text-4xl">{value}</p>
          <p className="mt-1 text-sm font-medium text-pink-500">{hint}</p>
        </div>
      </div>
    </div>
  );
}

export function DonezoStatCards({
  totalSessions,
  totalHours,
  todayMinutes,
  dailyAvgMinutes,
  completedGoals,
  activeGoals,
  pendingGoals,
  currentStreak,
}: DonezoStatCardsProps) {
  const trend =
    dailyAvgMinutes > 0
      ? todayMinutes >= dailyAvgMinutes
        ? "On track today"
        : "Below your average"
      : "Start your first session";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        hero
        icon="📚"
        badge="All time"
        label="Total study time"
        value={`${totalHours}h`}
        hint={`${totalSessions} sessions · ${currentStreak} day streak`}
      />
      <StatCard
        icon="⏱️"
        label="Today's study"
        value={formatHm(todayMinutes)}
        hint={trend}
      />
      <StatCard
        icon="✅"
        label="Completed goals"
        value={String(completedGoals)}
        hint={`${activeGoals} still in progress`}
      />
      <StatCard
        icon="🎯"
        label="Pending goals"
        value={String(pendingGoals)}
        hint={pendingGoals > 0 ? "Needs attention" : "All caught up"}
      />
    </div>
  );
}
