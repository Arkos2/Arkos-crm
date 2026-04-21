// lib/types.ts

export type StatusAtivo = 'ativo' | 'inativo' | 'arquivado'

export type TemperaturaLead = 'frio' | 'morno' | 'quente' | 'muito_quente'

export type StatusLead =
  | 'Triagem IA'
  | 'Qualificado >50k'
  | 'Gold >300k'
  | 'Handoff Humano'
  | 'ganho'
  | 'perdido'
  | 'inativo'

export type TipoAtividade =
  | 'ligacao'
  | 'email'
  | 'whatsapp'
  | 'reuniao_presencial'
  | 'reuniao_online'
  | 'mensagem'
  | 'nota_interna'
  | 'tarefa'
  | 'follow_up'

export type NivelPrioridade = 'baixa' | 'media' | 'alta' | 'urgente'

export type CanalOrigem =
  | 'google_ads'
  | 'meta_ads'
  | 'linkedin'
  | 'instagram'
  | 'indicacao'
  | 'site_organico'
  | 'prospeccao_outbound'
  | 'whatsapp_direto'
  | 'email_marketing'
  | 'evento'
  | 'parceiro'
  | 'outros'

export type PapelUsuario =
  | 'super_admin'
  | 'admin'
  | 'gestor_comercial'
  | 'vendedor'
  | 'sdr'
  | 'visualizador'

export type TipoAgenteIA = 'qualifier' | 'follow' | 'insight' | 'chat'

// ─── Entidades ────────────────────────────────────────────

export interface EmpresaArkos {
  id: string
  nome: string
  cnpj?: string
  email: string
  telefone?: string
  site?: string
  logo_url?: string
  plano: string
  status: StatusAtivo
  max_usuarios: number
  max_leads_mes: number
  configuracoes: Record<string, unknown>
  criado_em: string
  updated_at: string
}

export interface Usuario {
  id: string
  empresa_id: string
  nome: string
  email: string
  telefone?: string
  whatsapp?: string
  papel: PapelUsuario
  avatar_url?: string
  status: StatusAtivo
  ultimo_acesso?: string
  meta_mensal: number
  criado_em: string
  updated_at: string
}

export interface Pipeline {
  id: string
  empresa_id: string
  nome: string
  descricao?: string
  is_padrao: boolean
  status: StatusAtivo
  criado_por?: string
  criado_em: string
  updated_at: string
}

export interface EtapaPipeline {
  id: string
  pipeline_id: string
  nome: string
  descricao?: string
  ordem: number
  cor: string
  probabilidade_fechamento: number
  is_etapa_final_ganho: boolean
  is_etapa_final_perda: boolean
  limite_cards?: number
  criado_em: string
  updated_at: string
}

export interface EmpresaCliente {
  id: string
  empresa_arkos_id: string
  nome: string
  cnpj?: string
  segmento?: string
  site?: string
  telefone?: string
  email?: string
  cidade?: string
  estado?: string
  faturamento_min?: number
  faturamento_max?: number
  status: StatusAtivo
  tags: string[]
  criado_em: string
  updated_at: string
}

export interface Contato {
  id: string
  empresa_arkos_id: string
  empresa_cliente_id?: string
  nome: string
  sobrenome?: string
  cargo?: string
  email?: string
  telefone?: string
  whatsapp?: string
  linkedin?: string
  is_decisor: boolean
  is_influenciador: boolean
  status: StatusAtivo
  tags: string[]
  criado_em: string
  updated_at: string
}

export interface Lead {
  id: string
  empresa_arkos_id: string
  pipeline_id?: string
  etapa_id?: string
  responsavel_id?: string
  contato_id?: string
  empresa_cliente_id?: string
  titulo: string
  nome?: string
  telefone?: string
  faturamento_mensal: number
  score_ia: number
  descricao?: string
  valor_estimado?: number
  valor_fechado?: number
  moeda: string
  temperatura: TemperaturaLead
  score_qualificacao: number
  score_bant_budget: number
  score_bant_authority: number
  score_bant_need: number
  score_bant_timeline: number
  resumo_ia?: string
  proximo_passo_ia?: string
  objecoes_detectadas?: string[]
  canal_origem: CanalOrigem
  campanha_origem?: string
  status: StatusLead
  prioridade: NivelPrioridade
  data_primeiro_contato?: string
  data_ultima_atividade?: string
  data_fechamento_prev?: string
  data_fechamento_real?: string
  motivo_perda?: string
  probabilidade: number
  is_arquivado: boolean
  is_recorrente: boolean
  requer_atencao: boolean
  tags: string[]
  criado_por?: string
  criado_em: string
  updated_at: string
  // Joins opcionais
  etapas_pipeline?: EtapaPipeline
  usuarios?: Usuario
  contatos?: Contato
}

export interface Atividade {
  id: string
  empresa_arkos_id: string
  lead_id?: string
  contato_id?: string
  usuario_id?: string
  tipo: TipoAtividade
  status: string
  titulo: string
  descricao?: string
  resultado?: string
  duracao_minutos?: number
  is_gerado_ia: boolean
  agendado_para?: string
  realizado_em: string
  criado_em: string
}

export interface Tarefa {
  id: string
  empresa_arkos_id: string
  lead_id?: string
  responsavel_id?: string
  titulo: string
  descricao?: string
  prioridade: NivelPrioridade
  status: string
  tipo: TipoAtividade
  is_gerado_ia: boolean
  data_vencimento?: string
  concluida_em?: string
  criado_em: string
}

export interface Nota {
  id: string
  empresa_arkos_id: string
  lead_id?: string
  usuario_id?: string
  conteudo: string
  is_privada: boolean
  is_gerado_ia: boolean
  criado_em: string
}

export interface AgenteIA {
  id: string
  empresa_arkos_id: string
  tipo: TipoAgenteIA
  nome: string
  descricao?: string
  status: StatusAtivo
  modelo_llm: string
  temperatura_llm: number
  max_tokens: number
  prompt_sistema?: string
  total_execucoes: number
  total_sucesso: number
  total_falhas: number
  ultimo_uso?: string
  criado_em: string
}

// ─── Tipos de UI ──────────────────────────────────────────

export interface KanbanColuna {
  etapa: EtapaPipeline
  leads: Lead[]
  total_valor: number
}

export interface MetricaDashboard {
  label: string
  valor: number | string
  variacao?: number
  icone?: string
  cor?: string
}

export interface FiltroLead {
  status?: StatusLead
  temperatura?: TemperaturaLead
  responsavel_id?: string
  canal_origem?: CanalOrigem
  prioridade?: NivelPrioridade
  busca?: string
  etapa_id?: string
  data_inicio?: string
  data_fim?: string
}
