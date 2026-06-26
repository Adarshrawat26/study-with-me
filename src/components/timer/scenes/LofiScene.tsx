"use client";

export function LofiScene() {
  return (
    <div className="timer-scene timer-scene-lofi" aria-hidden>
      <div className="timer-scene-lofi__sky" />
      <div className="timer-scene-lofi__window-frame">
        <div className="timer-scene-lofi__city">
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className="timer-scene-lofi__building"
              style={{
                left: `${i * 8.5}%`,
                height: `${22 + (i % 5) * 10}%`,
                animationDelay: `${(i % 4) * 1.2}s`,
              }}
            />
          ))}
        </div>
      </div>
      <div className="timer-scene-lofi__desk" />
      <div className="timer-scene-lofi__vinyl" />
    </div>
  );
}
