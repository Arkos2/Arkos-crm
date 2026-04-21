'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Lead } from '@/lib/types'
import { formatarMoeda, corScore } from '@/lib/utils'

interface SortableLeadCardProps {
  lead: Lead
}

export default function SortableLeadCard({ lead }: SortableLeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id, data: { lead } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Se o drag está ocorrendo ativamente, deixa semi-transparente
  const draggingClass = isDragging ? 'opacity-40 border-arkos-gold' : ''
  const pulseClass = lead.status === 'Gold >300k' && !isDragging ? 'hover:glow-gold animate-pulse-live border-arkos-gold/30' : 'hover:border-white/10'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`glass rounded-xl p-4 cursor-grab active:cursor-grabbing transition-smooth bg-[#13151b] border border-white/5 mb-3 select-none ${draggingClass} ${pulseClass}`}
    >
      <div className="flex items-start justify-between mb-2 pointer-events-none">
        <h4 className="font-medium text-arkos-text text-sm line-clamp-2">
          {lead.nome || lead.titulo}
        </h4>
        <span className={`text-xs font-bold ml-2 ${corScore(lead.score_ia || 0)}`}>
          {lead.score_ia}
        </span>
      </div>
      
      {lead.faturamento_mensal > 0 && (
        <p className="text-xs text-arkos-muted mb-2 pointer-events-none">
          Receita: {formatarMoeda(lead.faturamento_mensal)}
        </p>
      )}

      <div className="flex items-center justify-between pointer-events-none mt-3 mt-auto">
        <span className="text-xs text-arkos-muted/50 font-medium">
          {lead.canal_origem?.replace('_', ' ')}
        </span>
        {lead.status === 'Gold >300k' && (
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#C9A84C]/20 text-[#C9A84C] font-semibold tracking-wider">
            VIP ⚜
          </span>
        )}
      </div>
    </div>
  )
}
