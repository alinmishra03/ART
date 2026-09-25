import Lenis from "lenis";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "../lib/motion";
import { useReducedMotion } from "../lib/useMediaQuery";

const LenisContext = createContext<Lenis | null>(null);

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis
 * share one frame loop. Touch devices keep native scrolling (syncTouch off),
 * and reduced-motion users get plain native scrolling.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;

    const instance = new Lenis({
      lerp: 0.095,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
    });
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export const useLenis = () => useContext(LenisContext);

type ScrollTarget = string | HTMLElement | number;

/** Scrolls to a target, via Lenis when active, otherwise natively. */
export function useScrollTo() {
  const lenis = useLenis();
  const reduced = useReducedMotion();

  return useCallback(
    (target: ScrollTarget, { offset = 0, immediate = false }: { offset?: number; immediate?: boolean } = {}) => {
      if (lenis) {
        lenis.scrollTo(target, { offset, immediate, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
        return;
      }
      let top: number;
      if (typeof target === "number") top = target;
      else {
        const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
        if (!el) return;
        top = el.getBoundingClientRect().top + window.scrollY;
      }
      window.scrollTo({ top: top + offset, behavior: reduced || immediate ? "auto" : "smooth" });
    },
    [lenis, reduced],
  );
}
