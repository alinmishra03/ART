import { useRef } from "react";
import { Button } from "../../components/ui/Button";
import { ArrowRight, ArrowUpRight } from "../../components/ui/icons";
import { hostOf, ProjectShot } from "../../components/ui/ProjectShot";
import { Tag } from "../../components/ui/SectionLabel";
import details from "../../content/projectDetails.json";
import { projects } from "../../content/projects";
import type { Project } from "../../content/types";
import { EASE, gsap, MQ, useGSAP } from "../../lib/motion";
import { useNearViewport } from "../../lib/useNearViewport";
import { categoryLabel, pad2, projectPath } from "../../lib/projectLookup";
import { usePageTransition } from "../../providers/PageTransition";

interface FeatureGroup {
  title: string;
  items: string[];
}
const featureGroups = (id: string): FeatureGroup[] => (details as unknown as Record<string, FeatureGroup[]>)[id] ?? [];
const sentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface CaseStudyProps {
  project: Project;
  /** "showcase": on the home page, links to the case study. "page": the case study itself. */
  variant?: "showcase" | "page";
  /** Alternate text columns for rhythm between consecutive case studies. */
  flip?: boolean;
  priority?: boolean;
  /** Plays the entrance on mount (e.g. top of a project page) instead of on scroll. */
  play?: boolean;
}

/**
 * A project as a mini case study, built only from the original project data:
 * number and category → complete screenshot → title and summary → what it
 * does (the original full description) → technologies → features (verbatim
 * excerpts, see projectDetails.json) → live project.
 *
 * Entrance: meta, then the screenshot reveals and settles (the mask always
 * ends fully open), then the text arrives in order. Transform/opacity only.
 */
