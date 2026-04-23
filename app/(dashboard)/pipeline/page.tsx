"use client";

import { useDeals } from "@/hooks/useDeals";
import { PIPELINE_STAGES, MOCK_PIPELINE } from "@/lib/mock/deals";
import { Button, Badge, Skeleton } from "@/components/ui";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import {
  Plus,
  Filter,
  LayoutGrid,
  List,
  Table,
  ChevronDown,
  Bot,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Deal } from "@/lib/types/deal";



// Estatísticas do pipeline
function getPipelineStats(deals: Deal[]) {
  const active = deals.filter((d) => d.status === "active");
  const total = active.reduce((sum, d) => sum + d.value, 0);
  const weighted = active.reduce(
    (sum, d) => sum + d.value * (d.probability / 100),
    0
  );
  const rotting = active.filter((d) => d.isRotting).length;
  const hot = active.filter((d) => d.temperature === "hot").length;

  return { total, weighted, rotting, hot, count: active.length };
}

export default function PipelinePage() {
  const { deals, isLoading, updateStage } = useDeals({
    status: "active",
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-64 rounded-xl" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[600px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = getPipelineStats(deals);

  return (
    <div className="space-y-5">

      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-text-primary">
              Pipeline
            </h1>
            {/* Seletor de funil */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-arkos-surface border border-arkos-border text-sm font-medium text-text-secondary hover:text-text-primary hover:border-arkos-blue/40 transition-all">
              {MOCK_PIPELINE.name}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-sm text-text-muted mt-0.5">
            {stats.count} negócios ativos
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle visualização */}
          <div className="flex items-center bg-arkos-surface border border-arkos-border rounded-xl p-1">
            {[
              { icon: LayoutGrid, label: "Kanban", active: true },
              { icon: List, label: "Lista", active: false },
              { icon: Table, label: "Tabela", active: false },
            ].map(({ icon: Icon, label, active }) => (
              <button
                key={label}
                title={label}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  active
                    ? "bg-arkos-blue/10 text-arkos-blue-light"
                    : "text-text-muted hover:text-text-primary hover:bg-arkos-surface-2"
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={<Filter className="h-3.5 w-3.5" />}
          >
            Filtros
          </Button>

          <Button
            variant="gold"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
          >
            Novo Negócio
          </Button>
        </div>
      </div>

      {/* ─── ESTATÍSTICAS RÁPIDAS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total no Pipeline",
            value: formatCurrency(stats.total),
            sub: "Valor bruto",
            color: "text-text-primary",
          },
          {
            label: "Receita Ponderada",
            value: formatCurrency(stats.weighted),
            sub: "Por probabilidade",
            color: "text-arkos-blue-light",
          },
          {
            label: "🔥 Negócios Quentes",
            value: String(stats.hot),
            sub: "Alta prob. de fechar",
            color: "text-danger",
          },
          {
            label: "⚠️ Parados (Rotting)",
            value: String(stats.rotting),
            sub: "Precisam de atenção",
            color: "text-warning",
          },
        ].map(({ label, value, sub, color }) => (
          <div
            key={label}
            className="bg-arkos-surface border border-arkos-border rounded-xl px-4 py-3"
          >
            <p className="text-2xs text-text-muted">{label}</p>
            <p className={cn("text-lg font-bold mt-0.5", color)}>{value}</p>
            <p className="text-2xs text-text-muted">{sub}</p>
          </div>
        ))}
      </div>

      {/* ─── ALERTA IA ─── */}
      {stats.rotting > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-warning/30 bg-warning/5">
          <Bot className="h-4 w-4 text-warning shrink-0" />
          <p className="text-sm text-text-secondary flex-1">
            <strong className="text-text-primary">Agente IA:</strong>{" "}
            {stats.rotting} {stats.rotting === 1 ? "negócio está" : "negócios estão"} parado{stats.rotting !== 1 ? "s" : ""} por mais de 5 dias.
            Ação imediata pode evitar perdas.
          </p>
          <Button variant="secondary" size="xs">
            Ver Todos
          </Button>
        </div>
      )}

      {/* ─── KANBAN BOARD ─── */}
      <PipelineBoard
        stages={PIPELINE_STAGES}
        initialDeals={deals}
        onDealMove={updateStage}
      />

      {/* ─── NEGÓCIOS GANHOS / PERDIDOS (RESUMO) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-arkos-border">
        {[
          {
            label: "✅ Ganhos este mês",
            count: 8,
            value: formatCurrency(380000),
            color: "text-success",
            border: "border-success/20",
            bg: "bg-success/5",
          },
          {
            label: "❌ Perdidos este mês",
            count: 3,
            value: formatCurrency(85000),
            color: "text-danger",
            border: "border-danger/20",
            bg: "bg-danger/5",
          },
        ].map(({ label, count, value, color, border, bg }) => (
          <div
            key={label}
            className={cn(
              "flex items-center justify-between px-4 py-3 rounded-xl border",
              bg,
              border
            )}
          >
            <div>
              <p className="text-xs font-semibold text-text-secondary">
                {label}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={cn("text-xl font-bold", color)}>
                  {count}
                </span>
                <span className="text-sm text-text-muted">{value}</span>
              </div>
            </div>
            <Button variant="ghost" size="xs">
              Ver detalhes
            </Button>
          </div>
        ))}
      </div>

    </div>
  );
}
