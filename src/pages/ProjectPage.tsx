import { useRef } from "react";
import { Footer } from "../components/layout/Footer";
import { Nav } from "../components/layout/Nav";
import { FadeIn } from "../components/motion";
import { ArrowRight } from "../components/ui/icons";
import { ProjectShot } from "../components/ui/ProjectShot";
import type { Project } from "../content/types";
import { EASE, gsap, MQ, useGSAP } from "../lib/motion";
import { usePageMeta } from "../lib/meta";
import { categoryLabel, nextProject, projectPath } from "../lib/projectLookup";
import { useRouteScroll } from "../lib/useRouteScroll";
import { useIntro } from "../providers/Intro";
import { usePageTransition } from "../providers/PageTransition";
import { CaseStudy } from "../sections/work/CaseStudy";

/**
 * Project case study page, built only from the original project data via the
 * shared CaseStudy layout (complete screenshot, what it does, technologies,
 * verbatim features, live link), followed by the next project.
 */
export function ProjectPage({ project: p }: { project: Project }) {
  const { ready } = useIntro();
  const { onLinkClick } = usePageTransition();
  const next = nextProject(p);

  usePageMeta({ title: `${p.title} — Aishwarya Raj Tyagi`, description: p.summary, path: projectPath(p) });
  useRouteScroll(ready);

  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1} className="outline-none">
        <div className="container-x pt-[calc(var(--nav-h)+2rem)] md:pt-[calc(var(--nav-h)+3.5rem)]">
          <FadeIn trigger="mount" play={ready} y={10}>
            <a href="/#projects" onClick={onLinkClick} className="group/back t-label inline-flex min-h-11 items-center gap-2 text-muted hover:text-fg">
              <ArrowRight size={14} className="rotate-180 transition-transform duration-500 group-hover/back:-translate-x-1" />
              All work
            </a>
          </FadeIn>
        </div>

        <div className="mt-8 pb-section md:mt-12">
          <CaseStudy project={p} variant="page" play={ready} priority />
        </div>

        <NextProject project={next} />
      </main>
      <Footer />
    </>
  );
}

function NextProject({ project: p }: { project: Project }) {
  const { onLinkClick } = usePageTransition();
  const media = useRef<HTMLDivElement>(null);

  // The whole frame rises into place; the screenshot inside is never cropped.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          media.current,
          { y: 80, autoAlpha: 0.4, scale: 0.94 },
          { y: 0, autoAlpha: 1, scale: 1, ease: EASE.soft, scrollTrigger: { trigger: media.current, start: "top bottom", end: "top 45%", scrub: true } },
        );
      });
      return () => mm.revert();
    },
    { scope: media },
  );

  return (
    <nav aria-label="Next project" className="border-t border-line">
      <a href={projectPath(p)} onClick={onLinkClick} data-cursor="next" className="group/next group/shot container-x block py-section">
        <p className="t-label flex items-center justify-between text-muted">
          <span>Next project</span>
          <span>{categoryLabel(p.category)}</span>
        </p>
        <p className="t-display mt-8 max-w-[16ch] transition-transform duration-700 ease-out group-hover/next:translate-x-3">
          {p.title}
          <ArrowRight size={48} className="ml-4 inline-block align-middle transition-transform duration-500 group-hover/next:translate-x-2" />
        </p>
        <div ref={media} className="mx-auto mt-12 max-w-5xl">
          <ProjectShot project={p} decorative sizes="(min-width: 64rem) 64rem, 100vw" />
        </div>
      </a>
    </nav>
  );
}
