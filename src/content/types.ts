export type ProjectCategoryKey = "all" | "shopify" | "fullstack" | "web" | "other";

export interface ProjectCategory {
  key: ProjectCategoryKey;
  label: string;
}

export interface Project {
  id: string;
  title: string;
  /** One-line description shown on cards. */
  summary: string;
  /** Full description from the original portfolio. */
  description: string;
  technologies: string[];
  liveUrl: string;
  featured: boolean;
  category: Exclude<ProjectCategoryKey, "all">;
}

export type SkillCategoryKey = "frontend" | "backend" | "database" | "tools" | "devops";

export interface SkillCategory {
  key: SkillCategoryKey;
  label: string;
  tag: string;
}

export interface Skill {
  name: string;
  category: SkillCategoryKey;
  url: string;
}
