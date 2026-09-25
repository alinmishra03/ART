import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { navItems, type SectionId } from "../../content/nav";
import { profile } from "../../content/profile";
import { EASE, gsap, MQ, ScrollTrigger, useGSAP } from "../../lib/motion";
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
 * Fixed header. Enters after the preloader, hides while scrolling down and
 * returns on scroll up (never while it holds focus or the menu is open), and
 * tracks the active section with ScrollTrigger (state only changes on toggle).
 */
export function Nav() {
  const { ready } = useIntro();
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState<SectionId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuOpenRef = useRef(false);
  menuOpenRef.current = menuOpen;
  const scrollTo = useScrollTo();
  const onHome = usePathname() === "/";
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
          { autoAlpha: 0, yPercent: -60 },
          { autoAlpha: 1, yPercent: 0, duration: 1, stagger: 0.06, ease: EASE.out, delay: 0.55 },
        );
      });
      return () => mm.revert();
    },
    { dependencies: [ready], scope: header },
  );

  // Scrolled surface + hide-on-scroll-down.
  useGSAP(
    () => {
      const el = header.current!;
      let hidden = false;
      const setHidden = (next: boolean, animate: boolean) => {
        if (next === hidden) return;
        hidden = next;
        if (animate) gsap.to(el, { yPercent: next ? -100 : 0, duration: next ? 0.45 : 0.7, ease: next ? "power3.in" : EASE.out, overwrite: true });
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
  }, []);

  useEffect(() => {
    if (menuOpen) gsap.to(header.current, { yPercent: 0, duration: 0.3, overwrite: true });
  }, [menuOpen]);

  return (
    <>
      <header
        ref={header}
        data-scrolled="false"
        className="fixed inset-x-0 top-0 border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-500 data-[scrolled=true]:border-line data-[scrolled=true]:bg-bg/80 data-[scrolled=true]:backdrop-blur-md"
        style={{ zIndex: "var(--z-nav)" }}
      >
        <div className="container-x flex h-nav items-center justify-between gap-6">
          <div data-nav-item data-fade="">
            <Magnetic strength={0.2}>
              <a
                href="/"
                onClick={(e) => goTo(e, "home")}
                aria-label={`${profile.name}, back to top`}
                className="group/roll flex min-h-11 items-center text-lg font-semibold tracking-tight"
              >
                <RollText>
                  <span className="flex items-baseline gap-3">
                    <span>
                      ART<span className="t-serif text-accent">.</span>
                    </span>
                    <span className="t-label hidden font-normal text-muted lg:inline">{profile.name}</span>
                  </span>
                </RollText>
              </a>
            </Magnetic>
          </div>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1 lg:gap-3">
              {navItems.map(({ id, label }, i) => {
                const isActive = active === id;
                return (
                  <li key={id} data-nav-item data-fade="">
                    <a
                      href={`/#${id}`}
                      onClick={(e) => goTo(e, id)}
                      aria-current={isActive ? "location" : undefined}
                      className={`group/roll t-label flex min-h-11 items-center gap-2 px-3 transition-colors duration-300 ${isActive ? "text-fg" : "text-muted hover:text-fg"}`}
                    >
                      <span
                        aria-hidden
                        className={`size-1.5 rounded-full bg-accent transition-transform duration-500 ease-out ${isActive ? "scale-100" : "scale-0"}`}
                      />
                      <span aria-hidden className="text-subtle">
                        0{i + 1}
                      </span>
                      <RollText>{label}</RollText>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            <div data-nav-item data-fade="">
              <ThemeToggle />
            </div>
            <div data-nav-item data-fade="" className="hidden md:block">
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
                className="group/menu flex min-h-11 items-center gap-3 pl-2"
              >
                <span className="t-label relative block h-[1.3em] overflow-hidden">
                  <span className={`block transition-transform duration-500 ease-out motion-reduce:transition-none ${menuOpen ? "-translate-y-1/2" : ""}`}>
                    <span className="block">Menu</span>
                    <span className="block">Close</span>
                  </span>
                </span>
                <span aria-hidden className="relative block h-3 w-6">
                  <span
                    className={`absolute left-0 h-px w-full bg-fg transition-transform duration-500 ease-out motion-reduce:transition-none top-0.5 ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`}
                  />
                  <span
                    className={`absolute left-0 h-px w-full bg-fg transition-transform duration-500 ease-out motion-reduce:transition-none bottom-0.5 ${menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`}
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
