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
  const [theme, setThemeState] = useState<ThemeId>("blush");
  const [fontSize, setFontSizeState] = useState<"small" | "medium" | "large">(
    "medium"
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("saadhak-theme") as ThemeId | null;
    const savedFont = localStorage.getItem("saadhak-font-size") as
      | "small"
      | "medium"
      | "large"
      | null;
    if (savedTheme && ["blush", "rose", "blossom", "petal", "fuchsia"].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
    if (savedFont) setFontSizeState(savedFont);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyThemeVars(theme);
    document.documentElement.classList.remove("dark");
    document.documentElement.dataset.fontSize = fontSize;
    localStorage.setItem("saadhak-theme", theme);
    localStorage.setItem("saadhak-dark", "false");
    localStorage.setItem("saadhak-font-size", fontSize);
  }, [theme, fontSize, mounted]);

  const setTheme = (t: ThemeId) => setThemeState(t);
  const setFontSize = (s: "small" | "medium" | "large") => setFontSizeState(s);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        darkMode: false,
        setDarkMode: () => {},
        fontSize,
        setFontSize,
      }}
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
