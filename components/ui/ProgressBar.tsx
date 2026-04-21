import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ProgressVariant = "default" | "success" | "warning" | "danger" | "gold" | "blue";

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  max?: number;
  variant?: ProgressVariant;
  size?: "xs" | "sm" | "md";
  showLabel?: boolean;
  label?: string;
  animate?: boolean;
  autoColor?: boolean; // muda cor automaticamente por valor
  segments?: boolean;
}

const variantColors: Record<ProgressVariant, string> = {
  default: "bg-arkos-blue",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  gold: "bg-arkos-gold",
  blue: "bg-arkos-blue",
};

const sizes = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2.5",
};

export function ProgressBar({
  value,
  max = 100,
  variant = "default",
  size = "sm",
  showLabel = false,
  label,
  animate = true,
  autoColor = false,
  segments = false,
  className,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const autoVariant: ProgressVariant = autoColor
    ? percentage >= 75
      ? "success"
      : percentage >= 50
      ? "warning"
      : "danger"
    : variant;

  return (
    <div className={cn("w-full", className)} {...props}>
      {(label || showLabel) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-2xs text-text-secondary">{label}</span>
          )}
          {showLabel && (
            <span className="text-2xs font-medium text-text-primary">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          "w-full rounded-full overflow-hidden",
          "bg-arkos-surface-3",
          sizes[size]
        )}
      >
        {segments ? (
          <div className="flex h-full gap-0.5">
            {[25, 50, 75, 100].map((segment) => (
              <div
                key={segment}
                className={cn(
                  "flex-1 rounded-sm transition-all duration-500",
                  percentage >= segment
                    ? variantColors[autoVariant]
                    : "bg-transparent"
                )}
              />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "h-full rounded-full",
              variantColors[autoVariant],
              animate && "transition-all duration-700 ease-out"
            )}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
}

// BANT Score específico
interface BANTBarProps {
  label: string;
  value: number; // 0-25
  max?: number;
}

export function BANTBar({ label, value, max = 25 }: BANTBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="text-2xs font-medium text-text-secondary w-4 shrink-0">
        {label[0]}
      </span>
      <div className="flex-1">
        <ProgressBar
          value={percentage}
          size="xs"
          autoColor
          animate
        />
      </div>
      <span className="text-2xs font-semibold text-text-primary w-6 text-right shrink-0">
        {value}
      </span>
    </div>
  );
}
