import { useEffect } from "react";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from "./seo";

function setMeta(selector: string, attr: "content" | "href", value: string) {
  document.head.querySelector(selector)?.setAttribute(attr, value);
}

/**
 * Keeps title, description, canonical and Open Graph/Twitter tags in sync
 * with the current route (the static tags in index.html are the defaults).
 */
export function usePageMeta({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION, path = "/" }: { title?: string; description?: string; path?: string }) {
  useEffect(() => {
    const url = SITE_URL + path;
    document.title = title;
    setMeta('meta[name="description"]', "content", description);
    setMeta('link[rel="canonical"]', "href", url);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
  }, [title, description, path]);
}
