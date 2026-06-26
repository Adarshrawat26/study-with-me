"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { applyThemeVars, type ThemeId } from "@/lib/themes";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  fontSize: "small" | "medium" | "large";
  setFontSize: (size: "small" | "medium" | "large") => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("cosmic");
  const [darkMode, setDarkModeState] = useState(true);
  const [fontSize, setFontSizeState] = useState<"small" | "medium" | "large">(
    "medium"
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("saadhak-theme") as ThemeId | null;
    const savedDark = localStorage.getItem("saadhak-dark");
    const savedFont = localStorage.getItem("saadhak-font-size") as
      | "small"
      | "medium"
      | "large"
      | null;
    if (savedTheme) setThemeState(savedTheme);
    if (savedDark !== null) setDarkModeState(savedDark === "true");
    if (savedFont) setFontSizeState(savedFont);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyThemeVars(theme);
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.dataset.fontSize = fontSize;
    localStorage.setItem("saadhak-theme", theme);
    localStorage.setItem("saadhak-dark", String(darkMode));
    localStorage.setItem("saadhak-font-size", fontSize);
  }, [theme, darkMode, fontSize, mounted]);

  const setTheme = (t: ThemeId) => setThemeState(t);
  const setDarkMode = (d: boolean) => setDarkModeState(d);
  const setFontSize = (s: "small" | "medium" | "large") => setFontSizeState(s);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, darkMode, setDarkMode, fontSize, setFontSize }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
