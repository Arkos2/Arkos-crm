// lib/queries.ts
import { supabase } from './supabase'
import { FiltroLead, Lead, Atividade, Nota } from './types'

// ─── EMPRESA ───────────────────────────────────────────────

export async function getEmpresa() {
  const { data, error } = await supabase
    .from('empresas_arkos')
    .select('*')
    .single()

  if (error) throw error
  return data
}

// ─── LEADS ─────────────────────────────────────────────────

export async function getLeads(filtros?: FiltroLead) {
  let query = supabase
    .from('leads')
    .select(`
      *,
      etapas_pipeline (id, nome, cor, ordem),
      usuarios!leads_responsavel_id_fkey (id, nome, avatar_url)
    `)
    .eq('is_arquivado', false)
    .order('criado_em', { ascending: false })

  if (filtros?.status)       query = query.eq('status', filtros.status)
  if (filtros?.temperatura)  query = query.eq('temperatura', filtros.temperatura)
  if (filtros?.prioridade)   query = query.eq('prioridade', filtros.prioridade)
  if (filtros?.canal_origem) query = query.eq('canal_origem', filtros.canal_origem)
  if (filtros?.etapa_id)     query = query.eq('etapa_id', filtros.etapa_id)
  if (filtros?.responsavel_id) {
    query = query.eq('responsavel_id', filtros.responsavel_id)
  }
  if (filtros?.busca) {
    query = query.ilike('titulo', `%${filtros.busca}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getLeadById(id: string) {
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      etapas_pipeline (id, nome, cor, ordem),
      usuarios!leads_responsavel_id_fkey (id, nome, avatar_url),
      contatos (id, nome, sobrenome, cargo, whatsapp, email)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function criarLead(lead: Partial<Lead>) {
  const empresa = await getEmpresa()

  const { data, error } = await supabase
    .from('leads')
    .insert({ ...lead, empresa_arkos_id: empresa.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function atualizarLead(id: string, updates: Partial<Lead>) {
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function moverLeadEtapa(leadId: string, etapaId: string) {
  const { data, error } = await supabase
    .from('leads')
    .update({ etapa_id: etapaId })
    .eq('id', leadId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── PIPELINE ──────────────────────────────────────────────

export async function getPipelineComEtapas() {
  const { data: pipeline, error: errPipeline } = await supabase
    .from('pipelines')
    .select('*')
    .eq('is_padrao', true)
    .single()

  if (errPipeline) throw errPipeline

  const { data: etapas, error: errEtapas } = await supabase
    .from('etapas_pipeline')
    .select('*')
    .eq('pipeline_id', pipeline.id)
    .order('ordem')

  if (errEtapas) throw errEtapas

  return { pipeline, etapas: etapas ?? [] }
}

export async function getLeadsPorEtapa(pipelineId: string) {
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      etapas_pipeline (id, nome, cor, ordem),
      usuarios!leads_responsavel_id_fkey (id, nome, avatar_url)
    `)
    .eq('pipeline_id', pipelineId)
    .eq('is_arquivado', false)

  if (error) throw error
  return data ?? []
}

// ─── ATIVIDADES ────────────────────────────────────────────

export async function getAtividadesDoLead(leadId: string) {
  const { data, error } = await supabase
    .from('atividades')
    .select(`
      *,
      usuarios!atividades_usuario_id_fkey (id, nome, avatar_url)
    `)
    .eq('lead_id', leadId)
    .order('criado_em', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function criarAtividade(atividade: Partial<Atividade>) {
  const empresa = await getEmpresa()

  const { data, error } = await supabase
    .from('atividades')
    .insert({ ...atividade, empresa_arkos_id: empresa.id })
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── NOTAS ─────────────────────────────────────────────────

export async function getNotasDoLead(leadId: string) {
  const { data, error } = await supabase
    .from('notas')
    .select(`
      *,
      usuarios!notas_usuario_id_fkey (id, nome, avatar_url)
    `)
    .eq('lead_id', leadId)
    .order('criado_em', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function criarNota(nota: Partial<Nota>) {
  const empresa = await getEmpresa()

  const { data, error } = await supabase
    .from('notas')
    .insert({ ...nota, empresa_arkos_id: empresa.id })
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── TAREFAS ───────────────────────────────────────────────

export async function getTarefasDoLead(leadId: string) {
  const { data, error } = await supabase
    .from('tarefas')
    .select('*')
    .eq('lead_id', leadId)
    .order('data_vencimento', { ascending: true })

  if (error) throw error
  return data ?? []
}

// ─── DASHBOARD ─────────────────────────────────────────────

export async function getMetricasDashboard() {
  const empresa = await getEmpresa()

  const [
    { count: totalLeads },
    { count: leadsQuentes },
    { data: leadsFechados },
    { count: leadsAtivos },
  ] = await Promise.all([
    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_arkos_id', empresa.id)
      .eq('is_arquivado', false),

    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_arkos_id', empresa.id)
      .in('temperatura', ['quente', 'muito_quente'])
      .eq('is_arquivado', false),

    supabase
      .from('leads')
      .select('valor_fechado')
      .eq('empresa_arkos_id', empresa.id)
      .eq('status', 'ganho'),

    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_arkos_id', empresa.id)
      .not('status', 'in', '(ganho,perdido)')
      .eq('is_arquivado', false),
  ])

  const receitaTotal = (leadsFechados ?? []).reduce((acc: number, l: { valor_fechado: number | null }) => acc + (l.valor_fechado ?? 0), 0)

  return {
    totalLeads:    totalLeads    ?? 0,
    leadsQuentes:  leadsQuentes  ?? 0,
    leadsAtivos:   leadsAtivos   ?? 0,
    receitaTotal,
  }
}

// ─── AGENTES IA ────────────────────────────────────────────

export async function getAgentesIA() {
  const { data, error } = await supabase
    .from('agentes_ia')
    .select('*')
    .order('tipo')

  if (error) throw error
  return data ?? []
}
