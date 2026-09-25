import { projects } from "../content/projects";
import type { Project, Skill } from "../content/types";

/*
 * Links each skill to the portfolio projects whose technology list names it.
 * Exact matches, plus a few unambiguous renames where the project data spells
 * the same technology differently. Nothing is inferred beyond that.
 */
const ALIASES: Record<string, string[]> = {
  "Express.js": ["Express"],
  "better-auth": ["Better Auth"],
  Firebase: ["Firebase Auth"],
  "AI Integration": ["AI", "AI Processing"],
};

export function projectsUsing(skill: Skill): Project[] {
  const names = new Set([skill.name, ...(ALIASES[skill.name] ?? [])]);
  return projects.filter((p) => p.technologies.some((t) => names.has(t)));
}
