import { HTMLAttributes } from "react";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "./Card";

type ValueFormat = "currency" | "number" | "percent" | "text" | "days";

interface KPICardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: number | string;
  valueFormat?: ValueFormat;
  trend?: number; // positivo ou negativo
  trendLabel?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  description?: string;
  loading?: boolean;
  invertTrend?: boolean; // quando queda é positiva (ex: CAC)
  suffix?: string;
  prefix?: string;
}

function formatValue(
  value: number | string,
  format: ValueFormat
): string {
  if (typeof value === "string") return value;

  switch (format) {
    case "currency":
      return formatCurrency(value);
    case "number":
      return formatNumber(value);
    case "percent":
      return formatPercent(value);
    case "days":
      return `${value} dias`;
    default:
      return String(value);
  }
}

function KPISkeleton() {
  return (
    <Card>
      <div className="space-y-3">
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="skeleton h-8 w-32 rounded-lg" />
        <div className="skeleton h-3 w-16 rounded-full" />
      </div>
    </Card>
  );
}

export function KPICard({
  title,
  value,
  valueFormat = "number",
  trend,
  trendLabel,
  icon,
  iconColor = "text-arkos-blue-light",
  description,
  loading = false,
  invertTrend = false,
  suffix,
  prefix,
  className,
  ...props
}: KPICardProps) {
  if (loading) return <KPISkeleton />;

  const trendPositive = invertTrend
    ? (trend ?? 0) < 0
    : (trend ?? 0) > 0;
  const trendNeutral = trend === 0 || trend === undefined;

  return (
    <Card
      className={cn("group relative overflow-hidden", className)}
      {...props}
    >
      {/* Glow sutil no hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-arkos-blue/5 to-transparent rounded-xl" />

      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-text-secondary tracking-wide uppercase">
          {title}
        </p>
        {icon && (
          <div
            className={cn(
              "p-1.5 rounded-lg bg-arkos-surface-3",
              iconColor
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end gap-2 mb-2">
        <span className="text-3xl font-bold text-text-primary tracking-tight">
          {prefix && (
            <span className="text-lg text-text-secondary mr-0.5">{prefix}</span>
          )}
          {formatValue(value, valueFormat)}
          {suffix && (
            <span className="text-lg text-text-secondary ml-0.5">{suffix}</span>
          )}
        </span>
      </div>

      {trend !== undefined && (
        <div
          className={cn(
            "flex items-center gap-1 text-2xs font-medium",
            trendNeutral
              ? "text-text-secondary"
              : trendPositive
              ? "text-success"
              : "text-danger"
          )}
        >
          {trendNeutral ? (
            <Minus className="h-3 w-3" />
          ) : trendPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>
            {trend > 0 ? "+" : ""}
            {formatPercent(trend)}
          </span>
          {trendLabel && (
            <span className="text-text-muted">{trendLabel}</span>
          )}
        </div>
      )}

      {description && (
        <p className="text-2xs text-text-muted mt-1">{description}</p>
      )}
    </Card>
  );
}
