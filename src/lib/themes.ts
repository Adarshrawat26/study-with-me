export type ThemeId = "blush" | "rose" | "blossom" | "petal" | "fuchsia";

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  preview: string;
  vars: Record<string, string>;
}

/** Light pink + white palette. Each theme shifts the primary pink shade. */
const baseLight = {
  "--background": "#FFFFFF",
  "--surface": "#FFFFFF",
  "--surface-elevated": "#FAFAFA",
  "--border": "#FBCFE8",
  "--border-subtle": "#FCE7F3",
  "--text": "#831843",
  "--text-muted": "#9D174D",
  "--success": "#EC4899",
  "--warning": "#DB2777",
  "--pink-soft": "#FDF2F8",
  "--pink-light": "#FBCFE8",
  "--pink-mid": "#F9A8D4",
  "--pink-strong": "#F472B6",
  "--pink-deep": "#DB2777",
  "--pink-rich": "#BE185D",
};

export const themes: Theme[] = [
  {
    id: "blush",
    name: "Blush",
    description: "Soft cotton candy pink",
    preview: "linear-gradient(135deg, #FBCFE8, #F9A8D4)",
    vars: {
      ...baseLight,
      "--primary": "#F472B6",
      "--primary-dim": "rgba(244, 114, 182, 0.14)",
      "--secondary": "#F9A8D4",
      "--gradient-from": "#F9A8D4",
      "--gradient-to": "#F472B6",
    },
  },
  {
    id: "rose",
    name: "Rose",
    description: "Classic rose pink",
    preview: "linear-gradient(135deg, #F472B6, #EC4899)",
    vars: {
      ...baseLight,
      "--primary": "#EC4899",
      "--primary-dim": "rgba(236, 72, 153, 0.14)",
      "--secondary": "#F472B6",
      "--gradient-from": "#F472B6",
      "--gradient-to": "#EC4899",
    },
  },
  {
    id: "blossom",
    name: "Blossom",
    description: "Vibrant cherry blossom",
    preview: "linear-gradient(135deg, #EC4899, #DB2777)",
    vars: {
      ...baseLight,
      "--primary": "#DB2777",
      "--primary-dim": "rgba(219, 39, 119, 0.14)",
      "--secondary": "#EC4899",
      "--gradient-from": "#EC4899",
      "--gradient-to": "#DB2777",
    },
  },
  {
    id: "petal",
    name: "Petal",
    description: "Light petal pink",
    preview: "linear-gradient(135deg, #FCE7F3, #FBCFE8)",
    vars: {
      ...baseLight,
      "--primary": "#F9A8D4",
      "--primary-dim": "rgba(249, 168, 212, 0.2)",
      "--secondary": "#FBCFE8",
      "--gradient-from": "#FBCFE8",
      "--gradient-to": "#F9A8D4",
      "--text": "#9D174D",
      "--text-muted": "#BE185D",
    },
  },
  {
    id: "fuchsia",
    name: "Fuchsia",
    description: "Bold fuchsia accent",
    preview: "linear-gradient(135deg, #DB2777, #BE185D)",
    vars: {
      ...baseLight,
      "--primary": "#BE185D",
      "--primary-dim": "rgba(190, 24, 93, 0.14)",
      "--secondary": "#DB2777",
      "--gradient-from": "#DB2777",
      "--gradient-to": "#BE185D",
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
