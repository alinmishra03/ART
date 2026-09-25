import { FadeIn, Magnetic, Parallax, RevealText, ScrollReveal, Stagger } from "../components/motion";
import { Button } from "../components/ui/Button";
import { ArrowDown, ArrowRight, GitHub, LinkedIn, Mail } from "../components/ui/icons";
import { ProjectImage } from "../components/ui/ProjectImage";
import { SectionLabel, Tag } from "../components/ui/SectionLabel";
import { TextLink } from "../components/ui/TextLink";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { copy, profile, stats } from "../content/profile";
import { projects } from "../content/projects";
import { skillCategories, skills } from "../content/skills";
import { usePageTransition } from "../providers/PageTransition";

/*
 * Phase 2 verification surface: every token and primitive rendered with the
 * real portfolio content. Replaced by the home page in Phase 3.
 */

const SWATCHES = [
  ["bg", "bg-bg"],
  ["bg-raised", "bg-bg-raised"],
  ["bg-sunken", "bg-bg-sunken"],
  ["fg", "bg-fg"],
  ["muted", "bg-muted"],
  ["subtle", "bg-subtle"],
  ["accent", "bg-accent"],
  ["inverse", "bg-inverse"],
] as const;

const TYPE_SCALE = [
  ["mega", "t-mega", "Aishwarya"],
  ["display", "t-display", "Full Stack"],
  ["h1", "t-h1", "Projects that ship to production"],
  ["h2", "t-h2", "Building products that people love using."],
  ["h3", "t-h3", "Trux360"],
  ["lead", "t-lead", profile.shortBio],
  ["body", "", profile.description],
  ["label", "t-label", "Selected Work — 18 Projects"],
] as const;

const trux = projects.find((p) => p.id === "trux360")!;
const autoConnex = projects.find((p) => p.id === "auto-connex")!;

