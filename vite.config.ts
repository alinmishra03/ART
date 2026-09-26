import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { profile } from "./src/content/profile.ts";
import { projects } from "./src/content/projects.ts";
import { DEFAULT_DESCRIPTION, NOT_FOUND_TITLE, projectMeta, projectPath, siteUrlFrom } from "./src/lib/seo.ts";

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
function withMeta(html: string, site: string, { title, description, path, image }: { title: string; description: string; path: string | null; image?: string }) {
  const set = (re: RegExp, value: string) => {
    if (!re.test(html)) throw new Error(`route-html: no match for ${re}`);
    html = html.replace(re, `$1${escapeAttr(value)}$2`);
  };
  set(/(<title>)[^<]*(<\/title>)/, title);
  set(/(<meta name="description" content=")[^"]*(")/, description);
  for (const key of ['property="og:title"', 'name="twitter:title"']) set(new RegExp(`(<meta ${key} content=")[^"]*(")`), title);
  for (const key of ['property="og:description"', 'name="twitter:description"']) set(new RegExp(`(<meta ${key} content=")[^"]*(")`), description);
  if (image) {
    for (const key of ['property="og:image"', 'name="twitter:image"']) set(new RegExp(`(<meta ${key} content=")[^"]*(")`), site + image);
    for (const key of ['property="og:image:alt"', 'name="twitter:image:alt"']) set(new RegExp(`(<meta ${key} content=")[^"]*(")`), title);
  }
  if (path) {
    set(/(<link rel="canonical" href=")[^"]*(")/, site + path);
    set(/(<meta property="og:url" content=")[^"]*(")/, site + path);
  } else {
    html = html.replace(/\s*<link rel="canonical"[^>]*>/, "").replace(/\s*<meta property="og:url"[^>]*>/, "");
    html = html.replace("</title>", '</title>\n    <meta name="robots" content="noindex" />');
  }
  return html;
}

/** Fills the %SITE_URL% placeholders in index.html (dev and build). */
function siteUrlHtml(site: string): Plugin {
  return {
    name: "site-url-html",
    transformIndexHtml: { order: "pre", handler: (html) => html.replaceAll("%SITE_URL%", site) },
  };
}

/**
 * Static files for crawlers and link previews that don't run JavaScript:
 * work/<id>.html per project (served at /work/<id> via cleanUrls in
 * vercel.json) with its share card from public/og (scripts/og-images.mjs;
 * verify-content checks they exist), 404.html (noindex, real 404 status on
 * Vercel; the app renders its Not Found page), sitemap.xml, robots.txt and
 * llms.txt. All from the same content modules the app renders.
 */
function routeHtml(site: string): Plugin {
  return {
    name: "route-html",
    apply: "build",
    enforce: "post",
    generateBundle(_, bundle) {
      const index = bundle["index.html"];
      if (!index || index.type !== "asset") throw new Error("route-html: index.html not in bundle");
      const html = String(index.source);
      const emit = (fileName: string, source: string) => this.emitFile({ type: "asset", fileName, source });

      for (const p of projects) {
        const meta = projectMeta(p);
        emit(`${meta.path.slice(1)}.html`, withMeta(html, site, meta));
      }
      emit("404.html", withMeta(html, site, { title: NOT_FOUND_TITLE, description: DEFAULT_DESCRIPTION, path: null }));

      const today = new Date().toISOString().slice(0, 10);
      const urls = [{ path: "/", priority: "1.0" }, ...projects.map((p) => ({ path: projectPath(p), priority: "0.8" }))];
      const entries = urls.map((u) => `  <url>\n    <loc>${site}${u.path}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`);
      emit("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`);
      emit("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);

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
        ...projects.map((p) => `- [${p.title}](${site}${projectPath(p)}): ${p.summary} Live: ${p.liveUrl}`),
        "",
      ].join("\n");
      emit("llms.txt", llms);
    },
  };
}

export default defineConfig(({ mode }) => {
  // SITE_URL from the environment (e.g. Vercel env vars) or .env files; see src/lib/seo.ts.
  const site = siteUrlFrom(loadEnv(mode, ".", "SITE_").SITE_URL);
  return {
    define: { __SITE_URL__: JSON.stringify(site) },
    plugins: [
      react(),
      tailwindcss(),
      preloadFonts([/inter-tight-latin-wght/, /jetbrains-mono-latin-wght/, /instrument-serif-latin-400-italic/]),
      siteUrlHtml(site),
      routeHtml(site),
    ],
    build: {
      target: "es2022",
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            // Draggable stays out: it loads on demand for the desktop code card.
            if ((id.includes("node_modules/gsap") && !id.includes("Draggable") && !id.includes("utils/matrix")) || id.includes("node_modules/lenis")) return "motion";
            if (id.includes("node_modules/react")) return "react";
          },
        },
      },
    },
  };
});
