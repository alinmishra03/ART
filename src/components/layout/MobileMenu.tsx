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
 * Full-screen menu for small screens. The cover grows as a circle out of the
 * menu button, the links rise into place with a slight tilt and their rules
 * draw in; closing shrinks it back into the button. It sits under the header
 * (which keeps the Close button reachable), makes the page inert while open,
 * locks scroll, closes on Escape and returns focus to the menu button.
 * Choosing a link jumps the page behind the cover, then the cover closes to
 * reveal the section.
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

    // The circle is centred on the menu button and reaches the farthest corner.
    const btn = returnFocus.current?.getBoundingClientRect();
    const cx = btn ? btn.left + btn.width / 2 : window.innerWidth;
    const cy = btn ? btn.top + btn.height / 2 : 0;
    const radius = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy));
    const shut = `circle(0px at ${cx}px ${cy}px)`;
    const full = `circle(${radius}px at ${cx}px ${cy}px)`;

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
          .fromTo(el, { clipPath: shut }, { clipPath: full, duration: 0.9, ease: "expo.inOut" })
          .fromTo("[data-menu-link]", { yPercent: 120, rotate: 7 }, { yPercent: 0, rotate: 0, duration: 1, stagger: 0.07, ease: EASE.out }, 0.35)
          .fromTo("[data-menu-rule]", { scaleX: 0 }, { scaleX: 1, duration: 1, stagger: 0.07, ease: EASE.out }, 0.35)
          .fromTo("[data-menu-meta]", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06, ease: EASE.out }, 0.6);
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
        .to("[data-menu-link]", { yPercent: -120, rotate: -4, duration: 0.4, stagger: 0.03, ease: "power3.in" })
        .to("[data-menu-meta]", { autoAlpha: 0, y: -10, duration: 0.3, ease: "power2.in" }, 0)
        .to(el, { clipPath: shut, duration: 0.75, ease: "expo.inOut" }, 0.2)
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
      className="invisible fixed inset-0 flex flex-col justify-between gap-10 overflow-y-auto overscroll-contain bg-bg pb-[max(2rem,env(safe-area-inset-bottom))] pl-[max(var(--gutter),env(safe-area-inset-left))] pr-[max(var(--gutter),env(safe-area-inset-right))] pt-[calc(var(--nav-h)+1.5rem)] md:hidden"
      style={{ zIndex: "var(--z-menu)" }}
    >
      <nav aria-label="Primary">
        <p data-menu-meta className="t-label mb-3 text-subtle">
          Navigation
        </p>
        <ul>
          {navItems.map(({ id, label }, i) => {
            const current = active === id;
            return (
              <li key={id} className="relative">
                <a
                  href={`/#${id}`}
                  onClick={(e) => choose(e, id)}
                  tabIndex={open ? 0 : -1}
                  aria-current={current ? "location" : undefined}
                  className="flex items-center justify-between gap-4 overflow-hidden py-3"
                >
                  <span data-menu-link className={`mobile-menu-link block origin-bottom-left ${current ? "t-serif text-accent" : ""}`}>
                    {label}
                  </span>
                  <span data-menu-link className="t-label flex items-center gap-2 text-subtle">
                    {current && <span aria-hidden className="size-1.5 rounded-full bg-accent" />}
                    0{i + 1}
                  </span>
                </a>
                <span data-menu-rule aria-hidden className="absolute inset-x-0 bottom-0 block h-px origin-left bg-line" />
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-6">
        <p data-menu-meta className="t-label flex items-center gap-2 text-muted">
          <span aria-hidden className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70 motion-reduce:animate-none" />
            <span className="relative inline-flex size-full rounded-full bg-accent" />
          </span>
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
              className="grid size-12 place-items-center rounded-full border border-line transition-colors duration-500 hover:border-fg hover:bg-fg hover:text-bg"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
