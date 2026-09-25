import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

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

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    preloadFonts([/inter-tight-latin-wght/, /jetbrains-mono-latin-wght/, /instrument-serif-latin-400-italic/]),
  ],
  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/gsap") || id.includes("node_modules/lenis")) return "motion";
          if (id.includes("node_modules/react")) return "react";
        },
      },
    },
  },
});
