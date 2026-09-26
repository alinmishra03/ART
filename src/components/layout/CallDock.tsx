import { lazy, Suspense, useEffect, useId, useRef, useState } from "react";
import { phone } from "../../content/profile";
import { EASE, gsap, prefersReducedMotion, ScrollTrigger } from "../../lib/motion";
import { usePathname } from "../../lib/router";
import { useFinePointer } from "../../lib/useMediaQuery";
import { useIntro } from "../../providers/Intro";
import { Phone } from "../ui/icons";

// The QR code is only drawn when the card opens; the pill preloads it on hover/focus.
const loadQR = () => import("qrcode.react");
const QRCodeSVG = lazy(() => loadQR().then((m) => ({ default: m.QRCodeSVG })));

const DISMISS_KEY = "call-dock-hidden";
const readDismissed = () => {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * The original floating "Scan to Call" QR widget, redesigned as a quiet dock.
 * - Desktop: a pill that opens a card with a scannable QR code (tel: link)
 *   and the number. Escape / outside click closes it.
 * - Touch: the pill dials directly (a QR code is pointless on the phone
 *   itself).
 * - Appears after the opening viewport, tucks away while scrolling down (back
 *   on scroll up or a pause), stays out of [data-hide-dock] zones
 *   (Contact and footer already list the number), and sits below the mobile
 *   menu. "Hide" replaces the old drag-to-dismiss and lasts for the session.
 */
export function CallDock() {
  const { ready } = useIntro();
  const fine = useFinePointer();
  const pathname = usePathname();
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState(readDismissed);
  const [past, setPast] = useState(false);
  const [inHideZone, setInHideZone] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrollingDown, setScrollingDown] = useState(false);
  // An open card stays put even while scrolling.
  const visible = ready && past && !inHideZone && !dismissed && (!scrollingDown || open);

  // Scroll-based visibility; re-created per route since the zones change.
  useEffect(() => {
    const threshold = ScrollTrigger.create({
      start: () => window.innerHeight * 0.7,
      end: "max",
      onToggle: (self) => setPast(self.isActive),
    });
    // Tuck away while reading downwards; return on scroll up or after a pause.
    let idle: number | undefined;
    const direction = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        setScrollingDown(self.direction === 1);
        window.clearTimeout(idle);
        idle = window.setTimeout(() => setScrollingDown(false), 900);
      },
    });
    const zones = [...document.querySelectorAll<HTMLElement>("[data-hide-dock]")];
    const active = new Set<HTMLElement>();
    const zoneTriggers = zones.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          if (self.isActive) active.add(el);
          else active.delete(el);
          setInHideZone(active.size > 0);
        },
      }),
    );
    return () => {
      threshold.kill();
      direction.kill();
      window.clearTimeout(idle);
      zoneTriggers.forEach((t) => t.kill());
      setInHideZone(false);
    };
  }, [pathname]);

  useEffect(() => {
    if (!visible) setOpen(false);
    gsap.to(root.current, {
      autoAlpha: visible ? 1 : 0,
      y: visible ? 0 : 24,
      duration: prefersReducedMotion() ? 0 : 0.5,
      ease: visible ? EASE.out : "power2.in",
    });
  }, [visible]);

  // Close the card on Escape or outside click.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* session-only preference; fine to lose */
    }
  };

  const pill =
    "group/dock inline-flex min-h-12 items-center gap-3 rounded-full bg-inverse pl-2 pr-5 text-inverse-fg shadow-[0_16px_40px_-18px_rgb(0_0_0/0.5)] transition-transform duration-500 ease-out hover:-translate-y-0.5";
  const badge = (
    <span className="relative grid size-8 place-items-center rounded-full bg-accent text-accent-fg">
      <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-accent opacity-40" />
      <Phone size={15} />
    </span>
  );

  return (
    <div
      ref={root}
      role="region"
      aria-label="Call Aishwarya"
      className="invisible fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(var(--gutter),env(safe-area-inset-left))] flex items-end gap-2"
      style={{ zIndex: 40 }}
    >
      {fine ? (
        <div className="relative">
          <button type="button" aria-expanded={open} aria-controls={`${uid}-card`} onClick={() => setOpen((o) => !o)} onPointerEnter={loadQR} onFocus={loadQR} className={pill}>
            {badge}
            <span className="t-label">Call</span>
          </button>

          <div
            id={`${uid}-card`}
            hidden={!open}
            className="absolute bottom-[calc(100%+0.75rem)] left-0 w-64 rounded-md border border-line bg-bg-raised p-5 text-fg shadow-[0_30px_60px_-30px_rgb(0_0_0/0.45)]"
          >
            <p className="t-label text-accent">{phone.label}</p>
            <div className="mt-4 aspect-square rounded-sm bg-white p-3">
              {open && (
                <Suspense fallback={null}>
                  <QRCodeSVG value={`tel:${phone.tel}`} size={200} fgColor="#000000" bgColor="#ffffff" title={`QR code to call ${phone.tel}`} className="h-auto w-full" />
                </Suspense>
              )}
            </div>
            <a href={`tel:${phone.tel}`} className="mt-4 block text-xl font-semibold tracking-tight underline-offset-4 hover:underline">
              {phone.tel}
            </a>
            <div className="mt-4 flex justify-between border-t border-line pt-3">
              <button type="button" onClick={() => setOpen(false)} className="t-label min-h-9 text-muted hover:text-fg">
                Close
              </button>
              <button type="button" onClick={dismiss} className="t-label min-h-9 text-muted hover:text-fg">
                Hide for this visit
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <a href={`tel:${phone.tel}`} className={pill} aria-label={`Call ${phone.tel}`}>
            {badge}
            <span className="t-label">Call</span>
          </a>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Hide call button"
            className="grid size-12 place-items-center rounded-full border border-line bg-bg/90 text-muted backdrop-blur-sm"
          >
            <span aria-hidden className="text-lg leading-none">×</span>
          </button>
        </>
      )}
    </div>
  );
}
