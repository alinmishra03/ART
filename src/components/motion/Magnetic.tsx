import { useRef, type ReactNode } from "react";
import { EASE, gsap, MQ, useGSAP } from "../../lib/motion";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** Fraction of the pointer offset the element follows. Keep it subtle (0.2–0.4). */
  strength?: number;
  /** Extra pull applied to a descendant marked [data-magnetic-inner] for depth. */
  innerStrength?: number;
}

/**
 * Pulls its child toward the pointer on fine-pointer devices, then settles back
 * with a soft elastic ease. Pure transforms via gsap.quickTo; no React state.
 */
export function Magnetic({ children, className, strength = 0.3, innerStrength = 0.15 }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(`${MQ.fine} and ${MQ.motion}`, () => {
        const inner = el.querySelector<HTMLElement>("[data-magnetic-inner]");
        const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
        const ixTo = inner ? gsap.quickTo(inner, "x", { duration: 0.6, ease: "power3.out" }) : null;
        const iyTo = inner ? gsap.quickTo(inner, "y", { duration: 0.6, ease: "power3.out" }) : null;
        let rect: DOMRect | null = null;

        const enter = () => {
          rect = el.getBoundingClientRect();
        };
        const move = (e: PointerEvent) => {
          if (!rect) rect = el.getBoundingClientRect();
          const dx = e.clientX - (rect.left + rect.width / 2);
          const dy = e.clientY - (rect.top + rect.height / 2);
          xTo(dx * strength);
          yTo(dy * strength);
          ixTo?.(dx * innerStrength);
          iyTo?.(dy * innerStrength);
        };
        const leave = () => {
          rect = null;
          gsap.to(el, { x: 0, y: 0, duration: 1, ease: EASE.settle, overwrite: true });
          if (inner) gsap.to(inner, { x: 0, y: 0, duration: 1, ease: EASE.settle, overwrite: true });
        };

        el.addEventListener("pointerenter", enter);
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointerenter", enter);
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
          gsap.set([el, inner], { clearProps: "transform" });
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={`inline-block ${className ?? ""}`} data-magnetic="">
      {children}
    </span>
  );
}
