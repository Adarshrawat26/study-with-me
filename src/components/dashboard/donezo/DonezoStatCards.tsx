function formatHm(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

interface DonezoStatCardsProps {
  totalSessions: number;
  todayMinutes: number;
  dailyAvgMinutes: number;
  completedGoals: number;
  activeGoals: number;
  pendingGoals: number;
  currentStreak: number;
}

export function DonezoStatCards({
  totalSessions,
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Hero card — deep pink solid (Donezo "Total Projects" treatment) */}
      <div className="donezo-stat-hero relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#BE185D] via-[#9D174D] to-[#831843] p-5 text-white shadow-lg shadow-pink-200/40">
        <div className="donezo-wave-pattern pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative">
          <div className="mb-8 flex items-start justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg">
              📚
            </span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium">
              All time
            </span>
          </div>
          <p className="text-4xl font-bold tabular-nums tracking-tight">{totalSessions}</p>
          <p className="mt-1 text-sm font-medium text-pink-100">Total sessions</p>
          <p className="mt-3 flex items-center gap-1 text-xs text-pink-200">
            <span className="text-pink-100">↑</span>
            {currentStreak} day streak
          </p>
        </div>
      </div>

      {/* White cards — pink accent on trend text only */}
      <div className="donezo-stat-card rounded-2xl border border-pink-100/80 bg-white p-5 shadow-sm">
        <div className="mb-6 flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-50 text-lg">
            ⏱️
          </span>
        </div>
        <p className="text-3xl font-bold tabular-nums text-[#831843]">{formatHm(todayMinutes)}</p>
        <p className="mt-1 text-sm font-medium text-pink-900/70">Today&apos;s study</p>
        <p className="mt-3 text-xs font-medium text-pink-500">{trend}</p>
      </div>

      <div className="donezo-stat-card rounded-2xl border border-pink-100/80 bg-white p-5 shadow-sm">
        <div className="mb-6 flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-50 text-lg">
            ✅
          </span>
        </div>
        <p className="text-3xl font-bold tabular-nums text-[#831843]">{completedGoals}</p>
        <p className="mt-1 text-sm font-medium text-pink-900/70">Completed goals</p>
        <p className="mt-3 text-xs font-medium text-pink-500">
          {activeGoals} still in progress
        </p>
      </div>

      <div className="donezo-stat-card rounded-2xl border border-pink-100/80 bg-white p-5 shadow-sm">
        <div className="mb-6 flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-50 text-lg">
            🎯
          </span>
        </div>
        <p className="text-3xl font-bold tabular-nums text-[#831843]">{pendingGoals}</p>
        <p className="mt-1 text-sm font-medium text-pink-900/70">Pending goals</p>
        <p className="mt-3 text-xs font-medium text-pink-500">
          {pendingGoals > 0 ? "Needs attention" : "All caught up"}
        </p>
      </div>
    </div>
  );
}
