"use client";

import { CoachTip, CoachTipType, CoachTipPriority } from "@/lib/types/coach";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Badge, Button } from "@/components/ui";
import Link from "next/link";
import {
  TrendingUp, AlertTriangle, Star, Clock,
  MessageSquare, Users, Trophy, ChevronDown,
  ChevronUp, ThumbsUp, ThumbsDown, X,
  Zap, Target, ArrowRight,
} from "lucide-react";
import { useState } from "react";

// ─── CONFIGURAÇÕES ───
const TYPE_CONFIG: Record<CoachTipType, {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
  border: string;
  badgeVariant: "danger" | "warning" | "success" | "gold" | "info" | "default";
  emoji: string;
}> = {
  performance: {
    icon: TrendingUp,
    label: "Performance",
    color: "text-info",
    bg: "bg-info/5",
    border: "border-info/20",
    badgeVariant: "info",
    emoji: "📊",
  },
  deal_risk: {
    icon: AlertTriangle,
    label: "Risco de Negócio",
    color: "text-danger",
    bg: "bg-danger/5",
    border: "border-danger/20",
    badgeVariant: "danger",
    emoji: "⚠️",
  },
  best_practice: {
    icon: Star,
    label: "Boa Prática",
    color: "text-arkos-gold",
    bg: "bg-arkos-gold/5",
    border: "border-arkos-gold/20",
    badgeVariant: "gold",
    emoji: "⭐",
  },
  timing: {
    icon: Clock,
    label: "Momento Ideal",
    color: "text-warning",
    bg: "bg-warning/5",
    border: "border-warning/20",
    badgeVariant: "warning",
    emoji: "⚡",
  },
  objection: {
    icon: MessageSquare,
    label: "Contorno de Objeção",
    color: "text-purple-400",
    bg: "bg-purple-500/5",
    border: "border-purple-500/20",
    badgeVariant: "default",
    emoji: "🛡️",
  },
  comparison: {
    icon: Users,
    label: "Top Performer",
    color: "text-arkos-blue-light",
    bg: "bg-arkos-blue/5",
    border: "border-arkos-blue/20",
    badgeVariant: "info",
    emoji: "🏅",
  },
  celebration: {
    icon: Trophy,
    label: "Conquista",
    color: "text-success",
    bg: "bg-success/5",
    border: "border-success/20",
    badgeVariant: "success",
    emoji: "🎉",
  },
};

const PRIORITY_CONFIG: Record<CoachTipPriority, {
  label: string;
  color: string;
  dot: string;
  animate: boolean;
}> = {
  urgent: { label: "Urgente", color: "text-danger", dot: "bg-danger", animate: true },
  high: { label: "Alta", color: "text-warning", dot: "bg-warning", animate: false },
  medium: { label: "Média", color: "text-info", dot: "bg-info", animate: false },
  low: { label: "Baixa", color: "text-text-muted", dot: "bg-text-muted", animate: false },
};

interface CoachTipCardProps {
  tip: CoachTip;
  onDismiss?: (id: string) => void;
  onFeedback?: (id: string, feedback: "up" | "down") => void;
  compact?: boolean;
}

export function CoachTipCard({
  tip,
  onDismiss,
  onFeedback,
  compact = false,
}: CoachTipCardProps) {
  const [expanded, setExpanded] = useState(!compact);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const typeCfg = TYPE_CONFIG[tip.type];
  const priorityCfg = PRIORITY_CONFIG[tip.priority];
  const Icon = typeCfg.icon;

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-300 hover:shadow-arkos",
        typeCfg.bg,
        typeCfg.border
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
        <div
          className={cn(
            "p-2 rounded-xl shrink-0 border",
            "bg-white/5",
            typeCfg.border
          )}
        >
          <Icon className={cn("h-4 w-4", typeCfg.color)} />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={typeCfg.badgeVariant} size="sm">
              {typeCfg.emoji} {typeCfg.label}
            </Badge>

            {/* Prioridade */}
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  priorityCfg.dot,
                  priorityCfg.animate && "animate-pulse"
                )}
              />
              <span
                className={cn("text-2xs font-medium", priorityCfg.color)}
              >
                {priorityCfg.label}
              </span>
            </div>

            <span className="text-2xs text-text-muted ml-auto">
              {formatRelativeTime(tip.createdAt)}
            </span>
          </div>

          {/* Título */}
          <h4 className="text-sm font-bold text-text-primary leading-snug">
            {tip.title}
          </h4>

          {/* Negócio vinculado */}
          {tip.dealTitle && (
            <div className="flex items-center gap-1.5 text-2xs text-text-muted">
              <Target className="h-3 w-3" />
              <span>{tip.dealTitle}</span>
            </div>
          )}

          {/* Mensagem (sempre visível no modo full) */}
          {(!compact || expanded) && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {tip.message}
            </p>
          )}
        </div>

        {/* Toggle + dismiss */}
        <div className="flex items-center gap-1 shrink-0">
          {onDismiss && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(tip.id);
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-text-muted hover:text-danger transition-all"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {compact && (
            <button className="p-1 rounded-lg text-text-muted">
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ─── CORPO EXPANDIDO ─── */}
      {(!compact || expanded) && (
        <div className="px-4 pb-4 space-y-3">

          {/* Data points */}
          {tip.dataPoints && tip.dataPoints.length > 0 && (
            <div className="space-y-1.5 p-3 rounded-xl bg-black/10 border border-white/5">
              <p className="text-2xs font-semibold text-text-muted uppercase tracking-wide">
                Dados
              </p>
              {tip.dataPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className={cn(
                      "w-1 h-1 rounded-full mt-1.5 shrink-0",
                      typeCfg.color.replace("text-", "bg-")
                    )}
                  />
                  <span className="text-xs text-text-secondary">
                    {point}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Impacto */}
          {tip.impact && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-success/5 border border-success/20">
              <Zap className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
              <p className="text-xs text-success leading-relaxed">
                {tip.impact}
              </p>
            </div>
          )}

          {/* Ações + Feedback */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              {tip.actionLabel && tip.actionHref && (
                <Link href={tip.actionHref}>
                  <Button
                    variant={
                      tip.priority === "urgent" ? "danger" : "secondary"
                    }
                    size="xs"
                    icon={<ArrowRight className="h-3 w-3" />}
                  >
                    {tip.actionLabel}
                  </Button>
                </Link>
              )}
              {tip.actionLabel && !tip.actionHref && (
                <Button
                  variant={
                    tip.priority === "urgent" ? "danger" : "secondary"
                  }
                  size="xs"
                  icon={<ArrowRight className="h-3 w-3" />}
                >
                  {tip.actionLabel}
                </Button>
              )}
            </div>

            {/* Feedback */}
            {onFeedback && (
              <div className="flex items-center gap-1">
                <span className="text-2xs text-text-muted">Útil?</span>
                <button
                  onClick={() => {
                    setFeedback("up");
                    onFeedback(tip.id, "up");
                  }}
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
                  onClick={() => {
                    setFeedback("down");
                    onFeedback(tip.id, "down");
                  }}
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
