import { useEffect, useRef } from "react";
import { gsap } from "../../lib/motion";
import { useFinePointer, useReducedMotion } from "../../lib/useMediaQuery";
import "./cursor.css";

const INTERACTIVE = "[data-cursor], a, button, [role='button'], label, summary, input, textarea, select, [contenteditable='true']";
const TEXT_FIELDS = "input, textarea, select, [contenteditable='true']";

/**
 * Desktop-only cursor. States are driven by markup:
 *   - links/buttons         → "link" (ring grows)
 *   - data-cursor="view"    → labelled bubble ("VIEW"); any word works, or set data-cursor-label
 *   - data-cursor="hide"    → hidden (also automatic over text fields, which keep the native caret)
 * Position runs through gsap.quickTo; state changes only touch data attributes.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const r = root.current;
    if (!fine || !r || !dot.current || !ring.current || !label.current) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");

    const lag = reduced ? 0.01 : 0.42;
    const dotX = gsap.quickTo(dot.current, "x", { duration: 0.01 });
    const dotY = gsap.quickTo(dot.current, "y", { duration: 0.01 });
    const ringX = gsap.quickTo(ring.current, "x", { duration: lag, ease: "power3.out" });
    const ringY = gsap.quickTo(ring.current, "y", { duration: lag, ease: "power3.out" });

    let state = "default";
    let text = "";
    const setState = (next: string, nextText = "") => {
      if (next === state && nextText === text) return;
      state = next;
      text = nextText;
      r.dataset.state = next;
      if (nextText) label.current!.textContent = nextText;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (r.dataset.visible !== "true") {
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY });
        r.dataset.visible = "true";
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest<HTMLElement>(INTERACTIVE);
      if (!target) return setState("default");
      if (target.matches(TEXT_FIELDS)) return setState("hide");
      const mode = target.dataset.cursor;
      if (mode === "hide") return setState("hide");
      if (mode && mode !== "link") return setState("label", target.dataset.cursorLabel ?? mode);
      setState("link");
    };

    const onLeaveWindow = (e: PointerEvent) => {
      if (!e.relatedTarget) r.dataset.visible = "false";
    };
    const onDown = () => (r.dataset.pressed = "true");
    const onUp = () => delete r.dataset.pressed;

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onLeaveWindow, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onLeaveWindow);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [fine, reduced]);

  if (!fine) return null;

  return (
    <div ref={root} className="cursor" data-state="default" data-visible="false" aria-hidden>
      <div ref={ring} className="cursor__ring">
        <div className="cursor__press">
          <div className="cursor__shape" />
          <span ref={label} className="cursor__label t-label" />
        </div>
      </div>
      <div ref={dot} className="cursor__dot" />
    </div>
  );
}
