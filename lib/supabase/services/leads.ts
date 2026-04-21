import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  status: 'Novo' | 'Em Qualificação' | 'Qualificado' | 'Descartado';
  faturamento_mensal?: number;
  nivel_urgencia?: string;
  score_ia?: number;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export async function getLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Lead[];
}

export async function getLeadById(id: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function createLead(lead: Partial<Lead>) {
  // Pega o usuário logado para carimbar o criador
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error("Você precisa estar logado para criar leads.");
  }

  const { data, error } = await supabase
    .from('leads')
    .insert({ ...lead, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}
