import { projectImages } from "../../content/images";

interface ProjectImageProps {
  id: string;
  alt: string;
  /** Responsive sizes hint, e.g. "(min-width: 64rem) 50vw, 100vw". */
  sizes?: string;
  className?: string;
  /** Above-the-fold images load eagerly with high priority. */
  priority?: boolean;
  /** Never display wider than the source pixels (no upscaling of small screenshots). */
  capToNative?: boolean;
}

const srcSet = (id: string, widths: number[], ext: string) =>
  widths.map((w) => `/img/projects/${id}-${w}.${ext} ${w}w`).join(", ");

/**
 * AVIF/WebP responsive screenshot with intrinsic dimensions (no layout shift)
 * and a blurred inline placeholder while it loads.
 */
export function ProjectImage({ id, alt, sizes = "100vw", className = "", priority = false, capToNative = false }: ProjectImageProps) {
  const meta = projectImages[id];
  if (!meta) return null;
  const largest = meta.widths.at(-1)!;

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(id, meta.widths, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(id, meta.widths, "webp")} sizes={sizes} />
      <img
        src={`/img/projects/${id}-${largest}.webp`}
        alt={alt}
        width={meta.width}
        height={meta.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={className}
        style={{
          backgroundImage: `url(${meta.placeholder})`,
          backgroundSize: "cover",
          aspectRatio: `${meta.width} / ${meta.height}`,
          ...(capToNative ? { maxWidth: `min(100%, ${meta.width}px)` } : {}),
        }}
      />
    </picture>
  );
}
