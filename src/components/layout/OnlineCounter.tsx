"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export function OnlineCounter() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (pathname === "/flip-clock") return;
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/online-count");
        const data = await res.json();
        setCount(data.count ?? 0);
      } catch {
        setCount(Math.floor(Math.random() * 200) + 50);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [pathname]);

  if (pathname === "/flip-clock") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface)]/90 px-4 py-2 text-xs backdrop-blur-md sm:left-auto sm:translate-x-0 sm:right-5"
    >
      <span className="text-[var(--text-muted)]">
        <span className="font-medium text-[var(--text)]">{count}</span> studying
      </span>
    </motion.div>
  );
}
