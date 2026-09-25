import { useRef } from "react";
import { useTheme } from "../../providers/ThemeProvider";

/**
 * Theme switch: an orb that eclipses into a crescent for dark mode, with a
 * rolling mono label. The page itself changes via a circular reveal from here.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const ref = useRef<HTMLButtonElement>(null);
  const dark = theme === "dark";

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => toggleTheme(ref.current)}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={dark}
      className={`group/theme inline-flex min-h-11 items-center gap-2.5 rounded-full px-2 text-fg ${className}`}
    >
      <span aria-hidden className="relative block size-4 overflow-hidden rounded-full bg-fg">
        <span
          className={`absolute inset-0 rounded-full bg-bg transition-transform duration-700 ease-out motion-reduce:transition-none ${
            dark ? "translate-x-[38%] -translate-y-[30%]" : "translate-x-[110%] -translate-y-[110%]"
          }`}
        />
      </span>
      <span aria-hidden className="t-label relative hidden h-[1.3em] overflow-hidden sm:block">
        <span
          className={`block transition-transform duration-500 ease-out motion-reduce:transition-none ${dark ? "-translate-y-1/2" : "translate-y-0"}`}
        >
          <span className="block">Light</span>
          <span className="block">Dark</span>
        </span>
      </span>
    </button>
  );
}
