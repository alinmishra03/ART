import { useEffect } from "react";
import { Nav } from "../components/layout/Nav";
import { useIntro } from "../providers/Intro";
import { useScrollTo } from "../providers/SmoothScroll";
import { Hero } from "../sections/hero/Hero";
import { About } from "../sections/about/About";
import { InterimContact, InterimWork } from "../sections/Interim";
import { Skills } from "../sections/skills/Skills";

export function Home() {
  const { ready } = useIntro();
  const scrollTo = useScrollTo();

  // Honour deep links such as /#projects once the intro has lifted.
  useEffect(() => {
    if (!ready || !window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    if (target) scrollTo(target as HTMLElement, { immediate: true });
  }, [ready, scrollTo]);

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
        <InterimWork />
        <Skills />
        <InterimContact />
      </main>
    </>
  );
}
