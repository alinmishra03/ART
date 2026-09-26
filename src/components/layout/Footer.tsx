import { useRef, type MouseEvent } from "react";
import { navItems } from "../../content/nav";
import { copy, profile } from "../../content/profile";
import { gsap, MQ, useGSAP } from "../../lib/motion";
import { useNearViewport } from "../../lib/useNearViewport";
import { usePathname } from "../../lib/router";
import { usePageTransition } from "../../providers/PageTransition";
import { useScrollTo } from "../../providers/SmoothScroll";
import { Magnetic } from "../motion/Magnetic";
import { ArrowRight, GitHub, LinkedIn, Mail } from "../ui/icons";
import { RollText } from "../ui/RollText";

/**
 * Footer on the inverted surface. Its content rises from underneath as the
 * page ends (scrubbed), finishing on the ART. wordmark. Only original details:
 * bio, availability, navigation, socials, title and copyright.
 */
const PHOTO_SET = (ext: string) => [640, 1024, 1376].map((w) => `/img/portrait/hero-${w}.${ext} ${w}w`).join(", ");

export function Footer() {
  const root = useRef<HTMLElement>(null);
  const near = useNearViewport(root);
  const onHome = usePathname() === "/";
  const scrollTo = useScrollTo();
  const { navigate } = usePageTransition();
  const year = new Date().getFullYear();

  useGSAP(
    () => {
      if (!near) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          "[data-footer-inner]",
          { yPercent: -35 },
          { yPercent: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true } },
        );
        gsap.fromTo(
          "[data-footer-mark]",
          { yPercent: 40 },
          { yPercent: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true } },
        );
      });
      return () => mm.revert();
    },
    { dependencies: [near], scope: root },
  );

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (onHome) scrollTo(`#${id}`);
    else navigate(`/#${id}`);
  };

  const socials = [
    { href: profile.github, label: "GitHub", Icon: GitHub, external: true },
    { href: profile.linkedin, label: "LinkedIn", Icon: LinkedIn, external: true },
    { href: `mailto:${profile.email}`, label: "Email", Icon: Mail, external: false },
  ];

  return (
    <footer ref={root} data-hide-dock className="surface-invert relative overflow-hidden border-t border-line bg-bg">
      {/* The hero photograph across the whole footer, in black and white (the image file is untouched). */}
      <div aria-hidden className="footer-photo pointer-events-none absolute inset-0 overflow-hidden">
        <picture>
          <source type="image/avif" srcSet={PHOTO_SET("avif")} sizes="100vw" />
          <img src="/img/portrait/hero-1376.webp" alt="" width={1376} height={768} loading="lazy" decoding="async" />
        </picture>
        <div className="footer-photo-wash absolute inset-0" />
      </div>

      <div data-footer-inner className="footer-copy container-x relative isolate pt-20 md:pt-28">
        <div className="grid-12 gap-y-12">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <p className="t-lead max-w-md text-muted">{profile.shortBio}</p>
            <p className="t-label mt-6 flex items-center gap-2 text-fg">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              {copy.heroBadge}
            </p>
          </div>

          <nav aria-label="Footer" className="col-span-2 md:col-span-3 lg:col-span-2 lg:col-start-7">
            <p className="t-label text-subtle">Navigate</p>
            <ul className="mt-3">
              {navItems.map(({ id, label }) => (
                <li key={id}>
                  <a href={`/#${id}`} onClick={(e) => go(e, id)} className="group/roll inline-flex min-h-11 min-w-11 items-center text-lg">
                    <RollText>{label}</RollText>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <p className="t-label text-subtle">Elsewhere</p>
            <ul className="mt-3">
              {socials.map(({ href, label, Icon, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group/roll inline-flex min-h-11 items-center gap-2 text-lg"
                  >
                    <Icon size={15} />
                    <RollText>{label}</RollText>
                    {external && <span className="sr-only">(opens in a new tab)</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-4 flex items-start md:col-span-2 md:justify-end lg:col-span-2">
            <Magnetic strength={0.3}>
              <button
                type="button"
                onClick={() => scrollTo(0)}
                className="group/top grid size-20 place-items-center rounded-full border border-line-strong text-fg transition-colors duration-500 hover:border-fg hover:bg-fg hover:text-bg"
                aria-label="Back to top"
              >
                <span data-magnetic-inner>
                  <ArrowRight size={20} className="-rotate-90 transition-transform duration-500 group-hover/top:-translate-y-1" />
                </span>
              </button>
            </Magnetic>
          </div>
        </div>

        <div className="mt-20 flex flex-col-reverse gap-3 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-label text-subtle">
            © {year} {profile.name}. Crafted with React, Tailwind &amp; GSAP.
          </p>
          <p className="t-label text-muted">{profile.title}</p>
        </div>
      </div>

      <p
        data-footer-mark
        aria-hidden
        className="pointer-events-none relative -mb-[0.06em] select-none text-center text-[clamp(8rem,30vw,30rem)] font-bold leading-[0.85] tracking-[-0.07em] text-fg"
      >
        ART<span className="t-serif text-accent">.</span>
      </p>
    </footer>
  );
}
