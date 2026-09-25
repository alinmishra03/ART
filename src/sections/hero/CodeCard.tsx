import { useRef, type RefObject } from "react";
import { Draggable } from "gsap/Draggable";
import { copy, profile } from "../../content/profile";
import { EASE, gsap, MQ, useGSAP } from "../../lib/motion";

gsap.registerPlugin(Draggable);

const { heroCodeCard } = copy;

/** The original hero's `developer.ts` card, content kept verbatim. */
function CardBody({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-md border border-line bg-bg-raised/90 font-mono leading-relaxed shadow-[0_30px_60px_-30px_rgb(0_0_0/0.35)] backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="ml-3 text-muted">{heroCodeCard.file}</span>
      </div>
      <pre className="overflow-hidden px-4 py-4 text-fg sm:px-5">
        <code>
          <span className="text-accent">const</span> developer = {"{"}
          {"\n"}  name: <span className="text-accent">'{profile.name}'</span>,
          {"\n"}  role: <span className="text-accent">'{profile.title}'</span>,
          {"\n"}  experience: <span className="text-accent">'{profile.yearsExperience} years'</span>,
          {"\n"}  status: <span className="text-accent">'{heroCodeCard.status}'</span>,
          {"\n"}  stack: [<span className="text-accent">{heroCodeCard.stack.map((s) => `'${s}'`).join(", ")}</span>],
          {"\n"}  passionate: <span className="text-accent">true</span>
          {"\n"}
          {"};"}
          <span className="ml-0.5 inline-block h-[1.1em] w-[0.5em] translate-y-[0.2em] animate-pulse bg-accent" />
        </code>
      </pre>
    </div>
  );
}

/**
 * Desktop (xl+): floats beside the name. Draggable within the hero, tilts toward
 * the pointer, drifts on scroll. Wrappers split the transforms so they never
 * fight: drift (scroll y) › drag (x/y) › tilt (rotation, entrance).
 * Decorative duplicate of facts shown in the hero, so it is aria-hidden.
 */
export function FloatingCodeCard({ play, bounds }: { play: boolean; bounds: RefObject<HTMLElement | null> }) {
  const drift = useRef<HTMLDivElement>(null);
  const drag = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!play) return;
      const mm = gsap.matchMedia();

      mm.add(`(min-width: 80rem) and ${MQ.motion}`, () => {
        gsap.fromTo(
          tilt.current,
          { autoAlpha: 0, y: 80, rotate: 10, scale: 0.92 },
          { autoAlpha: 1, y: 0, rotate: -4, scale: 1, duration: 1.4, ease: EASE.out, delay: 0.85 },
        );
        gsap.to(drift.current, {
          yPercent: -45,
          ease: "none",
          scrollTrigger: { trigger: bounds.current, start: "top top", end: "bottom top", scrub: true },
        });
      });

      mm.add(MQ.reduce, () => {
        gsap.set(tilt.current, { autoAlpha: 1, rotate: -4 });
      });

      mm.add(`(min-width: 80rem) and ${MQ.fine} and ${MQ.motion}`, () => {
        const rx = gsap.quickTo(tilt.current, "rotationX", { duration: 0.8, ease: "power3.out" });
        const ry = gsap.quickTo(tilt.current, "rotationY", { duration: 0.8, ease: "power3.out" });
        const onMove = (e: PointerEvent) => {
          ry((e.clientX / window.innerWidth - 0.5) * 16);
          rx(-(e.clientY / window.innerHeight - 0.5) * 12);
        };
        window.addEventListener("pointermove", onMove, { passive: true });

        const [draggable] = Draggable.create(drag.current, {
          type: "x,y",
          bounds: bounds.current,
          edgeResistance: 0.8,
          zIndexBoost: false,
          onPress: () => gsap.to(tilt.current, { scale: 1.04, duration: 0.3, ease: EASE.soft }),
          onRelease: () => gsap.to(tilt.current, { scale: 1, duration: 0.8, ease: EASE.settle }),
        });

        return () => {
          window.removeEventListener("pointermove", onMove);
          draggable.kill();
        };
      });

      return () => mm.revert();
    },
    { dependencies: [play] },
  );

  return (
    <div
      ref={drift}
      aria-hidden
      className="pointer-events-none absolute right-[3%] top-[40%] hidden xl:block 2xl:right-[6%]"
      style={{ perspective: 900 }}
    >
      <div ref={drag} data-cursor="drag" className="pointer-events-auto touch-none select-none">
        <div ref={tilt} data-fade="">
          <CardBody className="w-max text-[0.78rem] 2xl:text-[0.85rem]" />
        </div>
      </div>
    </div>
  );
}

/**
 * Phones and tablets (below lg): sits in the hero's open space, static and tilted.
 * Only on screens at least 820px tall, so shorter phones and landscape show
 * name, bio and CTAs in the first viewport. Hidden lg–xl, where the name fills the width.
 */
export function InlineCodeCard({ play }: { play: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!play) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          ref.current,
          { autoAlpha: 0, y: 50, rotate: 8 },
          { autoAlpha: 1, y: 0, rotate: -3, duration: 1.3, ease: EASE.out, delay: 0.8 },
        );
      });
      mm.add(MQ.reduce, () => {
        gsap.set(ref.current, { autoAlpha: 1, rotate: -3 });
      });
      return () => mm.revert();
    },
    { dependencies: [play] },
  );

  return (
    <div aria-hidden className="flex flex-1 items-center justify-center py-4 lg:hidden [@media(max-height:819px)]:hidden">
      <div ref={ref} data-fade="">
        <CardBody className="w-max max-w-[calc(100vw-3rem)] text-[0.7rem] sm:text-[0.8rem]" />
      </div>
    </div>
  );
}
