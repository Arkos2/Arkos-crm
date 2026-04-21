"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Deal, DealStage, PipelineStage } from "@/lib/types/deal";
import { cn } from "@/lib/utils";
import { PipelineColumn } from "./PipelineColumn";
import { DealCard, DealCardGhost } from "./DealCard";
import { DealDetailSheet } from "./DealDetailSheet";
import { toast } from "sonner";

interface PipelineBoardProps {
  stages: PipelineStage[];
  initialDeals: Deal[];
  onDealMove?: (dealId: string, newStage: DealStage) => Promise<void>;
  onDealUpdate?: (dealId: string, updates: Partial<Deal>) => Promise<void>;
}

export function PipelineBoard({
  stages,
  initialDeals,
  onDealMove,
  onDealUpdate,
}: PipelineBoardProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  // Sincronizar estado local quando os dados do SWR mudarem
  useEffect(() => {
    setDeals(initialDeals);
  }, [initialDeals]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Deals agrupados por etapa
  const getDealsByStage = useCallback(
    (stageId: DealStage) =>
      deals
        .filter((d) => d.stage === stageId && d.status === "active")
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    [deals]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find((d) => d.id === event.active.id);
    setActiveDeal(deal || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeDealId = active.id as string;
    const overId = over.id as string;

    const activeDeal = deals.find((d) => d.id === activeDealId);
    if (!activeDeal) return;

    const overIsStage = stages.some((s) => s.id === overId);
    const overDeal = deals.find((d) => d.id === overId);
    const targetStage = overIsStage
      ? (overId as DealStage)
      : overDeal?.stage;

    if (!targetStage || activeDeal.stage === targetStage) return;

    setDeals((prev) =>
      prev.map((d) =>
        d.id === activeDealId
          ? {
              ...d,
              stage: targetStage,
              stageEnteredAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : d
      )
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const activeDeal = deals.find((d) => d.id === active.id);
    setActiveDeal(null);

    if (!over || !activeDeal) return;

    const activeDealId = active.id as string;
    const overId = over.id as string;

    // Se houve mudança de coluna, disparar o save no banco
    if (activeDeal.stage !== initialDeals.find(d => d.id === activeDealId)?.stage) {
      if (onDealMove) {
        await onDealMove(activeDealId, activeDeal.stage as DealStage);
      }
      return;
    }

    if (activeDealId === overId) return;

    // Reordenar dentro da mesma coluna (apenas visual por enquanto)
    const overDeal = deals.find((d) => d.id === overId);
    if (activeDeal && overDeal && activeDeal.stage === overDeal.stage) {
      const stageDeals = getDealsByStage(activeDeal.stage);
      const oldIndex = stageDeals.findIndex((d) => d.id === activeDealId);
      const newIndex = stageDeals.findIndex((d) => d.id === overId);

      if (oldIndex !== newIndex) {
        const reordered = arrayMove(stageDeals, oldIndex, newIndex);
        setDeals((prev) => {
          const otherDeals = prev.filter((d) => d.stage !== activeDeal.stage);
          return [...otherDeals, ...reordered];
        });
      }
    }
  };

  const handleDealUpdate = async (dealId: string, updates: Partial<Deal>) => {
    // Modo otimista local
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId
          ? { ...d, ...updates, updatedAt: new Date().toISOString() }
          : d
      )
    );

    if (selectedDeal?.id === dealId) {
      setSelectedDeal((prev) => (prev ? { ...prev, ...updates } : null));
    }

    // Salvar no banco
    if (onDealUpdate) {
      await onDealUpdate(dealId, updates);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide">
          {stages
            .filter((s) => s.id !== "won" && s.id !== "lost")
            .map((stage) => (
              <PipelineColumn
                key={stage.id}
                stage={stage}
                deals={getDealsByStage(stage.id as DealStage)}
                onDealClick={setSelectedDeal}
                onAddDeal={(stageId) => {
                   toast.info("Abertura de modal de novo negócio...");
                }}
              />
            ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDeal && <DealCardGhost deal={activeDeal} />}
        </DragOverlay>
      </DndContext>

      <DealDetailSheet
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onUpdate={handleDealUpdate}
      />
    </>
  );
}
