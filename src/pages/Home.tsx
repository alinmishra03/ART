import { Nav } from "../components/layout/Nav";
import { useIntro } from "../providers/Intro";
import { usePageMeta } from "../lib/meta";
import { useRouteScroll } from "../lib/useRouteScroll";
import { Hero } from "../sections/hero/Hero";
import { About } from "../sections/about/About";
import { InterimContact } from "../sections/Interim";
import { Skills } from "../sections/skills/Skills";
import { Work } from "../sections/work/Work";

export function Home() {
  const { ready } = useIntro();
  usePageMeta({});
  // Deep links (/#projects), Back/Forward restoration, else top.
  useRouteScroll(ready);

  return (
    <>
      <a
        href="#main"
        className="t-label fixed left-gutter top-3 -translate-y-24 rounded-full bg-fg px-4 py-3 text-bg focus:translate-y-0"
        style={{ zIndex: "var(--z-cursor)" }}
      >
        Skip to content
      </a>
      <Nav />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <About />
        <Work />
        <Skills />
        <InterimContact />
      </main>
    </>
  );
}
