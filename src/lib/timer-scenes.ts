export const TIMER_SCENES = [
  { id: "none", label: "Default", audio: null },
  { id: "planets", label: "Planets", audio: null },
  { id: "rain", label: "Rain", audio: "Rain" as const },
  { id: "forest", label: "Forest", audio: "Forest" as const },
  { id: "cafe", label: "Cafe", audio: "Cafe" as const },
  { id: "lofi", label: "Lofi", audio: "Lofi" as const },
  { id: "noise", label: "White Noise", audio: "White Noise" as const },
] as const;

export type TimerSceneId = (typeof TIMER_SCENES)[number]["id"];
export type AmbientSound = NonNullable<(typeof TIMER_SCENES)[number]["audio"]>;

export const SCENE_STORAGE_KEY = "saadhak-timer-scene";

export function sceneToAudio(sceneId: TimerSceneId): AmbientSound | null {
  return TIMER_SCENES.find((s) => s.id === sceneId)?.audio ?? null;
}
