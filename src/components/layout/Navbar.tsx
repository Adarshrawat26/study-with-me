"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Timer" },
  { href: "/flip-clock", label: "Flip clock" },
  { href: "/study-with-me", label: "Study with me" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/labels", label: "Labels" },
  { href: "/goals", label: "Goals" },
  { href: "/ai-helper", label: "AI" },
  { href: "/groups", label: "Groups" },
  { href: "/leaderboard", label: "Rankings" },
  { href: "/study-plant", label: "Plant" },
  { href: "/habits", label: "Habits" },
  { href: "/exams", label: "Exams" },
  { href: "/focus", label: "Focus" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname === "/flip-clock") return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--background)]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="h-5 w-1 rounded-full bg-gradient-to-b from-[var(--gradient-from)] to-[var(--gradient-to)] transition-all group-hover:h-6" />
          <span className="font-heading text-base font-semibold tracking-tight">Study with me</span>
        </Link>

        <div className="hidden h-full items-center lg:flex">
          {navLinks.slice(0, 6).map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "nav-link",
                pathname === href && "nav-link-active"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/appearance" className="btn-ghost hidden h-9 items-center text-xs sm:inline-flex">
            Theme
          </Link>

          {!mounted ? (
            <span className="inline-flex h-9 w-[4.5rem] rounded-full bg-[var(--surface)]/50" aria-hidden />
          ) : session ? (
            <div className="flex items-center gap-3">
              {session.user.isPremium && <span className="badge-pro">Pro</span>}
              <span className="hidden text-sm text-[var(--text-muted)] sm:inline">
                {session.user.name?.split(" ")[0]}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-ghost text-xs"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/auth/signin" className="btn-primary inline-flex h-9 items-center px-4 text-xs">
              Sign in
            </Link>
          )}

          <button
            className="btn-ghost px-2 text-xs lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[var(--border-subtle)] lg:hidden"
          >
            <div className="grid grid-cols-2 gap-1 p-4">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium",
                    pathname === href
                      ? "bg-[var(--primary-dim)] text-[var(--primary)]"
                      : "text-[var(--text-muted)]"
                  )}
                >
                  {label}
                </Link>
              ))}
              <Link href="/appearance" onClick={() => setMobileOpen(false)} className="rounded-[var(--radius)] px-3 py-2.5 text-sm text-[var(--text-muted)]">
                Theme
              </Link>
              <Link href="/settings" onClick={() => setMobileOpen(false)} className="rounded-[var(--radius)] px-3 py-2.5 text-sm text-[var(--text-muted)]">
                Settings
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
