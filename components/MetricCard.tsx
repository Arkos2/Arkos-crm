interface MetricCardProps {
  titulo: string
  valor: string
  icone: string
  cor: string
  subtexto?: string
}

export default function MetricCard({ titulo, valor, icone, cor, subtexto }: MetricCardProps) {
  return (
    <div className={`glass rounded-2xl p-5 bg-gradient-to-br ${cor} hover:scale-[1.02] hover:glow-gold hover:border-arkos-gold/40 transition-smooth cursor-default`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icone}</span>
      </div>
      <p className="text-2xl font-bold text-arkos-text">{valor}</p>
      <p className="text-sm text-arkos-muted mt-1">{titulo}</p>
      {subtexto && (
        <p className="text-xs text-arkos-muted/60 mt-2">{subtexto}</p>
      )}
    </div>
  )
}
