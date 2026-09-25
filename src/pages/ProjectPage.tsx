import { useRef } from "react";
import { Footer } from "../components/layout/Footer";
import { Nav } from "../components/layout/Nav";
import { FadeIn, Parallax, RevealText, ScrollReveal, Stagger } from "../components/motion";
import { Button } from "../components/ui/Button";
import { ArrowRight, ArrowUpRight } from "../components/ui/icons";
import { ProjectImage } from "../components/ui/ProjectImage";
import { Tag } from "../components/ui/SectionLabel";
import { projects } from "../content/projects";
import type { Project } from "../content/types";
import { gsap, MQ, useGSAP } from "../lib/motion";
import { usePageMeta } from "../lib/meta";
import { categoryLabel, nextProject, pad2, projectIndex, projectPath } from "../lib/projectLookup";
import { useRouteScroll } from "../lib/useRouteScroll";
import { useIntro } from "../providers/Intro";
import { usePageTransition } from "../providers/PageTransition";

/**
 * Project page. Uses only the original project data: title, summary, full
 * description, category, technologies, screenshot and live URL.
 */
export function ProjectPage({ project: p }: { project: Project }) {
  const { ready } = useIntro();
  const { onLinkClick } = usePageTransition();
  const index = projectIndex(p);
  const next = nextProject(p);

  usePageMeta({ title: `${p.title} — Aishwarya Raj Tyagi`, description: p.summary, path: projectPath(p) });
  useRouteScroll(ready);

  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1} className="outline-none">
        <article>
          <header className="container-x pt-[calc(var(--nav-h)+3rem)] md:pt-[calc(var(--nav-h)+5rem)]">
            <FadeIn trigger="mount" play={ready} y={10}>
              <a href="/#projects" onClick={onLinkClick} className="group/back t-label inline-flex min-h-11 items-center gap-2 text-muted hover:text-fg">
                <ArrowRight size={14} className="rotate-180 transition-transform duration-500 group-hover/back:-translate-x-1" />
                All work
              </a>
            </FadeIn>

            <FadeIn trigger="mount" play={ready} delay={0.1} y={10} className="mt-10">
              <p className="t-label flex flex-wrap gap-x-4 gap-y-1 text-muted">
                <span className="text-accent">
                  Project {pad2(index + 1)} / {pad2(projects.length)}
                </span>
                <span>{categoryLabel(p.category)}</span>
                {p.featured && <span>★ Featured</span>}
              </p>
            </FadeIn>

            <RevealText as="h1" by="chars" trigger="mount" play={ready} delay={0.1} stagger={0.025} className="t-display mt-6 max-w-[14ch]">
              {p.title}
            </RevealText>

            <div className="grid-12 mt-12 gap-y-10 md:mt-16">
              <FadeIn trigger="mount" play={ready} delay={0.45} className="col-span-4 md:col-span-5 lg:col-span-6">
                <p className="t-lead text-muted">{p.summary}</p>
              </FadeIn>
              <FadeIn trigger="mount" play={ready} delay={0.55} className="col-span-4 md:col-span-3 lg:col-span-4 lg:col-start-9">
                <dl className="grid grid-cols-2 gap-6 border-t border-line pt-5">
                  <div>
                    <dt className="t-label text-subtle">Category</dt>
                    <dd className="mt-2">{categoryLabel(p.category)}</dd>
                  </div>
                  <div>
                    <dt className="t-label text-subtle">Stack</dt>
                    <dd className="mt-2">{p.technologies.slice(0, 3).join(", ")}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="t-label text-subtle">Live</dt>
                    <dd className="mt-2">
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 break-all underline decoration-line-strong underline-offset-4 hover:decoration-fg">
                        {new URL(p.liveUrl).hostname.replace(/^www\./, "")}
                        <ArrowUpRight size={14} />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </dd>
                  </div>
                </dl>
              </FadeIn>
            </div>
          </header>

          <div className="container-x mt-16 md:mt-24">
            <ScrollReveal className="overflow-hidden rounded-md bg-bg-sunken" start="top 95%">
              <Parallax speed={0.05}>
                <ProjectImage
                  id={p.id}
                  alt={`${p.title} — screenshot`}
                  sizes="(min-width: 120rem) 1840px, 100vw"
                  priority
                  className="w-full scale-[1.06]"
                />
              </Parallax>
            </ScrollReveal>
          </div>

          <section aria-labelledby="overview" className="container-x py-section">
            <div className="grid-12 gap-y-10">
              <div className="col-span-4 md:col-span-8 lg:col-span-3">
                <h2 id="overview" className="t-label text-muted lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
                  Overview
                </h2>
              </div>
              <div className="col-span-4 md:col-span-8 lg:col-span-8">
                <RevealText as="p" by="lines" className="text-[clamp(1.25rem,0.95rem+1.2vw,2.1rem)] font-medium leading-[1.35] tracking-[-0.02em]">
                  {p.description}
                </RevealText>

                <h3 className="t-label mt-16 text-muted">Technologies</h3>
                <Stagger as="ul" className="mt-5 flex flex-wrap gap-2" y={10} stagger={0.04}>
                  {p.technologies.map((t) => (
                    <li key={t}>
                      <Tag className="text-fg">{t}</Tag>
                    </li>
                  ))}
                </Stagger>

                <FadeIn className="mt-14 flex flex-wrap gap-3">
                  <Button href={p.liveUrl} target="_blank" rel="noopener noreferrer" icon={ArrowUpRight}>
                    Visit live site
                  </Button>
                  <Button href="/#projects" onClick={onLinkClick} variant="outline" icon={ArrowRight}>
                    All work
                  </Button>
                </FadeIn>
              </div>
            </div>
          </section>
        </article>

        <NextProject project={next} />
      </main>
      <Footer />
    </>
  );
}

function NextProject({ project: p }: { project: Project }) {
  const { onLinkClick } = usePageTransition();
  const media = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          media.current,
          { clipPath: "inset(12% 12% 12% 12% round 12px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 8px)",
            ease: "none",
            scrollTrigger: { trigger: media.current, start: "top bottom", end: "center center", scrub: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: media },
  );

  return (
    <nav aria-label="Next project" className="border-t border-line">
      <a href={projectPath(p)} onClick={onLinkClick} data-cursor="next" className="group/next container-x block py-section">
        <p className="t-label flex items-center justify-between text-muted">
          <span>Next project</span>
          <span>{categoryLabel(p.category)}</span>
        </p>
        <p className="t-display mt-8 max-w-[16ch] transition-transform duration-700 ease-out group-hover/next:translate-x-3">
          {p.title}
          <ArrowRight size={48} className="ml-4 inline-block align-middle transition-transform duration-500 group-hover/next:translate-x-2" />
        </p>
        <div ref={media} className="mt-12 overflow-hidden rounded-md bg-bg-sunken">
          <ProjectImage
            id={p.id}
            alt=""
            sizes="100vw"
            className="aspect-[21/9] w-full object-cover object-top transition-transform duration-[1.2s] ease-out group-hover/next:scale-[1.03]"
          />
        </div>
      </a>
    </nav>
  );
}

