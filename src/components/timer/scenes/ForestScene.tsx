"use client";

export function ForestScene() {
  return (
    <div className="timer-scene timer-scene-forest" aria-hidden>
      <div className="timer-scene-forest__sky" />
      <div className="timer-scene-forest__mist" />
      <svg className="timer-scene-forest__trees" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path
          fill="rgba(8, 28, 18, 0.95)"
          d="M0,320 L0,180 Q120,140 240,170 T480,150 T720,175 T960,145 T1200,165 T1440,140 L1440,320 Z"
        />
        <path
          fill="rgba(12, 40, 26, 0.88)"
          d="M0,320 L0,210 Q180,170 360,200 T720,185 T1080,205 T1440,175 L1440,320 Z"
        />
        <path
          fill="rgba(6, 22, 14, 1)"
          d="M0,320 L0,240 Q200,210 400,235 T800,220 T1200,245 T1440,225 L1440,320 Z"
        />
      </svg>
      {Array.from({ length: 8 }, (_, i) => (
        <span
          key={i}
          className="timer-scene-forest__firefly"
          style={{
            left: `${12 + i * 11}%`,
            top: `${28 + (i % 4) * 14}%`,
            animationDelay: `${i * 0.7}s`,
          }}
        />
      ))}
    </div>
  );
}
