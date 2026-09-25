import { useRef, type ElementType, type ReactNode } from "react";
import { DUR, EASE, gsap, MQ, REVEAL_START, STAGGER, useGSAP } from "../../lib/motion";

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

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !play) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          el.children,
          { autoAlpha: 0, y },
          {
            autoAlpha: 1,
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
    { dependencies: [play], scope: ref },
  );

  return (
    <Tag ref={ref} className={className} data-stagger="">
      {children}
    </Tag>
  );
}
