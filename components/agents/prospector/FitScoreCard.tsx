"use client";

import { FitScore } from "@/lib/types/prospector";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, XCircle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui";

interface FitScoreCardProps {
  fitScore: FitScore;
  compact?: boolean;
}

const RECOMMENDATION_CONFIG = {
  high_priority: {
    label: "Alta Prioridade",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
    badgeVariant: "success" as const,
    emoji: "🔥",
    action: "Contato em até 1h",
  },
  medium_priority: {
    label: "Média Prioridade",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
    badgeVariant: "warning" as const,
    emoji: "⚡",
    action: "Contato em até 24h",
  },
  low_priority: {
    label: "Baixa Prioridade",
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/30",
    badgeVariant: "info" as const,
    emoji: "📋",
    action: "Nurturing automático",
  },
  discard: {
    label: "Fora do ICP",
    color: "text-text-muted",
    bg: "bg-arkos-surface-3",
    border: "border-arkos-border",
    badgeVariant: "default" as const,
    emoji: "🗑️",
    action: "Desconsiderar",
  },
};

const DIMENSION_LABELS = {
  industry: { label: "Setor", short: "S" },
  size: { label: "Tamanho", short: "T" },
  role: { label: "Cargo", short: "C" },
  signals: { label: "Sinais", short: "S" },
};

function getScoreColor(value: number, max = 25) {
  const pct = (value / max) * 100;
  if (pct >= 80) return { bar: "bg-success", text: "text-success" };
  if (pct >= 50) return { bar: "bg-warning", text: "text-warning" };
  return { bar: "bg-danger", text: "text-danger" };
}

export function FitScoreCard({ fitScore, compact = false }: FitScoreCardProps) {
  const rec = RECOMMENDATION_CONFIG[fitScore.recommendation];

  // ─── COMPACT ───
  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-2.5 py-1.5 rounded-xl border",
        rec.bg, rec.border
      )}>
        <span className="text-sm">{rec.emoji}</span>
        <div>
          <p className={cn("text-xs font-bold", rec.color)}>
            {fitScore.total}/100
          </p>
          <p className="text-2xs text-text-muted">{rec.label}</p>
        </div>
      </div>
    );
  }

  // ─── FULL ───
  return (
    <div className={cn(
      "rounded-2xl border p-4 space-y-4",
      rec.bg, rec.border
    )}>
      {/* Score total */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xs text-text-muted font-medium uppercase tracking-wide">
            FIT Score ICP
          </p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={cn("text-4xl font-black", rec.color)}>
              {fitScore.total}
            </span>
            <span className="text-text-muted text-sm">/100</span>
          </div>
        </div>

        <div className="text-right space-y-1">
          <Badge variant={rec.badgeVariant} size="md">
            {rec.emoji} {rec.label}
          </Badge>
          <p className="text-2xs text-text-muted">{rec.action}</p>
        </div>
      </div>

      {/* Barra geral */}
      <div className="h-2 bg-black/20 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            fitScore.total >= 75 ? "bg-success" :
            fitScore.total >= 50 ? "bg-warning" :
            fitScore.total >= 25 ? "bg-info" : "bg-danger"
          )}
          style={{ width: `${fitScore.total}%` }}
        />
      </div>

      {/* Dimensões */}
      <div className="grid grid-cols-4 gap-2">
        {(["industry", "size", "role", "signals"] as const).map((dim) => {
          const value = fitScore[dim];
          const color = getScoreColor(value);
          const pct = (value / 25) * 100;
          const dimConfig = DIMENSION_LABELS[dim];

          return (
            <div key={dim} className="flex flex-col items-center gap-1.5">
              {/* Círculo SVG */}
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
                  <circle
                    cx="20" cy="20" r="16"
                    fill="none"
                    stroke="rgba(0,0,0,0.2)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="20" cy="20" r="16"
                    fill="none"
                    stroke={
                      pct >= 80 ? "#10B981" :
                      pct >= 50 ? "#F59E0B" : "#EF4444"
                    }
                    strokeWidth="3"
                    strokeDasharray={`${(pct / 100) * 100.53} 100.53`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text-primary">
                  {value}
                </span>
              </div>
              <span className="text-2xs text-text-muted text-center leading-tight">
                {dimConfig.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Breakdown */}
      {fitScore.breakdown.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-black/10">
          <p className="text-2xs font-semibold text-text-muted uppercase tracking-wide">
            Análise
          </p>
          {fitScore.breakdown.map((item, i) => {
            const isPositive = item.startsWith("✅");
            const isWarning = item.startsWith("⚠️");
            const isNegative = item.startsWith("❌");

            return (
              <div key={i} className="flex items-start gap-2">
                {isPositive && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />}
                {isWarning && <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />}
                {isNegative && <XCircle className="h-3.5 w-3.5 text-danger shrink-0 mt-0.5" />}
                {!isPositive && !isWarning && !isNegative && (
                  <TrendingUp className="h-3.5 w-3.5 text-info shrink-0 mt-0.5" />
                )}
                <span className="text-xs text-text-secondary leading-relaxed">
                  {item.replace(/^[✅⚠️❌]\s*/, "")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
