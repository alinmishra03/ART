/*
 * Interim sections (Phase 3). They carry the real content so every nav target,
 * project link and contact method works while the designed sections are built
 * in Phases 4–6, which replace this file.
 */
import { FadeIn, RevealText } from "../components/motion";
import { SectionLabel, Tag } from "../components/ui/SectionLabel";
import { TextLink } from "../components/ui/TextLink";
import { copy, phone, profile, stats } from "../content/profile";
import { projectCategories, projects } from "../content/projects";
import { skillCategories, skills } from "../content/skills";

export function InterimAbout() {
  return (
    <section id="about" className="container-x py-section">
      <SectionLabel index="01">{copy.aboutEyebrow}</SectionLabel>
      <RevealText as="h2" by="words" className="t-h1 mt-8 max-w-[16ch]">
        {copy.aboutHeading}
      </RevealText>
      <FadeIn className="t-lead mt-10 max-w-3xl text-muted">{profile.description}</FadeIn>
      <dl className="mt-16 grid gap-px border-y border-line bg-line sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-bg py-8 sm:px-6">
            <dt className="t-label text-muted">{s.label}</dt>
            <dd className="t-h1 mt-3">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

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

export function InterimSkills() {
  return (
    <section id="skills" className="container-x py-section">
      <SectionLabel index="03">{copy.skillsEyebrow}</SectionLabel>
      <RevealText as="h2" by="words" className="t-h1 mt-8">
        {copy.skillsHeading}
      </RevealText>
      <p className="t-lead mt-8 max-w-2xl text-muted">{copy.skillsIntro}</p>
      <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
        {skillCategories.map((c) => (
          <div key={c.key}>
            <h3 className="t-label text-accent">{c.label}</h3>
            <ul className="mt-4 space-y-1.5">
              {skills
                .filter((s) => s.category === c.key)
                .map((s) => (
                  <li key={s.name}>{s.name}</li>
                ))}
            </ul>
          </div>
        ))}
      </div>
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
