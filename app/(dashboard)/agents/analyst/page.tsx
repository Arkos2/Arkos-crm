"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { InsightCard } from "@/components/agents/InsightCard";
import { MOCK_INSIGHTS, MOCK_PIPELINE_DATA } from "@/lib/mock/analytics";
import { AnalystInsight, InsightLevel } from "@/lib/types/agent";
import { Card, Badge, Button, KPICard, ProgressBar } from "@/components/ui";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import {
  BarChart3, ArrowLeft, Bot, RefreshCw,
  Loader2, Filter, TrendingUp, TrendingDown,
  AlertTriangle, Trophy, BarChart2,
  DollarSign, Users, Zap,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line,
  CartesianGrid, ReferenceLine,
} from "recharts";

const LEVEL_FILTERS: Array<{ id: InsightLevel | "all"; label: string; emoji: string }> = [
  { id: "all", label: "Todos", emoji: "🔍" },
  { id: "urgent", label: "Urgentes", emoji: "🔴" },
  { id: "opportunity", label: "Oportunidades", emoji: "🎯" },
  { id: "win", label: "Wins", emoji: "🏆" },
  { id: "trend", label: "Tendências", emoji: "📈" },
];

// ─── TOOLTIP CUSTOMIZADO ───
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-arkos-surface-3 border border-arkos-border rounded-xl px-3 py-2.5 shadow-arkos">
      <p className="text-xs font-semibold text-text-primary mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function AnalystPage() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AnalystInsight[]>(MOCK_INSIGHTS);
  const [activeFilter, setActiveFilter] = useState<InsightLevel | "all">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"insights" | "funnel" | "revenue" | "team" | "economics">("insights");

  const filteredInsights =
    activeFilter === "all"
      ? insights
      : insights.filter((i) => i.level === activeFilter);

  const urgentCount = insights.filter((i) => i.level === "urgent").length;

  const handleRefreshInsights = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/agents/analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipelineData: MOCK_PIPELINE_DATA }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      if (data.insights?.length > 0) {
        setInsights(data.insights);
        toast.success(`${data.insights.length} novos insights gerados!`);
      }
    } catch {
      toast.error("Erro ao gerar insights. Usando dados locais.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDismiss = (id: string) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
    toast.info("Insight dispensado");
  };

  const data = MOCK_PIPELINE_DATA;

  return (
    <div className="space-y-5">

      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/agents">
            <button className="p-2 rounded-xl hover:bg-arkos-surface-2 text-text-muted transition-all">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <BarChart3 className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-text-primary">
                Agente Analista
              </h1>
              <Badge variant="success" dot dotAnimate>Ativo</Badge>
              {urgentCount > 0 && (
                <Badge variant="danger" dot>
                  {urgentCount} urgente{urgentCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <p className="text-xs text-text-muted">
              Insights acionáveis gerados por IA
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          loading={isRefreshing}
          onClick={handleRefreshInsights}
          icon={isRefreshing ? undefined : <RefreshCw className="h-3.5 w-3.5" />}
        >
          {isRefreshing ? "Analisando..." : "Atualizar Análise"}
        </Button>
      </div>

      {/* ─── KPIs ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Pipeline Total"
          value={data.totalValue}
          valueFormat="currency"
          trend={12}
          trendLabel="vs mês anterior"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KPICard
          title="Receita Ponderada"
          value={data.weightedValue}
          valueFormat="currency"
          trend={8}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KPICard
          title="Conversão Geral"
          value={data.conversionRate}
          valueFormat="percent"
          trend={5}
          icon={<Zap className="h-4 w-4" />}
        />
        <KPICard
          title="Ciclo Médio"
          value={data.avgCycleLength}
          valueFormat="days"
          trend={-11}
          invertTrend
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* ─── TABS ─── */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide border-b border-arkos-border pb-0">
        {[
          { id: "insights", label: "Insights IA", icon: Bot },
          { id: "funnel", label: "Funil", icon: BarChart2 },
          { id: "revenue", label: "Receita", icon: TrendingUp },
          { id: "team", label: "Equipe", icon: Users },
          { id: "economics", label: "Unit Economics", icon: DollarSign },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium",
              "border-b-2 -mb-px transition-all duration-200 whitespace-nowrap",
              activeTab === id
                ? "border-arkos-gold text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            {id === "insights" && urgentCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-danger/10 text-danger text-2xs font-bold">
                {urgentCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── TAB: INSIGHTS IA ─── */}
      {activeTab === "insights" && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {LEVEL_FILTERS.map((f) => {
              const count = f.id === "all"
                ? insights.length
                : insights.filter((i) => i.level === f.id).length;

              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium",
                    "transition-all duration-200 whitespace-nowrap shrink-0",
                    activeFilter === f.id
                      ? "bg-arkos-blue/10 border-arkos-blue/40 text-arkos-blue-light"
                      : "border-arkos-border text-text-muted hover:border-arkos-border-2 hover:text-text-secondary"
                  )}
                >
                  {f.emoji} {f.label}
                  {count > 0 && (
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-full text-2xs font-bold",
                      activeFilter === f.id
                        ? "bg-arkos-blue/20 text-arkos-blue-light"
                        : "bg-arkos-surface-3 text-text-muted"
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Cards de insight */}
          {filteredInsights.length > 0 ? (
            <div className="space-y-3">
              {filteredInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onDismiss={handleDismiss}
                  onAction={(id, action) => {
                    toast.info(`Ação: ${action}`);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BarChart3 className="h-10 w-10 text-text-muted mb-3" />
              <p className="text-sm text-text-secondary">
                Nenhum insight nessa categoria
              </p>
              <p className="text-xs text-text-muted mt-1">
                Clique em &quot;Atualizar Análise&quot; para gerar novos insights com IA
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: FUNIL ─── */}
      {activeTab === "funnel" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Funil visual */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">
                Conversão por Etapa
              </h3>
              <Badge variant="warning" dot>
                Gargalo detectado
              </Badge>
            </div>

            <div className="space-y-4">
              {data.stages.map((stage, i) => {
                const width = 100 - i * 14;
                const isBottleneck = stage.conversion !== null && stage.conversion < 55;

                return (
                  <div key={stage.name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text-secondary">
                          {stage.name}
                        </span>
                        {isBottleneck && (
                          <Badge variant="warning" size="sm">
                            ⚠️ Gargalo
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-2xs">
                        <span className="text-text-muted">{stage.count} negócios</span>
                        <span className="font-bold text-text-primary">
                          {formatCurrency(stage.value)}
                        </span>
                        {stage.conversion !== null && (
                          <span className={cn(
                            "font-bold",
                            isBottleneck ? "text-warning" : "text-success"
                          )}>
                            {stage.conversion}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="h-8 rounded-xl flex items-center px-3 transition-all"
                      style={{
                        width: `${width}%`,
                        background: isBottleneck
                          ? "rgba(245, 158, 11, 0.15)"
                          : "rgba(43, 88, 138, 0.15)",
                        border: `1px solid ${isBottleneck ? "rgba(245,158,11,0.3)" : "rgba(43,88,138,0.3)"}`,
                      }}
                    >
                      <span className="text-2xs font-medium text-text-secondary truncate">
                        {stage.count} × ~{formatCurrency(stage.value / (stage.count || 1))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-arkos-border">
              <p className="text-xs text-text-secondary flex items-start gap-2">
                <Bot className="h-3.5 w-3.5 text-arkos-gold shrink-0 mt-0.5" />
                <span>
                  <strong className="text-text-primary">IA:</strong> O gargalo em
                  Proposta (53%) está abaixo da média histórica (68%). Cada 1% de
                  melhoria aqui representa ~R$8.500 de receita adicional.
                </span>
              </p>
            </div>
          </Card>

          {/* Motivos de perda */}
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-4">
              Análise de Perdas
            </h3>

            <div className="space-y-3">
              {data.lossReasons.map((reason) => (
                <div key={reason.reason} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">{reason.reason}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted">{reason.count}x</span>
                      <span className="font-bold text-text-primary">
                        {reason.percentage}%
                      </span>
                    </div>
                  </div>
                  <ProgressBar
                    value={reason.percentage}
                    autoColor={false}
                    variant={reason.percentage > 30 ? "danger" : reason.percentage > 20 ? "warning" : "blue"}
                    size="sm"
                    animate
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-arkos-border">
              <p className="text-xs text-text-secondary flex items-start gap-2">
                <Bot className="h-3.5 w-3.5 text-arkos-gold shrink-0 mt-0.5" />
                <span>
                  <strong className="text-text-primary">IA:</strong> 35% cita preço.
                  Leads que recebem análise de ROI personalizada convertem 52% mais.
                  Ative o Agente Redator para gerar ROI automático.
                </span>
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB: RECEITA ─── */}
      {activeTab === "revenue" && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-text-primary">
                Realizado vs Meta — Últimos 7 Meses
              </h3>
              <div className="flex items-center gap-4 text-2xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-arkos-blue" />
                  <span className="text-text-muted">Realizado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-arkos-surface-3 border border-arkos-border-2" />
                  <span className="text-text-muted">Meta</span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.revenueHistory} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e2433"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="realized"
                  name="Realizado"
                  fill="#2b588a"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="target"
                  name="Meta"
                  fill="transparent"
                  stroke="#1e2433"
                  strokeWidth={1}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 pt-4 border-t border-arkos-border grid grid-cols-3 gap-4">
              {[
                { label: "Melhor Mês", value: "Dez/24", sub: formatCurrency(380000) },
                { label: "Crescimento MoM", value: "+12%", sub: "média últimos 6m" },
                { label: "Previsão Jan", value: formatCurrency(350000), sub: "87% conf. IA" },
              ].map(({ label, value, sub }) => (
                <div key={label} className="text-center">
                  <p className="text-2xs text-text-muted">{label}</p>
                  <p className="text-base font-bold text-text-primary">{value}</p>
                  <p className="text-2xs text-text-muted">{sub}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB: EQUIPE ─── */}
      {activeTab === "team" && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-4">
              Performance Individual
            </h3>
            <div className="space-y-5">
              {data.teamPerformance.map((member, i) => {
                const pct = Math.round((member.revenue / member.target) * 100);
                const medals = ["🥇", "🥈", "🥉", ""];

                return (
                  <div key={member.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg w-6 text-center">{medals[i]}</span>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">
                            {member.name}
                          </p>
                          <p className="text-2xs text-text-muted">
                            {member.deals} negócios · {member.winRate}% win rate
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-text-primary">
                          {formatCurrency(member.revenue)}
                        </p>
                        <p className="text-2xs text-text-muted">
                          de {formatCurrency(member.target)} ({pct}%)
                        </p>
                      </div>
                    </div>
                    <ProgressBar
                      value={pct}
                      autoColor
                      size="md"
                      animate
                      showLabel
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-arkos-border">
              <p className="text-xs text-text-secondary flex items-start gap-2">
                <Bot className="h-3.5 w-3.5 text-arkos-gold shrink-0 mt-0.5" />
                <span>
                  <strong className="text-text-primary">Coach IA:</strong> {user?.name ? user.name.split(" ")[0] : "Administrador"}
                  usa demo na 1ª reunião e fecha 2x mais. Recomendo treinar Pedro
                  e Ana nessa abordagem. Impacto estimado: +R$40k/mês.
                </span>
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB: UNIT ECONOMICS ─── */}
      {activeTab === "economics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Métricas principais */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "CAC",
                  value: formatCurrency(data.unitEconomics.cac),
                  trend: -8,
                  desc: "Custo de Aquisição",
                  invertTrend: true,
                  color: "text-info",
                },
                {
                  label: "LTV",
                  value: formatCurrency(data.unitEconomics.ltv),
                  trend: 15,
                  desc: "Lifetime Value",
                  color: "text-success",
                },
                {
                  label: "LTV/CAC",
                  value: `${data.unitEconomics.ltvCacRatio}x`,
                  trend: 20,
                  desc: "Relação LTV/CAC",
                  color: "text-arkos-gold",
                },
                {
                  label: "Payback",
                  value: `${data.unitEconomics.paybackMonths}m`,
                  trend: -12,
                  desc: "Tempo de retorno",
                  invertTrend: true,
                  color: "text-purple-400",
                },
              ].map(({ label, value, trend, desc, invertTrend, color }) => (
                <div
                  key={label}
                  className="p-4 rounded-2xl bg-arkos-surface border border-arkos-border"
                >
                  <p className="text-2xs text-text-muted">{desc}</p>
                  <p className={cn("text-2xl font-bold mt-1", color)}>{value}</p>
                  <div className={cn(
                    "flex items-center gap-1 mt-1 text-2xs font-medium",
                    (invertTrend ? trend < 0 : trend > 0) ? "text-success" : "text-danger"
                  )}>
                    {(invertTrend ? trend < 0 : trend > 0) ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {trend > 0 ? "+" : ""}{trend}% vs mês anterior
                  </div>
                </div>
              ))}
            </div>

            {/* MRR e ARR */}
            <Card>
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-4">
                Receita Recorrente
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "MRR", value: formatCurrency(data.unitEconomics.mrr), sub: "Mensal", color: "text-arkos-blue-light" },
                  { label: "ARR", value: formatCurrency(data.unitEconomics.arr), sub: "Anual", color: "text-arkos-gold" },
                ].map(({ label, value, sub, color }) => (
                  <div key={label} className="text-center p-4 rounded-xl bg-arkos-surface-2">
                    <p className="text-2xs text-text-muted">{sub}</p>
                    <p className={cn("text-xs font-bold", color)}>{label}</p>
                    <p className={cn("text-xl font-bold mt-1", color)}>{value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Gauge LTV/CAC + health */}
          <div className="space-y-4">
            <Card>
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-4">
                Saúde do Negócio
              </h4>
              <div className="space-y-4">
                {[
                  {
                    label: "LTV/CAC Ratio",
                    value: data.unitEconomics.ltvCacRatio,
                    max: 10,
                    ideal: "≥ 3x",
                    status: "excellent",
                    format: "x",
                  },
                  {
                    label: "Churn Rate",
                    value: data.unitEconomics.churnRate,
                    max: 15,
                    ideal: "< 5%",
                    status: "good",
                    format: "%",
                  },
                  {
                    label: "Payback (meses)",
                    value: data.unitEconomics.paybackMonths,
                    max: 12,
                    ideal: "< 12m",
                    status: "excellent",
                    format: "m",
                  },
                ].map(({ label, value, max, ideal, status, format }) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-text-secondary">
                        {label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-primary">
                          {value}{format}
                        </span>
                        <Badge
                          variant={status === "excellent" ? "success" : status === "good" ? "info" : "warning"}
                          size="sm"
                        >
                          Ideal: {ideal}
                        </Badge>
                      </div>
                    </div>
                    <ProgressBar
                      value={(value / max) * 100}
                      autoColor={false}
                      variant="success"
                      size="sm"
                      animate
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-arkos-border">
                <p className="text-xs text-text-secondary flex items-start gap-2">
                  <Bot className="h-3.5 w-3.5 text-arkos-gold shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-text-primary">IA:</strong> LTV/CAC de
                    8x está excelente (benchmark B2B: 3x). Se mantiver crescimento
                    atual, ARR atingirá R$2M em 8 meses.
                  </span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
