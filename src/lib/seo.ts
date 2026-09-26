import type { Project } from "../content/types.ts";

/*
 * Route metadata shared by the app (usePageMeta) and the build, which writes
 * it into each route's static HTML for crawlers and link previews that don't
 * run JavaScript. No React imports: vite.config.ts loads this module.
 */

export const SITE_URL = "https://aishwaryarajtyagi.com";
export const DEFAULT_TITLE = "Aishwarya Raj Tyagi — Full Stack Developer";
export const DEFAULT_DESCRIPTION =
  "Aishwarya Raj Tyagi — Full Stack Developer with 5+ years of experience building scalable, production-ready web applications in React, Next.js, and Node.js.";
export const NOT_FOUND_TITLE = "Page not found — Aishwarya Raj Tyagi";

export const projectPath = (p: Pick<Project, "id">) => `/work/${p.id}`;

export const projectMeta = (p: Project) => ({
  title: `${p.title} — Aishwarya Raj Tyagi`,
  description: p.summary,
  path: projectPath(p),
});
