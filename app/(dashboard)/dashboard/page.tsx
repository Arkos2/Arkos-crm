"use client";

import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import { KPICard, Card, CardHeader, CardTitle, Badge, Button, Avatar, ProgressBar } from "@/components/ui";
import { InsightCard } from "@/components/agents/InsightCard";
import { MOCK_INSIGHTS } from "@/lib/mock/analytics";
import { cn, formatCurrency } from "@/lib/utils";
import {
  DollarSign, TrendingUp, Users, Clock,
  ShoppingCart, Heart, Zap, Bot,
  Search, MessageSquare, FileText,
  RefreshCw, BarChart3, Target,
  AlertCircle, CheckCircle2, Info,
  ArrowRight, Plus,
} from "lucide-react";

// Metadata cannot be exported in a client component

const KPI_DATA = [
  { title: "Pipeline Total", value: 847500, valueFormat: "currency" as const, trend: 12, trendLabel: "vs mês anterior", icon: <DollarSign className="h-4 w-4" /> },
  { title: "Negócios Ativos", value: 23, valueFormat: "number" as const, trend: 3, trendLabel: "novos esta semana", icon: <ShoppingCart className="h-4 w-4" /> },
  { title: "Conversão Geral", value: 67, valueFormat: "percent" as const, trend: 5, icon: <TrendingUp className="h-4 w-4" /> },
  { title: "Ciclo Médio", value: 12, valueFormat: "days" as const, trend: -14, invertTrend: true, icon: <Clock className="h-4 w-4" /> },
  { title: "CAC", value: 2340, valueFormat: "currency" as const, trend: -8, invertTrend: true, icon: <Users className="h-4 w-4" /> },
  { title: "LTV", value: 18700, valueFormat: "currency" as const, trend: 15, icon: <Heart className="h-4 w-4" /> },
  { title: "LTV/CAC", value: "8.0x", valueFormat: "text" as const, trend: 20, icon: <Zap className="h-4 w-4" /> },
  { title: "NPS", value: 94, valueFormat: "number" as const, trend: 3, suffix: "pts", icon: <Heart className="h-4 w-4" /> },
];

const PRIORITY_ACTIONS = [
  { type: "danger", icon: <AlertCircle className="h-4 w-4" />, text: "3 leads em Diagnóstico sem contato há 48h", cta: "Resolver Agora", href: "/pipeline" },
  { type: "warning", icon: <Info className="h-4 w-4" />, text: "Proposta da LogiMax visualizada há 10min", cta: "Ligar Agora", href: "/pipeline" },
  { type: "success", icon: <CheckCircle2 className="h-4 w-4" />, text: "2 contratos prontos para assinatura", cta: "Enviar", href: "/documents" },
  { type: "info", icon: <Zap className="h-4 w-4" />, text: "EduPlus qualificado pelo agente IA — BANT 85/100", cta: "Ver Lead", href: "/pipeline" },
];

const TEAM_DATA = [
  { name: "Maria Santos", value: 125000, target: 150000, role: "Sênior" },
  { name: "João Silva", value: 112000, target: 150000, role: "Pleno" },
  { name: "Pedro Lima", value: 78000, target: 120000, role: "Pleno" },
  { name: "Ana Costa", value: 67000, target: 120000, role: "Júnior" },
];

const AGENTS = [
  { name: "Prospector", icon: <Search className="h-3.5 w-3.5" />, metric: "12 leads", active: true, href: "/agents/prospector" },
  { name: "Qualificador", icon: <MessageSquare className="h-3.5 w-3.5" />, metric: "8 conversas", active: true, href: "/agents/qualifier" },
  { name: "Redator", icon: <FileText className="h-3.5 w-3.5" />, metric: "5 criados", active: true, href: "/agents/writer" },
  { name: "Follow-Up", icon: <RefreshCw className="h-3.5 w-3.5" />, metric: "23 sequências", active: true, href: "/agents/followup" },
  { name: "Analista", icon: <BarChart3 className="h-3.5 w-3.5" />, metric: "3 insights", active: true, href: "/agents/analyst" },
  { name: "Coach", icon: <Target className="h-3.5 w-3.5" />, metric: "4 tips", active: false, href: "/agents/coach" },
];

// Top 2 insights urgentes para o dashboard
const TOP_INSIGHTS = MOCK_INSIGHTS.filter((i) => i.level === "urgent").slice(0, 2);

