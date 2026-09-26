import { useRef, type ElementType, type ReactNode } from "react";
import { DUR, EASE, gsap, MQ, REVEAL_START, SplitText, STAGGER, useGSAP } from "../../lib/motion";
import { useNearViewport } from "../../lib/useNearViewport";

type SplitBy = "lines" | "words" | "chars";

interface RevealTextProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Classes for the animated inner copy; use "inline-block" when the text sits inline. */
  innerClassName?: string;
  /** Unit that slides up out of its line mask. */
  by?: SplitBy;
  /** "scroll" plays on viewport entry; "mount" plays as soon as `play` is true. */
  trigger?: "scroll" | "mount";
  /** Gate for mount-triggered reveals (e.g. wait for the preloader). */
  play?: boolean;
  delay?: number;
  duration?: number;
  stagger?: number;
  start?: string;
  id?: string;
}

const SPLIT_TYPE: Record<SplitBy, string> = {
  lines: "lines",
  words: "lines,words",
  chars: "lines,words,chars",
};

/**
 * Masked text reveal built on GSAP SplitText. Re-splits automatically on
 * resize and font load. Screen readers get an untouched visually-hidden copy;
 * the split, animated copy is aria-hidden (aria-label on generic spans/divs is
 * not reliably announced). Reduced motion: text is shown as-is.
 */
export function RevealText({
  as: Tag = "div",
  children,
  className,
  innerClassName = "block",
  by = "lines",
  trigger = "scroll",
  play = true,
  delay = 0,
  duration = DUR.slow,
  stagger,
  start = REVEAL_START,
  id,
}: RevealTextProps) {
  const outer = useRef<HTMLElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const near = useNearViewport(outer, trigger === "scroll");

  useGSAP(
    () => {
      const el = inner.current;
      if (!el || !play || !near) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const split = SplitText.create(el, {
          type: SPLIT_TYPE[by],
          mask: "lines",
          linesClass: "rt-line",
          autoSplit: true,
          aria: "none",
          onSplit(self: SplitText) {
            gsap.set(el, { visibility: "visible" });
            return gsap.from(self[by], {
              yPercent: 118,
              rotate: by === "lines" ? 2.5 : 0,
              transformOrigin: "0% 100%",
              duration,
              delay,
              ease: EASE.out,
              stagger: stagger ?? STAGGER[by],
              scrollTrigger: trigger === "scroll" ? { trigger: outer.current, start, once: true } : undefined,
            });
          },
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { dependencies: [play, near, by, trigger], scope: outer },
  );

  return (
    <Tag ref={outer} id={id} className={className}>
      <span className="sr-only">{children}</span>
      <span ref={inner} aria-hidden="true" className={innerClassName} data-reveal="">
        {children}
      </span>
    </Tag>
  );
}
