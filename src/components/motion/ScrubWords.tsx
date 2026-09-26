import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, MQ, SplitText, useGSAP } from "../../lib/motion";
import { useNearViewport } from "../../lib/useNearViewport";

interface ScrubWordsProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  start?: string;
  end?: string;
}

/**
 * Words brighten from the subtle tone to full ink as the passage scrolls
 * through the viewport. The tween drives a per-word `--p` (0→1) that CSS mixes
 * between theme tokens, so it survives theme switches and never drops below
 * the subtle colour's contrast. Screen readers get an untouched copy.
 */
export function ScrubWords({ as: Tag = "p", children, className, start = "top 82%", end = "bottom 55%" }: ScrubWordsProps) {
  const outer = useRef<HTMLElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const near = useNearViewport(outer);

  useGSAP(
    () => {
      if (!near) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const split = SplitText.create(inner.current, {
          type: "words",
          wordsClass: "scrub-word",
          autoSplit: true,
          aria: "none",
          onSplit(self: SplitText) {
            return gsap.fromTo(
              self.words,
              { "--p": 0 },
              {
                "--p": 1,
                ease: "none",
                stagger: 0.1,
                scrollTrigger: { trigger: outer.current, start, end, scrub: 0.6 },
              },
            );
          },
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { dependencies: [near], scope: outer },
  );

  return (
    <Tag ref={outer} className={className}>
      <span className="sr-only">{children}</span>
      <span ref={inner} aria-hidden="true">
        {children}
      </span>
    </Tag>
  );
}
