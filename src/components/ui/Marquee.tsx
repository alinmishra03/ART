import { useRef, type ReactNode } from "react";
import { gsap, MQ, ScrollTrigger, useGSAP } from "../../lib/motion";
import { useNearViewport } from "../../lib/useNearViewport";

interface MarqueeProps {
  children: ReactNode;
  /** 1 scrolls left, -1 scrolls right. */
  direction?: 1 | -1;
  /** Base speed in pixels per second. */
  speed?: number;
  className?: string;
}

/**
 * Seamless horizontal loop (content rendered twice, track moves −50%).
 * Speeds up with scroll velocity and follows scroll direction, pauses while
 * off-screen, and stays still for reduced motion. Decorative: aria-hidden.
 */
export function Marquee({ children, direction = 1, speed = 60, className = "" }: MarqueeProps) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const near = useNearViewport(root);

  useGSAP(
    () => {
      if (!near) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const el = track.current!;
        // xPercent of the doubled track is exactly one copy, whatever the fonts do later.
        const loop = gsap.fromTo(
          el,
          { xPercent: direction === 1 ? 0 : -50 },
          { xPercent: direction === 1 ? -50 : 0, duration: el.scrollWidth / 2 / speed, ease: "none", repeat: -1, paused: true },
        );
        let scrollDir = 1;
        const settle = gsap.quickTo(loop, "timeScale", { duration: 0.8, ease: "power2.out" });

        const visibility = ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
        });
        const velocity = ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            if (!visibility.isActive) return;
            scrollDir = self.direction;
            const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 4);
            loop.timeScale(scrollDir * boost);
            settle(scrollDir);
          },
        });

        return () => {
          visibility.kill();
          velocity.kill();
        };
      });
      return () => mm.revert();
    },
    { dependencies: [near], scope: root },
  );

  return (
    <div ref={root} aria-hidden className={`overflow-hidden ${className}`}>
      <div ref={track} className="flex w-max will-change-transform">
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0">{children}</div>
      </div>
    </div>
  );
}
