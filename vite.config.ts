import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { profile } from "./src/content/profile.ts";
import { projects } from "./src/content/projects.ts";
import { DEFAULT_DESCRIPTION, NOT_FOUND_TITLE, projectMeta, projectPath, SITE_URL } from "./src/lib/seo.ts";

/**
 * Preloads the fonts the preloader and hero need on the first frame, so the
 * opening sequence isn't waiting on CSS discovery. Build output only (the
 * filenames are hashed).
 */
function preloadFonts(patterns: RegExp[]): Plugin {
  return {
    name: "preload-critical-fonts",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const files = Object.keys(ctx.bundle ?? {}).filter((f) => f.endsWith(".woff2") && patterns.some((p) => p.test(f)));
        return {
          html,
          tags: files.map((file) => ({
            tag: "link",
            attrs: { rel: "preload", href: `/${file}`, as: "font", type: "font/woff2", crossorigin: "" },
            injectTo: "head" as const,
          })),
        };
      },
    },
  };
}

const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Sets title, description, canonical and OG/Twitter tags in the built index.html. */
function withMeta(html: string, { title, description, path }: { title: string; description: string; path: string | null }) {
  const set = (re: RegExp, value: string) => {
    if (!re.test(html)) throw new Error(`route-html: no match for ${re}`);
    html = html.replace(re, `$1${escapeAttr(value)}$2`);
  };
  set(/(<title>)[^<]*(<\/title>)/, title);
  set(/(<meta name="description" content=")[^"]*(")/, description);
  for (const key of ['property="og:title"', 'name="twitter:title"']) set(new RegExp(`(<meta ${key} content=")[^"]*(")`), title);
  for (const key of ['property="og:description"', 'name="twitter:description"']) set(new RegExp(`(<meta ${key} content=")[^"]*(")`), description);
  if (path) {
    set(/(<link rel="canonical" href=")[^"]*(")/, SITE_URL + path);
    set(/(<meta property="og:url" content=")[^"]*(")/, SITE_URL + path);
  } else {
    html = html.replace(/\s*<link rel="canonical"[^>]*>/, "").replace(/\s*<meta property="og:url"[^>]*>/, "");
    html = html.replace("</title>", '</title>\n    <meta name="robots" content="noindex" />');
  }
  return html;
}

/**
 * Static HTML per route, for crawlers and link previews that don't run
 * JavaScript: work/<id>.html for each project (served at /work/<id> via
 * cleanUrls in vercel.json), 404.html (noindex, real 404 status on Vercel;
 * the app renders its Not Found page) and llms.txt. All from the same content
 * modules the app renders.
 */
function routeHtml(): Plugin {
  return {
    name: "route-html",
    apply: "build",
    enforce: "post",
    generateBundle(_, bundle) {
      const index = bundle["index.html"];
      if (!index || index.type !== "asset") throw new Error("route-html: index.html not in bundle");
      const html = String(index.source);

      for (const p of projects) {
        const meta = projectMeta(p);
        this.emitFile({ type: "asset", fileName: `${meta.path.slice(1)}.html`, source: withMeta(html, meta) });
      }
      this.emitFile({ type: "asset", fileName: "404.html", source: withMeta(html, { title: NOT_FOUND_TITLE, description: DEFAULT_DESCRIPTION, path: null }) });

      const llms = [
        `# ${profile.name}`,
        "",
        `> ${DEFAULT_DESCRIPTION}`,
        "",
        profile.description,
        "",
        "## Contact",
        "",
        `- Email: ${profile.email}`,
        `- [GitHub](${profile.github})`,
        `- [LinkedIn](${profile.linkedin})`,
        "",
        "## Projects",
        "",
        ...projects.map((p) => `- [${p.title}](${SITE_URL}${projectPath(p)}): ${p.summary} Live: ${p.liveUrl}`),
        "",
      ].join("\n");
      this.emitFile({ type: "asset", fileName: "llms.txt", source: llms });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    preloadFonts([/inter-tight-latin-wght/, /jetbrains-mono-latin-wght/, /instrument-serif-latin-400-italic/]),
    routeHtml(),
  ],
  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Draggable stays out: it loads on demand for the desktop code card.
          if ((id.includes("node_modules/gsap") && !id.includes("Draggable") && !id.includes("utils/matrix")) || id.includes("node_modules/lenis")) return "motion";
          if (id.includes("node_modules/react")) return "react";
        },
      },
    },
  },
});
