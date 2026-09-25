import { useSyncExternalStore } from "react";

/*
 * Minimal history router. The site is essentially one page plus a 404, so a
 * full router library isn't warranted; this keeps back/forward and direct URL
 * access working while letting PageTransition wrap navigations.
 */

const NAV_EVENT = "app:navigate";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(NAV_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(NAV_EVENT, onChange);
  };
}

export function usePathname() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => "/",
  );
}

export function pushPath(href: string) {
  const url = new URL(href, window.location.href);
  if (url.pathname === window.location.pathname && url.search === window.location.search) return;
  // Remember where we were so Back can restore it (see useRestoredScroll).
  window.history.replaceState({ ...(window.history.state ?? {}), scrollY: window.scrollY }, "");
  window.history.pushState({}, "", url.pathname + url.search + url.hash);
  window.dispatchEvent(new Event(NAV_EVENT));
}

export const isInternalHref = (href: string) => {
  try {
    return new URL(href, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
};

/** Scroll position saved on the current history entry, if any. */
export const savedScrollY = (): number | null => {
  const y = (window.history.state as { scrollY?: number } | null)?.scrollY;
  return typeof y === "number" ? y : null;
};
