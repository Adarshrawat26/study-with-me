"use client";

export function NoiseScene() {
  return (
    <div className="timer-scene timer-scene-noise" aria-hidden>
      <div className="timer-scene-noise__grain" />
      <div className="timer-scene-noise__wave" />
      <div className="timer-scene-noise__wave timer-scene-noise__wave--2" />
    </div>
  );
}
