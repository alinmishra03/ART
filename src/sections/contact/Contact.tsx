import { useRef, type ComponentType } from "react";
import { DrawLine, FadeIn, Magnetic, RevealText, Stagger } from "../../components/motion";
import { ArrowUpRight, GitHub, LinkedIn, Mail, Phone } from "../../components/ui/icons";
import { SectionLabel } from "../../components/ui/SectionLabel";
import { copy, phone, profile } from "../../content/profile";
import { gsap, MQ, useGSAP } from "../../lib/motion";
import { useNearViewport } from "../../lib/useNearViewport";
import { ContactForm } from "./ContactForm";

interface Channel {
  label: string;
  value: string;
  note: string;
  href: string;
  Icon: ComponentType<{ size?: number }>;
  external?: boolean;
}

// Titles and notes are the original contact copy.
const CHANNELS: Channel[] = [
  { label: "Email Me", value: profile.email, note: copy.contactEmailNote, href: `mailto:${profile.email}`, Icon: Mail },
  {
    label: copy.contactLinkedIn.title,
    value: copy.contactLinkedIn.subtitle,
    note: copy.contactLinkedIn.note,
    href: profile.linkedin,
    Icon: LinkedIn,
    external: true,
  },
  {
    label: copy.contactGithub.cta,
    value: copy.contactGithub.title,
    note: copy.contactGithub.body,
    href: profile.github,
    Icon: GitHub,
    external: true,
  },
  { label: "Call", value: phone.tel, note: "Tap to call", href: `tel:${phone.tel}`, Icon: Phone },
];

/**
 * The closing act, on the inverted surface: the original "Let's start a
 * Project Together" headline, a magnetic email CTA, every contact channel from
 * the original site, and the EmailJS form.
 */
export function Contact() {
  const section = useRef<HTMLElement>(null);
  const near = useNearViewport(section);
  const [lead, rest] = copy.contactHeading.split(" Project ");

  useGSAP(
    () => {
      if (!near) return;
      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, mobile: MQ.mobile }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return;
        // Surface opens from rounded insets as it arrives.
        gsap.fromTo(
          section.current,
          { clipPath: mobile ? "inset(0% 3% 0% 3% round 24px)" : "inset(0% 5% 0% 5% round 48px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            ease: "none",
            scrollTrigger: { trigger: section.current, start: "top bottom", end: "top 25%", scrub: true },
          },
        );
        // Headline lines drift apart, echoing the hero.
        gsap.fromTo("[data-contact-line='1']", { xPercent: mobile ? 3 : 8 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: "[data-contact-head]", start: "top bottom", end: "bottom 40%", scrub: true } });
        gsap.fromTo("[data-contact-line='3']", { xPercent: mobile ? -3 : -8 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: "[data-contact-head]", start: "top bottom", end: "bottom 40%", scrub: true } });
      });
      return () => mm.revert();
    },
    { dependencies: [near], scope: section },
  );

  return (
    <section ref={section} id="contact" data-hide-dock aria-labelledby="contact-title" className="surface-invert relative overflow-x-clip bg-bg py-section">
      <div className="container-x">
        <div className="flex items-center justify-between gap-6">
          <SectionLabel index="04">{copy.contactEyebrow}</SectionLabel>
          <DrawLine className="hidden flex-1 md:block" />
          <p className="t-label hidden items-center gap-2 text-muted md:flex">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            {copy.heroBadge}
          </p>
        </div>

        <h2 id="contact-title" data-contact-head className="t-display mt-8 md:mt-10">
          <span data-contact-line="1" className="block">
            <RevealText as="span" by="words" className="block">
              {lead}
            </RevealText>
          </span>
          <span data-contact-line="2" className="block pl-[10vw]">
            <RevealText as="span" by="words" delay={0.08} className="t-serif block text-accent">
              Project
            </RevealText>
          </span>
          <span data-contact-line="3" className="block text-right md:pl-[34vw] md:text-left">
            <RevealText as="span" by="words" delay={0.16} className="block">
              {rest}
            </RevealText>
          </span>
        </h2>

        <div className="grid-12 mt-10 items-center gap-y-10 md:mt-14">
          <FadeIn className="col-span-4 md:col-span-5 lg:col-span-6">
            <p className="t-lead text-muted">{copy.contactIntro}</p>
          </FadeIn>
          <div className="col-span-4 flex md:col-span-3 md:justify-end lg:col-span-6">
            <Magnetic strength={0.35} innerStrength={0.2}>
              <a
                href={`mailto:${profile.email}`}
                className="group/cta grid size-40 place-items-center rounded-full bg-accent text-accent-fg transition-transform duration-500 ease-out hover:scale-105 md:size-48 lg:size-56"
              >
                <span data-magnetic-inner className="flex flex-col items-center gap-2 text-center">
                  <Mail size={22} />
                  <span className="text-lg font-semibold tracking-tight md:text-xl">Email Me</span>
                  <span className="t-label opacity-90">{copy.contactEmailNote.replace("Expect a response ", "")}</span>
                </span>
              </a>
            </Magnetic>
          </div>
        </div>

        <Stagger as="ul" className="mt-12 grid gap-px border-y border-line bg-line md:mt-16 md:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {CHANNELS.map((c) => (
            <li key={c.label} className="bg-bg">
              <a
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group/ch flex h-full flex-col gap-6 p-6 transition-colors duration-500 hover:bg-bg-raised md:p-8"
              >
                <span className="flex items-center justify-between text-muted">
                  <c.Icon size={20} />
                  <ArrowUpRight size={18} />
                </span>
                <span>
                  <span className="t-label block text-accent">{c.label}</span>
                  <span className="mt-2 block break-words text-xl font-semibold tracking-tight transition-transform duration-500 ease-out group-hover/ch:translate-x-1">
                    {c.value}
                  </span>
                  <span className="mt-2 block text-sm text-muted">{c.note}</span>
                </span>
                {c.external && <span className="sr-only">(opens in a new tab)</span>}
              </a>
            </li>
          ))}
        </Stagger>

        <div className="grid-12 mt-section gap-y-10">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <FadeIn>
              <p className="t-h2">
                Or write it <span className="t-serif text-accent">here.</span>
              </p>
            </FadeIn>
          </div>
          <div className="col-span-4 md:col-span-8 lg:col-span-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
