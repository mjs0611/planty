"use client";
import { createContext, useContext, useEffect, useState, ReactNode, createElement } from "react";

type Theme = "light" | "dark";
interface ThemeContextType { theme: Theme; toggle: () => void; }
const ThemeContext = createContext<ThemeContextType>({ theme: "light", toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) setTheme(saved);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggle = () => setTheme(t => t === "light" ? "dark" : "light");
  return createElement(ThemeContext.Provider, { value: { theme, toggle } }, children);
}

export const useTheme = () => useContext(ThemeContext);
