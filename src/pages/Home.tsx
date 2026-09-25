import { Nav } from "../components/layout/Nav";
import { useIntro } from "../providers/Intro";
import { usePageMeta } from "../lib/meta";
import { useRouteScroll } from "../lib/useRouteScroll";
import { Hero } from "../sections/hero/Hero";
import { About } from "../sections/about/About";
import { Footer } from "../components/layout/Footer";
import { Contact } from "../sections/contact/Contact";
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
        className="t-label fixed left-gutter top-3 inline-flex min-h-11 -translate-y-24 items-center rounded-full bg-fg px-4 text-bg focus:translate-y-0"
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
        <Contact />
      </main>
      <Footer />
    </>
  );
}
