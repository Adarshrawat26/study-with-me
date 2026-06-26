export type ThemeId =
  | "cosmic"
  | "ocean"
  | "sunset"
  | "forest"
  | "midnight"
  | "sepia"
  | "mono"
  | "sakura";

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  preview: string;
  vars: Record<string, string>;
}

export const themes: Theme[] = [
  {
    id: "cosmic",
    name: "Cosmic",
    description: "Deep space violet & cyan",
    preview: "linear-gradient(135deg, #7C3AED, #06B6D4)",
    vars: {
      "--background": "#0A0A0F",
      "--surface": "#13131A",
      "--border": "#1E1E2E",
      "--primary": "#7C3AED",
      "--secondary": "#06B6D4",
      "--success": "#10B981",
      "--warning": "#F59E0B",
      "--text": "#F4F4F5",
      "--text-muted": "#A1A1AA",
      "--gradient-from": "#7C3AED",
      "--gradient-to": "#06B6D4",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Deep blue tides",
    preview: "linear-gradient(135deg, #0EA5E9, #0284C7)",
    vars: {
      "--background": "#0B1120",
      "--surface": "#111827",
      "--border": "#1E3A5F",
      "--primary": "#0EA5E9",
      "--secondary": "#38BDF8",
      "--success": "#10B981",
      "--warning": "#F59E0B",
      "--text": "#F0F9FF",
      "--text-muted": "#94A3B8",
      "--gradient-from": "#0EA5E9",
      "--gradient-to": "#0284C7",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm amber glow",
    preview: "linear-gradient(135deg, #F97316, #EC4899)",
    vars: {
      "--background": "#1A0A0A",
      "--surface": "#1F1212",
      "--border": "#3D2020",
      "--primary": "#F97316",
      "--secondary": "#EC4899",
      "--success": "#10B981",
      "--warning": "#FBBF24",
      "--text": "#FFF7ED",
      "--text-muted": "#D6A88A",
      "--gradient-from": "#F97316",
      "--gradient-to": "#EC4899",
    },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Emerald woodland",
    preview: "linear-gradient(135deg, #059669, #84CC16)",
    vars: {
      "--background": "#0A0F0A",
      "--surface": "#111811",
      "--border": "#1E2E1E",
      "--primary": "#059669",
      "--secondary": "#84CC16",
      "--success": "#10B981",
      "--warning": "#F59E0B",
      "--text": "#F0FDF4",
      "--text-muted": "#86EFAC",
      "--gradient-from": "#059669",
      "--gradient-to": "#84CC16",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Pure dark elegance",
    preview: "linear-gradient(135deg, #6366F1, #8B5CF6)",
    vars: {
      "--background": "#09090B",
      "--surface": "#18181B",
      "--border": "#27272A",
      "--primary": "#6366F1",
      "--secondary": "#8B5CF6",
      "--success": "#10B981",
      "--warning": "#F59E0B",
      "--text": "#FAFAFA",
      "--text-muted": "#71717A",
      "--gradient-from": "#6366F1",
      "--gradient-to": "#8B5CF6",
    },
  },
  {
    id: "sepia",
    name: "Sepia",
    description: "Vintage paper tones",
    preview: "linear-gradient(135deg, #D97706, #92400E)",
    vars: {
      "--background": "#1C1410",
      "--surface": "#261C16",
      "--border": "#3D2E24",
      "--primary": "#D97706",
      "--secondary": "#92400E",
      "--success": "#10B981",
      "--warning": "#F59E0B",
      "--text": "#FEF3C7",
      "--text-muted": "#D4A574",
      "--gradient-from": "#D97706",
      "--gradient-to": "#92400E",
    },
  },
  {
    id: "mono",
    name: "Mono",
    description: "Minimal grayscale",
    preview: "linear-gradient(135deg, #71717A, #A1A1AA)",
    vars: {
      "--background": "#0A0A0A",
      "--surface": "#141414",
      "--border": "#262626",
      "--primary": "#E4E4E7",
      "--secondary": "#A1A1AA",
      "--success": "#10B981",
      "--warning": "#F59E0B",
      "--text": "#FAFAFA",
      "--text-muted": "#71717A",
      "--gradient-from": "#71717A",
      "--gradient-to": "#A1A1AA",
    },
  },
  {
    id: "sakura",
    name: "Sakura",
    description: "Soft cherry blossom",
    preview: "linear-gradient(135deg, #F472B6, #FB7185)",
    vars: {
      "--background": "#1A0F14",
      "--surface": "#221018",
      "--border": "#3D2030",
      "--primary": "#F472B6",
      "--secondary": "#FB7185",
      "--success": "#10B981",
      "--warning": "#F59E0B",
      "--text": "#FDF2F8",
      "--text-muted": "#F9A8D4",
      "--gradient-from": "#F472B6",
      "--gradient-to": "#FB7185",
    },
  },
];

export function getTheme(id: ThemeId): Theme {
  return themes.find((t) => t.id === id) ?? themes[0];
}

export function applyThemeVars(id: ThemeId): void {
  const theme = getTheme(id);
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
