"use client";

import useSWR, { mutate } from "swr";
import { useCallback } from "react";
import {
  getWorkflows, createWorkflow,
  updateWorkflow, toggleWorkflow, deleteWorkflow,
} from "@/lib/supabase/services/workflows";
import { Workflow, WorkflowStatus } from "@/lib/types/settings";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const KEY = "workflows";

export function useWorkflows() {
  const { user } = useAuth();

  const { data, error, isLoading } = useSWR(
    KEY,
    getWorkflows,
    { revalidateOnFocus: false }
  );

  const handleCreate = useCallback(
    async (input: Partial<Workflow>) => {
      if (!user) return;
      try {
        await createWorkflow({ ...input, createdBy: user.id } as any);
        mutate(KEY);
        toast.success("Workflow criado!");
      } catch {
        toast.error("Erro ao criar workflow");
      }
    },
    [user]
  );

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<Workflow>) => {
      // Optimistic
      mutate(
        KEY,
        (current: Workflow[] | undefined) =>
          current?.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        false
      );
      try {
        await updateWorkflow(id, updates);
        mutate(KEY);
      } catch {
        mutate(KEY);
        toast.error("Erro ao atualizar workflow");
      }
    },
    []
  );

  const handleToggle = useCallback(
    async (id: string, currentStatus: WorkflowStatus) => {
      const newStatus = currentStatus === "active" ? "paused" : "active";
      mutate(
        KEY,
        (current: Workflow[] | undefined) =>
          current?.map((w) =>
            w.id === id ? { ...w, status: newStatus as WorkflowStatus } : w
          ),
        false
      );
      try {
        await toggleWorkflow(id, currentStatus);
        const label = newStatus === "active" ? "ativado" : "pausado";
        toast.success(`Workflow ${label}!`);
      } catch {
        mutate(KEY);
        toast.error("Erro ao alterar workflow");
      }
    },
    []
  );

  const handleDelete = useCallback(async (id: string) => {
    mutate(
      KEY,
      (current: Workflow[] | undefined) =>
        current?.filter((w) => w.id !== id),
      false
    );
    try {
      await deleteWorkflow(id);
      toast.success("Workflow excluído");
    } catch {
      mutate(KEY);
      toast.error("Erro ao excluir workflow");
    }
  }, []);

  return {
    workflows: data || [],
    isLoading,
    error,
    create: handleCreate,
    update: handleUpdate,
    toggle: handleToggle,
    delete: handleDelete,
    refresh: () => mutate(KEY),
  };
}
