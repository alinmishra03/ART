import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { prefersReducedMotion } from "../lib/motion";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  /** Toggles the theme; pass the triggering element to reveal from its position. */
  toggleTheme: (origin?: HTMLElement | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "theme"; // same key as the original site, so saved preferences carry over
const THEME_COLOR = { light: "#f1efea", dark: "#0e0e0d" } as const;

const readTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable: theme still applies for this visit */
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The inline script in index.html has already applied the initial theme.
  const [theme, setTheme] = useState<Theme>(readTheme);

  const toggleTheme = useCallback((origin?: HTMLElement | null) => {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    const commit = () => {
      applyTheme(next);
      setTheme(next);
    };

    if (prefersReducedMotion()) {
      commit();
      return;
    }

    if (!document.startViewTransition) {
      const root = document.documentElement;
      root.classList.add("theme-fading");
      commit();
      window.setTimeout(() => root.classList.remove("theme-fading"), 450);
      return;
    }

    // Circular reveal expanding from the toggle.
    const rect = origin?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 48;
    const y = rect ? rect.top + rect.height / 2 : 40;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(() => flushSync(commit));
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 750, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {});
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
