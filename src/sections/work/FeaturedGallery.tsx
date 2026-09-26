import { useRef, type FocusEvent } from "react";
import { FadeIn } from "../../components/motion";
import { ArrowRight } from "../../components/ui/icons";
import { ProjectImage } from "../../components/ui/ProjectImage";
import { projects } from "../../content/projects";
import type { Project } from "../../content/types";
import { gsap, MQ, ScrollTrigger, useGSAP } from "../../lib/motion";
import { featuredProjects, pad2, projectPath } from "../../lib/projectLookup";
import { usePageTransition } from "../../providers/PageTransition";
import { useScrollTo } from "../../providers/SmoothScroll";

/**
 * The featured projects (the original data's `featured` flag). Desktop with
 * motion: the section pins and the cards travel horizontally, each opening its
 * image mask and drifting the image inside the frame. Elsewhere the same
 * markup stacks vertically. Cards lead to the project page (live links are
 * there and in the project index below).
 */
export function FeaturedGallery() {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const scrollTo = useScrollTo();
  const total = featuredProjects.length;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MQ.desktop} and ${MQ.motion}`, () => {
        const t = track.current!;
        const distance = () => Math.max(0, t.scrollWidth - window.innerWidth);
        const tween = gsap.to(t, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: wrap.current,
            pin: true,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
              if (counter.current) counter.current.textContent = pad2(Math.min(total, Math.floor(self.progress * total) + 1));
            },
          },
        });
        trigger.current = tween.scrollTrigger ?? null;
        // The call dock would sit on the progress row while pinned.
        wrap.current?.setAttribute("data-hide-dock", "");

        gsap.utils.toArray<HTMLElement>("[data-card]", t).forEach((card) => {
          const media = card.querySelector("[data-card-media]");
          const img = card.querySelector("[data-card-img]");
          gsap.fromTo(
            media,
            // Same right-to-left reveal; the 2% margin keeps the frame's drift and hover scale from being clipped.
            { clipPath: "inset(-2% -2% -2% 100%)" },
            {
              clipPath: "inset(-2% -2% -2% -2%)",
              ease: "none",
              scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 98%", end: "left 50%", scrub: true },
            },
          );
          gsap.fromTo(
            img,
            // The whole frame drifts (not the image inside it), so the screenshot is never cut off.
            { xPercent: -1.5 },
            {
              xPercent: 1.5,
              ease: "none",
              scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
            },
          );
        });

        return () => {
          trigger.current = null;
          wrap.current?.removeAttribute("data-hide-dock");
        };
      });
      return () => mm.revert();
    },
    { scope: wrap },
  );

  // Keyboard: bring a focused card into view by scrolling to its horizontal position.
  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    const st = trigger.current;
    const card = (e.target as HTMLElement).closest<HTMLElement>("[data-card]");
    if (!st || !card || !track.current) return;
    const max = track.current.scrollWidth - window.innerWidth;
    const x = Math.min(max, Math.max(0, card.offsetLeft - (window.innerWidth - card.offsetWidth) / 2));
    scrollTo(st.start + (x / max) * (st.end - st.start), { immediate: true });
  };

  return (
    <div ref={wrap} className="relative mt-20 overflow-clip md:mt-28 pin:mt-16 pin:h-svh">
      <div
        ref={track}
        onFocus={onFocus}
        className="container-x grid gap-y-20 md:gap-y-28 pin:flex pin:h-full pin:w-max pin:max-w-none pin:items-center pin:gap-x-[5vw] pin:pr-[8vw]"
      >
        {/* Intro panel (pinned layout only) */}
        <div aria-hidden className="hidden pin:flex pin:h-[70%] pin:w-[22vw] pin:shrink-0 pin:flex-col pin:justify-between">
          <p className="t-label text-muted">Featured — {pad2(total)}</p>
          <p className="t-h2 max-w-[10ch]">
            Featured <span className="t-serif text-accent">work</span>
          </p>
          <p className="t-label flex items-center gap-2 text-subtle">
            <ArrowRight size={14} /> Keep scrolling
          </p>
        </div>

        {featuredProjects.map((p, i) => (
          <FeaturedCard key={p.id} project={p} index={i} />
        ))}

        {/* Outro: jump to the full index */}
        <div className="pin:flex pin:h-[70%] pin:w-[26vw] pin:shrink-0 pin:flex-col pin:justify-center">
          <FadeIn>
            <p className="t-label text-muted">Featured {pad2(total)} of {pad2(projects.length)}</p>
            <a
              href="#all-projects"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#all-projects");
              }}
              className="group/out mt-4 inline-flex items-end gap-3 text-[clamp(2rem,1.2rem+2.6vw,4rem)] font-semibold leading-none tracking-[-0.04em]"
            >
              <span>
                See all
                <br />
                <span className="t-serif font-normal text-accent">{projects.length} projects</span>
              </span>
              <span className="mb-2 transition-transform duration-500 ease-out group-hover/out:translate-y-1">
                <ArrowRight size={28} className="rotate-90" />
              </span>
            </a>
          </FadeIn>
        </div>
      </div>

      {/* Progress (pinned layout only) */}
      <div aria-hidden className="container-x absolute inset-x-0 bottom-8 hidden items-center gap-6 pin:flex">
        <span className="t-label text-muted">
          <span ref={counter}>01</span> / {pad2(total)}
        </span>
        <div className="h-px flex-1 bg-line">
          <div ref={bar} className="h-full origin-left scale-x-0 bg-fg" />
        </div>
      </div>
    </div>
  );
}

/** Leftover frame space shows the frame's fill, not the blurred loading placeholder. */
const NO_PLACEHOLDER = { backgroundImage: "none" } as const;

function FeaturedCard({ project: p, index }: { project: Project; index: number }) {
  const { onLinkClick } = usePageTransition();

  return (
    <article data-card className="group/card relative pin:w-[56vw] pin:shrink-0 xl:pin:w-[52vw]">
      <a href={projectPath(p)} onClick={onLinkClick} data-cursor="view" className="block">
        <p className="t-label text-accent">Project {pad2(index + 1)}</p>

        {/* One frame for every project (see .project-frame): 16:9, the complete screenshot contained, sheen on top. */}
        {/* GSAP drifts [data-card-img] (and writes inline `scale: none` on it), so the hover scale lives on the frame inside. */}
        <div data-card-media className="mt-4">
          <div data-card-img>
            <div className="project-frame transition-[scale] duration-[1.1s] ease-out group-hover/card:scale-[1.015]">
              <ProjectImage
                id={p.id}
                alt={`${p.title} — ${p.summary}`}
                sizes="(min-width: 64rem) 56vw, 100vw"
                priority={index < 2}
                style={NO_PLACEHOLDER}
                className="transition-[filter] duration-[1.1s] ease-out fine:grayscale-[0.9] fine:group-hover/card:grayscale-0"
              />
              {/* Hover-only: on touch it would sit over the screenshot; "View project" below is the cue there. */}
              <span className="absolute bottom-3 right-3 z-10 hidden size-12 place-items-center rounded-full bg-bg text-fg opacity-0 transition-opacity duration-500 ease-out group-hover/card:opacity-100 fine:grid">
                <ArrowRight size={18} />
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_minmax(0,24rem)] md:items-start md:gap-10">
          <h3 className="t-h2 transition-transform duration-700 ease-out group-hover/card:translate-x-2">{p.title}</h3>
          <div>
            <p className="text-muted">{p.summary}</p>
            <span className="t-label mt-4 inline-flex min-h-11 items-center gap-2 text-fg">
              View project
              <ArrowRight size={14} className="transition-transform duration-500 ease-out group-hover/card:translate-x-1" />
            </span>
          </div>
        </div>
      </a>
    </article>
  );
}
