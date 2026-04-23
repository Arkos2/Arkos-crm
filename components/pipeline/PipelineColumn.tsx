"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Deal, PipelineStage } from "@/lib/types/deal";
import { cn, formatCurrency } from "@/lib/utils";
import { DealCard } from "./DealCard";
import { Plus, MoreHorizontal } from "lucide-react";
import { AnimatePresence } from "framer-motion";

interface PipelineColumnProps {
  stage: PipelineStage;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onAddDeal?: (stageId: string) => void;
}

// Cor de progresso por etapa
const STAGE_PROGRESS_COLORS: Record<string, string> = {
  prospecting: "bg-slate-500",
  qualification: "bg-info",
  diagnosis: "bg-purple-500",
  proposal: "bg-warning",
  negotiation: "bg-orange-500",
  closing: "bg-success",
  won: "bg-success",
  lost: "bg-danger",
};

export function PipelineColumn({
  stage,
  deals,
  onDealClick,
  onAddDeal,
}: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const rottingCount = deals.filter((d) => d.isRotting).length;
  const progressColor = STAGE_PROGRESS_COLORS[stage.id] || "bg-arkos-blue";

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* ─── HEADER DA COLUNA ─── */}
      <div className="mb-3">
        {/* Barra de progresso superior */}
        <div className="h-1 rounded-full bg-arkos-surface-3 mb-3 overflow-hidden">
          <div
            className={cn("h-full rounded-full", progressColor)}
            style={{ width: `${stage.probability}%` }}
          />
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary truncate">
                {stage.name}
              </h3>
              {/* Count */}
              <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-arkos-surface-3 text-2xs font-bold text-text-secondary">
                {deals.length}
              </span>
            </div>

            {/* Valor total */}
            <p className="text-xs text-text-muted mt-0.5">
              {formatCurrency(totalValue)}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Rotting badge */}
            {rottingCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger/10 border border-danger/20 text-2xs text-danger font-medium">
                ⚠️ {rottingCount}
              </span>
            )}

            {/* Probabilidade */}
            <span className="text-2xs text-text-muted">
              {stage.probability}%
            </span>

            <button className="p-1 rounded-lg hover:bg-arkos-surface-2 text-text-muted hover:text-text-primary transition-colors">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── DROPPABLE AREA ─── */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-2 flex-1 min-h-[200px] rounded-xl p-2 -m-2",
          "transition-all duration-200",
          isOver && "bg-arkos-blue/5 ring-1 ring-arkos-blue/30"
        )}
      >
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence>
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                onClick={onDealClick}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        {/* Área vazia */}
        {deals.length === 0 && (
          <div
            className={cn(
              "flex flex-col items-center justify-center",
              "border-2 border-dashed rounded-xl py-8",
              "transition-all duration-200",
              isOver
                ? "border-arkos-blue/60 bg-arkos-blue/5"
                : "border-arkos-border"
            )}
          >
            <p className="text-xs text-text-muted text-center">
              {isOver ? "Soltar aqui" : "Nenhum negócio"}
            </p>
          </div>
        )}

        {/* Botão adicionar */}
        <button
          onClick={() => onAddDeal?.(stage.id)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl",
            "border border-dashed border-arkos-border",
            "text-text-muted hover:text-text-secondary hover:border-arkos-blue/40 hover:bg-arkos-blue/5",
            "transition-all duration-200 text-xs",
            "mt-1"
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar negócio
        </button>
      </div>
    </div>
  );
}
