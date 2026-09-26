import { useRef, type ElementType, type ReactNode } from "react";
import { DUR, EASE, gsap, MQ, REVEAL_START, useGSAP } from "../../lib/motion";
import { useNearViewport } from "../../lib/useNearViewport";

interface FadeInProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  duration?: number;
  trigger?: "scroll" | "mount";
  play?: boolean;
  start?: string;
}

/** Opacity + rise on entry. Reduced motion: rendered immediately, no movement. */
export function FadeIn({
  as: Tag = "div",
  children,
  className,
  y = 28,
  delay = 0,
  duration = DUR.base,
  trigger = "scroll",
  play = true,
  start = REVEAL_START,
}: FadeInProps) {
  const ref = useRef<HTMLElement>(null);
  const near = useNearViewport(ref, trigger === "scroll");

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !play || !near) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          el,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration,
            delay,
            ease: EASE.out,
            scrollTrigger: trigger === "scroll" ? { trigger: el, start, once: true } : undefined,
          },
        );
      });
      return () => mm.revert();
    },
    { dependencies: [play, near], scope: ref },
  );

  return (
    <Tag ref={ref} className={className} data-fade="">
      {children}
    </Tag>
  );
}
