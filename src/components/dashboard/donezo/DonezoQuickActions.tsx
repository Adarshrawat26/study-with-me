import Link from "next/link";

const ACTIONS = [
  { label: "Pomodoro", href: "/", icon: "🍅", desc: "25 min focus", premium: false },
  { label: "Focus mode", href: "/focus", icon: "🎧", desc: "Distraction-free", premium: false },
  { label: "Mini timer", href: "/mini", icon: "📌", desc: "Float anywhere", premium: false },
  { label: "Leaderboard", href: "/leaderboard", icon: "🏆", desc: "Weekly ranks", premium: false },
  { label: "Study groups", href: "/groups", icon: "👥", desc: "Study together", premium: false },
  { label: "Habits", href: "/habits", icon: "✅", desc: "Daily routines", premium: true },
];

export function DonezoQuickActions({ isPremium }: { isPremium: boolean }) {
  return (
    <div className="donezo-panel rounded-2xl border border-pink-100/80 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-heading text-base font-bold text-[#831843]">Quick actions</h2>
      <p className="mt-1 text-xs text-pink-400">Jump into your favorite tools</p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ACTIONS.map((action) => {
          const locked = action.premium && !isPremium;
          const href = locked ? "/pricing" : action.href;
          return (
            <Link
              key={action.href + action.label}
              href={href}
              className="group rounded-xl border border-pink-100 bg-gradient-to-br from-white to-pink-50/30 p-3 transition hover:border-pink-200 hover:shadow-md hover:shadow-pink-100/50"
            >
              <span className="text-xl">{action.icon}</span>
              <p className="mt-2 text-xs font-semibold text-[#831843] group-hover:text-pink-700">
                {action.label}
                {locked ? " 🔒" : ""}
              </p>
              <p className="text-[10px] text-pink-400">{action.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
