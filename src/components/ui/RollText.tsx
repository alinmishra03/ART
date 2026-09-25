import type { ReactNode } from "react";

/**
 * Text that rolls up to a duplicate of itself on hover/focus of the nearest
 * `group/roll` ancestor. The duplicate is aria-hidden.
 */
export function RollText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <span className="block transition-transform duration-500 ease-out group-hover/roll:-translate-y-full group-focus-visible/roll:-translate-y-full motion-reduce:transition-none">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-out group-hover/roll:translate-y-0 group-focus-visible/roll:translate-y-0 motion-reduce:transition-none"
      >
        {children}
      </span>
    </span>
  );
}
