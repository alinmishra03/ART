import { lazy, Suspense, useEffect, useState } from "react";
import { Cursor } from "./components/cursor/Cursor";
import { CallDock } from "./components/layout/CallDock";
import { usePathname } from "./lib/router";
import { Home } from "./pages/Home";
import { matchProjectRoute, projectById } from "./lib/projectLookup";
import { NotFound } from "./pages/NotFound";
import { ProjectPage } from "./pages/ProjectPage";
import { IntroProvider } from "./providers/Intro";
import { PageTransitionProvider } from "./providers/PageTransition";
import { SmoothScroll } from "./providers/SmoothScroll";
import { ThemeProvider, useTheme } from "./providers/ThemeProvider";

// Design-system reference page, development builds only.
// Toasts only follow a form submission, so sonner loads once the page is idle.
const Toaster = lazy(() => import("sonner").then((m) => ({ default: m.Toaster })));

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

function ThemedToaster() {
  const { theme } = useTheme();
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const show = () => setIdle(true);
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(show, { timeout: 4000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(show, 2500);
    return () => clearTimeout(id);
  }, []);
  if (!idle) return null;
  return (
    <Suspense fallback={null}>
      <Toaster position="top-right" richColors closeButton theme={theme} toastOptions={{ style: { fontFamily: "var(--font-sans)" } }} />
    </Suspense>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <SmoothScroll>
        <PageTransitionProvider>
          <IntroProvider>
            <Routes />
            <CallDock />
          </IntroProvider>
          <ThemedToaster />
          <Cursor />
          <div className="grain" aria-hidden />
        </PageTransitionProvider>
      </SmoothScroll>
    </ThemeProvider>
  );
}
