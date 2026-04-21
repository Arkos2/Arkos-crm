import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gold"
  | "blue"
  | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  dotAnimate?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-arkos-surface-3 text-text-secondary border border-arkos-border-2",
  success: "bg-success/10 text-success border border-success/20",
  warning: "bg-warning/10 text-warning border border-warning/20",
  danger: "bg-danger/10 text-danger border border-danger/20",
  info: "bg-info/10 text-info border border-info/20",
  gold: "bg-arkos-gold/10 text-arkos-gold border border-arkos-gold/20",
  blue: "bg-arkos-blue/10 text-arkos-blue-light border border-arkos-blue/20",
  outline: "bg-transparent text-text-secondary border border-arkos-border-2",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-text-secondary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  gold: "bg-arkos-gold",
  blue: "bg-arkos-blue-light",
  outline: "bg-text-secondary",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "default",
      size = "sm",
      dot = false,
      dotAnimate = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 font-medium rounded-full",
          size === "sm" ? "px-2 py-0.5 text-2xs" : "px-2.5 py-1 text-xs",
          variants[variant],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              dotColors[variant],
              dotAnimate && "animate-pulse"
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
