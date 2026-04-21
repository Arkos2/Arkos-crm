"use client";

import { SellerPerformance, SellerLevel } from "@/lib/types/coach";
import { cn, formatCurrency } from "@/lib/utils";
import { Avatar, Badge, ProgressBar } from "@/components/ui";
import {
  TrendingUp, TrendingDown, Star, Trophy,
  Target, Clock, Zap,
} from "lucide-react";

const LEVEL_CONFIG: Record<SellerLevel, {
  label: string;
  color: string;
  bg: string;
  border: string;
  emoji: string;
}> = {
  junior: {
    label: "Júnior",
    color: "text-text-secondary",
    bg: "bg-arkos-surface-3",
    border: "border-arkos-border",
    emoji: "🌱",
  },
  pleno: {
    label: "Pleno",
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/20",
    emoji: "⚡",
  },
  senior: {
    label: "Sênior",
    color: "text-arkos-gold",
    bg: "bg-arkos-gold/10",
    border: "border-arkos-gold/20",
    emoji: "🏅",
  },
  top_performer: {
    label: "Top Performer",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    emoji: "🏆",
  },
};

function getScoreColor(score: number) {
  if (score >= 80) return { text: "text-success", bg: "bg-success" };
  if (score >= 60) return { text: "text-warning", bg: "bg-warning" };
  return { text: "text-danger", bg: "bg-danger" };
}

interface SellerScoreCardProps {
  seller: SellerPerformance;
  isSelected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export function SellerScoreCard({
  seller,
  isSelected = false,
  onClick,
  compact = false,
}: SellerScoreCardProps) {
  const levelCfg = LEVEL_CONFIG[seller.level];
  const scoreColor = getScoreColor(seller.coachScore);
  const revenueProgress = Math.round(
    (seller.revenue / seller.revenueTarget) * 100
  );

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-xl border",
          "transition-all duration-200 text-left",
          isSelected
            ? "bg-arkos-blue/10 border-arkos-blue/40"
            : "bg-arkos-surface border-arkos-border hover:border-arkos-border-2 hover:bg-arkos-surface-2"
        )}
      >
        <Avatar name={seller.name} size="sm" />

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-text-primary truncate">
            {seller.name}
          </p>
          <p className="text-2xs text-text-muted">{seller.role}</p>
        </div>

        {/* Coach Score */}
        <div className="text-right shrink-0">
          <p className={cn("text-lg font-black", scoreColor.text)}>
            {seller.coachScore}
          </p>
          <p className="text-2xs text-text-muted">score</p>
        </div>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 space-y-4 cursor-pointer",
        "transition-all duration-300 hover:shadow-arkos hover:-translate-y-0.5",
        isSelected
          ? "border-arkos-blue/40 bg-arkos-blue/5"
          : "border-arkos-border bg-arkos-surface hover:border-arkos-border-2"
      )}
      onClick={onClick}
    >
      {/* ─── HEADER ─── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={seller.name} size="lg" />
          <div>
            <p className="text-base font-bold text-text-primary">
              {seller.name}
            </p>
            <p className="text-xs text-text-muted">{seller.role}</p>
            <div className="mt-1">
              <Badge
                variant={
                  seller.level === "top_performer"
                    ? "success"
                    : seller.level === "senior"
                    ? "gold"
                    : seller.level === "pleno"
                    ? "info"
                    : "default"
                }
                size="sm"
              >
                {levelCfg.emoji} {levelCfg.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Coach Score — círculo grande */}
        <div className="relative w-16 h-16 shrink-0">
          <svg
            className="w-16 h-16 -rotate-90"
            viewBox="0 0 60 60"
          >
            <circle
              cx="30" cy="30" r="24"
              fill="none"
              stroke="#1e2433"
              strokeWidth="4"
            />
            <circle
              cx="30" cy="30" r="24"
              fill="none"
              stroke={
                seller.coachScore >= 80
                  ? "#10B981"
                  : seller.coachScore >= 60
                  ? "#F59E0B"
                  : "#EF4444"
              }
              strokeWidth="4"
              strokeDasharray={`${(seller.coachScore / 100) * 150.8} 150.8`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-lg font-black", scoreColor.text)}>
              {seller.coachScore}
            </span>
            <span className="text-2xs text-text-muted leading-none">
              score
            </span>
          </div>
        </div>
      </div>

      {/* ─── META DE RECEITA ─── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Receita</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text-primary">
              {formatCurrency(seller.revenue)}
            </span>
            <span className="text-2xs text-text-muted">
              / {formatCurrency(seller.revenueTarget)}
            </span>
            <span
              className={cn(
                "text-2xs font-bold",
                revenueProgress >= 80
                  ? "text-success"
                  : revenueProgress >= 60
                  ? "text-warning"
                  : "text-danger"
              )}
            >
              {revenueProgress}%
            </span>
          </div>
        </div>
        <ProgressBar
          value={revenueProgress}
          autoColor
          size="md"
          animate
        />
      </div>

      {/* ─── KPIs RÁPIDOS ─── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            icon: Target,
            label: "Win Rate",
            value: `${seller.winRate}%`,
            color:
              seller.winRate >= 60
                ? "text-success"
                : seller.winRate >= 45
                ? "text-warning"
                : "text-danger",
          },
          {
            icon: Clock,
            label: "Ciclo",
            value: `${seller.avgCycleLength}d`,
            color:
              seller.avgCycleLength <= 18
                ? "text-success"
                : seller.avgCycleLength <= 27
                ? "text-warning"
                : "text-danger",
          },
          {
            icon: Zap,
            label: "Ticket",
            value: `R$${(seller.avgTicket / 1000).toFixed(0)}k`,
            color: seller.avgTicket >= 45000 ? "text-success" : "text-text-secondary",
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-arkos-surface-2 border border-arkos-border"
          >
            <Icon className={cn("h-3.5 w-3.5", color)} />
            <span className={cn("text-sm font-bold", color)}>{value}</span>
            <span className="text-2xs text-text-muted">{label}</span>
          </div>
        ))}
      </div>

      {/* ─── TREND DO COACH SCORE ─── */}
      <div className="flex items-center gap-2 pt-1 border-t border-arkos-border">
        <div
          className={cn(
            "flex items-center gap-1",
            seller.coachScoreTrend > 0 ? "text-success" : "text-danger"
          )}
        >
          {seller.coachScoreTrend > 0 ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          <span className="text-xs font-bold">
            {seller.coachScoreTrend > 0 ? "+" : ""}
            {seller.coachScoreTrend} pts
          </span>
        </div>
        <span className="text-2xs text-text-muted">
          vs mês anterior
        </span>

        {/* Tips pendentes */}
        {seller.tips.filter(
          (t) => !t.dismissed && t.priority !== "low"
        ).length > 0 && (
          <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-warning/10 border border-warning/20">
            <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
            <span className="text-2xs text-warning font-medium">
              {
                seller.tips.filter(
                  (t) => !t.dismissed && t.priority !== "low"
                ).length
              }{" "}
              tips
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
