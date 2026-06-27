import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hero" | "stat";
}

export function DashboardCard({
  children,
  className,
  variant = "default",
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "dash-card group relative overflow-hidden rounded-[1.75rem] p-5 sm:p-6",
        "border border-pink-100/80 bg-white",
        "shadow-[0_1px_2px_rgba(131,24,67,0.04),0_8px_28px_rgba(236,72,153,0.07)]",
        "ring-1 ring-white/80",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:border-pink-200/90",
        "hover:shadow-[0_2px_4px_rgba(131,24,67,0.05),0_16px_40px_rgba(236,72,153,0.1)]",
        variant === "hero" && "dash-card-hero ring-pink-100/60",
        variant === "stat" && "min-h-[156px]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] bg-gradient-to-b from-white via-white to-pink-50/15 opacity-90" />
      <div className="relative z-[1]">{children}</div>
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
        <h3 className="font-heading text-base font-semibold tracking-tight text-[var(--text)]">
          {title}
        </h3>
        {badge && (
          <span className="rounded-full border border-pink-100 bg-pink-50 px-2.5 py-0.5 text-xs font-medium text-[var(--primary)]">
            {badge}
          </span>
        )}
      </div>
      {action && actionHref && (
        <Link
          href={actionHref}
          className="text-xs font-medium text-[var(--primary)] transition-colors hover:text-[var(--secondary)]"
        >
          {action}
        </Link>
      )}
    </div>
  );
}

export function DashboardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
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
        "font-heading text-3xl font-semibold tabular-nums tracking-tight sm:text-[2.25rem]",
        muted ? "text-[var(--text-muted)]" : "text-[var(--text)]",
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
      className="dash-card animate-pulse rounded-[1.75rem] border border-pink-100 bg-white p-6 shadow-sm"
      data-grid-area={area}
      style={area ? { gridArea: area } : undefined}
    >
      <div className="mb-4 h-3 w-16 rounded-full bg-pink-100" />
      <div className="mb-2 h-10 w-24 rounded-full bg-pink-100" />
      <div className="h-2 w-full rounded-full bg-pink-50" />
    </div>
  );
}

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
