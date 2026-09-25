import { useRef, type ElementType, type ReactNode } from "react";
import { DUR, EASE, gsap, MQ, REVEAL_START, SplitText, STAGGER, useGSAP } from "../../lib/motion";

type SplitBy = "lines" | "words" | "chars";

interface RevealTextProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
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
 * resize and font load; SplitText keeps an aria-label with the full text so
 * screen readers never read fragments. Reduced motion: text is shown as-is.
 */
export function RevealText({
  as: Tag = "div",
  children,
  className,
  by = "lines",
  trigger = "scroll",
  play = true,
  delay = 0,
  duration = DUR.slow,
  stagger,
  start = REVEAL_START,
  id,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !play) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const split = SplitText.create(el, {
          type: SPLIT_TYPE[by],
          mask: "lines",
          linesClass: "rt-line",
          autoSplit: true,
          aria: "auto",
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
              scrollTrigger: trigger === "scroll" ? { trigger: el, start, once: true } : undefined,
            });
          },
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { dependencies: [play, by, trigger], scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={className} data-reveal="">
      {children}
    </Tag>
  );
}
