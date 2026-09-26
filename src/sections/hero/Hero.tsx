import { useRef, type MouseEvent } from "react";
import { RevealText } from "../../components/motion";
import { Button } from "../../components/ui/Button";
import { ArrowRight } from "../../components/ui/icons";
import { copy, profile, stats } from "../../content/profile";
import { EASE, gsap, MQ, useGSAP } from "../../lib/motion";
import { useIntro } from "../../providers/Intro";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { useScrollTo } from "../../providers/SmoothScroll";
import { HeroClassic } from "./HeroClassic";
import { HeroName } from "./HeroName";
import { Portrait } from "./Portrait";

// The bio's second sentence, "React specialist building modern SaaS products end-to-end.", its last word in the serif.
const STATEMENT = profile.shortBio.split(". ").slice(1).join(". ").replace(/\.$/, "");
const STATEMENT_HEAD = STATEMENT.slice(0, STATEMENT.lastIndexOf(" "));
const STATEMENT_TAIL = STATEMENT.slice(STATEMENT.lastIndexOf(" ") + 1);
const YEARS = stats[0].value;

/**
 * Opening screen: the full-bleed photograph, kept quiet and open. A frosted
 * availability pill under the nav; above the name, a serif greeting on the
 * left and a short statement with a link to the work on the photo's free
 * side; the oversized name along the bottom (first · project card · last,
 * reacting to the pointer); a closing row with the role and a scroll cue.
 * On the photo surface palette.
 *
 * Sequence after the preloader: the photo rises out of the ground colour, the
 * text lines slide up and the pill, button and cue fade up, then the name and
 * its card. On scroll the photo lags the page. Phones (below 768px): no
 * photograph; the original hero from the start of the redesign instead
 * (HeroClassic), on the site's own theme.
 */
export function Hero() {
  const { ready } = useIntro();
  const section = useRef<HTMLElement>(null);
  const phone = useMediaQuery("(max-width: 47.99rem)");
  const scrollTo = useScrollTo();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.to("[data-photo-scroll]", {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: section.current, start: "top top", end: "bottom top", scrub: true },
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  // The pill, button and scroll cue fade up alongside the text reveals.
  useGSAP(
    () => {
      if (!ready) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo("[data-hero-fade]", { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2, ease: EASE.out, delay: 0.5, stagger: 0.15 });
      });
      return () => mm.revert();
    },
    { dependencies: [ready], scope: section },
  );

  const go = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollTo(`#${id}`);
  };

  return (
    <section ref={section} id="home" aria-label="Introduction" className="surface-photo relative min-h-svh overflow-hidden bg-bg">
      <Portrait play={ready} />

      <h1 className="sr-only">
        {profile.name}, {profile.title}
      </h1>

      {/* Desktop and tablet */}
      <div className="container-x relative hidden min-h-svh flex-col pt-[calc(var(--nav-h)+clamp(1.25rem,4svh,3rem))] md:flex">
        {/* Availability: a frosted pill with the site's pulsing status dot. */}
        <p data-hero-fade className="hero-pill self-end">
          <span aria-hidden className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#2133EB] opacity-80 motion-reduce:animate-none" />
            <span className="relative inline-flex size-full rounded-full bg-[#2133EB]" />
          </span>
          {copy.heroBadge}
        </p>

        <div className="mt-auto flex items-end justify-between gap-10 pb-[clamp(1.25rem,3.5svh,2.5rem)]">
          <RevealText as="p" by="lines" trigger="mount" play={ready} delay={0.5} className="hero-greeting t-serif">
            {copy.heroGreeting}
          </RevealText>
          <div className="flex max-w-[24rem] flex-col items-end text-right lg:max-w-[27rem]">
            <RevealText as="p" by="lines" trigger="mount" play={ready} delay={0.6} className="hero-statement">
              {STATEMENT_HEAD} <span className="t-serif">{STATEMENT_TAIL}.</span>
            </RevealText>
            <div data-hero-fade className="mt-6">
              <Button href="/#projects" onClick={go("projects")} variant="outline" size="sm" className="hero-glass" icon={ArrowRight}>
                View selected work
              </Button>
            </div>
          </div>
        </div>

        <HeroName play={ready} />

        <div className="flex items-center justify-between gap-8 py-[clamp(1.1rem,3svh,2rem)]">
          <RevealText as="p" by="lines" trigger="mount" play={ready} delay={0.85} className="hero-role">
            {profile.title} <span className="hero-role-muted">· {YEARS} years</span>
          </RevealText>
          <a data-hero-fade href="#about" onClick={go("about")} className="hero-cue-link group/cue">
            Scroll
            <span aria-hidden className="hero-cue-ring">
              <ArrowRight size={14} className="hero-cue-arrow" />
            </span>
          </a>
        </div>
      </div>

      {/* Phones: the original hero from the start of the redesign, on the site's own theme. */}
      {phone && <HeroClassic ready={ready} />}
    </section>
  );
}
