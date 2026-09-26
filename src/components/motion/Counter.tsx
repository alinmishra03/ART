import { useRef } from "react";
import { EASE, gsap, MQ, REVEAL_START, useGSAP } from "../../lib/motion";
import { useNearViewport } from "../../lib/useNearViewport";

/**
 * Counts up to a value like "15+" on first view. The final text is always in
 * the DOM for screen readers; only the aria-hidden copy animates.
 */
export function Counter({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const near = useNearViewport(ref);
  const match = value.match(/^(\d+)(.*)$/);

  useGSAP(
    () => {
      if (!match || !near) return;
      const target = Number(match[1]);
      const suffix = match[2];
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const state = { n: 0 };
        const el = ref.current!;
        el.textContent = `0${suffix}`;
        gsap.to(state, {
          n: target,
          duration: 1.6,
          ease: EASE.out,
          scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
          onUpdate: () => {
            el.textContent = `${Math.round(state.n)}${suffix}`;
          },
        });
        return () => {
          el.textContent = value;
        };
      });
      return () => mm.revert();
    },
    { dependencies: [near], scope: ref },
  );

  return (
    <span className={className}>
      <span className="sr-only">{value}</span>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {value}
      </span>
    </span>
  );
}
