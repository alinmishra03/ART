import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { profile } from "../../content/profile";
import { EASE, gsap, prefersReducedMotion } from "../../lib/motion";
import { useLenis } from "../../providers/SmoothScroll";

declare global {
  interface Window {
    __introTaken?: boolean;
  }
}

const SEEN_KEY = "intro-seen";
const FONT_TIMEOUT = 2500;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Opening sequence. Takes over the static #preloader cover from index.html
 * (so the first frame is never blank), counts 0→100 while fonts load, then
 * lifts the cover and hands off to the hero via onReveal.
 * - Repeat visits in the same session run a shorter version.
 * - Reduced motion: the cover is hidden by CSS and this resolves immediately.
 */
export function Preloader({ onReveal }: { onReveal: () => void }) {
  const [host] = useState(() => document.getElementById("preloader"));
  // Read once (StrictMode re-runs effects; the flag is written below).
  const [fast] = useState(() => {
    try {
      return sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      return false;
    }
  });
  const content = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useEffect(() => {
    window.__introTaken = true;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    if (!host || prefersReducedMotion()) {
      if (host) host.hidden = true;
      onReveal();
      return;
    }

    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage unavailable: every visit runs the full intro */
    }

    const html = document.documentElement;
    html.style.overflow = "hidden";
    const counter = { value: 0 };
    let tl: gsap.core.Timeline | null = null;
    let cancelled = false;

    (async () => {
      await Promise.race([document.fonts.ready, wait(FONT_TIMEOUT)]);
      if (cancelled) return;
      lenisRef.current?.stop();

      tl = gsap.timeline({
        defaults: { ease: EASE.out },
        onComplete: () => {
          host.hidden = true;
          html.style.overflow = "";
          lenisRef.current?.start();
        },
      });
      const countDuration = fast ? 0.35 : 0.85;
      tl.set(content.current, { autoAlpha: 1 })
        .from("[data-pl-line]", { yPercent: 110, duration: fast ? 0.4 : 0.6, stagger: 0.05 }, 0)
        .to(
          counter,
          {
            value: 100,
            duration: countDuration,
            ease: "power2.inOut",
            onUpdate: () => {
              if (count.current) count.current.textContent = String(Math.round(counter.value)).padStart(3, "0");
            },
          },
          0.1,
        )
        .fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, duration: countDuration, ease: "power2.inOut" }, 0.1)
        .to("[data-pl-line]", { yPercent: -110, duration: 0.4, stagger: 0.025, ease: "power3.in" })
        .add(onReveal, "-=0.15")
        .to(host, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.85, ease: EASE.inOut }, "<");
    })();

    return () => {
      cancelled = true;
      tl?.kill();
      html.style.overflow = "";
    };
    // Runs once per page load.
  }, []);

  if (!host) return null;

  return createPortal(
    <div ref={content} className="invisible absolute inset-0 flex flex-col justify-between p-gutter">
      <div className="flex justify-between">
        <span className="block overflow-hidden">
          <span data-pl-line className="block text-lg font-semibold tracking-tight">
            ART<span className="t-serif">.</span>
          </span>
        </span>
        <span className="block overflow-hidden">
          <span data-pl-line className="t-label block opacity-60">
            Portfolio
          </span>
        </span>
      </div>

      <div>
        <div className="flex items-end justify-between gap-6">
          <div className="space-y-1">
            <span className="block overflow-hidden">
              <span data-pl-line className="t-label block opacity-60">
                {profile.name}
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-pl-line className="t-label block opacity-60">
                {profile.title}
              </span>
            </span>
          </div>
          <span className="block overflow-hidden">
            <span data-pl-line className="t-display block tabular-nums leading-none">
              <span ref={count}>000</span>
            </span>
          </span>
        </div>
        <div className="mt-5 h-px w-full bg-current/15">
          <div ref={bar} className="h-full origin-left bg-current" />
        </div>
      </div>
    </div>,
    host,
  );
}
