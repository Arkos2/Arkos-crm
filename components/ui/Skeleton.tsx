import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "card" | "avatar" | "button" | "line";
  lines?: number;
  width?: string;
  height?: string;
}

function SkeletonBase({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton rounded-lg", className)}
      {...props}
    />
  );
}

export function Skeleton({
  variant = "line",
  lines = 1,
  width,
  height,
  className,
  ...props
}: SkeletonProps) {
  if (variant === "text") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBase
            key={i}
            className="h-3"
            style={{
              width: i === lines - 1 && lines > 1 ? "70%" : "100%",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "avatar") {
    return (
      <SkeletonBase
        className="rounded-full"
        style={{ width: width || "36px", height: height || "36px" }}
        {...props}
      />
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "bg-arkos-surface border border-arkos-border rounded-xl p-4 space-y-3",
          className
        )}
        {...props}
      >
        <SkeletonBase className="h-3 w-1/3" />
        <SkeletonBase className="h-8 w-2/3" />
        <SkeletonBase className="h-3 w-1/4" />
      </div>
    );
  }

  if (variant === "button") {
    return (
      <SkeletonBase
        className="h-9 rounded-lg"
        style={{ width: width || "120px" }}
        {...props}
      />
    );
  }

  return (
    <SkeletonBase
      style={{ width, height }}
      className={className}
      {...props}
    />
  );
}

// KPI Card Skeleton
export function KPICardSkeleton() {
  return (
    <div className="bg-arkos-surface border border-arkos-border rounded-xl p-4 sm:p-5 space-y-3">
      <Skeleton variant="line" width="60%" height="12px" />
      <Skeleton variant="line" width="45%" height="32px" />
      <Skeleton variant="line" width="30%" height="10px" />
    </div>
  );
}

// Deal Card Skeleton
export function DealCardSkeleton() {
  return (
    <div className="bg-arkos-surface border border-arkos-border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton variant="line" width="60%" height="14px" />
        <Skeleton variant="line" width="20%" height="14px" />
      </div>
      <Skeleton variant="line" width="40%" height="20px" />
      <div className="flex items-center gap-2">
        <Skeleton variant="avatar" width="24px" height="24px" />
        <Skeleton variant="line" width="30%" height="10px" />
      </div>
      <Skeleton variant="line" width="80%" height="8px" />
    </div>
  );
}
