import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { profile } from "../../content/profile";
import { EASE, gsap, MQ, useGSAP } from "../../lib/motion";

/*
 * Full-bleed hero photograph: the owner's image
 * (public/img/Gemini_Generated_Image_qfcs7sqfcs7sqfcs.png, never modified;
 * public/img/portrait holds plain resizes, see scripts/portrait.mjs) fills the
 * whole opening screen: a black-and-white finish in the site's ink / paper,
 * shading for the type, a soft glowing frame and grain. The face sits clear of
 * the type (the name runs along the bottom, the role text on the far side).
 */

const SOURCE = { width: 1376, height: 768 };
const WIDTHS = [640, 1024, 1376];
/** Head and face in the photo, as fractions (measured: x 150–395, y 50–310 of 1376×768, plus margin). */
const FACE = { bottom: 0.41, centerX: 0.2 };
/** A little over cover, so the cursor follow never shows an edge. */
const OVERSCAN = 1.03;

const srcSet = (ext: string) => WIDTHS.map((w) => `/img/portrait/hero-${w}.${ext} ${w}w`).join(", ");

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Covers the hero with the photo (never letterboxed): face left of centre on wide screens, centred on phones. */
function usePhotoBox(photo: RefObject<HTMLElement | null>): Box | null {
  const [box, setBox] = useState<Box | null>(null);

  useLayoutEffect(() => {
    const root = photo.current;
    if (!root) return;
    const measure = () => {
      const vw = root.clientWidth;
      const vh = root.clientHeight;
      const wide = window.matchMedia(MQ.desktop).matches;
      const scale = Math.max(vw / SOURCE.width, vh / SOURCE.height) * OVERSCAN;
      const width = SOURCE.width * scale;
      const height = SOURCE.height * scale;
      const left = Math.min(0, Math.max(vw - width, vw * (wide ? 0.34 : 0.5) - width * FACE.centerX));
      const top = Math.min(0, (vh - height) / 2);
      setBox({ left: Math.round(left), top: Math.round(top), width: Math.round(width), height: Math.round(height) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [photo]);

  return box;
}

export function Portrait({ play }: { play: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const box = usePhotoBox(root);

  // Opening: the photo rises out of a solid wash of the ground colour and
  // settles. Transform/opacity only.
  useGSAP(
    () => {
      if (!play) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        let tl: gsap.core.Timeline | undefined;
        let cancelled = false;
        const decoded = img.current?.decode?.().catch(() => undefined) ?? Promise.resolve();
        Promise.race([decoded, new Promise((r) => setTimeout(r, 2500))]).then(() => {
          if (cancelled) return;
          tl = gsap
            .timeline({ defaults: { ease: EASE.out } })
            .fromTo("[data-photo-zoom]", { scale: 1.08, yPercent: 6 }, { scale: 1, yPercent: 0, duration: 1.8, ease: "expo.out" }, 0)
            .fromTo("[data-photo-curtain]", { opacity: 1 }, { opacity: 0, duration: 1.1, ease: "power2.inOut" }, 0);
        });
        return () => {
          cancelled = true;
          tl?.kill();
        };
      });
      return () => mm.revert();
    },
    { dependencies: [play], scope: root },
  );

  // Desktop cursor: the photo follows the pointer by a few pixels (no React state).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MQ.fine} and ${MQ.motion}`, () => {
        const target = root.current?.querySelector("[data-photo-mouse]");
        if (!target) return;
        const x = gsap.quickTo(target, "x", { duration: 1.2, ease: "power3.out" });
        const y = gsap.quickTo(target, "y", { duration: 1.2, ease: "power3.out" });
        const onMove = (e: PointerEvent) => {
          x((e.clientX / window.innerWidth - 0.5) * -16);
          y((e.clientY / window.innerHeight - 0.5) * -10);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} data-photo className="pointer-events-none absolute inset-0 overflow-hidden bg-bg">
      {/* Scroll moves [data-photo-scroll]; the cursor [data-photo-mouse]; the opening [data-photo-zoom]. */}
      <div data-photo-scroll className="absolute inset-0">
        <div data-photo-mouse className="absolute inset-0">
          <div data-photo-zoom className="absolute inset-0 origin-[34%_30%]">
            {box && (
              <picture>
                <source type="image/avif" srcSet={srcSet("avif")} sizes={`${box.width}px`} />
                <source type="image/webp" srcSet={srcSet("webp")} sizes={`${box.width}px`} />
                <img
                  ref={img}
                  src="/img/portrait/hero-1024.webp"
                  alt={`Portrait of ${profile.name}`}
                  width={SOURCE.width}
                  height={SOURCE.height}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="hero-photo absolute max-w-none"
                  style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
                />
              </picture>
            )}
          </div>
        </div>
      </div>
      <div aria-hidden className="hero-photo-shade absolute inset-0" />
      <div aria-hidden className="hero-photo-legibility absolute inset-0" />
      <div aria-hidden className="hero-photo-edge absolute inset-0" />
      <div aria-hidden className="hero-photo-grain absolute inset-0" />
      <div aria-hidden data-photo-curtain className="hero-photo-curtain absolute inset-0" />
    </div>
  );
}
