import { lazy, Suspense } from "react";
import { Cursor } from "./components/cursor/Cursor";
import { usePathname } from "./lib/router";
import { Home } from "./pages/Home";
import { matchProjectRoute, projectById } from "./lib/projectLookup";
import { NotFound } from "./pages/NotFound";
import { ProjectPage } from "./pages/ProjectPage";
import { IntroProvider } from "./providers/Intro";
import { PageTransitionProvider } from "./providers/PageTransition";
import { SmoothScroll } from "./providers/SmoothScroll";
import { ThemeProvider } from "./providers/ThemeProvider";

// Design-system reference page, development builds only.
const Styleguide = import.meta.env.DEV ? lazy(() => import("./pages/Styleguide").then((m) => ({ default: m.Styleguide }))) : null;

function Routes() {
  const pathname = usePathname();
  if (pathname === "/") return <Home />;
  const projectId = matchProjectRoute(pathname);
  const project = projectId ? projectById(projectId) : undefined;
  // key: remount per project so entrance animations and scroll reset run again.
  if (project) return <ProjectPage key={project.id} project={project} />;
  if (Styleguide && pathname === "/styleguide")
    return (
      <Suspense fallback={null}>
        <Styleguide />
      </Suspense>
    );
  return <NotFound />;
}

export function App() {
  return (
    <ThemeProvider>
      <SmoothScroll>
        <PageTransitionProvider>
          <IntroProvider>
            <Routes />
          </IntroProvider>
          <Cursor />
          <div className="grain" aria-hidden />
        </PageTransitionProvider>
      </SmoothScroll>
    </ThemeProvider>
  );
}
