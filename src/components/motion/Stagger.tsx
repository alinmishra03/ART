import { useRef, type ElementType, type ReactNode } from "react";
import { DUR, EASE, gsap, MQ, REVEAL_START, STAGGER, useGSAP } from "../../lib/motion";
import { useNearViewport } from "../../lib/useNearViewport";

interface StaggerProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  y?: number;
  stagger?: number;
  delay?: number;
  trigger?: "scroll" | "mount";
  play?: boolean;
  start?: string;
}

/** Reveals direct children one after another. */
export function Stagger({
  as: Tag = "div",
  children,
  className,
  y = 24,
  stagger = STAGGER.items,
  delay = 0,
  trigger = "scroll",
  play = true,
  start = REVEAL_START,
}: StaggerProps) {
  const ref = useRef<HTMLElement>(null);
  const near = useNearViewport(ref, trigger === "scroll");

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !play || !near) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          el.children,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration: DUR.base,
            delay,
            stagger,
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
    <Tag ref={ref} className={className} data-stagger="">
      {children}
    </Tag>
  );
}
