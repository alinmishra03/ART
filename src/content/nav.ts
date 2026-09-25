// Section ids keep the original site's anchors (#about, #projects, #skills, #contact).
export const navItems = [
  { id: "about", label: "About" },
  { id: "projects", label: "Work" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof navItems)[number]["id"];
