import { useRef } from "react";
import { Counter, DrawLine, FadeIn, RevealText, ScrubWords } from "../../components/motion";
import { Button } from "../../components/ui/Button";
import { ArrowRight, Mail } from "../../components/ui/icons";
import { SectionLabel } from "../../components/ui/SectionLabel";
import { copy, profile, stats } from "../../content/profile";
import { gsap, MQ, useGSAP } from "../../lib/motion";
import { useNearViewport } from "../../lib/useNearViewport";
import { useScrollTo } from "../../providers/SmoothScroll";

// Sectors named in the original description ("…across SaaS, fintech, logistics, and e-commerce").
const SECTORS = ["SaaS", "Fintech", "Logistics", "E-commerce"];

/**
 * About as a scroll story: statement → description that brightens word by word
 * → sector band sliding sideways → counted stats. All copy is the original.
 */
export function About() {
  const scrollTo = useScrollTo();
  const band = useRef<HTMLDivElement>(null);
  const bandNear = useNearViewport(band);

  // Sector band drifts horizontally with scroll.
  useGSAP(
    () => {
      if (!bandNear) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          "[data-band-track]",
          { xPercent: 0 },
          { xPercent: -28, ease: "none", scrollTrigger: { trigger: band.current, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
      return () => mm.revert();
    },
    { dependencies: [bandNear], scope: band },
  );

  const [lead, ...rest] = copy.aboutHeading.replace(/\.$/, "").split(" that ");

  return (
    <section id="about" aria-labelledby="about-title" className="relative py-section">
      <div className="container-x">
        <div className="flex items-center justify-between gap-6">
          <SectionLabel index="01">{copy.aboutEyebrow}</SectionLabel>
          <DrawLine className="hidden flex-1 md:block" />
        </div>

        <h2 id="about-title" className="t-display mt-8 md:mt-10">
          <RevealText as="span" by="lines" className="block">
            {lead} that
          </RevealText>
          <RevealText as="span" by="lines" delay={0.1} className="block pl-[8vw] md:pl-[16vw]">
            <em className="t-serif text-accent">{rest.join(" that ")}.</em>
          </RevealText>
        </h2>

        <div className="grid-12 mt-10 gap-y-10 md:mt-14">
          <div className="col-span-4 md:col-span-8 lg:col-span-3">
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
              <FadeIn>
                <p className="t-label text-muted">{profile.title}</p>
                <p className="t-label mt-1 text-subtle">
                  {profile.yearsExperience} years · {profile.name}
                </p>
              </FadeIn>
            </div>
          </div>
          <div className="col-span-4 md:col-span-8 lg:col-span-9">
            <ScrubWords className="text-[clamp(1.5rem,0.95rem+2.05vw,3.1rem)] font-medium leading-[1.2] tracking-[-0.025em]">
              {profile.description}
            </ScrubWords>
            <FadeIn className="mt-8 flex flex-wrap gap-3">
              <Button
                href="#projects"
                icon={ArrowRight}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#projects");
                }}
              >
                See My Work
              </Button>
              <Button
                href="#contact"
                variant="outline"
                icon={Mail}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#contact");
                }}
              >
                Get in Touch
              </Button>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Sector band */}
      <div ref={band} aria-hidden className="mt-section overflow-hidden border-y border-line py-6 md:py-10">
        <div data-band-track className="flex w-max items-center gap-[0.35em] whitespace-nowrap text-[clamp(3rem,1rem+8vw,10rem)] font-semibold leading-none tracking-[-0.045em]">
          {[...SECTORS, ...SECTORS, ...SECTORS].map((s, i) => (
            <span key={i} className="flex items-center gap-[0.35em]">
              <span className={i % 2 ? "t-serif font-normal text-accent" : "t-outline"}>{s}</span>
              <span className="text-[0.3em] text-subtle">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="container-x mt-section">
        <dl className="grid gap-y-12 md:grid-cols-3 md:gap-x-gutter">
          {stats.map((s, i) => (
            <div key={s.label}>
              <DrawLine strong delay={i * 0.12} />
              <dt className="t-label mt-5 flex justify-between text-muted">
                <span>{s.label}</span>
                <span aria-hidden className="text-subtle">
                  0{i + 1}
                </span>
              </dt>
              <dd className="t-display mt-6">
                <Counter value={s.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
