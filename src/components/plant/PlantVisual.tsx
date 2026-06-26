"use client";

import { motion } from "framer-motion";

interface PlantVisualProps {
  stage: number;
  wilting?: boolean;
  size?: "sm" | "lg";
}

export function PlantVisual({ stage, wilting = false, size = "lg" }: PlantVisualProps) {
  const dim = size === "lg" ? 200 : 48;
  const scale = wilting ? 0.9 : 1;
  const leafColor = wilting ? "#78716C" : "#10B981";
  const trunkColor = wilting ? "#57534E" : "#92400E";
  const potColor = wilting ? "#44403C" : "#7C3AED";

  return (
    <motion.svg
      key={stage}
      width={dim}
      height={dim}
      viewBox="0 0 200 200"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale, opacity: wilting ? 0.65 : 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="mx-auto"
    >
      {/* Pot */}
      <rect x="70" y="155" width="60" height="35" rx="4" fill={potColor} opacity="0.8" />
      <rect x="65" y="150" width="70" height="10" rx="3" fill={potColor} />

      {/* Stage 0: Seed */}
      {stage === 0 && (
        <motion.ellipse
          cx="100" cy="140" rx="12" ry="8"
          fill="#92400E"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        />
      )}

      {/* Stage 1: Sprout */}
      {stage === 1 && (
        <>
          <motion.line x1="100" y1="150" x2="100" y2="120" stroke={leafColor} strokeWidth="3"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
          <motion.ellipse cx="100" cy="115" rx="6" ry="10" fill={leafColor}
            animate={{ rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 2 }}
            style={{ transformOrigin: "100px 120px" }} />
        </>
      )}

      {/* Stage 2-3: Seedling / Young */}
      {stage >= 2 && stage <= 3 && (
        <>
          <line x1="100" y1="150" x2="100" y2="90" stroke={trunkColor} strokeWidth={stage >= 3 ? 4 : 3} />
          {[0, 1, 2].slice(0, stage).map((i) => (
            <motion.ellipse
              key={i}
              cx={100 + (i % 2 === 0 ? -20 : 20)}
              cy={110 - i * 15}
              rx="14" ry="8"
              fill={leafColor}
              transform={`rotate(${i % 2 === 0 ? -30 : 30}, ${100 + (i % 2 === 0 ? -20 : 20)}, ${110 - i * 15})`}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2 + i * 0.3, delay: i * 0.2 }}
            />
          ))}
        </>
      )}

      {/* Stage 4-5: Mature / Blooming */}
      {stage >= 4 && stage <= 5 && (
        <>
          <rect x="94" y="80" width="12" height="70" rx="3" fill={trunkColor} />
          <motion.circle cx="100" cy="70" r="35" fill={leafColor} opacity="0.85"
            animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 4 }} />
          {stage >= 5 && [0, 1, 2, 3, 4].map((i) => (
            <motion.circle
              key={i}
              cx={100 + Math.cos((i * 72 * Math.PI) / 180) * 25}
              cy={70 + Math.sin((i * 72 * Math.PI) / 180) * 25}
              r="6"
              fill="#F472B6"
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
            />
          ))}
        </>
      )}

      {/* Stage 6-7: Mighty Tree / Legendary */}
      {stage >= 6 && stage <= 7 && (
        <>
          <rect x="90" y="60" width="20" height="90" rx="4" fill={trunkColor} />
          <motion.ellipse cx="100" cy="55" rx="50" ry="40" fill={leafColor} opacity="0.9"
            animate={{ scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 5 }} />
          <motion.ellipse cx="70" cy="70" rx="25" ry="20" fill={leafColor} opacity="0.7"
            animate={{ x: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 4 }} />
          <motion.ellipse cx="130" cy="70" rx="25" ry="20" fill={leafColor} opacity="0.7"
            animate={{ x: [2, -2, 2] }} transition={{ repeat: Infinity, duration: 4 }} />
          {stage >= 7 && (
            <motion.circle cx="100" cy="30" r="8" fill="#FBBF24"
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
              transition={{ repeat: Infinity, duration: 2 }} />
          )}
        </>
      )}

      {/* Stage 8-9: Mythical / Eternal */}
      {stage >= 8 && (
        <>
          <rect x="88" y="50" width="24" height="100" rx="5" fill={trunkColor} />
          <motion.ellipse cx="100" cy="45" rx="60" ry="45" fill={leafColor} opacity="0.85"
            animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 6 }} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.circle
              key={i}
              cx={100 + Math.cos((i * 60 * Math.PI) / 180) * 55}
              cy={45 + Math.sin((i * 60 * Math.PI) / 180) * 40}
              r="4"
              fill={stage >= 9 ? "#06B6D4" : "#A78BFA"}
              animate={{ opacity: [0.3, 1, 0.3], y: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 3, delay: i * 0.4 }}
            />
          ))}
          {stage >= 9 && (
            <motion.circle cx="100" cy="45" r="70" fill="none" stroke="#06B6D4" strokeWidth="1"
              animate={{ opacity: [0.2, 0.6, 0.2], r: [65, 75, 65] }}
              transition={{ repeat: Infinity, duration: 4 }} />
          )}
        </>
      )}

      {wilting && (
        <text x="100" y="195" textAnchor="middle" fill="#F59E0B" fontSize="10">needs water</text>
      )}
    </motion.svg>
  );
}

export function PlantStageIcon({ stage, active }: { stage: number; active: boolean }) {
  return (
    <div className={`flex flex-col items-center ${active ? "opacity-100" : "opacity-40"}`}>
      <PlantVisual stage={stage} size="sm" />
    </div>
  );
}
