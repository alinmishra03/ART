import { useRef, type ReactNode } from "react";
import { gsap, MQ, useGSAP } from "../../lib/motion";

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** Travel as a fraction of the element's own height (0.1 = ±10%). Negative moves against scroll. */
  speed?: number;
}

/**
 * Scroll-scrubbed vertical drift. The outer element is the (static) trigger,
 * the inner one moves, so measurements never feed back into themselves.
 * Halved on small screens, disabled for reduced motion.
 */
export function Parallax({ children, className, innerClassName, speed = 0.12 }: ParallaxProps) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, mobile: MQ.mobile }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return;
        const travel = speed * (mobile ? 50 : 100);
        gsap.fromTo(
          inner.current,
          { yPercent: -travel },
          {
            yPercent: travel,
            ease: "none",
            scrollTrigger: { trigger: outer.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
      return () => mm.revert();
    },
    { dependencies: [speed], scope: outer },
  );

  return (
    <div ref={outer} className={className}>
      <div ref={inner} className={innerClassName} style={{ willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}
