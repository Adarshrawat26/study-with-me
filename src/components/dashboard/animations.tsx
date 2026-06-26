"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export function CountUp({
  value,
  decimals = 0,
  suffix = "",
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()
  );
  const [text, setText] = useState("0");

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    return display.on("change", (v) => setText(String(v)));
  }, [display]);

  return (
    <span className={className}>
      {text}
      {suffix}
    </span>
  );
}

export function AnimatedWidthBar({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, percent)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={className ?? "h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]"}
      />
    </div>
  );
}

export function FadeIn({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  area?: string;
}) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
