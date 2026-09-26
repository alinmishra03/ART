import { useMemo, useRef, useState, type FocusEvent, type PointerEvent as ReactPointerEvent } from "react";
import { DrawLine, FadeIn, RevealText, Stagger } from "../../components/motion";
import { Marquee } from "../../components/ui/Marquee";
import { SectionLabel } from "../../components/ui/SectionLabel";
import { copy } from "../../content/profile";
import { skillCategories, skills } from "../../content/skills";
import type { Project, Skill, SkillCategory } from "../../content/types";
import { EASE, gsap, useGSAP } from "../../lib/motion";
import { projectsUsing } from "../../lib/skillUsage";
import { useFinePointer, useReducedMotion } from "../../lib/useMediaQuery";

interface Entry extends Skill {
  usedIn: Project[];
}

interface PanelData {
  name: string;
  category: SkillCategory;
  usedIn: Project[];
}

/**
 * Skills without scores: two velocity-reactive marquees, then every category
 * as an editorial list with sticky labels. Each skill keeps its original
 * official-site link; the only added context is derived from this portfolio's
 * own project data (which projects list the technology).
 */
export function Skills() {
  const entries = useMemo<Entry[]>(() => skills.map((s) => ({ ...s, usedIn: projectsUsing(s) })), []);
  const [rowA, rowB] = useMemo(() => {
    const mid = Math.ceil(skills.length / 2);
    return [skills.slice(0, mid), skills.slice(mid)];
  }, []);

  return (
    <section id="skills" aria-labelledby="skills-title" className="relative overflow-clip py-section">
      <div className="container-x">
        <div className="flex items-center justify-between gap-6">
          <SectionLabel index="03">{copy.skillsEyebrow}</SectionLabel>
          <DrawLine className="hidden flex-1 md:block" />
        </div>
        <div className="grid-12 mt-10 gap-y-8 md:mt-14">
          <h2 id="skills-title" className="t-display col-span-4 md:col-span-8 lg:col-span-7">
            <RevealText as="span" by="chars" className="block">
              Skills &amp;
            </RevealText>
            <RevealText as="span" by="chars" delay={0.1} className="t-serif block text-accent">
              Tools
            </RevealText>
          </h2>
          <FadeIn className="col-span-4 self-end md:col-span-6 lg:col-span-4 lg:col-start-9">
            <p className="t-lead text-muted">{copy.skillsIntro}</p>
            <p className="t-label mt-6 text-subtle">
              {skills.length} technologies · {skillCategories.length} disciplines
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="mt-12 space-y-2 md:mt-16">
        <Marquee speed={55} className="border-y border-line py-4">
          {rowA.map((s) => (
            <MarqueeItem key={s.name} name={s.name} />
          ))}
        </Marquee>
        <Marquee speed={45} direction={-1} className="border-b border-line py-4">
          {rowB.map((s) => (
            <MarqueeItem key={s.name} name={s.name} outline />
          ))}
        </Marquee>
      </div>

      <SkillIndex entries={entries} />
    </section>
  );
}

function MarqueeItem({ name, outline = false }: { name: string; outline?: boolean }) {
  return (
    <span className="flex items-center gap-[0.5em] pr-[0.5em] text-[clamp(2rem,1rem+3.6vw,5rem)] font-semibold leading-none tracking-[-0.04em]">
      <span className={outline ? "t-outline" : ""}>{name}</span>
      <span className="text-[0.35em] text-accent">✦</span>
    </span>
  );
}

