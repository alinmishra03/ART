import { projectCategories, projects } from "../content/projects";
import type { Project } from "../content/types";

export const projectPath = (p: Pick<Project, "id">) => `/work/${p.id}`;

export const projectById = (id: string) => projects.find((p) => p.id === id);

export const projectIndex = (p: Project) => projects.indexOf(p);

export const nextProject = (p: Project) => projects[(projects.indexOf(p) + 1) % projects.length];

export const categoryLabel = (key: string) => projectCategories.find((c) => c.key === key)?.label ?? key;

export const featuredProjects = projects.filter((p) => p.featured);

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** "/work/<id>" → id, else null. */
export function matchProjectRoute(pathname: string) {
  const m = pathname.match(/^\/work\/([a-z0-9-]+)\/?$/);
  return m ? m[1] : null;
}
