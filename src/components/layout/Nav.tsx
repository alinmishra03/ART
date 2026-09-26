import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { navItems, type SectionId } from "../../content/nav";
import { profile } from "../../content/profile";
import { EASE, gsap, MQ, prefersReducedMotion, ScrollTrigger, useGSAP } from "../../lib/motion";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { usePathname } from "../../lib/router";
import { useIntro } from "../../providers/Intro";
import { usePageTransition } from "../../providers/PageTransition";
import { useScrollTo } from "../../providers/SmoothScroll";
import { Magnetic } from "../motion/Magnetic";
import { Button } from "../ui/Button";
import { ArrowRight } from "../ui/icons";
import { RollText } from "../ui/RollText";
import { ThemeToggle } from "../ui/ThemeToggle";
import { MobileMenu } from "./MobileMenu";

/**
 * Fixed header as three floating islands: logo, link dock and actions. They
 * take on a frosted glass once the page scrolls (the name beside the logo
 * tucks away). In the dock a solid pill slides under the hovered or focused
 * link and settles back on the current section, the text under it inverting.
 *
 * Enters after the preloader, hides while scrolling down and returns on scroll
 * up (never while it holds focus or the menu is open), and tracks the active
 * section with ScrollTrigger (state only changes on toggle).
 */
