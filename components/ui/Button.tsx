"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "gold"
  | "outline";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: [
    "bg-arkos-blue hover:bg-arkos-blue-light",
    "text-white",
    "border border-arkos-blue-light/30",
    "shadow-arkos-sm hover:shadow-arkos-glow-blue",
  ].join(" "),

  secondary: [
    "bg-arkos-surface-2 hover:bg-arkos-surface-3",
    "text-text-primary",
    "border border-arkos-border-2 hover:border-arkos-blue/50",
  ].join(" "),

  ghost: [
    "bg-transparent hover:bg-arkos-surface-2",
    "text-text-secondary hover:text-text-primary",
    "border border-transparent",
  ].join(" "),

  danger: [
    "bg-danger/10 hover:bg-danger/20",
    "text-danger",
    "border border-danger/30 hover:border-danger/60",
  ].join(" "),

  gold: [
    "bg-gradient-gold",
    "text-arkos-bg font-semibold",
    "border border-arkos-gold/30",
    "shadow-arkos-sm hover:shadow-arkos-glow-gold",
  ].join(" "),

  outline: [
    "bg-transparent hover:bg-arkos-surface-2",
    "text-text-primary",
    "border border-arkos-border-2 hover:border-arkos-blue",
  ].join(" "),
};

const sizes: Record<ButtonSize, string> = {
  xs: "h-6 px-2.5 text-xs rounded-md gap-1",
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-9 px-4 text-sm rounded-lg gap-2",
  lg: "h-11 px-6 text-sm rounded-xl gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base
          "inline-flex items-center justify-center",
          "font-medium transition-all duration-200",
          "select-none cursor-pointer",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-arkos-blue focus-visible:ring-offset-2 focus-visible:ring-offset-arkos-bg",
          // Hover scale
          "hover:scale-[1.02] active:scale-[0.98]",
          // Disabled
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
          // Variant
          variants[variant],
          // Size
          sizes[size],
          // Full width
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          icon && iconPosition === "left" && (
            <span className="shrink-0 flex items-center">{icon}</span>
          )
        )}
        {children && <span>{children}</span>}
        {!loading && icon && iconPosition === "right" && (
          <span className="shrink-0 flex items-center">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
