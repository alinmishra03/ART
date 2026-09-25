import { useEffect } from "react";
import { RevealText } from "../components/motion";
import { Button } from "../components/ui/Button";
import { ArrowRight } from "../components/ui/icons";
import { usePageTransition } from "../providers/PageTransition";

export function NotFound() {
  const { onLinkClick } = usePageTransition();

  useEffect(() => {
    const previous = document.title;
    document.title = "Page not found — Aishwarya Raj Tyagi";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.append(robots);
    return () => {
      document.title = previous;
      robots.remove();
    };
  }, []);

  return (
    <main className="container-x flex min-h-svh flex-col justify-center gap-10 py-24">
      <p className="t-label text-muted">Error 404</p>
      <RevealText as="h1" by="chars" trigger="mount" className="t-mega">
        Lost<span className="t-serif text-accent">?</span>
      </RevealText>
      <p className="t-lead max-w-xl text-muted">This page doesn't exist. The work is one click away.</p>
      <div>
        <Button href="/" onClick={onLinkClick} icon={ArrowRight}>
          Back to home
        </Button>
      </div>
    </main>
  );
}