export function Styleguide() {
  const { onLinkClick } = usePageTransition();

  return (
    <div className="relative">
      <header className="container-x sticky top-0 flex h-nav items-center justify-between" style={{ zIndex: "var(--z-nav)" }}>
        <a href="/" className="text-lg font-semibold tracking-tight" aria-label="ART — home">
          ART<span className="t-serif text-accent">.</span>
        </a>
        <p className="t-label hidden text-muted sm:block">Design system · Phase 2</p>
        <ThemeToggle />
      </header>

      <main>
        {/* ---------------------------------------------------------- Intro */}
        <section className="container-x flex min-h-[calc(100svh-var(--nav-h))] flex-col justify-end pb-16">
          <SectionLabel index="00">Foundation</SectionLabel>
          <RevealText as="h1" by="chars" trigger="mount" className="t-mega mt-6 uppercase">
            Aishwarya
          </RevealText>
          <RevealText as="p" by="chars" trigger="mount" delay={0.15} className="t-mega uppercase">
            Raj <span className="t-serif normal-case text-accent">Tyagi</span>
          </RevealText>
          <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
            <FadeIn trigger="mount" delay={0.6} className="t-lead max-w-xl text-muted">
              {profile.shortBio}
            </FadeIn>
            <FadeIn trigger="mount" delay={0.8}>
              <span className="t-label inline-flex items-center gap-2 text-muted">
                Scroll <ArrowDown size={14} />
              </span>
            </FadeIn>
          </div>
        </section>

        {/* --------------------------------------------------------- Colour */}
        <section className="container-x py-section">
          <SectionLabel index="01">Colour</SectionLabel>
          <Stagger className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
            {SWATCHES.map(([name, cls]) => (
              <div key={name} className="bg-bg p-4">
                <div className={`aspect-[4/3] rounded-sm border border-line ${cls}`} />
                <p className="t-label mt-3 text-muted">--{name}</p>
              </div>
            ))}
          </Stagger>
        </section>

        {/* ------------------------------------------------------ Type scale */}
        <section className="container-x py-section">
          <SectionLabel index="02">Typography</SectionLabel>
          <p className="t-label mt-6 text-muted">Inter Tight · Instrument Serif · JetBrains Mono — fluid via clamp()</p>
          <div className="mt-12 divide-y divide-line border-y border-line">
            {TYPE_SCALE.map(([name, cls, sample]) => (
              <div key={name} className="grid-12 items-baseline gap-y-3 py-8">
                <p className="t-label col-span-4 text-subtle md:col-span-2">{name}</p>
                <p className={`col-span-4 md:col-span-6 lg:col-span-10 ${cls} ${name === "body" ? "max-w-3xl text-muted" : ""}`}>
                  {sample}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------ Text reveals */}
        <section className="container-x py-section">
          <SectionLabel index="03">Text reveal</SectionLabel>
          <RevealText as="h2" by="words" className="t-h1 mt-10 max-w-[18ch]">
            Building products that <em className="t-serif">people love using.</em>
          </RevealText>
          <div className="grid-12 mt-16 gap-y-10">
            <RevealText as="p" by="lines" className="t-lead col-span-4 text-muted md:col-span-6 lg:col-start-6 lg:col-span-7">
              {profile.description}
            </RevealText>
          </div>
        </section>

        {/* ------------------------------------------------ Controls */}
        <section className="container-x py-section">
          <SectionLabel index="04">Controls</SectionLabel>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button href="#work" variant="solid" icon={ArrowRight}>
              View Projects
            </Button>
            <Button href={`mailto:${profile.email}`} variant="outline" icon={Mail}>
              Contact Me
            </Button>
            <Button variant="accent" onClick={() => {}}>
              Get in Touch
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-8">
            <TextLink href={profile.github} external className="t-lead">
              GitHub
            </TextLink>
            <TextLink href={profile.linkedin} external className="t-lead">
              LinkedIn
            </TextLink>
            <TextLink href={`mailto:${profile.email}`} className="t-lead">
              {profile.email}
            </TextLink>
          </div>
          <div className="mt-10 flex items-center gap-3">
            {[
              { href: profile.github, label: "GitHub", Icon: GitHub },
              { href: profile.linkedin, label: "LinkedIn", Icon: LinkedIn },
              { href: `mailto:${profile.email}`, label: "Email", Icon: Mail },
            ].map(({ href, label, Icon }) => (
              <Magnetic key={label} strength={0.4}>
                <a
                  href={href}
                  aria-label={label}
                  {...(label === "Email" ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                  className="grid size-12 place-items-center rounded-full border border-line text-fg transition-colors duration-300 hover:border-fg"
                >
                  <Icon size={18} />
                </a>
              </Magnetic>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {autoConnex.technologies.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------ Cursor states */}
        <section className="container-x py-section">
          <SectionLabel index="05">Cursor states (desktop)</SectionLabel>
          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-4">
            {["view", "open", "drag", "explore"].map((mode) => (
              <div key={mode} data-cursor={mode} className="grid aspect-square place-items-center bg-bg-raised">
                <span className="t-label text-muted">data-cursor="{mode}"</span>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------ Stats stagger */}
        <section className="container-x py-section">
          <SectionLabel index="06">Stagger</SectionLabel>
          <Stagger className="mt-10 grid gap-px border-y border-line bg-line sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-bg py-10 sm:px-6">
                <p className="t-display">{s.value}</p>
                <p className="t-label mt-4 text-muted">{s.label}</p>
              </div>
            ))}
          </Stagger>
        </section>

        {/* ------------------------------------------------ Image reveal + parallax */}
        <section id="work" className="container-x py-section">
          <SectionLabel index="07">Image mask + parallax</SectionLabel>
          <div className="grid-12 mt-10 items-end gap-y-8">
            <a
              href={trux.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="view"
              className="group col-span-4 block md:col-span-8 lg:col-span-8"
            >
              <ScrollReveal className="overflow-hidden rounded-md bg-bg-sunken">
                <Parallax speed={0.06}>
                  <ProjectImage
                    id={trux.id}
                    alt={`${trux.title} — ${trux.summary}`}
                    sizes="(min-width: 64rem) 66vw, 100vw"
                    className="w-full scale-[1.08] transition-transform duration-[1.2s] ease-out group-hover:scale-[1.12]"
                  />
                </Parallax>
              </ScrollReveal>
            </a>
            <div className="col-span-4 lg:col-span-4">
              <p className="t-label text-accent">Project 05</p>
              <RevealText as="h3" by="chars" className="t-h2 mt-3">
                {trux.title}
              </RevealText>
              <FadeIn className="mt-4 text-muted">{trux.summary}</FadeIn>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ Skills coverage */}
        <section className="container-x py-section">
          <SectionLabel index="08">Content check — all skill categories</SectionLabel>
          <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
            {skillCategories.map((c) => (
              <div key={c.key}>
                <p className="t-label text-accent">{c.label}</p>
                <ul className="mt-4 space-y-1.5 text-muted">
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

        {/* ------------------------------------------------ Page transition */}
        <section className="container-x py-section">
          <SectionLabel index="09">Page transition</SectionLabel>
          <p className="t-lead mt-8 max-w-xl text-muted">
            Internal navigation runs behind a curtain (~800ms). Back/forward stay native.
          </p>
          <div className="mt-8">
            <Button href="/does-not-exist" onClick={onLinkClick} variant="outline" icon={ArrowRight}>
              Visit a missing page
            </Button>
          </div>
        </section>
      </main>

      <footer className="container-x border-t border-line py-10">
        <p className="t-label text-muted">
          {copy.contactEyebrow} — {profile.email}
        </p>
      </footer>
    </div>
  );
}
