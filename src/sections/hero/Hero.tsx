import { useRef } from "react";
import { FadeIn, RevealText } from "../../components/motion";
import { Button } from "../../components/ui/Button";
import { ArrowRight, Mail } from "../../components/ui/icons";
import { copy, profile } from "../../content/profile";
import { gsap, MQ, useGSAP } from "../../lib/motion";
import { useIntro } from "../../providers/Intro";
import { useScrollTo } from "../../providers/SmoothScroll";
import { FloatingCodeCard, InlineCodeCard } from "./CodeCard";

/**
 * Opening viewport: status → oversized name → bio + CTAs. Entrance plays when
 * the preloader lifts; on scroll the two name lines drift apart and the lower
 * row recedes, handing over to the About section.
 */
export function Hero() {
  const { ready } = useIntro();
  const section = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, mobile: MQ.mobile }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: section.current, start: "top top", end: "bottom top", scrub: true },
        });
        tl.to("[data-hero-line='1']", { xPercent: mobile ? -4 : -9 }, 0)
          .to("[data-hero-line='2']", { xPercent: mobile ? 4 : 7 }, 0)
          .to("[data-hero-bottom]", { y: -60, opacity: 0, duration: 0.45 }, 0);
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} id="home" aria-label="Introduction" className="relative flex min-h-svh flex-col overflow-hidden pt-nav">
      <div className="container-x relative flex flex-1 flex-col gap-12 pb-6 pt-6 md:pb-10 md:pt-10">
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

        {/* Name (layered above the floating card) */}
        <h1 className="t-mega pointer-events-none relative z-10 mt-auto uppercase">
          <span data-hero-line="1" className="block will-change-transform">
            <RevealText as="span" className="block" by="chars" trigger="mount" play={ready} stagger={0.035}>
              {profile.name.split(" ")[0]}
            </RevealText>
          </span>
          <span data-hero-line="2" className="flex items-baseline gap-[0.22em] will-change-transform lg:pl-[8%]">
            <RevealText as="span" by="chars" trigger="mount" play={ready} delay={0.12} stagger={0.035}>
              {profile.name.split(" ")[1]}
            </RevealText>
            <RevealText as="span" by="chars" trigger="mount" play={ready} delay={0.22} stagger={0.035} className="t-serif text-[1.08em] normal-case text-accent">
              {profile.name.split(" ")[2]}
            </RevealText>
          </span>
        </h1>

        {/* Bio, CTAs, scroll cue */}
        <div data-hero-bottom className="grid-12 items-end gap-y-8">
          <FadeIn trigger="mount" play={ready} delay={0.75} className="col-span-4 md:col-span-8 lg:col-span-5">
            <p className="t-lead max-w-[34ch] text-muted">{profile.shortBio}</p>
          </FadeIn>
          <FadeIn trigger="mount" play={ready} delay={0.85} className="col-span-4 md:col-span-8 lg:col-span-5 lg:col-start-7 xl:col-span-4">
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
          <FadeIn trigger="mount" play={ready} delay={0.95} className="hidden justify-end xl:col-span-2 xl:flex">
            <button
              type="button"
              onClick={() => scrollTo("#about")}
              className="group/scroll t-label flex min-h-11 items-center gap-3 text-muted transition-colors hover:text-fg"
            >
              Scroll to explore
              <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-line">
                <span className="absolute inset-x-0 top-0 block h-1/2 animate-[scroll-cue_1.8s_var(--ease-in-out)_infinite] bg-fg" />
              </span>
            </button>
          </FadeIn>
        </div>
      </div>

      <FloatingCodeCard play={ready} bounds={section} />
    </section>
  );
}
