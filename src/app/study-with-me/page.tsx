"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MinimalTimer } from "@/components/timer/MinimalTimer";
import { useMotivationalQuote } from "@/hooks/useMotivationalQuote";

export default function StudyWithMePage() {
  const [count, setCount] = useState(0);
  const quote = useMotivationalQuote();

  useEffect(() => {
    const fetchCount = () =>
      fetch("/api/online-count")
        .then((r) => r.json())
        .then((d) => setCount(d.count ?? 0))
        .catch(() => {});

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="page-shell-narrow pb-4 pt-8 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="stat-label">Study with me</p>
          <h1 className="page-title mt-2">You&apos;re not alone</h1>
          <p className="page-subtitle mx-auto max-w-lg">
            Body-doubling works. Right now{" "}
            <span className="font-semibold text-[var(--primary)]">{count}</span> students are
            studying alongside you.
          </p>
        </motion.div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/flip-clock" className="btn-secondary text-sm">
            Flip clock screensaver
          </Link>
          <Link href="/focus" className="btn-secondary text-sm">
            Focus mode
          </Link>
          <Link href="/presets" className="btn-secondary text-sm">
            Study presets
          </Link>
        </div>

        <p className="mx-auto mt-6 max-w-md text-sm italic text-[var(--text-muted)]">
          &ldquo;{quote}&rdquo;
        </p>
      </div>

      <MinimalTimer defaultMinutes={25} />
    </div>
  );
}
