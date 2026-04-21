'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { criarLead } from '@/lib/queries'
import type { TemperaturaLead, CanalOrigem, NivelPrioridade } from '@/lib/types'
import { Card, Button, Badge } from '@/components/ui'
import { ArrowLeft, Plus, FileText } from 'lucide-react'

export default function NovoLeadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    valor_estimado: '',
    temperatura: 'morno' as TemperaturaLead,
    canal_origem: 'whatsapp_direto' as CanalOrigem,
    prioridade: 'media' as NivelPrioridade,
    campanha_origem: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    try {
      await criarLead({
        titulo: form.titulo,
        descricao: form.descricao || undefined,
        valor_estimado: form.valor_estimado ? parseFloat(form.valor_estimado) : undefined,
        temperatura: form.temperatura,
        canal_origem: form.canal_origem,
        prioridade: form.prioridade,
        campanha_origem: form.campanha_origem || undefined,
        status: 'Triagem IA',
        score_qualificacao: 0,
        score_bant_budget: 0,
        score_bant_authority: 0,
        score_bant_need: 0,
        score_bant_timeline: 0,
        probabilidade: 0,
        is_arquivado: false,
        is_recorrente: false,
        requer_atencao: false,
        tags: [],
        moeda: 'BRL',
      })

      router.push('/leads')
    } catch (err) {
      console.error('Erro ao criar lead:', err)
      setErro('Erro ao criar o lead. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = cn(
    "w-full px-4 py-3 rounded-xl text-sm",
    "bg-arkos-surface-2 border border-arkos-border",
    "text-text-primary placeholder-text-muted",
    "focus:outline-none focus:border-arkos-blue focus:ring-1 focus:ring-arkos-blue/30",
    "transition-all duration-200"
  )
  const labelClass = "block text-xs font-medium text-text-secondary mb-1.5"

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
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-arkos-gold/10 border border-arkos-gold/20">
                <Plus className="h-5 w-5 text-arkos-gold" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">Novo Lead</h1>
                <p className="text-xs text-text-secondary mt-0.5">Adicione um novo lead ao pipeline</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FORMULÁRIO ─── */}
      <Card className="max-w-3xl">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-4 w-4 text-arkos-blue-light" />
          <span className="text-sm font-semibold text-text-primary">Informações do Lead</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label htmlFor="titulo" className={labelClass}>Título do Lead *</label>
              <input id="titulo" name="titulo" value={form.titulo} onChange={handleChange} className={inputClass} placeholder="Ex: Proposta para Empresa XYZ" required />
            </div>

            <div>
              <label htmlFor="valor_estimado" className={labelClass}>Valor Estimado (R$)</label>
              <input id="valor_estimado" name="valor_estimado" type="number" value={form.valor_estimado} onChange={handleChange} className={inputClass} placeholder="50000" />
            </div>

            <div>
              <label htmlFor="canal_origem" className={labelClass}>Canal de Origem</label>
              <select id="canal_origem" name="canal_origem" value={form.canal_origem} onChange={handleChange} className={inputClass}>
                <option value="whatsapp_direto">WhatsApp</option>
                <option value="instagram">Instagram</option>
                <option value="meta_ads">Meta Ads</option>
                <option value="google_ads">Google Ads</option>
                <option value="linkedin">LinkedIn</option>
                <option value="indicacao">Indicação</option>
                <option value="site_organico">Site Orgânico</option>
                <option value="prospeccao_outbound">Prospecção Outbound</option>
                <option value="email_marketing">E-mail Marketing</option>
                <option value="evento">Evento</option>
                <option value="parceiro">Parceiro</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div>
              <label htmlFor="temperatura" className={labelClass}>Temperatura</label>
              <select id="temperatura" name="temperatura" value={form.temperatura} onChange={handleChange} className={inputClass}>
                <option value="muito_quente">🚀 Muito Quente</option>
                <option value="quente">🔥 Quente</option>
                <option value="morno">🟡 Morno</option>
                <option value="frio">🔵 Frio</option>
              </select>
            </div>

            <div>
              <label htmlFor="prioridade" className={labelClass}>Prioridade</label>
              <select id="prioridade" name="prioridade" value={form.prioridade} onChange={handleChange} className={inputClass}>
                <option value="urgente">🚨 Urgente</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>

            <div>
              <label htmlFor="campanha_origem" className={labelClass}>Campanha de Origem</label>
              <input id="campanha_origem" name="campanha_origem" value={form.campanha_origem} onChange={handleChange} className={inputClass} placeholder="Nome da campanha (opcional)" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="descricao" className={labelClass}>Descrição</label>
              <textarea id="descricao" name="descricao" value={form.descricao} onChange={handleChange} className={`${inputClass} resize-none h-24`} placeholder="Detalhes sobre o lead, contexto, próximos passos..." />
            </div>
          </div>

          {erro && (
            <div className="mt-4 bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-danger text-xs">
              {erro}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-arkos-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="gold"
              disabled={loading}
              icon={<Plus className="h-3.5 w-3.5" />}
            >
              {loading ? 'Salvando...' : 'Criar Lead'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
