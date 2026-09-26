import { useLayoutEffect, useRef, useState } from "react";
import { ProjectImage } from "../../components/ui/ProjectImage";
import { profile } from "../../content/profile";
import { EASE, gsap, MQ, useGSAP } from "../../lib/motion";
import { featuredProjects } from "../../lib/projectLookup";

/*
 * The oversized full name: "Aishwarya Raj" · project card · "Tyagi" (in the site's blue italic serif), filling the row.
 * The pointer's horizontal position shares the width between the two words
 * (one stretches, the other narrows; the row's total width never changes)
 * and steps the card through the featured projects. Touch screens get a slow
 * automatic sway instead; reduced motion keeps it still.
 */

// Full name in two parts that trade width: "Aishwarya Raj" | "Tyagi".
const nameParts = profile.name.split(" ");
const FIRST = nameParts.slice(0, -1).join(" ");
const LAST = nameParts[nameParts.length - 1];
/** Card width and word gap, as multiples of the font size. */
const CARD = 1.34;
const GAP = 0.1;

interface Metrics {
  font: number;
  w1: number;
  w2: number;
  amp: number;
}

export function HeroName({ play }: { play: boolean }) {
  const row = useRef<HTMLDivElement>(null);
  const [m, setM] = useState<Metrics | null>(null);
  const [active, setActive] = useState(0);
  const metrics = useRef<Metrics | null>(null);
  metrics.current = m;

  // Font size so that first + card + last exactly fill the row at rest.
  useLayoutEffect(() => {
    const el = row.current;
    if (!el) return;
    const measure = () => {
      const probe = el.querySelectorAll<HTMLElement>("[data-name-probe]");
      if (probe.length < 2) return;
      const a1 = probe[0].getBoundingClientRect().width / 100;
      const a2 = probe[1].getBoundingClientRect().width / 100;
      const width = el.clientWidth;
      const font = width / (a1 + a2 + CARD + GAP * 2);
      const w1 = a1 * font;
      const w2 = a2 * font;
      // How far the words may trade width: neither narrower than 0.55 nor wider than 1.6.
      const r = w1 / w2;
      const amp = Math.min(0.45, 0.6, 0.45 / r, 0.6 / r);
      setM({ font, w1, w2, amp });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  // Applies a pointer position p in [-1, 1] to the words and the card.
  const apply = useRef((p: number) => {
    const mm = metrics.current;
    const el = row.current;
    if (!mm || !el) return;
    const s1 = 1 + mm.amp * p;
    const s2 = 1 - (mm.amp * p * mm.w1) / mm.w2;
    const gap = GAP * mm.font;
    gsap.set(el.querySelector("[data-name-first]"), { scaleX: s1 });
    gsap.set(el.querySelector("[data-name-last]"), { scaleX: s2 });
    gsap.set(el.querySelector("[data-name-card]"), { x: mm.w1 * s1 + gap });
    const n = featuredProjects.length;
    const idx = Math.min(n - 1, Math.floor(((p + 1) / 2) * n));
    setActive((cur) => (cur === idx ? cur : idx));
  });

  useLayoutEffect(() => {
    if (m) apply.current(0);
  }, [m]);

  // Entrance (after the photo starts rising) and the pointer / sway interaction.
  useGSAP(
    () => {
      if (!play || !m) return;
      const mm = gsap.matchMedia();
      const state = { p: 0 };
      const render = () => apply.current(state.p);

      mm.add(MQ.motion, () => {
        gsap
          .timeline({ delay: 0.75, defaults: { ease: EASE.out } })
          .fromTo("[data-name-rise]", { yPercent: 110 }, { yPercent: 0, duration: 1.3, stagger: 0.12 }, 0)
          .fromTo("[data-name-card]", { clipPath: "inset(50% 0% 50% 0% round 0.12em)" }, { clipPath: "inset(0% 0% 0% 0% round 0.12em)", duration: 1.1, ease: EASE.inOut }, 0.2)
          .fromTo("[data-name-card] img", { scale: 1.35 }, { scale: 1, duration: 1.6 }, 0.2);
      });

      mm.add(`${MQ.fine} and ${MQ.motion}`, () => {
        const onMove = (e: PointerEvent) =>
          gsap.to(state, { p: (e.clientX / window.innerWidth) * 2 - 1, duration: 0.9, ease: "power3.out", overwrite: true, onUpdate: render });
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      });

      mm.add(`(hover: none) and ${MQ.motion}`, () => {
        gsap.fromTo(state, { p: -0.8 }, { p: 0.8, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2, onUpdate: render });
      });

      return () => {
        mm.revert();
        apply.current(0);
      };
    },
    { dependencies: [play, Boolean(m)], scope: row },
  );

  const style = m ? { fontSize: m.font, height: m.font * 0.86 } : { visibility: "hidden" as const, height: "1em" };

  return (
    <div ref={row} aria-hidden className="hero-name relative w-full" style={style}>
      {/* Width probes at 100px (never shown). */}
      <span data-name-probe className="hero-name-word invisible absolute left-0 top-0" style={{ fontSize: 100 }}>
        {FIRST}
      </span>
      <span data-name-probe className="hero-name-word hero-name-accent invisible absolute left-0 top-0" style={{ fontSize: 100 }}>
        {LAST}
      </span>
      {m && (
        <>
          <span data-name-first className="hero-name-mask absolute left-0 block origin-left">
            <span data-name-rise className="hero-name-word block">
              {FIRST}
            </span>
          </span>
          <div
            data-name-card
            className="hero-name-card absolute left-0 overflow-hidden bg-bg-sunken"
            style={{ width: CARD * m.font, height: m.font * 0.7, bottom: m.font * 0.08 }}
          >
            {featuredProjects.map((p, i) => (
              <div key={p.id} className="absolute inset-0 transition-opacity duration-200" style={{ opacity: i === active ? 1 : 0 }}>
                <ProjectImage id={p.id} alt="" sizes={`${Math.round(CARD * m.font)}px`} className="size-full object-cover object-top" />
              </div>
            ))}
          </div>
          <span data-name-last className="hero-name-mask absolute right-0 block origin-right">
            <span data-name-rise className="hero-name-word hero-name-accent block">
              {LAST}
            </span>
          </span>
        </>
      )}
    </div>
  );
}
