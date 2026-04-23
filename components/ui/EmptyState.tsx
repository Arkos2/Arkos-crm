"use client";

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "gold";
  };
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  size = "md",
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        size === "sm" && "py-8 gap-2",
        size === "md" && "py-12 gap-3",
        size === "lg" && "py-20 gap-4",
        className
      )}
      {...props}
    >
      {icon && (
        <div
          className={cn(
            "rounded-2xl bg-arkos-surface-2 border border-arkos-border text-text-muted",
            "flex items-center justify-center",
            size === "sm" && "p-3 w-12 h-12",
            size === "md" && "p-4 w-16 h-16",
            size === "lg" && "p-5 w-20 h-20"
          )}
        >
          {icon}
        </div>
      )}

      <div className="space-y-1">
        <h3
          className={cn(
            "font-semibold text-text-primary",
            size === "sm" && "text-sm",
            size === "md" && "text-base",
            size === "lg" && "text-lg"
          )}
        >
          {title}
        </h3>

        {description && (
          <p
            className={cn(
              "text-text-secondary max-w-[280px]",
              size === "sm" && "text-xs",
              size === "md" && "text-sm",
              size === "lg" && "text-sm"
            )}
          >
            {description}
          </p>
        )}
      </div>

      {action && (
        <Button
          variant={action.variant || "primary"}
          size={size === "lg" ? "md" : "sm"}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
