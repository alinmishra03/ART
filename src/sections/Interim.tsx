/*
 * Interim Work and Contact sections. They carry the real content so every nav
 * target, project link and contact method works until Phases 5–6 replace them.
 */
import { RevealText } from "../components/motion";
import { SectionLabel, Tag } from "../components/ui/SectionLabel";
import { TextLink } from "../components/ui/TextLink";
import { copy, phone, profile } from "../content/profile";
import { projectCategories, projects } from "../content/projects";

export function InterimWork() {
  const label = (key: string) => projectCategories.find((c) => c.key === key)?.label ?? key;
  return (
    <section id="projects" className="container-x py-section">
      <SectionLabel index="02">{copy.projectsEyebrow}</SectionLabel>
      <RevealText as="h2" by="words" className="t-h1 mt-8 max-w-[16ch]">
        {copy.projectsHeading}
      </RevealText>
      <p className="t-lead mt-8 max-w-2xl text-muted">{copy.projectsIntro}</p>
      <ol className="mt-16 border-t border-line">
        {projects.map((p, i) => (
          <li key={p.id} className="grid-12 gap-y-2 border-b border-line py-6">
            <span className="t-label col-span-4 text-subtle md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="t-h3 col-span-4 md:col-span-3">
              <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" data-cursor="open" className="hover:text-accent">
                {p.title}
              </a>
            </h3>
            <p className="col-span-4 text-muted md:col-span-3 lg:col-span-6">{p.summary}</p>
            <span className="col-span-4 md:col-span-1 lg:col-span-2 lg:text-right">
              <Tag>{label(p.category)}</Tag>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function InterimContact() {
  return (
    <section id="contact" className="container-x py-section">
      <SectionLabel index="04">{copy.contactEyebrow}</SectionLabel>
      <RevealText as="h2" by="words" className="t-display mt-8 max-w-[14ch]">
        {copy.contactHeading}
      </RevealText>
      <p className="t-lead mt-8 max-w-2xl text-muted">{copy.contactIntro}</p>
      <ul className="t-h3 mt-12 space-y-4">
        <li>
          <TextLink href={`mailto:${profile.email}`}>{profile.email}</TextLink>
          <p className="t-label mt-2 text-muted">{copy.contactEmailNote}</p>
        </li>
        <li>
          <TextLink href={profile.linkedin} external>
            LinkedIn
          </TextLink>
        </li>
        <li>
          <TextLink href={profile.github} external>
            GitHub
          </TextLink>
        </li>
        <li>
          <TextLink href={`tel:${phone.tel}`}>Call {phone.tel}</TextLink>
        </li>
      </ul>
      <p className="t-label mt-24 text-subtle">
        © {new Date().getFullYear()} {profile.name}
      </p>
    </section>
  );
}
