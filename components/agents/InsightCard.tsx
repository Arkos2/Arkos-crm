"use client";

import { useState } from "react";
import { AnalystInsight, InsightLevel } from "@/lib/types/agent";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Badge, Button } from "@/components/ui";
import {
  AlertTriangle, TrendingUp, Trophy,
  BarChart2, ChevronDown, ChevronUp,
  ThumbsUp, ThumbsDown, Bot,
} from "lucide-react";

const LEVEL_CONFIG: Record<InsightLevel, {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
  border: string;
  badgeVariant: "danger" | "success" | "gold" | "info";
  emoji: string;
}> = {
  urgent: {
    icon: AlertTriangle,
    label: "Urgente",
    color: "text-danger",
    bg: "bg-danger/5",
    border: "border-danger/20",
    badgeVariant: "danger",
    emoji: "🔴",
  },
  opportunity: {
    icon: TrendingUp,
    label: "Oportunidade",
    color: "text-success",
    bg: "bg-success/5",
    border: "border-success/20",
    badgeVariant: "success",
    emoji: "🎯",
  },
  win: {
    icon: Trophy,
    label: "Win",
    color: "text-arkos-gold",
    bg: "bg-arkos-gold/5",
    border: "border-arkos-gold/20",
    badgeVariant: "gold",
    emoji: "🏆",
  },
  trend: {
    icon: BarChart2,
    label: "Tendência",
    color: "text-info",
    bg: "bg-info/5",
    border: "border-info/20",
    badgeVariant: "info",
    emoji: "📈",
  },
};

interface InsightCardProps {
  insight: AnalystInsight;
  onDismiss?: (id: string) => void;
  onAction?: (insightId: string, action: string) => void;
  compact?: boolean;
}

export function InsightCard({
  insight,
  onDismiss,
  onAction,
  compact = false,
}: InsightCardProps) {
  const [expanded, setExpanded] = useState(!compact);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const config = LEVEL_CONFIG[insight.level];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-300",
        "hover:shadow-arkos group",
        config.bg,
        config.border
      )}
    >
      {/* ─── HEADER ─── */}
      <div
        className={cn(
          "flex items-start gap-3 p-4",
          compact && "cursor-pointer"
        )}
        onClick={() => compact && setExpanded(!expanded)}
      >
        {/* Ícone */}
        <div className={cn(
          "p-2 rounded-xl shrink-0",
          "bg-white/5 border",
          config.border
        )}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={config.badgeVariant} size="sm">
              {config.emoji} {config.label}
            </Badge>
            <span className="text-2xs text-text-muted">
              {formatRelativeTime(insight.createdAt)}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <span className="text-2xs text-text-muted">
                {insight.confidence}% conf.
              </span>
            </div>
          </div>

          <h4 className="text-sm font-bold text-text-primary leading-snug">
            {insight.title}
          </h4>

          {(!compact || expanded) && (
            <p className="text-xs text-text-secondary leading-relaxed">
              {insight.description}
            </p>
          )}
        </div>

        {/* Toggle expand (compact) */}
        {compact && (
          <button className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-text-muted">
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* ─── CORPO EXPANDIDO ─── */}
      {(!compact || expanded) && (
        <div className="px-4 pb-4 space-y-3">

          {/* Data points */}
          <div className="space-y-1.5">
            <p className="text-2xs font-semibold text-text-muted uppercase tracking-wide">
              Dados que sustentam
            </p>
            {insight.dataPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className={cn("w-1 h-1 rounded-full mt-1.5 shrink-0", config.color.replace("text-", "bg-"))} />
                <span className="text-xs text-text-secondary">{point}</span>
              </div>
            ))}
          </div>

          {/* Ações */}
          {insight.actions.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {insight.actions.map((action) => (
                <Button
                  key={action.action}
                  variant={insight.level === "urgent" ? "danger" : "secondary"}
                  size="xs"
                  onClick={() => onAction?.(insight.id, action.action)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Rodapé: feedback + dismiss */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-1">
              <span className="text-2xs text-text-muted mr-1">Útil?</span>
              <button
                onClick={() => setFeedback("up")}
                className={cn(
                  "p-1 rounded-lg transition-all",
                  feedback === "up"
                    ? "bg-success/20 text-success"
                    : "hover:bg-white/10 text-text-muted"
                )}
              >
                <ThumbsUp className="h-3 w-3" />
              </button>
              <button
                onClick={() => setFeedback("down")}
                className={cn(
                  "p-1 rounded-lg transition-all",
                  feedback === "down"
                    ? "bg-danger/20 text-danger"
                    : "hover:bg-white/10 text-text-muted"
                )}
              >
                <ThumbsDown className="h-3 w-3" />
              </button>
            </div>

            {onDismiss && (
              <button
                onClick={() => onDismiss(insight.id)}
                className="text-2xs text-text-muted hover:text-text-secondary transition-colors"
              >
                Dispensar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
