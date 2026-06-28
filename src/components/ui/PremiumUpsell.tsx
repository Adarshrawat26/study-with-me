import Link from "next/link";

interface PremiumUpsellProps {
  title?: string;
  description?: string;
  compact?: boolean;
  className?: string;
}

export function PremiumUpsell({
  title = "Premium feature",
  description = "Upgrade to unlock full history, habits, AI modes, and more.",
  compact = false,
  className = "",
}: PremiumUpsellProps) {
  if (compact) {
    return (
      <p className={`text-xs text-pink-500 ${className}`}>
        {title} —{" "}
        <Link href="/pricing" className="font-semibold text-pink-600 hover:text-pink-800">
          Upgrade
        </Link>
      </p>
    );
  }

  return (
    <div
      className={`rounded-xl border border-pink-200 bg-gradient-to-br from-pink-50 to-white p-4 ${className}`}
    >
      <p className="font-heading text-sm font-semibold text-[#831843]">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-pink-500">{description}</p>
      <Link
        href="/pricing"
        className="mt-3 inline-flex rounded-lg bg-gradient-to-r from-pink-600 to-rose-500 px-3 py-1.5 text-xs font-semibold text-white"
      >
        View Premium
      </Link>
    </div>
  );
}
