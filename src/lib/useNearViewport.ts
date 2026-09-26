import { useEffect, useState, type RefObject } from "react";

/*
 * Scroll animations are set up lazily: creating every SplitText, tween and
 * ScrollTrigger on a ~25k px page at mount cost seconds of forced layout on
 * mid-range phones. Each one now waits until its element is within about a
 * viewport of the screen. Elements that animate in stay hidden by CSS
 * (styles/index.css) until then, so nothing flashes before its reveal.
 *
 * One shared observer; the flag latches, so a set-up animation is never torn
 * down by scrolling away.
 */

const ROOT_MARGIN = "50% 0px 100% 0px";
const pending = new Map<Element, () => void>();
let observer: IntersectionObserver | null = null;

function observe(el: Element, onNear: () => void) {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const cb = pending.get(entry.target);
        observer!.unobserve(entry.target);
        pending.delete(entry.target);
        cb?.();
      }
    },
    { rootMargin: ROOT_MARGIN },
  );
  pending.set(el, onNear);
  observer.observe(el);
  return () => {
    observer?.unobserve(el);
    pending.delete(el);
  };
}

/** True once `ref`'s element has come near the viewport. Always true when `enabled` is false. */
export function useNearViewport(ref: RefObject<Element | null>, enabled = true) {
  const [near, setNear] = useState(!enabled || typeof IntersectionObserver === "undefined");

  useEffect(() => {
    if (near || !enabled) return;
    const el = ref.current;
    if (!el) {
      setNear(true);
      return;
    }
    return observe(el, () => setNear(true));
  }, [near, enabled, ref]);

  return near || !enabled;
}
