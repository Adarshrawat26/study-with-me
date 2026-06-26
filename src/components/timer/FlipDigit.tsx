"use client";

import { motion, AnimatePresence } from "framer-motion";

interface FlipDigitProps {
  value: string;
  size?: "md" | "lg";
}

export function FlipDigit({ value, size = "lg" }: FlipDigitProps) {
  return (
    <div className={size === "lg" ? "flip-digit flip-digit--lg" : "flip-digit"}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flip-digit__face"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

interface FlipTimeProps {
  time: string;
  size?: "md" | "lg";
}

export function FlipTime({ time, size = "lg" }: FlipTimeProps) {
  const parts = time.split(":");
  const showHours = parts.length === 3;

  return (
    <div className="flip-time">
      {showHours && (
        <>
          <FlipDigit value={parts[0][0]} size={size} />
          <FlipDigit value={parts[0][1]} size={size} />
          <span className="flip-time__colon">:</span>
        </>
      )}
      <FlipDigit value={parts[showHours ? 1 : 0][0]} size={size} />
      <FlipDigit value={parts[showHours ? 1 : 0][1]} size={size} />
      <span className="flip-time__colon">:</span>
      <FlipDigit value={parts[showHours ? 2 : 1][0]} size={size} />
      <FlipDigit value={parts[showHours ? 2 : 1][1]} size={size} />
    </div>
  );
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function formatWallClock(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatFlipDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}
