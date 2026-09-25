import { Cursor } from "./components/cursor/Cursor";
import { usePathname } from "./lib/router";
import { NotFound } from "./pages/NotFound";
import { Styleguide } from "./pages/Styleguide";
import { PageTransitionProvider } from "./providers/PageTransition";
import { SmoothScroll } from "./providers/SmoothScroll";
import { ThemeProvider } from "./providers/ThemeProvider";

function Routes() {
  const pathname = usePathname();
  // Phase 2: the design-system page stands in for the home page until the
  // real sections land in Phase 3.
  if (pathname === "/") return <Styleguide />;
  return <NotFound />;
}

export function App() {
  return (
    <ThemeProvider>
      <SmoothScroll>
        <PageTransitionProvider>
          <Routes />
          <Cursor />
          <div className="grain" aria-hidden />
        </PageTransitionProvider>
      </SmoothScroll>
    </ThemeProvider>
  );
}
