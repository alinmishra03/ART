import type { Project } from "../../content/types";
import { ProjectImage } from "./ProjectImage";

const KIND: Record<Project["category"], string> = {
  shopify: "Shopify store",
  web: "website",
  fullstack: "web platform",
  other: "Chrome extension",
};

/** Alt text from the project's own data, e.g. "Screenshot of TaskNest (Chrome extension): …". */
export const shotAlt = (p: Project) => `Screenshot of ${p.title} (${KIND[p.category]}): ${p.summary}`;

export const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

interface ProjectShotProps {
  project: Project;
  sizes?: string;
  priority?: boolean;
  /** Decorative duplicate (e.g. inside a link that already names the project). */
  decorative?: boolean;
  className?: string;
}

/**
 * The complete project screenshot, never cropped: the image keeps its natural
 * aspect ratio (width 100%, height auto) inside a browser-style frame, and is
 * never shown wider than its source pixels. Hover scale and entrance motion
 * act on the frame, not the image, so the full screenshot stays visible.
 *
 * Hooks for animation: [data-shot] (frame), [data-shot-mask] (reveal mask,
 * ends fully open), [data-shot-img] (settles from a slight scale to 1).
 */
export function ProjectShot({ project: p, sizes = "(min-width: 120rem) 1840px, 100vw", priority = false, decorative = false, className = "" }: ProjectShotProps) {
  return (
    <figure data-shot className={`relative ${className}`}>
      <div className="shot-frame overflow-hidden rounded-md border border-line bg-bg-raised shadow-[0_40px_80px_-48px_rgb(0_0_0/0.45)] transition-transform duration-700 ease-out">
        {/* Browser-style bar with the project's real hostname */}
        <div aria-hidden className="flex items-center gap-3 border-b border-line px-3 py-2.5 md:px-4">
          <span className="flex gap-1.5">
            <span className="size-2 rounded-full bg-line-strong md:size-2.5" />
            <span className="size-2 rounded-full bg-line-strong md:size-2.5" />
            <span className="size-2 rounded-full bg-line-strong md:size-2.5" />
          </span>
          <span className="t-label min-w-0 flex-1 truncate rounded-full bg-bg px-3 py-1 text-center text-[0.65rem] text-subtle md:text-label">
            {hostOf(p.liveUrl)}
          </span>
          <span className="w-8 md:w-10" />
        </div>
        <div className="bg-[radial-gradient(ellipse_at_top,var(--bg-sunken),var(--bg-raised))] p-[clamp(0.4rem,1vw,1rem)]">
          <div data-shot-mask className="overflow-hidden rounded-sm">
            <div data-shot-img className="origin-top">
              <ProjectImage
                id={p.id}
                alt={decorative ? "" : shotAlt(p)}
                sizes={sizes}
                priority={priority}
                capToNative
                className="mx-auto block h-auto w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
