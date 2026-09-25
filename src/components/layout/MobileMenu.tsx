import { useEffect, useRef, type MouseEvent, type RefObject } from "react";
import { copy, profile } from "../../content/profile";
import { navItems, type SectionId } from "../../content/nav";
import { EASE, gsap, prefersReducedMotion } from "../../lib/motion";
import { usePageTransition } from "../../providers/PageTransition";
import { useLenis, useScrollTo } from "../../providers/SmoothScroll";
import { GitHub, LinkedIn, Mail } from "../ui/icons";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  returnFocus: RefObject<HTMLButtonElement | null>;
  active: SectionId | null;
  onHome: boolean;
}

/**
 * Full-screen menu for small screens. It sits under the header (which keeps
 * the Close button reachable), makes the page inert while open, locks scroll,
 * closes on Escape and returns focus to the menu button. Choosing a link jumps
 * the page behind the cover, then the cover lifts to reveal the section.
 */
export function MobileMenu({ open, onClose, returnFocus, active, onHome }: MobileMenuProps) {
  const root = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(open);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;
  const scrollTo = useScrollTo();
  const { navigate } = usePageTransition();

  // Acts only on real open/close transitions, never on unrelated re-renders.
  useEffect(() => {
    if (open === wasOpen.current) return;
    wasOpen.current = open;
    const el = root.current!;
    const main = document.getElementById("main");
    const html = document.documentElement;
    const reduce = prefersReducedMotion();

    if (open) {
      if (main) main.inert = true;
      html.style.overflow = "hidden";
      lenisRef.current?.stop();
      // Visible synchronously so focus() below can land.
      gsap.set(el, { autoAlpha: 1 });
      if (reduce) gsap.set(el, { clipPath: "none" });
      else
        gsap
          .timeline()
          .fromTo(el, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: EASE.inOut })
          .fromTo("[data-menu-link]", { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.06, ease: EASE.out }, 0.3)
          .fromTo("[data-menu-meta]", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.05, ease: EASE.out }, 0.5);
      el.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
      return;
    }

    if (main) main.inert = false;
    html.style.overflow = "";
    lenisRef.current?.start();
    returnFocus.current?.focus({ preventScroll: true });
    if (reduce) gsap.set(el, { autoAlpha: 0 });
    else
      gsap
        .timeline()
        .to("[data-menu-link]", { yPercent: -110, duration: 0.35, stagger: 0.03, ease: "power3.in" })
        .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.6, ease: EASE.inOut }, 0.15)
        .set(el, { autoAlpha: 0 });
  }, [open, returnFocus]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const choose = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    onClose();
    if (onHome) scrollTo(`#${id}`, { immediate: true });
    else navigate(`/#${id}`);
  };

  return (
    <div
      ref={root}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
      className="invisible fixed inset-0 flex flex-col justify-between bg-bg px-gutter pb-8 pt-[calc(var(--nav-h)+2rem)] md:hidden"
      style={{ zIndex: "var(--z-menu)" }}
    >
      <nav aria-label="Primary">
        <ul className="border-t border-line">
          {navItems.map(({ id, label }, i) => (
            <li key={id} className="border-b border-line">
              <a
                href={`/#${id}`}
                onClick={(e) => choose(e, id)}
                tabIndex={open ? 0 : -1}
                aria-current={active === id ? "location" : undefined}
                className="flex items-baseline justify-between overflow-hidden py-4"
              >
                <span data-menu-link className="t-h1 block">
                  {label}
                </span>
                <span data-menu-link className={`t-label block ${active === id ? "text-accent" : "text-subtle"}`}>
                  (0{i + 1})
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-6">
        <p data-menu-meta className="t-label flex items-center gap-2 text-muted">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {copy.heroBadge}
        </p>
        <a data-menu-meta href={`mailto:${profile.email}`} tabIndex={open ? 0 : -1} className="t-h3 block break-all">
          {profile.email}
        </a>
        <div data-menu-meta className="flex gap-3">
          {[
            { href: profile.github, label: "GitHub", Icon: GitHub },
            { href: profile.linkedin, label: "LinkedIn", Icon: LinkedIn },
            { href: `mailto:${profile.email}`, label: "Email", Icon: Mail },
          ].map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              tabIndex={open ? 0 : -1}
              {...(label === "Email" ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              className="grid size-12 place-items-center rounded-full border border-line"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
