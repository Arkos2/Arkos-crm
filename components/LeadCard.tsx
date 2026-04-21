import Link from 'next/link'
import { formatarMoeda, corScore, corTemperatura, labelTemperatura, labelStatus, corStatus, labelCanal } from '@/lib/utils'
import type { Lead } from '@/lib/types'

interface LeadCardProps {
  lead: Lead
}

export default function LeadCard({ lead }: LeadCardProps) {
  return (
    <Link href={`/leads/${lead.id}`}>
      <div className="glass rounded-2xl p-5 hover:border-arkos-gold/40 hover:glow-gold transition-smooth cursor-pointer group">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-arkos-text group-hover:text-arkos-accent-light transition-smooth truncate">
              {lead.titulo}
            </h3>
            <p className="text-sm text-arkos-muted truncate">
              {lead.contatos?.nome || lead.descricao || 'Sem contato'}
            </p>
          </div>
          <span className={`text-lg font-bold ${corScore(lead.score_qualificacao)}`}>
            {lead.score_qualificacao}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${corStatus(lead.status)}`}>
            {labelStatus(lead.status)}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${corTemperatura(lead.temperatura)}`}>
            {labelTemperatura(lead.temperatura)}
          </span>
          {lead.requer_atencao && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-live" />
              Atenção
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-arkos-border/50">
          <span className="text-sm font-medium text-arkos-text">
            {formatarMoeda(lead.valor_estimado || 0)}
          </span>
          <span className="text-xs text-arkos-muted">
            {labelCanal(lead.canal_origem)}
          </span>
        </div>
      </div>
    </Link>
  )
}
