"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { TimerSceneId } from "@/lib/timer-scenes";
import { RainScene } from "./RainScene";
import { ForestScene } from "./ForestScene";
import { PlanetsScene } from "./PlanetsScene";
import { CafeScene } from "./CafeScene";
import { LofiScene } from "./LofiScene";
import { NoiseScene } from "./NoiseScene";

interface TimerSceneBackgroundProps {
  scene: TimerSceneId;
}

function SceneContent({ scene }: { scene: TimerSceneId }) {
  switch (scene) {
    case "rain":
      return <RainScene />;
    case "forest":
      return <ForestScene />;
    case "planets":
      return <PlanetsScene />;
    case "cafe":
      return <CafeScene />;
    case "lofi":
      return <LofiScene />;
    case "noise":
      return <NoiseScene />;
    default:
      return null;
  }
}

export function TimerSceneBackground({ scene }: TimerSceneBackgroundProps) {
  return (
    <div className="timer-scene-layer">
      <AnimatePresence mode="wait">
        {scene !== "none" && (
          <motion.div
            key={scene}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="timer-scene-layer__inner"
          >
            <SceneContent scene={scene} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
