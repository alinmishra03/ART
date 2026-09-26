import { DrawLine, FadeIn, RevealText } from "../../components/motion";
import { SectionLabel } from "../../components/ui/SectionLabel";
import { copy } from "../../content/profile";
import { projects } from "../../content/projects";
import { FeaturedGallery } from "./FeaturedGallery";
import { ProjectIndex } from "./ProjectIndex";

export function Work() {
  const [first, second] = copy.projectsHeading.split(" that ");

  return (
    <section id="projects" aria-labelledby="work-title" className="relative py-section">
      <div className="container-x">
        <div className="flex items-center justify-between gap-6">
          <SectionLabel index="02">{copy.projectsEyebrow}</SectionLabel>
          <DrawLine className="hidden flex-1 md:block" />
          <p className="t-label hidden text-muted md:block">{projects.length} projects</p>
        </div>
        <div className="grid-12 mt-10 gap-y-8 md:mt-14">
          <h2 id="work-title" className="t-display col-span-4 md:col-span-8 lg:col-span-8">
            <RevealText as="span" by="lines" className="block">
              {first} that
            </RevealText>
            <RevealText as="span" by="lines" delay={0.1} className="block">
              <em className="t-serif text-accent">{second}</em>
            </RevealText>
          </h2>
          <FadeIn className="col-span-4 self-end md:col-span-6 lg:col-span-4">
            <p className="t-lead text-muted">{copy.projectsIntro}</p>
          </FadeIn>
        </div>
      </div>

      <FeaturedGallery />
      <ProjectIndex />
    </section>
  );
}