export function CaseStudy({ project: p, variant = "showcase", flip = false, priority = false, play = true }: CaseStudyProps) {
  const root = useRef<HTMLElement>(null);
  const { onLinkClick } = usePageTransition();
  const near = useNearViewport(root, variant === "showcase");
  const number = projects.indexOf(p) + 1;
  const groups = featureGroups(p.id);
  const TitleTag = variant === "page" ? "h1" : "h3";
  // Keep the outline intact: h1 → h2 on project pages, h3 → h4 in the home showcase.
  const SubTag = variant === "page" ? "h2" : "h4";
  const titleId = `cs-${p.id}-title`;

  useGSAP(
    () => {
      if (!play || !near) return;
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        const start = variant === "page" ? undefined : { trigger: el, start: "top 78%", once: true };
        gsap
          .timeline({ defaults: { ease: EASE.out }, scrollTrigger: start, delay: variant === "page" ? 0.2 : 0 })
          .fromTo(q("[data-cs='num']"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 })
          .fromTo(q("[data-cs='cat']"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.45")
          .fromTo(q("[data-cs='rule']"), { scaleX: 0 }, { scaleX: 1, duration: 1.2 }, "-=0.5")
          .fromTo(q("[data-shot]"), { opacity: 0, y: 56 }, { opacity: 1, y: 0, duration: 1.2 }, "-=1")
          .fromTo(q("[data-shot-mask]"), { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: EASE.inOut, clearProps: "clipPath" }, "<0.1")
          .fromTo(q("[data-shot-img]"), { scale: 1.08 }, { scale: 1, duration: 1.7, clearProps: "transform" }, "<");

        gsap.fromTo(
          q("[data-cs='text']"),
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.09,
            ease: EASE.out,
            delay: variant === "page" ? 0.9 : 0,
            scrollTrigger: variant === "page" ? undefined : { trigger: q("[data-cs-body]")[0], start: "top 88%", once: true },
          },
        );
      });

      // Gentle drift of the whole frame on large screens (never the image inside it).
      mm.add(`${MQ.desktop} and ${MQ.motion}`, () => {
        gsap.fromTo(
          q("[data-cs-drift]"),
          { y: 36 },
          { y: -36, ease: "none", scrollTrigger: { trigger: q("[data-cs-drift]")[0], start: "top bottom", end: "bottom top", scrub: true } },
        );
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [play, near] },
  );

  const shot = <ProjectShot project={p} priority={priority} decorative={variant === "showcase"} sizes="(min-width: 120rem) 1840px, (min-width: 64rem) 94vw, 100vw" />;

  return (
    <article ref={root} aria-labelledby={titleId} className="container-x">
      {/* Number + category */}
      <div className="flex items-end justify-between gap-6">
        <p data-cs="num" data-fade="" className="t-label text-accent">
          Project {pad2(number)}
          <span className="text-subtle"> / {pad2(projects.length)}</span>
        </p>
        <p data-cs="cat" data-fade="" className="t-label flex gap-4 text-muted">
          <span>{categoryLabel(p.category)}</span>
          {p.featured && <span className="text-fg">★ Featured</span>}
        </p>
      </div>
      <div data-cs="rule" aria-hidden className="mt-4 h-px origin-left bg-line-strong" />

      {/* Complete screenshot */}
      <div data-cs-drift className="mt-6 md:mt-8">
        {variant === "showcase" ? (
          <a
            href={projectPath(p)}
            onClick={onLinkClick}
            data-cursor="view"
            // Pointer shortcut only: "View case study" below is the same link for keyboard and screen readers.
            aria-hidden
            tabIndex={-1}
            className="group/shot block rounded-md"
          >
            {shot}
          </a>
        ) : (
          <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" data-cursor="open" className="group/shot block rounded-md">
            <span className="sr-only">Open the {p.title} live site (opens in a new tab)</span>
            {shot}
          </a>
        )}
      </div>

      {/* Details */}
      <div data-cs-body className="grid-12 mt-10 gap-y-10 md:mt-14">
        <div className={`col-span-4 md:col-span-8 lg:col-span-7 ${flip ? "lg:order-2 lg:col-start-6" : ""}`}>
          <TitleTag id={titleId} data-cs="text" data-fade="" className={variant === "page" ? "t-display" : "t-h1"}>
            {p.title}
          </TitleTag>
          <p data-cs="text" data-fade="" className="t-lead mt-5 max-w-[42ch] text-fg">
            {p.summary}
          </p>
          <div data-cs="text" data-fade="" className="mt-10">
            <SubTag className="t-label text-muted">What it does</SubTag>
            <p className="mt-3 max-w-[62ch] text-muted">{p.description}</p>
          </div>
        </div>

        <div className={`col-span-4 md:col-span-8 lg:col-span-4 ${flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-9"}`}>
          <div data-cs="text" data-fade="">
            <SubTag className="t-label text-muted">Technologies</SubTag>
            <ul className="mt-3 flex flex-wrap gap-2">
              {p.technologies.map((t) => (
                <li key={t}>
                  <Tag className="text-fg">{t}</Tag>
                </li>
              ))}
            </ul>
          </div>

          {groups.map((g) => (
            <div key={g.title} data-cs="text" data-fade="" className="mt-9">
              <SubTag className="t-label text-muted">{g.title}</SubTag>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {g.items.map((item) => (
                  <li key={item} className="flex gap-3 py-2.5 text-sm leading-snug">
                    <span aria-hidden className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{sentenceCase(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div data-cs="text" data-fade="" className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button href={p.liveUrl} target="_blank" rel="noopener noreferrer" icon={ArrowUpRight} aria-label={`View live project: ${p.title} (opens in a new tab)`}>
              View live project
            </Button>
            {variant === "showcase" && (
              <a href={projectPath(p)} onClick={onLinkClick} className="group/cs t-label inline-flex min-h-11 items-center gap-2 text-fg">
                <span className="relative after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 group-hover/cs:after:scale-x-100 group-focus-visible/cs:after:scale-x-100">
                  View case study
                </span>
                <ArrowRight size={14} className="transition-transform duration-500 group-hover/cs:translate-x-1" />
              </a>
            )}
          </div>
          <p data-cs="text" data-fade="" className="t-label mt-4 text-subtle">
            {hostOf(p.liveUrl)}
          </p>
        </div>
      </div>
    </article>
  );
}
