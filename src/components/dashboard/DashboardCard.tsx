import Link from "next/link";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "hero" | "stat";
type CardAccent = "violet" | "cyan" | "amber" | "emerald" | "rose" | "none";

const accentGlow: Record<CardAccent, string> = {
  violet: "before:bg-violet-500/20",
  cyan: "before:bg-cyan-500/20",
  amber: "before:bg-amber-500/20",
  emerald: "before:bg-emerald-500/20",
  rose: "before:bg-rose-500/20",
  none: "before:bg-transparent",
};

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  accent?: CardAccent;
}

export function DashboardCard({
  children,
  className,
  variant = "default",
  accent = "none",
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "dash-card group relative overflow-hidden rounded-2xl border border-white/[0.08] p-5 sm:p-6",
        "bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent",
        "shadow-[0_4px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl",
        "transition-[border-color,box-shadow,transform] duration-300",
        "hover:border-white/[0.14] hover:shadow-[0_8px_40px_rgba(0,0,0,0.28)]",
        variant === "hero" && "dash-card-hero",
        variant === "stat" && "min-h-[148px]",
        accent !== "none" &&
          cn(
            "before:pointer-events-none before:absolute before:-right-8 before:-top-8 before:h-24 before:w-24 before:rounded-full before:blur-2xl",
            accentGlow[accent]
          ),
        className
      )}
    >
      {children}
    </div>
  );
}

export function DashboardSectionHeader({
  title,
  action,
  actionHref,
  badge,
}: {
  title: string;
  action?: string;
  actionHref?: string;
  badge?: string;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <h3 className="font-heading text-base font-semibold tracking-tight text-white">
          {title}
        </h3>
        {badge && (
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
            {badge}
          </span>
        )}
      </div>
      {action && actionHref && (
        <Link
          href={actionHref}
          className="text-xs font-medium text-violet-400 transition-colors hover:text-violet-300"
        >
          {action}
        </Link>
      )}
    </div>
  );
}

export function DashboardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
      {children}
    </p>
  );
}

export function DashboardStatValue({
  children,
  className,
  muted,
}: {
  children: React.ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <p
      className={cn(
        "font-heading text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl",
        muted ? "text-zinc-500" : "text-white",
        className
      )}
    >
      {children}
    </p>
  );
}

export function StatCardSkeleton({ area }: { area?: string }) {
  return (
    <div
      className="dash-card animate-pulse rounded-2xl border border-white/[0.08] p-6"
      data-grid-area={area}
      style={area ? { gridArea: area } : undefined}
    >
      <div className="mb-4 h-3 w-16 rounded bg-white/10" />
      <div className="mb-2 h-10 w-24 rounded bg-white/10" />
      <div className="h-2 w-full rounded bg-white/10" />
    </div>
  );
}

// Kept for backwards compatibility
export function DashboardGridItem({
  area,
  children,
  className,
}: {
  area: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("min-h-0", className)}
      data-grid-area={area}
      style={{ gridArea: area }}
    >
      {children}
    </div>
  );
}
