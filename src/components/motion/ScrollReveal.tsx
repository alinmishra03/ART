import { useRef, type ReactNode } from "react";
import { DUR, EASE, gsap, MQ, useGSAP } from "../../lib/motion";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Edge the mask opens from. */
  from?: "bottom" | "top" | "left" | "right";
  /** Inner content settles from this scale while the mask opens. */
  scale?: number;
  delay?: number;
  start?: string;
}

const CLOSED: Record<NonNullable<ScrollRevealProps["from"]>, string> = {
  bottom: "inset(100% 0% 0% 0%)",
  top: "inset(0% 0% 100% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
};

/** Clip-path mask reveal for images and blocks, with a subtle inner scale settle. */
export function ScrollReveal({ children, className, from = "bottom", scale = 1.18, delay = 0, start = "top 85%" }: ScrollRevealProps) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const tl = gsap.timeline({
          delay,
          defaults: { duration: DUR.xslow, ease: EASE.out },
          scrollTrigger: { trigger: outer.current, start, once: true },
        });
        tl.fromTo(outer.current, { clipPath: CLOSED[from], autoAlpha: 1 }, { clipPath: "inset(0% 0% 0% 0%)" }).fromTo(
          inner.current,
          { scale },
          { scale: 1 },
          0,
        );
      });
      return () => mm.revert();
    },
    { scope: outer },
  );

  return (
    <div ref={outer} className={className} data-fade="">
      <div ref={inner} className="h-full w-full">
        {children}
      </div>
    </div>
  );
}
