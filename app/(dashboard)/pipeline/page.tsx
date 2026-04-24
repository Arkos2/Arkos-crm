"use client";

import { useDeals } from "@/hooks/useDeals";
import { Button, Badge, Skeleton } from "@/components/ui";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import {
  Plus,
  Filter,
  LayoutGrid,
  List,
  Table as TableIcon,
  ChevronDown,
  Bot,
  Building2,
  Calendar,
  DollarSign,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Deal, PipelineStage } from "@/lib/types/deal";
import { useState } from "react";
import { NewDealModal } from "@/components/pipeline/NewDealModal";

const PIPELINE_STAGES: PipelineStage[] = [
  { id: "prospecting", name: "Prospecção", color: "slate", probability: 10, rottingAfterDays: 7, order: 0 },
  { id: "qualification", name: "Qualificação", color: "blue", probability: 25, rottingAfterDays: 5, order: 1 },
  { id: "diagnosis", name: "Diagnóstico", color: "purple", probability: 40, rottingAfterDays: 5, order: 2 },
  { id: "proposal", name: "Proposta", color: "amber", probability: 60, rottingAfterDays: 4, order: 3 },
  { id: "negotiation", name: "Negociação", color: "orange", probability: 80, rottingAfterDays: 3, order: 4 },
  { id: "closing", name: "Fechamento", color: "green", probability: 95, rottingAfterDays: 2, order: 5 },
];
import { DealCard } from "@/components/pipeline/DealCard";



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
  const { deals, isLoading, updateStage, createDeal } = useDeals({
    status: "active",
  });
  
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "table">("kanban");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              Pipeline Vendas
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
              { id: "kanban", icon: LayoutGrid, label: "Kanban" },
              { id: "list", icon: List, label: "Lista" },
              { id: "table", icon: TableIcon, label: "Tabela" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                title={label}
                onClick={() => setViewMode(id as any)}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  viewMode === id
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
            onClick={() => setIsModalOpen(true)}
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

      {/* ─── CONTEÚDO PRINCIPAL (KANBAN / LISTA / TABELA) ─── */}
      {viewMode === "kanban" ? (
        <PipelineBoard
          stages={PIPELINE_STAGES}
          initialDeals={deals}
          onDealMove={updateStage}
          onAddDeal={() => setIsModalOpen(true)}
        />
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {deals.map(deal => (
            <div key={deal.id} className="w-full max-w-2xl">
              <DealCard deal={deal} />
            </div>
          ))}
          {deals.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-arkos-border rounded-2xl">
              <p className="text-text-muted">Nenhum negócio encontrado.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-arkos-border bg-arkos-surface">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-arkos-surface-2 border-b border-arkos-border">
                <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Negócio</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Etapa</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arkos-border">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-arkos-surface-2 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-text-primary">{deal.title}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-text-muted" />
                      <span className="text-sm text-text-secondary">{deal.organization?.name || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-arkos-blue-light">
                    {formatCurrency(deal.value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="info" size="sm">{deal.stage.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-2xs text-text-muted">
                      <Calendar className="h-3 w-3" />
                      {new Date(deal.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {deals.length === 0 && (
            <div className="text-center py-20">
              <p className="text-text-muted">Nenhum negócio encontrado.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Novo Negócio */}
      <NewDealModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* ─── NEGÓCIOS GANHOS / PERDIDOS (RESUMO) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-arkos-border">
        {[
          {
            label: "✅ Ganhos este mês",
            count: 0,
            value: formatCurrency(0),
            color: "text-success",
            border: "border-success/20",
            bg: "bg-success/5",
          },
          {
            label: "❌ Perdidos este mês",
            count: 0,
            value: formatCurrency(0),
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
