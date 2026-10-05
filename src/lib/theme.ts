"use client";
import { createContext, useContext, useEffect, useState, ReactNode, createElement } from "react";

type Theme = "light" | "dark";
interface ThemeContextType { theme: Theme; toggle: () => void; }
const ThemeContext = createContext<ThemeContextType>({ theme: "light", toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("theme"); } catch { /* Theme still works when storage is unavailable. */ }
    if (saved === 'light' || saved === 'dark') setTheme(saved);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try { localStorage.setItem("theme", theme); } catch { /* The selected theme lasts for this visit. */ }
  }, [theme]);
  const toggle = () => setTheme(t => t === "light" ? "dark" : "light");
  return createElement(ThemeContext.Provider, { value: { theme, toggle } }, children);
}

export const useTheme = () => useContext(ThemeContext);
