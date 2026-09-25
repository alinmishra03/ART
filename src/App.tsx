import { lazy, Suspense } from "react";
import { Cursor } from "./components/cursor/Cursor";
import { usePathname } from "./lib/router";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { IntroProvider } from "./providers/Intro";
import { PageTransitionProvider } from "./providers/PageTransition";
import { SmoothScroll } from "./providers/SmoothScroll";
import { ThemeProvider } from "./providers/ThemeProvider";

// Design-system reference page, development builds only.
const Styleguide = import.meta.env.DEV ? lazy(() => import("./pages/Styleguide").then((m) => ({ default: m.Styleguide }))) : null;

function Routes() {
  const pathname = usePathname();
  if (pathname === "/") return <Home />;
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
