"use client";

import { AgentType, AgentMetrics, AgentStatus } from "@/lib/types/agent";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import Link from "next/link";
import {
  Search, MessageSquare, FileText, RefreshCw,
  BarChart3, Target, Pause, Play, ArrowRight,
} from "lucide-react";

const AGENT_CONFIG: Record<AgentType, {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  href: string;
}> = {
  prospector: {
    name: "Prospector",
    description: "Encontra e enriquece leads automaticamente",
    icon: Search,
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/20",
    href: "/agents/prospector",
  },
  qualifier: {
    name: "Qualificador",
    description: "Qualifica leads via chat com BANT automático",
    icon: MessageSquare,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    href: "/agents/qualifier",
  },
  writer: {
    name: "Redator",
    description: "Gera e-mails, propostas e scripts de vendas",
    icon: FileText,
    color: "text-arkos-gold",
    bg: "bg-arkos-gold/10",
    border: "border-arkos-gold/20",
    href: "/agents/writer",
  },
  followup: {
    name: "Follow-Up",
    description: "Gerencia sequências de acompanhamento automáticas",
    icon: RefreshCw,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    href: "/agents/followup",
  },
  analyst: {
    name: "Analista",
    description: "Analisa dados e gera insights acionáveis",
    icon: BarChart3,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    href: "/agents/analyst",
  },
  coach: {
    name: "Coach",
    description: "Treina e orienta vendedores em tempo real",
    icon: Target,
    color: "text-arkos-blue-light",
    bg: "bg-arkos-blue/10",
    border: "border-arkos-blue/20",
    href: "/agents/coach",
  },
};

const STATUS_CONFIG: Record<AgentStatus, {
  label: string;
  variant: "success" | "warning" | "danger" | "info";
  animate: boolean;
}> = {
  active: { label: "Ativo", variant: "success", animate: true },
  paused: { label: "Pausado", variant: "warning", animate: false },
  error: { label: "Erro", variant: "danger", animate: false },
  processing: { label: "Processando", variant: "info", animate: true },
};

interface AgentCardProps {
  metrics: AgentMetrics;
  onToggle?: (type: AgentType) => void;
}

export function AgentCard({ metrics, onToggle }: AgentCardProps) {
  const config = AGENT_CONFIG[metrics.type];
  const Icon = config.icon;
  const statusCfg = STATUS_CONFIG[metrics.status];

  return (
    <div
      className={cn(
        "relative group rounded-2xl border p-5",
        "bg-arkos-surface transition-all duration-300",
        "hover:border-opacity-60 hover:-translate-y-1 hover:shadow-arkos-lg",
        config.border
      )}
    >
      {/* Glow no hover */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100",
        "transition-opacity duration-300 pointer-events-none",
        config.bg
      )} />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className={cn("p-2.5 rounded-xl", config.bg)}>
            <Icon className={cn("h-5 w-5", config.color)} />
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={statusCfg.variant}
              size="sm"
              dot
              dotAnimate={statusCfg.animate}
            >
              {statusCfg.label}
            </Badge>
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggle?.(metrics.type);
              }}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                metrics.status === "active"
                  ? "hover:bg-warning/10 text-text-muted hover:text-warning"
                  : "hover:bg-success/10 text-text-muted hover:text-success"
              )}
            >
              {metrics.status === "active"
                ? <Pause className="h-3.5 w-3.5" />
                : <Play className="h-3.5 w-3.5" />
              }
            </button>
          </div>
        </div>

        {/* Nome e descrição */}
        <div>
          <h3 className="text-base font-bold text-text-primary">{config.name}</h3>
          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{config.description}</p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3">
          <div className={cn("p-3 rounded-xl", config.bg)}>
            <p className="text-2xs text-text-muted">{metrics.primaryMetric.label}</p>
            <p className={cn("text-lg font-bold mt-0.5", config.color)}>
              {metrics.primaryMetric.value}
            </p>
          </div>
          {metrics.secondaryMetric && (
            <div className="p-3 rounded-xl bg-arkos-surface-2">
              <p className="text-2xs text-text-muted">{metrics.secondaryMetric.label}</p>
              <p className="text-lg font-bold mt-0.5 text-text-primary">
                {metrics.secondaryMetric.value}
              </p>
            </div>
          )}
        </div>

        {/* Última ação */}
        {metrics.lastAction && (
          <p className="text-2xs text-text-muted leading-relaxed">
            Última ação: {metrics.lastAction}
          </p>
        )}

        {/* Rodapé */}
        <div className="flex items-center justify-between pt-2 border-t border-arkos-border">
          <div className="flex items-center gap-3 text-2xs text-text-muted">
            <span>Hoje: <strong className="text-text-secondary">{metrics.todayActions}</strong></span>
            <span>Semana: <strong className="text-text-secondary">{metrics.weekActions}</strong></span>
            <span>Taxa: <strong className={cn(
              metrics.successRate >= 80 ? "text-success"
              : metrics.successRate >= 60 ? "text-warning"
              : "text-danger"
            )}>{metrics.successRate}%</strong></span>
          </div>

          <Link href={config.href}>
            <span className={cn(
              "flex items-center gap-1 text-2xs font-medium transition-all cursor-pointer",
              config.color,
              "hover:gap-2"
            )}>
              Abrir
              <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
