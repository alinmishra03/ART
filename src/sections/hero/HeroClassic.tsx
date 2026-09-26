import { useRef } from "react";
import { FadeIn, RevealText } from "../../components/motion";
import { Button } from "../../components/ui/Button";
import { ArrowRight, Mail } from "../../components/ui/icons";
import { copy, profile } from "../../content/profile";
import { gsap, MQ, useGSAP } from "../../lib/motion";
import { useScrollTo } from "../../providers/SmoothScroll";
import { InlineCodeCard } from "./CodeCard";

/**
 * Phones (below 768px): the original hero from the start of the redesign
 * (commit 9ea78e0), on the site's own theme: status → oversized name → bio +
 * CTAs, with the inline code card on tall phones. Same entrance (when the
 * preloader lifts) and the same scroll hand-off (name lines drift apart, the
 * lower row recedes). The page's h1 lives in Hero; the name here is visual.
 */
export function HeroClassic({ ready }: { ready: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const scrollTo = useScrollTo();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        tl.to("[data-mhero-line='1']", { xPercent: -4 }, 0)
          .to("[data-mhero-line='2']", { xPercent: 4 }, 0)
          .to("[data-mhero-bottom]", { y: -60, opacity: 0, duration: 0.45 }, 0);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const [first, second, third] = profile.name.split(" ");

  return (
    <div ref={root} className="relative flex min-h-svh flex-col pt-nav">
      <div className="container-x relative flex flex-1 flex-col gap-12 pb-6 pt-6">
        {/* Status row */}
        <div className="flex items-start justify-between gap-6">
          <FadeIn trigger="mount" play={ready} delay={0.6} y={12}>
            <p className="t-label flex items-center gap-2.5 text-muted">
              <span aria-hidden className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              {copy.heroBadge}
            </p>
          </FadeIn>
          <FadeIn trigger="mount" play={ready} delay={0.7} y={12} className="hidden text-right sm:block">
            <p className="t-label text-muted">{profile.title}</p>
            <p className="t-label mt-1 text-subtle">React · Next.js · Node.js</p>
          </FadeIn>
        </div>

        <InlineCodeCard play={ready} />

        {/* Name (visual; the section's h1 carries it for assistive tech) */}
        <p aria-hidden className="t-mega pointer-events-none relative z-10 mt-auto font-bold uppercase">
          <span data-mhero-line="1" className="block will-change-transform">
            <RevealText as="span" className="block" by="chars" trigger="mount" play={ready} stagger={0.035}>
              {first}
            </RevealText>
          </span>
          <span data-mhero-line="2" className="flex items-baseline gap-[0.22em] will-change-transform">
            <RevealText as="span" by="chars" trigger="mount" play={ready} delay={0.12} stagger={0.035}>
              {second}
            </RevealText>
            <RevealText as="span" by="chars" trigger="mount" play={ready} delay={0.22} stagger={0.035} className="t-serif text-[1.08em] normal-case text-accent">
              {third}
            </RevealText>
          </span>
        </p>

        {/* Bio and CTAs */}
        <div data-mhero-bottom className="grid-12 items-end gap-y-8">
          <FadeIn trigger="mount" play={ready} delay={0.75} className="col-span-4">
            <p className="t-lead max-w-[34ch] text-muted">{profile.shortBio}</p>
          </FadeIn>
          <FadeIn trigger="mount" play={ready} delay={0.85} className="col-span-4">
            <div className="flex flex-wrap gap-3">
              <Button
                href="#projects"
                icon={ArrowRight}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#projects");
                }}
              >
                View Projects
              </Button>
              <Button href={`mailto:${profile.email}`} variant="outline" icon={Mail}>
                Contact Me
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
