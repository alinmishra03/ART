import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentType, ReactNode } from "react";
import { Magnetic } from "../motion/Magnetic";
import { ArrowUpRight } from "./icons";
import { RollText } from "./RollText";

type Variant = "solid" | "outline" | "accent";
type Size = "md" | "sm";

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
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

const SIZES: Record<Size, string> = {
  md: "min-h-13 px-7 text-[0.95rem] gap-3",
  sm: "min-h-11 px-5 text-sm gap-2",
};

/**
 * Pill CTA with a vertical text roll on hover, an icon nudge and an optional
 * magnetic pull. Renders <a> when given href, otherwise <button>.
 */
export function Button({
  children,
  variant = "solid",
  size = "md",
  icon: Icon = ArrowUpRight,
  magnetic = true,
  className = "",
  ...rest
}: ButtonProps) {
  const classes = `group/roll relative inline-flex items-center rounded-full font-medium tracking-[-0.01em] transition-colors duration-500 ease-out ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  const inner = (
    <span data-magnetic-inner className="flex items-center gap-[inherit]">
      <RollText>{children}</RollText>
      {Icon && (
        <span className="transition-transform duration-500 ease-out group-hover/roll:translate-x-0.5 group-hover/roll:-translate-y-0.5 motion-reduce:transition-none">
          <Icon size={size === "sm" ? 16 : 18} />
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
