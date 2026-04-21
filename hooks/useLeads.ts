import useSWR from "swr";
import { getLeads, createLead, updateLead } from "@/lib/supabase/services/leads";
import { Lead } from "@/lib/supabase/services/leads";
import { toast } from "sonner";

export function useLeads() {
  const { data: leads, error, mutate, isLoading } = useSWR("leads", getLeads);

  const addLead = async (lead: Partial<Lead>) => {
    try {
      const newLead = await createLead(lead);
      mutate((prev) => (prev ? [newLead, ...prev] : [newLead]), false);
      toast.success("Lead criado com sucesso!");
      return newLead;
    } catch (err) {
      toast.error("Erro ao criar lead");
      throw err;
    }
  };

  const refreshLeads = () => mutate();

  return {
    leads: leads || [],
    isLoading,
    isError: error,
    addLead,
    refreshLeads,
  };
}
