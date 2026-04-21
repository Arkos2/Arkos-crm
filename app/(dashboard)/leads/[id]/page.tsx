'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { cn, formatarMoeda, formatarData, corScore, labelTemperatura, labelStatus, labelCanal, labelPrioridade, diasAtras } from '@/lib/utils'
import { getLeadById, getAtividadesDoLead, getNotasDoLead } from '@/lib/queries'
import type { Lead, Atividade, Nota } from '@/lib/types'
import { Card, Badge, Button, ProgressBar } from '@/components/ui'
import {
  ArrowLeft,
  Bot,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Target,
  DollarSign,
  Clock,
  User,
  FileText,
  AlertCircle,
} from 'lucide-react'

function getStatusBadgeVariant(status: string): "gold" | "blue" | "success" | "warning" | "danger" | "default" {
  if (status === 'Gold >300k') return 'gold'
  if (status === 'Qualificado >50k') return 'blue'
  if (status === 'ganho') return 'success'
  if (status === 'Handoff Humano') return 'warning'
  return 'default'
}

function getTemperatureBadgeVariant(temp: string): "danger" | "warning" | "blue" | "default" {
  if (temp === 'quente' || temp === 'muito_quente') return 'danger'
  if (temp === 'morno') return 'warning'
  return 'blue'
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [notas, setNotas] = useState<Nota[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLead() {
      try {
        const id = params.id as string
        const [leadData, atividadesData, notasData] = await Promise.all([
          getLeadById(id),
          getAtividadesDoLead(id),
          getNotasDoLead(id),
        ])

        setLead(leadData as Lead)
        setAtividades(atividadesData as Atividade[])
        setNotas(notasData as Nota[])
      } catch (err) {
        console.error('Erro ao carregar lead:', err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) fetchLead()
  }, [params.id])

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-arkos-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-text-muted">Carregando lead...</p>
      </div>
    </div>
  )

  if (!lead) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <AlertCircle className="h-10 w-10 text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary">Lead não encontrado.</p>
        <Button variant="ghost" size="sm" className="mt-3" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-arkos-surface-2 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">{lead.titulo}</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              {lead.contatos ? `${lead.contatos.nome} ${lead.contatos.sobrenome || ''}`.trim() : 'Sem contato vinculado'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant={getStatusBadgeVariant(lead.status)} size="md">
            {labelStatus(lead.status)}
          </Badge>
          <Badge variant={getTemperatureBadgeVariant(lead.temperatura)} size="md">
            {labelTemperatura(lead.temperatura)}
          </Badge>
          {lead.requer_atencao && (
            <Badge variant="danger" dot dotAnimate size="md">
              Atenção
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start gap-5">
        {/* ═══ COLUNA PRINCIPAL ═══ */}
        <div className="flex-1 space-y-5">

          {/* Métricas Rápidas */}
          <Card>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-2xs text-text-muted mb-1 flex items-center gap-1.5">
                  <Target className="h-3 w-3" /> Score
                </p>
                <p className={cn(
                  "text-xl font-bold",
                  lead.score_qualificacao >= 80 ? "text-success" :
                  lead.score_qualificacao >= 50 ? "text-warning" : "text-danger"
                )}>
                  {lead.score_qualificacao}
                </p>
              </div>
              <div>
                <p className="text-2xs text-text-muted mb-1 flex items-center gap-1.5">
                  <DollarSign className="h-3 w-3" /> Valor Estimado
                </p>
                <p className="text-lg font-semibold text-text-primary">
                  {formatarMoeda(lead.valor_estimado || 0)}
                </p>
              </div>
              <div>
                <p className="text-2xs text-text-muted mb-1 flex items-center gap-1.5">
                  <MessageSquare className="h-3 w-3" /> Canal
                </p>
                <p className="text-sm text-text-primary">{labelCanal(lead.canal_origem)}</p>
              </div>
              <div>
                <p className="text-2xs text-text-muted mb-1 flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3" /> Prioridade
                </p>
                <p className="text-sm text-text-primary">{labelPrioridade(lead.prioridade)}</p>
              </div>
            </div>
          </Card>

          {/* BANT Scores */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-4 w-4 text-arkos-gold" />
              <span className="text-sm font-semibold text-text-primary">Qualificação BANT</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Budget', value: lead.score_bant_budget },
                { label: 'Authority', value: lead.score_bant_authority },
                { label: 'Need', value: lead.score_bant_need },
                { label: 'Timeline', value: lead.score_bant_timeline },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-2xs text-text-muted uppercase tracking-wider mb-2">{item.label}</p>
                  <div className={cn(
                    "text-lg font-bold",
                    (item.value || 0) >= 80 ? "text-success" :
                    (item.value || 0) >= 50 ? "text-warning" : "text-danger"
                  )}>
                    {item.value || 0}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Detalhes */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-arkos-blue-light" />
              <span className="text-sm font-semibold text-text-primary">Detalhes</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-2xs text-text-muted mb-1">Responsável</p>
                <p className="text-xs text-text-primary">{lead.usuarios?.nome || '—'}</p>
              </div>
              <div>
                <p className="text-2xs text-text-muted mb-1">Probabilidade</p>
                <p className="text-xs text-text-primary">{lead.probabilidade}%</p>
              </div>
              <div>
                <p className="text-2xs text-text-muted mb-1">Última Atividade</p>
                <p className="text-xs text-text-primary">
                  {lead.data_ultima_atividade ? `${diasAtras(lead.data_ultima_atividade)} dias atrás` : '—'}
                </p>
              </div>
              <div>
                <p className="text-2xs text-text-muted mb-1">Previsão Fechamento</p>
                <p className="text-xs text-text-primary">{formatarData(lead.data_fechamento_prev) || '—'}</p>
              </div>
              {lead.contatos?.email && (
                <div>
                  <p className="text-2xs text-text-muted mb-1">Email</p>
                  <p className="text-xs text-text-primary">{lead.contatos.email}</p>
                </div>
              )}
              {lead.contatos?.whatsapp && (
                <div>
                  <p className="text-2xs text-text-muted mb-1">WhatsApp</p>
                  <p className="text-xs text-text-primary">{lead.contatos.whatsapp}</p>
                </div>
              )}
            </div>
          </Card>

          {/* AI Summary */}
          {lead.resumo_ia && (
            <Card className="border-arkos-blue/20 bg-gradient-to-r from-arkos-blue/5 to-transparent">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="h-4 w-4 text-arkos-gold" />
                <span className="text-sm font-semibold text-text-primary">Resumo IA</span>
                <Badge variant="gold" size="sm">Agente Lucas</Badge>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{lead.resumo_ia}</p>
              {lead.proximo_passo_ia && (
                <div className="mt-3 pt-3 border-t border-arkos-border">
                  <p className="text-2xs text-text-muted mb-1">Próximo Passo Sugerido:</p>
                  <p className="text-xs text-arkos-blue-light font-medium">{lead.proximo_passo_ia}</p>
                </div>
              )}
            </Card>
          )}

          {/* Notas */}
          {notas.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-text-secondary" />
                <span className="text-sm font-semibold text-text-primary">Notas</span>
                <Badge variant="default" size="sm">{notas.length}</Badge>
              </div>
              <div className="space-y-2.5">
                {notas.map((nota) => (
                  <div key={nota.id} className="bg-arkos-surface-2 rounded-xl p-3">
                    <p className="text-xs text-text-primary">{nota.conteudo}</p>
                    <p className="text-2xs text-text-muted mt-1.5">
                      {formatarData(nota.criado_em)}
                      {nota.is_gerado_ia && (
                        <span className="inline-flex items-center gap-1 ml-1.5 text-arkos-gold">
                          <Bot className="h-2.5 w-2.5" /> Gerado por IA
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* ═══ COLUNA LATERAL — TIMELINE ═══ */}
        <div className="w-full lg:w-80 shrink-0">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-text-secondary" />
              <span className="text-sm font-semibold text-text-primary">Atividades</span>
              <Badge variant="default" size="sm">{atividades.length}</Badge>
            </div>

            {atividades.length === 0 ? (
              <p className="text-text-muted text-xs text-center py-6">Nenhuma atividade registrada.</p>
            ) : (
              <div className="space-y-3.5">
                {atividades.map((atividade) => (
                  <div key={atividade.id} className="relative pl-5 border-l border-arkos-border">
                    <div className={cn(
                      "absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full",
                      atividade.is_gerado_ia ? 'bg-arkos-gold' : 'bg-success'
                    )} />
                    <p className="text-2xs text-text-muted mb-0.5">
                      {formatarData(atividade.criado_em)}
                      {atividade.is_gerado_ia && (
                        <span className="inline-flex items-center gap-0.5 ml-1 text-arkos-gold">
                          <Bot className="h-2 w-2" />
                        </span>
                      )}
                    </p>
                    <p className="text-xs font-medium text-text-primary">{atividade.titulo}</p>
                    {atividade.descricao && (
                      <p className="text-2xs text-text-muted mt-0.5">{atividade.descricao}</p>
                    )}
                    <span className="text-2xs text-text-muted/60 mt-0.5 inline-block capitalize">
                      {atividade.tipo.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