export function Nav() {
  const { ready } = useIntro();
  const header = useRef<HTMLElement>(null);
  const dock = useRef<HTMLUListElement>(null);
  const blob = useRef<HTMLSpanElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState<SectionId | null>(null);
  const [hovered, setHovered] = useState<SectionId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuOpenRef = useRef(false);
  menuOpenRef.current = menuOpen;
  const scrollTo = useScrollTo();
  const pathname = usePathname();
  const onHome = pathname === "/";
  const { navigate } = usePageTransition();
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const wide = useMediaQuery("(min-width: 48rem)");

  // The overlay is mobile-only; close it if the viewport grows past it.
  useEffect(() => {
    if (wide) setMenuOpen(false);
  }, [wide]);

  const goTo = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, id: string) => {
      event.preventDefault();
      // Off the home page, sections are reached through the page transition.
      if (!onHome) navigate(id === "home" ? "/" : `/#${id}`);
      else scrollTo(`#${id}`);
    },
    [scrollTo, onHome, navigate],
  );

  // Entrance, gated on the intro.
  useGSAP(
    () => {
      if (!ready) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          "[data-nav-item]",
          { opacity: 0, yPercent: -60 },
          { opacity: 1, yPercent: 0, duration: 1, stagger: 0.06, ease: EASE.out, delay: 0.55 },
        );
        gsap.fromTo("[data-nav-dock]", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 1.1, ease: EASE.out, delay: 0.5 });
      });
      return () => mm.revert();
    },
    { dependencies: [ready], scope: header },
  );

  // The dock pill: slides (with a little stretch) to the lit link, or shrinks away when none is lit.
  const lit = hovered ?? active;
  const firstPlace = useRef(true);
  const placeBlob = useCallback(() => {
    const list = dock.current;
    const pill = blob.current;
    if (!list || !pill) return;
    const link = lit ? list.querySelector<HTMLElement>(`[data-dock-link="${lit}"]`) : null;
    const instant = firstPlace.current || prefersReducedMotion();
    if (!link) {
      gsap.to(pill, { scale: 0.6, autoAlpha: 0, duration: instant ? 0 : 0.4, ease: EASE.soft, overwrite: true });
      return;
    }
    // The link sits in its own <li>; the <li> offset is relative to the dock.
    const props = { x: (link.parentElement?.offsetLeft ?? 0) + link.offsetLeft, width: link.offsetWidth, scale: 1, autoAlpha: 1 };
    const wasHidden = gsap.getProperty(pill, "autoAlpha") === 0;
    if (instant) gsap.set(pill, props);
    else if (wasHidden) {
      gsap.set(pill, { x: props.x, width: props.width });
      gsap.fromTo(pill, { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: EASE.out, overwrite: true });
    } else gsap.to(pill, { ...props, duration: 0.65, ease: "elastic.out(1, 0.8)", overwrite: true });
    firstPlace.current = false;
  }, [lit]);

  useLayoutEffect(() => {
    if (blob.current && firstPlace.current) gsap.set(blob.current, { autoAlpha: 0 });
    placeBlob();
  }, [placeBlob]);

  useEffect(() => {
    const list = dock.current;
    if (!list) return;
    // Re-measure when the dock's size changes (fonts, breakpoints).
    const ro = new ResizeObserver(() => {
      firstPlace.current = true;
      placeBlob();
    });
    ro.observe(list);
    return () => ro.disconnect();
  }, [placeBlob]);

  // Scrolled surface + hide-on-scroll-down.
  useGSAP(
    () => {
      const el = header.current!;
      let hidden = false;
      const setHidden = (next: boolean, animate: boolean) => {
        if (next === hidden) return;
        hidden = next;
        if (animate) gsap.to(el, { yPercent: next ? -110 : 0, duration: next ? 0.45 : 0.7, ease: next ? "power3.in" : EASE.out, overwrite: true });
      };
      const reduce = window.matchMedia(MQ.reduce).matches;
      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const y = self.scroll();
          el.dataset.scrolled = y > 24 ? "true" : "false";
          if (reduce) return;
          const pastHero = y > window.innerHeight * 0.7;
          const focusInside = el.contains(document.activeElement);
          setHidden(self.direction === 1 && pastHero && !focusInside && !menuOpenRef.current, true);
        },
      });
      const onFocus = () => setHidden(false, !reduce);
      el.addEventListener("focusin", onFocus);
      return () => {
        st.kill();
        el.removeEventListener("focusin", onFocus);
      };
    },
    { scope: header },
  );

  // Active section tracking.
  useEffect(() => {
    const triggers = navItems.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) setActive(id);
          else setActive((cur) => (cur === id ? null : cur));
        },
      });
    });
    return () => triggers.forEach((t) => t?.kill());
  }, [pathname]);

  // Take on the inverted palette while over an inverted section (Contact, footer),
  // and the photo palette while over the hero portrait.
  useEffect(() => {
    const el = header.current!;
    const active = new Set<Element>();
    const photo = new Set<Element>();
    const photoTriggers = [...document.querySelectorAll("main .surface-photo")].map((section) =>
      ScrollTrigger.create({
        trigger: section,
        start: () => `top top+=${el.offsetHeight / 2}`,
        end: () => `bottom top+=${el.offsetHeight / 2}`,
        onToggle: (self) => {
          if (self.isActive) photo.add(section);
          else photo.delete(section);
          el.classList.toggle("surface-photo", photo.size > 0);
        },
      }),
    );
    const triggers = [...document.querySelectorAll("main .surface-invert, footer.surface-invert")].map((section) =>
      ScrollTrigger.create({
        trigger: section,
        start: () => `top top+=${el.offsetHeight / 2}`,
        end: () => `bottom top+=${el.offsetHeight / 2}`,
        onToggle: (self) => {
          if (self.isActive) active.add(section);
          else active.delete(section);
          el.classList.toggle("surface-invert", active.size > 0);
        },
      }),
    );
    return () => {
      [...triggers, ...photoTriggers].forEach((t) => t.kill());
      el.classList.remove("surface-invert", "surface-photo");
    };
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) gsap.to(header.current, { yPercent: 0, duration: 0.3, overwrite: true });
  }, [menuOpen]);

  return (
    <>
      <header ref={header} data-scrolled="false" data-menu={menuOpen ? "open" : "closed"} className="site-nav fixed inset-x-0 top-0" style={{ zIndex: "var(--z-nav)" }}>
        <div className="container-x flex h-nav items-center justify-between gap-4">
          {/* Logo island: the name beside it tucks away once the page scrolls. */}
          <div data-nav-item data-fade="" className="nav-island">
            <Magnetic strength={0.2}>
              <a
                href="/"
                onClick={(e) => goTo(e, "home")}
                // Name starts with the visible text (WCAG 2.5.3 label in name).
                aria-label={`ART. ${profile.name}, back to top`}
                className="group/roll flex min-h-11 min-w-11 items-center px-3 text-lg font-semibold tracking-tight"
              >
                <RollText>
                  <span className="flex items-baseline">
                    <span>
                      ART<span className="t-serif text-accent">.</span>
                    </span>
                    <span className="nav-name t-label hidden font-normal text-muted lg:inline-block">{profile.name}</span>
                  </span>
                </RollText>
              </a>
            </Magnetic>
          </div>

          {/* Link dock. */}
          <nav aria-label="Primary" data-nav-dock className="nav-dock hidden md:block">
            <ul ref={dock} onPointerLeave={() => setHovered(null)} className="relative flex items-center">
              <li aria-hidden className="pointer-events-none absolute inset-y-0 left-0">
                <span ref={blob} className="nav-blob block h-full rounded-full bg-fg" />
              </li>
              {navItems.map(({ id, label }, i) => {
                const isLit = lit === id;
                return (
                  <li key={id} data-nav-item data-fade="" className="relative">
                    <a
                      data-dock-link={id}
                      href={`/#${id}`}
                      onClick={(e) => goTo(e, id)}
                      onPointerEnter={() => setHovered(id)}
                      onFocus={() => setHovered(id)}
                      onBlur={() => setHovered(null)}
                      aria-current={active === id ? "location" : undefined}
                      className={`group/roll t-label flex min-h-10 items-center gap-1.5 rounded-full px-4 transition-colors duration-500 lg:px-5 ${isLit ? "text-bg" : "text-muted"}`}
                    >
                      <span aria-hidden className="hidden text-[0.85em] opacity-55 lg:inline">
                        0{i + 1}
                      </span>
                      <RollText>{label}</RollText>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Actions island. */}
          <div className="nav-island flex items-center gap-1 sm:gap-2">
            <div data-nav-item data-fade="">
              <ThemeToggle />
            </div>
            <div data-nav-item data-fade="" className="hidden lg:block">
              <Button href="/#contact" onClick={(e) => goTo(e, "contact")} size="sm" icon={ArrowRight}>
                Get in Touch
              </Button>
            </div>
            <div data-nav-item data-fade="" className="md:hidden">
              <button
                ref={menuButton}
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                className="group/menu flex min-h-11 items-center gap-3 rounded-full bg-fg pl-4 pr-3.5 text-bg"
              >
                <span className="t-label relative block h-[1.3em] overflow-hidden">
                  <span className={`block transition-transform duration-500 ease-out motion-reduce:transition-none ${menuOpen ? "-translate-y-1/2" : ""}`}>
                    <span className="block">Menu</span>
                    <span className="block">Close</span>
                  </span>
                </span>
                <span aria-hidden className="relative block size-4">
                  <span
                    className={`absolute left-0 top-[4.5px] h-[1.5px] w-full origin-center rounded bg-current transition-transform duration-500 ease-out motion-reduce:transition-none ${menuOpen ? "translate-y-[2.75px] rotate-45" : ""}`}
                  />
                  <span
                    className={`absolute bottom-[4.5px] right-0 h-[1.5px] rounded bg-current transition-all duration-500 ease-out motion-reduce:transition-none ${menuOpen ? "w-full -translate-y-[2.75px] -rotate-45" : "w-2/3"}`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} returnFocus={menuButton} active={active} onHome={onHome} />
    </>
  );
}
