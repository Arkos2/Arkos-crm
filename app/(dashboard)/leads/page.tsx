'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn, formatarMoeda, corScore, corTemperatura, labelTemperatura, labelStatus, labelCanal } from '@/lib/utils'
import { getLeads } from '@/lib/queries'
import type { Lead, FiltroLead, StatusLead } from '@/lib/types'
import {
  Card,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  KPICard,
  EmptyState,
} from '@/components/ui'
import {
  Users,
  Plus,
  Search,
  Filter,
  Flame,
  Snowflake,
  Sun,
  Crown,
  Phone,
  Mail,
  ExternalLink,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Zap,
} from 'lucide-react'

const statusOptions = [
  { value: 'todos', label: 'Todos', icon: Users },
  { value: 'Triagem IA', label: 'Triagem IA', icon: Zap },
  { value: 'Qualificado >50k', label: 'Qualificado >50k', icon: TrendingUp },
  { value: 'Gold >300k', label: 'VIP Gold', icon: Crown },
  { value: 'Handoff Humano', label: 'Handoff', icon: Phone },
  { value: 'ganho', label: 'Ganhos', icon: DollarSign },
]

function getTemperatureIcon(temp: string) {
  if (temp === 'quente' || temp === 'muito_quente') return <Flame className="h-3 w-3" />
  if (temp === 'morno') return <Sun className="h-3 w-3" />
  return <Snowflake className="h-3 w-3" />
}

function getTemperatureBadgeVariant(temp: string): "danger" | "warning" | "blue" | "default" {
  if (temp === 'quente' || temp === 'muito_quente') return 'danger'
  if (temp === 'morno') return 'warning'
  return 'blue'
}

function getStatusBadgeVariant(status: string): "gold" | "blue" | "success" | "warning" | "danger" | "default" {
  if (status === 'Gold >300k') return 'gold'
  if (status === 'Qualificado >50k') return 'blue'
  if (status === 'ganho') return 'success'
  if (status === 'Handoff Humano') return 'warning'
  return 'default'
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    async function fetchLeads() {
      try {
        const filtros: FiltroLead = {}
        if (filtroStatus !== 'todos') {
          filtros.status = filtroStatus as StatusLead
        }
        if (busca) {
          filtros.busca = busca
        }

        const data = await getLeads(filtros)
        setLeads(data as Lead[])
      } catch (err) {
        console.error('Erro ao carregar leads:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [filtroStatus, busca])

  // KPI calculadas
  const totalLeads = leads.length
  const leadsQuentes = leads.filter(l => l.temperatura === 'quente' || l.temperatura === 'muito_quente').length
  const valorTotal = leads.reduce((acc, l) => acc + (Number(l.valor_estimado) || 0), 0)
  const leadsAtencao = leads.filter(l => l.requer_atencao).length

  return (
    <div className="space-y-6">

      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-arkos-gold/10 border border-arkos-gold/20">
              <Users className="h-5 w-5 text-arkos-gold" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                Leads
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                {totalLeads} leads no sistema
              </p>
            </div>
          </div>
        </div>
        <Link href="/leads/novo">
          <Button variant="gold" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
            Novo Lead
          </Button>
        </Link>
      </div>

      {/* ─── KPIs ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Total de Leads"
          value={totalLeads}
          valueFormat="number"
          icon={<Users className="h-4 w-4" />}
          iconColor="text-arkos-blue-light"
        />
        <KPICard
          title="Leads Quentes"
          value={leadsQuentes}
          valueFormat="number"
          icon={<Flame className="h-4 w-4" />}
          iconColor="text-danger"
        />
        <KPICard
          title="Pipeline Estimado"
          value={valorTotal}
          valueFormat="currency"
          icon={<DollarSign className="h-4 w-4" />}
          iconColor="text-arkos-gold"
        />
        <KPICard
          title="Requer Atenção"
          value={leadsAtencao}
          valueFormat="number"
          icon={<AlertCircle className="h-4 w-4" />}
          iconColor="text-danger"
        />
      </div>

      {/* ─── FILTROS ─── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar leads..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm",
              "bg-arkos-surface border border-arkos-border",
              "text-text-primary placeholder-text-muted",
              "focus:outline-none focus:border-arkos-blue focus:ring-1 focus:ring-arkos-blue/30",
              "transition-all duration-200"
            )}
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {statusOptions.map((opt) => {
            const Icon = opt.icon
            const isActive = filtroStatus === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setFiltroStatus(opt.value)
                  setLoading(true)
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap",
                  "border transition-all duration-200",
                  isActive
                    ? "bg-arkos-blue/10 text-arkos-blue-light border-arkos-blue/30"
                    : "bg-arkos-surface text-text-secondary border-arkos-border hover:text-text-primary hover:border-arkos-border-2"
                )}
              >
                <Icon className="h-3 w-3" />
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── LEADS GRID ─── */}
      {loading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-arkos-gold border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-text-muted">Carregando leads...</p>
          </div>
        </div>
      ) : leads.length === 0 ? (
        <EmptyState
          title="Nenhum lead encontrado"
          description="Tente ajustar os filtros ou adicione um novo lead."
          icon={<Users className="h-10 w-10" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {leads.map((lead) => (
            <Link key={lead.id} href={`/leads/${lead.id}`}>
              <Card className="group cursor-pointer card-hover hover:border-arkos-blue/30">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-arkos-blue-light transition-colors truncate">
                      {lead.titulo}
                    </h3>
                    <p className="text-2xs text-text-muted truncate mt-0.5">
                      {lead.contatos?.nome || lead.descricao || 'Sem contato'}
                    </p>
                  </div>

                  {/* Score */}
                  <div className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-xl text-xs font-bold shrink-0 ml-3",
                    lead.score_qualificacao >= 80 && "bg-success/10 text-success border border-success/20",
                    lead.score_qualificacao >= 50 && lead.score_qualificacao < 80 && "bg-warning/10 text-warning border border-warning/20",
                    lead.score_qualificacao < 50 && "bg-danger/10 text-danger border border-danger/20"
                  )}>
                    {lead.score_qualificacao}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge variant={getStatusBadgeVariant(lead.status)} size="sm">
                    {labelStatus(lead.status)}
                  </Badge>
                  <Badge variant={getTemperatureBadgeVariant(lead.temperatura)} size="sm">
                    {getTemperatureIcon(lead.temperatura)}
                    {labelTemperatura(lead.temperatura)}
                  </Badge>
                  {lead.requer_atencao && (
                    <Badge variant="danger" size="sm" dot dotAnimate>
                      Atenção
                    </Badge>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-arkos-border/50">
                  <span className="text-xs font-semibold text-text-primary">
                    {formatarMoeda(lead.valor_estimado || 0)}
                  </span>
                  <span className="text-2xs text-text-muted">
                    {labelCanal(lead.canal_origem)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
