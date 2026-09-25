import { createContext, useCallback, useContext, useRef, type MouseEvent, type ReactNode } from "react";
import { EASE, gsap, prefersReducedMotion, ScrollTrigger } from "../lib/motion";
import { isInternalHref, pushPath } from "../lib/router";
import { useLenis } from "./SmoothScroll";

interface PageTransitionValue {
  /** Navigates to an internal path behind the transition curtain (~800ms total). */
  navigate: (href: string) => void;
  /** Click handler for internal <a> links: keeps modifier-clicks/new tabs native. */
  onLinkClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}

const PageTransitionContext = createContext<PageTransitionValue | null>(null);

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const curtain = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);
  const lenis = useLenis();

  const swap = useCallback(
    (href: string) => {
      pushPath(href);
      if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
      else window.scrollTo(0, 0);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    [lenis],
  );

  const navigate = useCallback(
    (href: string) => {
      if (busy.current) return;
      if (prefersReducedMotion() || !curtain.current) {
        swap(href);
        return;
      }
      busy.current = true;
      lenis?.stop();
      gsap
        .timeline({
          defaults: { ease: EASE.inOut },
          onComplete: () => {
            busy.current = false;
            lenis?.start();
          },
        })
        .set(curtain.current, { visibility: "visible", yPercent: 100 })
        .to(curtain.current, { yPercent: 0, duration: 0.42 })
        .fromTo(mark.current, { yPercent: 110 }, { yPercent: 0, duration: 0.32, ease: EASE.out }, "-=0.18")
        .add(() => swap(href))
        .to(mark.current, { yPercent: -110, duration: 0.24, ease: "power2.in" }, "+=0.04")
        .to(curtain.current, { yPercent: -100, duration: 0.46 }, "-=0.1")
        .set(curtain.current, { visibility: "hidden" });
    },
    [lenis, swap],
  );

  const onLinkClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      const a = event.currentTarget;
      const href = a.getAttribute("href");
      if (
        !href ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        a.target === "_blank" ||
        !isInternalHref(href)
      )
        return;
      const url = new URL(href, window.location.href);
      if (url.pathname === window.location.pathname) return; // same-page anchors are handled by scroll logic
      event.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    },
    [navigate],
  );

  return (
    <PageTransitionContext.Provider value={{ navigate, onLinkClick }}>
      {children}
      <div
        ref={curtain}
        aria-hidden
        className="invisible fixed inset-0 grid place-items-center overflow-hidden bg-inverse text-inverse-fg"
        style={{ zIndex: "var(--z-transition)" }}
      >
        <span className="block overflow-hidden">
          <span ref={mark} className="t-display block">
            ART<span className="t-serif text-accent">.</span>
          </span>
        </span>
      </div>
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) throw new Error("usePageTransition must be used inside PageTransitionProvider");
  return ctx;
}
