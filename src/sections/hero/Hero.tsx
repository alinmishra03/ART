import { useRef } from "react";
import { RevealText } from "../../components/motion";
import { copy, profile } from "../../content/profile";
import { gsap, MQ, useGSAP } from "../../lib/motion";
import { useIntro } from "../../providers/Intro";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { HeroClassic } from "./HeroClassic";
import { HeroName } from "./HeroName";
import { Portrait } from "./Portrait";

// "Available for Hire & Freelance" → two lines, as set in the composition.
const [availLead, availTail] = copy.heroBadge.split(" & ");

/**
 * Opening screen: the full-bleed photograph with the role in two short
 * statements and the oversized name along the bottom (first · project card ·
 * last, reacting to the pointer). On the photo surface palette.
 *
 * Sequence after the preloader: the photo rises out of the ground colour, the
 * role lines slide up, then the name and its card. On scroll the photo lags
 * the page. Phones (below 768px): no photograph; the original hero from the
 * start of the redesign instead (HeroClassic), on the site's own theme.
 */
export function Hero() {
  const { ready } = useIntro();
  const section = useRef<HTMLElement>(null);
  const phone = useMediaQuery("(max-width: 47.99rem)");

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

  const role = (
    <RevealText as="span" by="lines" trigger="mount" play={ready} delay={0.45} className="block">
      {availLead}
      <br />
      &amp; {availTail}
    </RevealText>
  );
  const title = (
    <RevealText as="span" by="lines" trigger="mount" play={ready} delay={0.55} className="block">
      {profile.title}
    </RevealText>
  );

  return (
    <section ref={section} id="home" aria-label="Introduction" className="surface-photo relative min-h-svh overflow-hidden bg-bg">
      <Portrait play={ready} />

      <h1 className="sr-only">
        {profile.name}, {profile.title}
      </h1>

      {/* Desktop and tablet */}
      <div className="container-x relative hidden min-h-svh flex-col pt-[calc(var(--nav-h)+clamp(2rem,6svh,5rem))] md:flex">
        {/* Availability, set like the site's status labels elsewhere (pulsing blue dot, mono caps), sized to read clearly over the photo. */}
        <p className="hero-status self-end">
          <span aria-hidden className="relative mt-[0.3em] flex size-[0.62em] shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#2133EB] opacity-70" />
            <span className="relative inline-flex size-full rounded-full bg-[#2133EB]" />
          </span>
          <span className="text-right">{role}</span>
        </p>
        <div className="mt-auto pb-[clamp(1.5rem,5svh,3.5rem)]">
          <HeroName play={ready} />
          <p className="hero-role mt-[clamp(1.75rem,2.6vw,2.75rem)] text-right">{title}</p>
        </div>
      </div>

      {/* Phones */}
      {/* Phones: the original hero from the start of the redesign, on the site's own theme. */}
      {phone && <HeroClassic ready={ready} />}
    </section>
  );
}
