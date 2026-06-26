"use client";

import { useEffect, useRef, useCallback } from "react";
import type { AmbientSound } from "@/lib/timer-scenes";

/** Procedural ambient audio via Web Audio API — no external files needed */
export function useAmbientAudio(sound: AmbientSound | null, muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const gainRef = useRef<GainNode | null>(null);

  const stop = useCallback(() => {
    nodesRef.current.forEach((n) => {
      try {
        if ("stop" in n && typeof n.stop === "function") (n as OscillatorNode).stop();
        n.disconnect();
      } catch {
        /* already stopped */
      }
    });
    nodesRef.current = [];
    if (ctxRef.current?.state !== "closed") {
      ctxRef.current?.close().catch(() => {});
    }
    ctxRef.current = null;
    gainRef.current = null;
  }, []);

  useEffect(() => {
    if (!sound || muted) {
      stop();
      return;
    }

    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    gain.connect(ctx.destination);
    gainRef.current = gain;
    const nodes: AudioNode[] = [gain];

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const playNoise = (filterFreq: number, q = 1, gainVal = 1) => {
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = filterFreq;
      filter.Q.value = q;
      const g = ctx.createGain();
      g.gain.value = gainVal;
      source.connect(filter);
      filter.connect(g);
      g.connect(gain);
      source.start();
      nodes.push(source, filter, g);
    };

    const playTone = (freq: number, type: OscillatorType, gainVal = 0.03) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = gainVal;
      osc.connect(g);
      g.connect(gain);
      osc.start();
      nodes.push(osc, g);
    };

    switch (sound) {
      case "White Noise":
        playNoise(8000, 0.5, 1);
        break;
      case "Rain":
        playNoise(1200, 2, 0.8);
        playNoise(400, 1, 0.4);
        break;
      case "Forest":
        playNoise(600, 3, 0.5);
        playTone(180, "sine", 0.015);
        playTone(240, "sine", 0.01);
        break;
      case "Cafe":
        playNoise(2000, 0.8, 0.4);
        playTone(110, "triangle", 0.02);
        playTone(165, "triangle", 0.015);
        break;
      case "Lofi":
        playNoise(400, 2, 0.3);
        playTone(220, "sine", 0.04);
        playTone(330, "sine", 0.025);
        playTone(440, "sine", 0.015);
        break;
    }

    nodesRef.current = nodes;

    return () => stop();
  }, [sound, muted, stop]);

  return { stop };
}
