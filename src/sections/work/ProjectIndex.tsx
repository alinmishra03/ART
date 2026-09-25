import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowUpRight } from "../../components/ui/icons";
import { ProjectImage } from "../../components/ui/ProjectImage";
import { projectCategories, projects } from "../../content/projects";
import type { ProjectCategoryKey } from "../../content/types";
import { EASE, gsap, MQ, useGSAP } from "../../lib/motion";
import { categoryLabel, pad2, projectPath } from "../../lib/projectLookup";
import { useFinePointer, useReducedMotion } from "../../lib/useMediaQuery";
import { usePageTransition } from "../../providers/PageTransition";

/**
 * All projects as an editorial index. Keeps the original category filters
 * (now with counts). Rows open the project page; the ↗ opens the live site.
 * Desktop: a preview of the hovered project follows the cursor and leans
 * with its horizontal velocity.
 */
export function ProjectIndex() {
  const [filter, setFilter] = useState<ProjectCategoryKey>("all");
  const rows = useMemo(() => (filter === "all" ? projects : projects.filter((p) => p.category === filter)), [filter]);
  const list = useRef<HTMLOListElement>(null);
  const { onLinkClick } = usePageTransition();
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  const counts = useMemo(
    () => Object.fromEntries(projectCategories.map((c) => [c.key, c.key === "all" ? projects.length : projects.filter((p) => p.category === c.key).length])),
    [],
  );

  // Re-entrance when the filter changes.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo("[data-index-row]", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.035, ease: EASE.out });
      });
      return () => mm.revert();
    },
    { dependencies: [filter], scope: list },
  );

  // ---- cursor preview
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const follow = useRef<{ x: (v: number) => void; y: (v: number) => void; r: (v: number) => void } | null>(null);
  const lastX = useRef(0);
  const shown = useRef(false);

  useGSAP(
    () => {
      if (!fine || !preview.current) return;
      const d = reduced ? 0.01 : 0.6;
      gsap.set(preview.current, { yPercent: -50 });
      follow.current = {
        x: gsap.quickTo(preview.current, "x", { duration: d, ease: "power3.out" }),
        y: gsap.quickTo(preview.current, "y", { duration: d, ease: "power3.out" }),
        r: gsap.quickTo(preview.current, "rotate", { duration: reduced ? 0.01 : 0.8, ease: "power3.out" }),
      };
    },
    { dependencies: [fine, reduced] },
  );

  useGSAP(
    () => {
      if (!preview.current) return;
      gsap.to(preview.current, {
        autoAlpha: active ? 1 : 0,
        scale: active ? 1 : 0.85,
        duration: reduced ? 0 : 0.45,
        ease: EASE.out,
        overwrite: "auto",
      });
      if (active && !reduced) {
        gsap.fromTo(
          preview.current.querySelector("[data-preview-inner]"),
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: EASE.out },
        );
      }
    },
    { dependencies: [active, reduced] },
  );

  const onMove = (e: ReactPointerEvent) => {
    if (!follow.current || !preview.current) return;
    // Sits to the right of the pointer so it never covers the title being read.
    const x = Math.min(e.clientX + 40, window.innerWidth - preview.current.offsetWidth - 16);
    const y = e.clientY;
    if (!shown.current) {
      gsap.set(preview.current, { x, y });
      shown.current = true;
    }
    follow.current.x(x);
    follow.current.y(y);
    follow.current.r(gsap.utils.clamp(-8, 8, (e.clientX - lastX.current) * 0.6));
    lastX.current = e.clientX;
  };
  const onLeave = () => {
    shown.current = false;
    setActive(null);
  };

  return (
    <div id="all-projects" className="container-x mt-section scroll-mt-[calc(var(--nav-h)+1rem)]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h3 className="t-h2">
          All <span className="t-serif text-accent">projects</span>
        </h3>
        <div role="group" aria-label="Filter projects by category" className="flex flex-wrap gap-2">
          {projectCategories.map((c) => {
            const on = filter === c.key;
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(c.key)}
                className={`t-label inline-flex min-h-11 items-center gap-2 rounded-full border px-4 transition-colors duration-300 ${
                  on ? "border-fg bg-fg text-bg" : "border-line text-muted hover:border-fg hover:text-fg"
                }`}
              >
                {c.label}
                <span className={on ? "text-bg/60" : "text-subtle"}>{counts[c.key]}</span>
              </button>
            );
          })}
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        Showing {rows.length} project{rows.length === 1 ? "" : "s"}
      </p>

      <ol
        ref={list}
        className="index-list mt-10 border-t border-line"
        onPointerMove={fine ? onMove : undefined}
        onPointerLeave={fine ? onLeave : undefined}
      >
        {rows.map((p) => {
          const n = projects.indexOf(p) + 1;
          return (
            <li key={p.id} data-index-row className="index-row relative flex items-center border-b border-line">
              <a
                href={projectPath(p)}
                onClick={onLinkClick}
                onPointerEnter={fine ? () => setActive(p.id) : undefined}
                data-cursor="view"
                className="row-main group/row grid flex-1 grid-cols-[4.5rem_1fr] items-center gap-x-4 gap-y-1 py-5 transition-opacity duration-300 md:grid-cols-[3.5rem_1fr_10rem] md:py-7 lg:grid-cols-[4rem_1.2fr_10rem_1fr]"
              >
                {/* Mobile thumbnail */}
                <span className="row-span-2 block overflow-hidden rounded-sm bg-bg-sunken md:hidden">
                  <ProjectImage id={p.id} alt="" sizes="96px" className="aspect-[16/10] w-full object-cover object-top" />
                </span>
                <span className="t-label hidden text-subtle md:block">{pad2(n)}</span>
                <span className="flex items-baseline gap-3 text-[clamp(1.35rem,0.9rem+1.9vw,3rem)] font-semibold leading-[1.05] tracking-[-0.035em] transition-transform duration-500 ease-out group-hover/row:translate-x-2 group-focus-visible/row:translate-x-2">
                  {p.title}
                  {p.featured && (
                    <span className="t-label shrink-0 text-accent" title="Featured">
                      ★<span className="sr-only"> Featured</span>
                    </span>
                  )}
                </span>
                <span className="t-label text-muted">
                  <span className="md:hidden">{pad2(n)} · </span>
                  {categoryLabel(p.category)}
                </span>
                <span className="t-label hidden truncate text-subtle lg:block">{p.technologies.slice(0, 3).join(" · ")}</span>
              </a>
              <a
                href={p.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${p.title} live site (opens in a new tab)`}
                className="ml-3 grid size-11 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors duration-300 hover:border-fg hover:text-fg"
              >
                <ArrowUpRight size={16} />
              </a>
            </li>
          );
        })}
      </ol>

      {fine && (
        <div
          ref={preview}
          aria-hidden
          className="pointer-events-none invisible fixed left-0 top-0 w-[22rem]"
          style={{ zIndex: "var(--z-nav)" }}
        >
          <div data-preview-inner className="overflow-hidden rounded-md shadow-[0_30px_60px_-30px_rgb(0_0_0/0.45)]">
            {active && <ProjectImage key={active} id={active} alt="" sizes="352px" className="aspect-[16/10] w-full object-cover object-top" />}
          </div>
        </div>
      )}
    </div>
  );
}
