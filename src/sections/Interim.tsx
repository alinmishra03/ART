/*
 * Interim Contact section. It carries the real contact details so every
 * contact method works until Phase 6 replaces it.
 */
import { RevealText } from "../components/motion";
import { SectionLabel } from "../components/ui/SectionLabel";
import { TextLink } from "../components/ui/TextLink";
import { copy, phone, profile } from "../content/profile";

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