function SkillIndex({ entries }: { entries: Entry[] }) {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const [panel, setPanel] = useState<PanelData | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const moveTo = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null);

  useGSAP(
    () => {
      if (!fine || !panelRef.current) return;
      const dur = reduced ? 0.01 : 0.5;
      moveTo.current = {
        x: gsap.quickTo(panelRef.current, "x", { duration: dur, ease: "power3.out" }),
        y: gsap.quickTo(panelRef.current, "y", { duration: dur, ease: "power3.out" }),
      };
    },
    { dependencies: [fine, reduced] },
  );

  useGSAP(
    () => {
      if (!panelRef.current) return;
      gsap.to(panelRef.current, {
        autoAlpha: panel ? 1 : 0,
        scale: panel ? 1 : 0.92,
        duration: reduced ? 0 : 0.35,
        ease: EASE.out,
      });
    },
    { dependencies: [panel, reduced] },
  );

  const hideTimer = useRef<number | undefined>(undefined);
  const visible = useRef(false);
  const PANEL_W = 256;
  const place = (x: number, y: number, immediate: boolean) => {
    const px = Math.min(x + 24, window.innerWidth - PANEL_W - 16);
    const py = Math.min(y + 24, window.innerHeight - 200);
    if (immediate || !moveTo.current) gsap.set(panelRef.current, { x: px, y: py });
    else {
      moveTo.current.x(px);
      moveTo.current.y(py);
    }
  };

  const show = (entry: Entry, at?: { x: number; y: number }) => {
    window.clearTimeout(hideTimer.current);
    if (at) place(at.x, at.y, !visible.current);
    visible.current = true;
    const category = skillCategories.find((c) => c.key === entry.category)!;
    setPanel((cur) => (cur?.name === entry.name ? cur : { name: entry.name, category, usedIn: entry.usedIn }));
  };
  const hide = () => {
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      visible.current = false;
      setPanel(null);
    }, 90);
  };
  const track = (e: ReactPointerEvent) => {
    if (visible.current) place(e.clientX, e.clientY, false);
  };
  const onFocusSkill = (entry: Entry, e: FocusEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    show(entry, { x: r.right - 16, y: r.top - 8 });
  };

  return (
    <div className="container-x mt-section" onPointerMove={fine ? track : undefined}>
      {skillCategories.map((category, ci) => {
        const items = entries.filter((e) => e.category === category.key);
        return (
          <div key={category.key} className="grid-12 relative gap-y-6 pb-10 md:pb-14">
            <DrawLine strong className="col-span-4 md:col-span-8 lg:col-span-12" />
            <div className="col-span-4 md:col-span-8 lg:col-span-3">
              <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
                <p className="t-label text-accent">({String(ci + 1).padStart(2, "0")})</p>
                <h3 className="t-h3 mt-3">{category.label}</h3>
                <p className="t-label mt-2 text-muted">
                  {category.tag} · {items.length}
                </p>
              </div>
            </div>
            <Stagger
              as="ul"
              y={18}
              stagger={0.035}
              className="skill-list col-span-4 flex flex-wrap items-center gap-x-[0.55em] md:col-span-8 lg:col-span-9"
            >
              {items.map((entry) => (
                <li key={entry.name} className="skill-item">
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onPointerEnter={fine ? (e) => show(entry, { x: e.clientX, y: e.clientY }) : undefined}
                    onPointerLeave={fine ? hide : undefined}
                    onFocus={fine ? (e) => onFocusSkill(entry, e) : undefined}
                    onBlur={fine ? hide : undefined}
                    className="relative inline-flex min-h-11 min-w-11 items-start gap-1 py-1 text-[clamp(1.75rem,1.1rem+2.4vw,3.6rem)] font-semibold leading-[1.08] tracking-[-0.035em] transition-[color,opacity] duration-300 hover:text-accent focus-visible:text-accent"
                  >
                    {entry.name}
                    {entry.usedIn.length > 0 && (
                      <sup className="t-label mt-[0.4em] text-[0.75rem] font-normal tracking-normal text-accent">
                        {entry.usedIn.length}
                      </sup>
                    )}
                    <span className="sr-only">
                      {entry.usedIn.length > 0
                        ? `, listed in ${entry.usedIn.length} portfolio project${entry.usedIn.length > 1 ? "s" : ""}`
                        : ""}{" "}
                      (official site, opens in a new tab)
                    </span>
                  </a>
                  <span aria-hidden className="ml-[0.55em] text-[clamp(1.75rem,1.1rem+2.4vw,3.6rem)] font-light text-line-strong">
                    /
                  </span>
                </li>
              ))}
            </Stagger>
          </div>
        );
      })}

      <p className="t-label text-subtle">
        <span className="text-accent">n</span> = number of projects in this portfolio that list the technology
      </p>

      {/* Cursor-following context panel (fine pointers only) */}
      {fine && (
        <div
          ref={panelRef}
          aria-hidden
          className="pointer-events-none invisible fixed left-0 top-0 w-64 origin-top-left rounded-md border border-line bg-bg-raised/95 p-4 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.4)] backdrop-blur-sm"
          style={{ zIndex: "var(--z-nav)" }}
        >
          {panel && (
            <>
              <p className="t-label text-accent">
                {panel.category.label} · {panel.category.tag}
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight">{panel.name}</p>
              {panel.usedIn.length > 0 ? (
                <>
                  <p className="t-label mt-3 text-muted">
                    In {panel.usedIn.length} project{panel.usedIn.length > 1 ? "s" : ""}
                  </p>
                  <ul className="mt-2 space-y-0.5 text-sm text-muted">
                    {panel.usedIn.slice(0, 5).map((p) => (
                      <li key={p.id}>{p.title}</li>
                    ))}
                    {panel.usedIn.length > 5 && <li className="text-subtle">+{panel.usedIn.length - 5} more</li>}
                  </ul>
                </>
              ) : (
                <p className="t-label mt-3 text-subtle">Official site ↗</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