export default function DashboardPage() {
  const { user } = useAuth();

  // Modifica os dados da equipe para que o usuário logado apareça no topo
  const dynamicTeamData = [...TEAM_DATA];
  dynamicTeamData[0] = { ...dynamicTeamData[0], name: user?.name || "Administrador", role: user?.role || "Cargo" };

  return (
    <div className="space-y-6">

      {/* ─── SAUDAÇÃO ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            Bom dia, {user?.name ? user.name.split(" ")[0] : "Administrador"} 👋
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Janeiro 2025 · Semana 3
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="gold" dot dotAnimate size="md">Ao vivo</Badge>
          <Button variant="gold" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
            Novo Negócio
          </Button>
        </div>
      </div>

      {/* ─── AÇÕES PRIORITÁRIAS ─── */}
      <Card className="border-arkos-blue/20 bg-gradient-to-r from-arkos-blue/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-arkos-gold" />
            <CardTitle>Ações Prioritárias</CardTitle>
            <Badge variant="gold" size="sm">IA</Badge>
          </div>
          <Link href="/agents/analyst">
            <button className="text-2xs text-arkos-blue-light hover:text-arkos-gold transition-colors flex items-center gap-1">
              Ver todos os insights <ArrowRight className="h-3 w-3" />
            </button>
          </Link>
        </CardHeader>

        <div className="space-y-2">
          {PRIORITY_ACTIONS.map((action, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center justify-between gap-4 px-4 py-3 rounded-xl border transition-all hover:scale-[1.005]",
                action.type === "danger" && "bg-danger/5 border-danger/20",
                action.type === "warning" && "bg-warning/5 border-warning/20",
                action.type === "success" && "bg-success/5 border-success/20",
                action.type === "info" && "bg-info/5 border-info/20",
              )}
            >
              <div className={cn(
                "flex items-center gap-3",
                action.type === "danger" && "text-danger",
                action.type === "warning" && "text-warning",
                action.type === "success" && "text-success",
                action.type === "info" && "text-info",
              )}>
                {action.icon}
                <span className="text-sm font-medium text-text-primary">
                  {action.text}
                </span>
              </div>
              <Link href={action.href}>
                <Button variant="secondary" size="xs">{action.cta}</Button>
              </Link>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── KPIs ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi, i) => (
          <KPICard key={i} {...kpi} />
        ))}
      </div>

      {/* ─── INSIGHTS URGENTES + FUNIL ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Insights urgentes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Bot className="h-4 w-4 text-arkos-gold" />
              Insights Urgentes da IA
            </h3>
            <Link href="/agents/analyst">
              <button className="text-2xs text-arkos-blue-light hover:text-arkos-gold transition-colors flex items-center gap-1">
                Ver todos <ArrowRight className="h-3 w-3" />
              </button>
            </Link>
          </div>
          {TOP_INSIGHTS.map((insight) => (
            <InsightCard key={insight.id} insight={insight} compact />
          ))}
        </div>

        {/* Funil rápido */}
        <Card>
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <Link href="/agents/analyst?tab=funnel">
              <button className="text-2xs text-arkos-blue-light hover:text-arkos-gold transition-colors">
                Análise completa →
              </button>
            </Link>
          </CardHeader>

          <div className="space-y-3">
            {[
              { label: "Leads", value: 100, total: 100 },
              { label: "Qualificados", value: 68, total: 100 },
              { label: "Reunião", value: 42, total: 100 },
              { label: "Proposta", value: 28, total: 100, warning: true },
              { label: "Negociação", value: 19, total: 100 },
              { label: "Fechado", value: 14, total: 100 },
            ].map((stage) => (
              <div key={stage.label} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary w-20 shrink-0">
                  {stage.label}
                </span>
                <div className="flex-1">
                  <ProgressBar
                    value={stage.value}
                    variant={stage.warning ? "warning" : "blue"}
                    size="md"
                    animate
                  />
                </div>
                <span className="text-xs font-bold text-text-primary w-6 text-right shrink-0">
                  {stage.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-arkos-border">
            <p className="text-xs text-text-secondary flex items-start gap-2">
              <Bot className="h-3.5 w-3.5 text-arkos-gold shrink-0 mt-0.5" />
              <span>Gargalo detectado em Proposta → Negociação (53%)</span>
            </p>
          </div>
        </Card>
      </div>

      {/* ─── EQUIPE ─── */}
      <Card>
        <CardHeader>
          <CardTitle>Performance da Equipe</CardTitle>
          <Link href="/goals">
            <button className="text-2xs text-arkos-blue-light hover:text-arkos-gold transition-colors">
              Ver metas →
            </button>
          </Link>
        </CardHeader>

        <div className="space-y-4">
          {dynamicTeamData.map((member, i) => {
            const pct = Math.round((member.value / member.target) * 100);
            return (
              <div key={member.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base w-6">
                      {i === 0 ? "🏆" : i === TEAM_DATA.length - 1 ? "🔴" : ""}
                    </span>
                    <Avatar name={member.name} size="xs" />
                    <div>
                      <p className="text-xs font-semibold text-text-primary">
                        {member.name}
                      </p>
                      <p className="text-2xs text-text-muted">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-text-primary">
                      {formatCurrency(member.value)}
                    </p>
                    <p className="text-2xs text-text-muted">{pct}%</p>
                  </div>
                </div>
                <ProgressBar value={pct} autoColor size="xs" animate />
              </div>
            );
          })}
        </div>
      </Card>

      {/* ─── AGENTES IA ─── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-arkos-gold" />
            <CardTitle>Agentes IA — Status</CardTitle>
          </div>
          <Link href="/agents">
            <Button variant="ghost" size="xs">
              Gerenciar
            </Button>
          </Link>
        </CardHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {AGENTS.map((agent) => (
            <Link key={agent.name} href={agent.href}>
              <div
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border",
                  "transition-all duration-200 hover:scale-105 cursor-pointer",
                  agent.active
                    ? "bg-success/5 border-success/20"
                    : "bg-arkos-surface-2 border-arkos-border opacity-60"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg",
                  agent.active ? "bg-success/10 text-success" : "bg-arkos-surface-3 text-text-muted"
                )}>
                  {agent.icon}
                </div>
                <div className="text-center">
                  <p className="text-2xs font-bold text-text-primary">{agent.name}</p>
                  <p className="text-2xs text-text-muted mt-0.5">{agent.metric}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    agent.active ? "bg-success animate-pulse" : "bg-text-muted"
                  )} />
                  <span className="text-2xs text-text-muted">
                    {agent.active ? "Ativo" : "Pausado"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>

    </div>
  );
}
