import { useRef } from "react";
import { RevealText } from "../../components/motion";
import { copy, profile } from "../../content/profile";
import { gsap, MQ, useGSAP } from "../../lib/motion";
import { useIntro } from "../../providers/Intro";
import { HeroName } from "./HeroName";
import { Portrait } from "./Portrait";

// "Available for Hire & Freelance" → two lines, as set in the composition.
const [availLead, availTail] = copy.heroBadge.split(" & ");
const [firstName, ...otherNames] = profile.name.split(" ");

/**
 * Opening screen: the full-bleed photograph with the role in two short
 * statements and the oversized name along the bottom (first · project card ·
 * last, reacting to the pointer). On the photo surface palette.
 *
 * Sequence after the preloader: the photo rises out of the ground colour, the
 * role lines slide up, then the name and its card. On scroll the photo lags
 * the page. Phones: no oversized name; the name sits small at chest height
 * with the two role statements facing each other below it.
 */
export function Hero() {
  const { ready } = useIntro();
  const section = useRef<HTMLElement>(null);

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
        <p className="hero-role self-end text-right">{role}</p>
        <div className="mt-auto pb-[clamp(1.5rem,5svh,3.5rem)]">
          <HeroName play={ready} />
          <p className="hero-role mt-[clamp(1.75rem,2.6vw,2.75rem)] text-right">{title}</p>
        </div>
      </div>

      {/* Phones */}
      <div className="container-x relative flex min-h-svh flex-col md:hidden" aria-hidden>
        {/* The photo's head reaches the top of a phone screen, so the name sits at chest height with the role. */}
        <p className="hero-role-sm mt-[56svh] flex items-center justify-center">
          {firstName}
          <span className="mx-1.5 inline-block size-1.5 rounded-full bg-fg" />
          {otherNames.join(" ")}
        </p>
        <div className="mt-5 flex items-start justify-between gap-6">
          <p className="hero-role-sm">
            {availLead}
            <br />
            &amp; {availTail}
          </p>
          <p className="hero-role-sm text-right">{profile.title}</p>
        </div>
      </div>
    </section>
  );
}
