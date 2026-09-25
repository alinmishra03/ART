import type { ReactNode } from "react";

interface SectionLabelProps {
  index?: string;
  children: ReactNode;
  className?: string;
}

/** Mono section marker, e.g. "(02) —— Selected Work". */
export function SectionLabel({ index, children, className = "" }: SectionLabelProps) {
  return (
    <p className={`t-label flex items-center gap-3 text-muted ${className}`}>
      {index && <span className="text-accent">({index})</span>}
      <span aria-hidden className="h-px w-8 bg-line-strong" />
      <span>{children}</span>
    </p>
  );
}

/** Small mono chip for technologies and categories. */
export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`t-label inline-flex items-center rounded-full border border-line px-3 py-1.5 text-muted ${className}`}>
      {children}
    </span>
  );
}
