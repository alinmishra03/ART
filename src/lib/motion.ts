import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/** Media queries shared by every animated component (use with gsap.matchMedia). */
export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  fine: "(hover: hover) and (pointer: fine)",
  mobile: "(max-width: 47.99rem)",
  desktop: "(min-width: 64rem)",
} as const;

/** Eases mirror the CSS tokens in styles/tokens.css. */
export const EASE = {
  out: "expo.out",
  inOut: "power3.inOut",
  soft: "power2.out",
  settle: "elastic.out(1, 0.45)",
} as const;

export const DUR = {
  fast: 0.35,
  base: 0.8,
  slow: 1.2,
  xslow: 1.6,
} as const;

export const STAGGER = {
  chars: 0.022,
  words: 0.045,
  lines: 0.09,
  items: 0.08,
} as const;

/** Default viewport entry point for scroll-triggered reveals. */
export const REVEAL_START = "top 88%";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia(MQ.reduce).matches;

export { gsap, ScrollTrigger, SplitText, useGSAP };
