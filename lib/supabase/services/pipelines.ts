import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface PipelineRow {
  id: string;
  name: string;
  is_default: boolean;
  currency: string;
}

export async function getPipelines() {
  const { data, error } = await supabase
    .from("pipelines")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as PipelineRow[];
}

export async function getDefaultPipeline() {
  const { data, error } = await supabase
    .from("pipelines")
    .select("*")
    .eq("is_default", true)
    .maybeSingle();

  if (error) throw error;
  if (data) return data as PipelineRow;

  // Se no tiver default, pega o primeiro
  const all = await getPipelines();
  if (all && all.length > 0) return all[0];

  // Fallback: criar um pipeline padrao se o banco estiver vazio
  const { data: newPipeline, error: insertError } = await supabase
    .from("pipelines")
    .insert([{ name: "Funil de Vendas", is_default: true }])
    .select("*")
    .single();

  if (insertError) throw insertError;
  return newPipeline as PipelineRow;
}
