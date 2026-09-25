import { useRef } from "react";
import { EASE, gsap, MQ, REVEAL_START, useGSAP } from "../../lib/motion";

/** Hairline separator that draws in from the left on entry. */
export function DrawLine({ className = "", delay = 0, strong = false }: { className?: string; delay?: number; strong?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          ref.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 1.4, delay, ease: EASE.out, scrollTrigger: { trigger: ref.current, start: REVEAL_START, once: true } },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return <div ref={ref} aria-hidden className={`h-px origin-left ${strong ? "bg-line-strong" : "bg-line"} ${className}`} />;
}
