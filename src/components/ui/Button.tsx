import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentType, ReactNode } from "react";
import { Magnetic } from "../motion/Magnetic";
import { ArrowUpRight } from "./icons";

type Variant = "solid" | "outline" | "accent";

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  icon?: ComponentType<{ size?: number }> | null;
  magnetic?: boolean;
  className?: string;
}

type ButtonProps = CommonProps &
  (
    | ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className">)
    | ({ href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">)
  );

const VARIANTS: Record<Variant, string> = {
  solid: "bg-fg text-bg hover:bg-accent hover:text-accent-fg",
  accent: "bg-accent text-accent-fg hover:bg-fg hover:text-bg",
  outline: "border border-line-strong text-fg hover:border-fg",
};

/**
 * Pill CTA with a vertical text roll on hover, an icon nudge and an optional
 * magnetic pull. Renders <a> when given href, otherwise <button>.
 */
export function Button({ children, variant = "solid", icon: Icon = ArrowUpRight, magnetic = true, className = "", ...rest }: ButtonProps) {
  const classes = `group/btn relative inline-flex min-h-13 items-center rounded-full px-7 text-[0.95rem] font-medium tracking-[-0.01em] transition-colors duration-500 ease-out ${VARIANTS[variant]} ${className}`;

  const inner = (
    <span data-magnetic-inner className="flex items-center gap-3">
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-out group-hover/btn:-translate-y-full motion-reduce:transition-none">
          {children}
        </span>
        <span
          aria-hidden
          className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-out group-hover/btn:translate-y-0 motion-reduce:transition-none"
        >
          {children}
        </span>
      </span>
      {Icon && (
        <span className="transition-transform duration-500 ease-out group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 motion-reduce:transition-none">
          <Icon size={18} />
        </span>
      )}
    </span>
  );

  const element =
    rest.href !== undefined ? (
      <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {inner}
      </a>
    ) : (
      <button type="button" className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
        {inner}
      </button>
    );

  return magnetic ? <Magnetic strength={0.25}>{element}</Magnetic> : element;
}
