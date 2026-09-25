import type { AnchorHTMLAttributes, ReactNode } from "react";

interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  /** Opens in a new tab with safe rel attributes. */
  external?: boolean;
}

/** Inline link with an underline that draws in from the left and exits to the right. */
export function TextLink({ children, external, className = "", ...rest }: TextLinkProps) {
  return (
    <a
      className={`relative inline-block after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-out hover:after:origin-left hover:after:scale-x-100 focus-visible:after:scale-x-100 ${className}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
