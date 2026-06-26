"use client";

import { motion } from "framer-motion";

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  top: `${(i * 23) % 85}%`,
  size: i % 5 === 0 ? 2 : 1,
  delay: (i % 7) * 0.4,
}));

export function PlanetsScene() {
  return (
    <div className="timer-scene timer-scene-planets" aria-hidden>
      <div className="timer-scene-planets__nebula" />
      {STARS.map((star) => (
        <span
          key={star.id}
          className="timer-scene-planets__star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      <motion.div
        className="timer-scene-planets__planet timer-scene-planets__planet--large"
        animate={{ y: [0, -12, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="timer-scene-planets__ring" />
      </motion.div>

      <motion.div
        className="timer-scene-planets__planet timer-scene-planets__planet--mid"
        animate={{ y: [0, 10, 0], x: [0, 6, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="timer-scene-planets__planet timer-scene-planets__planet--small"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="timer-scene-planets__moon"
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
