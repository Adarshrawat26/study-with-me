"use client";

export function CafeScene() {
  return (
    <div className="timer-scene timer-scene-cafe" aria-hidden>
      <div className="timer-scene-cafe__wall" />
      <div className="timer-scene-cafe__window">
        <div className="timer-scene-cafe__window-light" />
      </div>
      <div className="timer-scene-cafe__counter" />
      {Array.from({ length: 3 }, (_, i) => (
        <span
          key={i}
          className="timer-scene-cafe__steam"
          style={{ left: `${42 + i * 4}%`, animationDelay: `${i * 0.8}s` }}
        />
      ))}
      <div className="timer-scene-cafe__lamp-glow" />
    </div>
  );
}
