"use client";

const DROP_COUNT = 48;

export function RainScene() {
  return (
    <div className="timer-scene timer-scene-rain" aria-hidden>
      <div className="timer-scene-rain__sky" />
      <div className="timer-scene-rain__window">
        <div className="timer-scene-rain__pane" />
        <div className="timer-scene-rain__drops">
          {Array.from({ length: DROP_COUNT }, (_, i) => (
            <span
              key={i}
              className="timer-scene-rain__drop"
              style={{
                left: `${(i * 17) % 100}%`,
                animationDelay: `${(i * 0.13) % 2}s`,
                animationDuration: `${0.55 + (i % 5) * 0.12}s`,
                opacity: 0.35 + (i % 4) * 0.12,
                height: `${14 + (i % 3) * 8}px`,
              }}
            />
          ))}
        </div>
        <div className="timer-scene-rain__mist" />
      </div>
    </div>
  );
}
