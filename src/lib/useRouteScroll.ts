import { useEffect } from "react";
import { useLenis, useScrollTo } from "../providers/SmoothScroll";
import { ScrollTrigger } from "./motion";
import { savedScrollY } from "./router";

/**
 * Initial scroll for a freshly mounted page: the #hash section if present,
 * else the position saved on this history entry (Back/Forward), else the top.
 * Waits a frame and refreshes ScrollTrigger first so pinned sections have
 * their spacers and the target position is correct.
 */
export function useRouteScroll(enabled = true) {
  const scrollTo = useScrollTo();
  const lenis = useLenis();

  useEffect(() => {
    if (!enabled) return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        lenis?.resize();
        const hash = window.location.hash;
        const target = hash ? document.querySelector<HTMLElement>(hash) : null;
        if (target) scrollTo(target, { immediate: true });
        else scrollTo(savedScrollY() ?? 0, { immediate: true });
      });
    });
    return () => cancelAnimationFrame(frame);
    // Once per mount (and once `enabled` flips true).
  }, [enabled]);
}
