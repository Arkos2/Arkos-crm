import { supabase } from "../client";

export interface PipelineRow {
  id: string;
  name: string;
  is_default: boolean;
  currency: string;
}

function mapPipelineRow(row: any): PipelineRow {
  return {
    id: row.id,
    name: row.name || row.nome || "Funil de Vendas",
    is_default: row.is_default || row.is_padrao || false,
    currency: row.currency || row.moeda || "BRL",
  };
}

export async function getPipelines() {
  // Ignora erros de ordenacao se "created_at" nao existir
  const { data, error } = await supabase
    .from("pipelines")
    .select("*")
    .limit(10);

  if (error) {
    console.error("Erro getPipelines:", error);
    return [];
  }
  return (data || []).map(mapPipelineRow);
}

export async function getDefaultPipeline() {
  // Pega qualquer pipeline existente para evitar erros de constraint de schema
  const { data, error } = await supabase
    .from("pipelines")
    .select("*")
    .limit(1);

  if (data && data.length > 0) return mapPipelineRow(data[0]);

  // Fallback: criar um pipeline padrao se o banco estiver completamente vazio
  const { data: newPipeline, error: insertError } = await supabase
    .from("pipelines")
    .insert([{ name: "Funil de Vendas" }])
    .select("*")
    .single();

  if (insertError) {
    console.error("Erro ao inserir pipeline default:", insertError);
    throw insertError;
  }
  
  return mapPipelineRow(newPipeline);
}
