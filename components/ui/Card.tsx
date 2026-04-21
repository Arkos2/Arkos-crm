import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "interactive" | "highlighted" | "glass" | "elevated";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  noBorder?: boolean;
}

const variants: Record<CardVariant, string> = {
  default: "bg-arkos-surface border border-arkos-border",
  interactive: [
    "bg-arkos-surface border border-arkos-border",
    "cursor-pointer",
    "hover:border-arkos-blue/40 hover:bg-arkos-surface-2",
    "hover:-translate-y-0.5 hover:shadow-card-hover",
  ].join(" "),
  highlighted: [
    "bg-arkos-surface border border-arkos-gold/40",
    "shadow-arkos-glow-gold",
  ].join(" "),
  glass: [
    "glass",
    "hover:border-arkos-blue/30",
  ].join(" "),
  elevated: [
    "bg-arkos-surface-2 border border-arkos-border-2",
    "shadow-arkos",
  ].join(" "),
};

const paddings = {
  none: "",
  sm: "p-3",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      noBorder = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl transition-all duration-200",
          variants[variant],
          paddings[padding],
          noBorder && "border-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Sub-componentes
export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between mb-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-sm font-semibold text-text-primary", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-text-secondary", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center pt-4 mt-4 border-t border-arkos-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
