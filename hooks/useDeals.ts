"use client";

import useSWR, { mutate } from "swr";
import { useCallback, useEffect } from "react";
import {
  getDeals, getDealById, createDeal,
  updateDeal, updateDealStage, deleteDeal,
  subscribeToDeals,
} from "@/lib/supabase/services/deals";
import { Deal, DealStage } from "@/lib/types/deal";
import { toast } from "sonner";

// ─── HOOK: LISTA DE DEALS ───
export function useDeals(filters?: {
  status?: string;
  ownerId?: string;
  pipelineId?: string;
}) {
  const key = ["deals", JSON.stringify(filters)];

  const { data, error, isLoading } = useSWR(
    key,
    () => getDeals(filters),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  // Realtime
  useEffect(() => {
    const channel = subscribeToDeals((deal, event) => {
      mutate(key);
    });

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [key]);

  const handleUpdateStage = useCallback(
    async (dealId: string, newStage: DealStage) => {
      // Optimistic update
      mutate(
        key,
        (current: Deal[] | undefined) =>
          current?.map((d) =>
            d.id === dealId
              ? { ...d, stage: newStage, stageEnteredAt: new Date().toISOString() }
              : d
          ),
        false
      );

      try {
        await updateDealStage(dealId, newStage);
        toast.success("Etapa atualizada!");
      } catch (err) {
        // Reverter em caso de erro
        mutate(key);
        toast.error("Erro ao atualizar etapa");
        throw err;
      }
    },
    [key]
  );

  const handleCreate = useCallback(
    async (input: Parameters<typeof createDeal>[0]) => {
      try {
        const newDeal = await createDeal(input);
        mutate(key);
        toast.success("Negócio criado!");
        return newDeal;
      } catch (err) {
        toast.error("Erro ao criar negócio");
        throw err;
      }
    },
    [key]
  );

  const handleUpdate = useCallback(
    async (dealId: string, updates: Parameters<typeof updateDeal>[1]) => {
      // Optimistic update
      mutate(
        key,
        (current: Deal[] | undefined) =>
          current?.map((d) => (d.id === dealId ? { ...d, ...updates } : d)),
        false
      );

      try {
        await updateDeal(dealId, updates);
        mutate(key);
      } catch (err) {
        mutate(key);
        toast.error("Erro ao atualizar negócio");
        throw err;
      }
    },
    [key]
  );

  const handleDelete = useCallback(
    async (dealId: string) => {
      mutate(
        key,
        (current: Deal[] | undefined) =>
          current?.filter((d) => d.id !== dealId),
        false
      );

      try {
        await deleteDeal(dealId);
        toast.success("Negócio excluído");
      } catch (err) {
        mutate(key);
        toast.error("Erro ao excluir negócio");
        throw err;
      }
    },
    [key]
  );

  return {
    deals: data || [],
    isLoading,
    error,
    updateStage: handleUpdateStage,
    createDeal: handleCreate,
    updateDeal: handleUpdate,
    deleteDeal: handleDelete,
    refresh: () => mutate(key),
  };
}

// ─── HOOK: DEAL ÚNICO ───
export function useDeal(id: string | null) {
  const { data, error, isLoading } = useSWR(
    id ? ["deal", id] : null,
    () => getDealById(id!),
    { revalidateOnFocus: false }
  );

  return { deal: data, isLoading, error };
}
