import { useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { navItems } from "../../content/nav";
import { copy, profile } from "../../content/profile";
import { EASE, gsap, MQ, useGSAP } from "../../lib/motion";
import { useNearViewport } from "../../lib/useNearViewport";
import { usePathname } from "../../lib/router";
import { usePageTransition } from "../../providers/PageTransition";
import { useScrollTo } from "../../providers/SmoothScroll";
import { Magnetic } from "../motion/Magnetic";
import { ArrowRight, GitHub, LinkedIn, Mail } from "../ui/icons";
import { RollText } from "../ui/RollText";

/**
 * Full-screen footer on the inverted surface, over the hero photograph in
 * black and white. Small columns sit above the name, set as two oversized
 * words at either edge ("Aishwarya" … "Tyagi"). As the page ends the photo
 * settles, the columns rise in and the name's letters rise from their
 * baseline (scrubbed to the scroll); each letter lifts on hover.
 * Phones: no photo, natural height, the name on two lines.
 */
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const PHOTO_SET = (ext: string) => [640, 1024, 1376, 1920, 2752].map((w) => `/img/portrait/hero-${w}.${ext} ${w}w`).join(", ");

const nameParts = profile.name.split(" ");
const FIRST = nameParts[0];
const LAST = nameParts[nameParts.length - 1];
/** Space between the two words on one row, as a multiple of the font size. */
const GAP = 0.25;
const BUILT_WITH = ["React", "TypeScript", "Tailwind CSS", "GSAP", "Lenis"];

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
        const scrub = { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: 0.6 };
        gsap.fromTo("[data-footer-photo]", { scale: 1.18, yPercent: -8 }, { scale: 1, yPercent: 0, ease: "none", scrollTrigger: scrub });
        gsap.fromTo("[data-footer-rule]", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: scrub });
        gsap.fromTo(
          "[data-footer-char]",
          { yPercent: 115, rotate: 6 },
          { yPercent: 0, rotate: 0, ease: "none", stagger: 0.05, scrollTrigger: { ...scrub, start: "top 70%" } },
        );
        gsap.fromTo(
          "[data-footer-item]",
          { y: 36, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 1.1,
            ease: EASE.out,
            stagger: 0.06,
            scrollTrigger: { trigger: "[data-footer-cols]", start: "top 85%", toggleActions: "play none none reverse" },
          },
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
    <footer
      ref={root}
      data-hide-dock
      className="surface-invert relative flex flex-col justify-end overflow-hidden border-t border-line bg-bg md:min-h-svh"
    >
      {/* The hero photograph across the whole footer, in black and white (the image file is untouched). */}
      <div aria-hidden className="footer-photo pointer-events-none absolute inset-0 overflow-hidden">
        <div data-footer-photo className="absolute inset-0 origin-bottom">
          <picture>
            {/* Phones: no photograph in the footer, so nothing is downloaded. */}
            <source media="(max-width: 47.99rem)" srcSet={BLANK} />
            <source type="image/avif" srcSet={PHOTO_SET("avif")} sizes="100vw" />
            <img src="/img/portrait/hero-1920.webp" alt="" width={1376} height={768} loading="lazy" decoding="async" />
          </picture>
        </div>
        <div className="footer-photo-wash absolute inset-0" />
      </div>

      <div className="footer-copy container-x relative isolate pt-14 md:pt-[calc(var(--nav-h)+2rem)]">
        <div data-footer-cols className="grid-12 gap-y-10">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <p data-footer-item className="t-label flex items-center gap-2 text-fg">
              <span aria-hidden className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              {copy.heroBadge}
            </p>
            <p data-footer-item className="t-lead mt-5 max-w-md text-muted">
              {profile.shortBio}
            </p>
          </div>

          <nav aria-label="Footer" className="col-span-2 md:col-span-2 lg:col-span-2 lg:col-start-6">
            <p data-footer-item className="t-label text-subtle">
              Navigate
            </p>
            <ul className="mt-3">
              {navItems.map(({ id, label }) => (
                <li key={id} data-footer-item>
                  <a href={`/#${id}`} onClick={(e) => go(e, id)} className="group/roll inline-flex min-h-11 min-w-11 items-center text-lg">
                    <RollText>{label}</RollText>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <p data-footer-item className="t-label text-subtle">
              Elsewhere
            </p>
            <ul className="mt-3">
              {socials.map(({ href, label, Icon, external }) => (
                <li key={label} data-footer-item>
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

          <div className="col-span-2 md:col-span-2 lg:col-span-2">
            <p data-footer-item className="t-label text-subtle">
              Built with
            </p>
            <ul className="mt-3">
              {BUILT_WITH.map((tool) => (
                <li key={tool} data-footer-item className="flex min-h-9 items-center text-lg text-muted">
                  {tool}
                </li>
              ))}
            </ul>
          </div>

          <div data-footer-item className="col-span-2 flex items-start justify-end md:col-span-1 lg:col-span-1">
            <Magnetic strength={0.3}>
              <button
                type="button"
                onClick={() => scrollTo(0)}
                className="group/top grid size-16 place-items-center rounded-full border border-line-strong text-fg transition-colors duration-500 hover:border-fg hover:bg-fg hover:text-bg md:size-20"
                aria-label="Back to top"
              >
                <span data-magnetic-inner>
                  <ArrowRight size={20} className="-rotate-90 transition-transform duration-500 group-hover/top:-translate-y-1" />
                </span>
              </button>
            </Magnetic>
          </div>
        </div>
      </div>

      <div className="container-x relative mt-16 md:mt-24">
        <FooterName />
        <div data-footer-rule aria-hidden className="mt-4 h-px origin-left bg-line-strong md:mt-6" />
        <div className="flex flex-col-reverse gap-2 py-5 sm:flex-row sm:items-center sm:justify-between md:py-6">
          <p className="t-label text-subtle">
            © {year} {profile.name}
          </p>
          <p className="t-label text-muted">{profile.title}</p>
        </div>
      </div>
    </footer>
  );
}

/*
 * The name at the foot of the page, fitted to the container: on one row with
 * the words at either edge from 768px up, on two rows (last name right
 * aligned) on phones. Each letter sits in its own mask so it can rise from
 * the baseline, and lifts a little on hover.
 */
function FooterName() {
  const row = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ font: number; stacked: boolean } | null>(null);

  useLayoutEffect(() => {
    const el = row.current;
    if (!el) return;
    const measure = () => {
      const probe = el.querySelectorAll<HTMLElement>("[data-fname-probe]");
      if (probe.length < 2) return;
      const a1 = probe[0].getBoundingClientRect().width / 100;
      const a2 = probe[1].getBoundingClientRect().width / 100;
      const width = el.clientWidth;
      const stacked = width < 720;
      setFit({ font: stacked ? width / a1 : width / (a1 + a2 + GAP), stacked });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  const word = (text: string, accent: boolean) => (
    <span className={`footer-name-word flex ${accent ? "footer-name-accent" : ""}`}>
      {Array.from(text).map((ch, i) => (
        <span key={i} className="footer-name-mask">
          <span data-footer-char className="block">
            <span className="footer-name-char block">{ch}</span>
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div ref={row} className="relative w-full">
      <p className="sr-only">{profile.name}</p>
      {/* Width probes at 100px (never shown). */}
      <span aria-hidden data-fname-probe className="footer-name-word invisible absolute left-0 top-0" style={{ fontSize: 100 }}>
        {FIRST}
      </span>
      <span aria-hidden data-fname-probe className="footer-name-word footer-name-accent invisible absolute left-0 top-0" style={{ fontSize: 100 }}>
        {LAST}
      </span>
      <div
        aria-hidden
        className={`flex justify-between ${fit?.stacked ? "flex-col items-start gap-y-[0.04em]" : "flex-row items-end"}`}
        style={fit ? { fontSize: fit.font } : { visibility: "hidden", fontSize: "12vw" }}
      >
        {word(FIRST, false)}
        <span className="self-end">{word(LAST, true)}</span>
      </div>
    </div>
  );
}
