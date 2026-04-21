"use client";

import { BANTCollection } from "@/lib/types/agent";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface BANTLiveMeterProps {
  bant: BANTCollection;
  compact?: boolean;
}

const DIMENSIONS = [
  { key: "budget" as const, label: "Budget", short: "B", desc: "Orçamento" },
  { key: "authority" as const, label: "Authority", short: "A", desc: "Decisor" },
  { key: "need" as const, label: "Need", short: "N", desc: "Necessidade" },
  { key: "timeline" as const, label: "Timeline", short: "T", desc: "Prazo" },
];

function getColor(value: number, max = 25) {
  const pct = (value / max) * 100;
  if (pct >= 80) return { bar: "bg-success", text: "text-success", ring: "border-success/40" };
  if (pct >= 50) return { bar: "bg-warning", text: "text-warning", ring: "border-warning/40" };
  if (pct > 0) return { bar: "bg-info", text: "text-info", ring: "border-info/40" };
  return { bar: "bg-arkos-surface-3", text: "text-text-muted", ring: "border-arkos-border" };
}

function getTotalStatus(total: number) {
  if (total >= 75) return { label: "✅ Qualificado", color: "text-success", bg: "bg-success/10", border: "border-success/30" };
  if (total >= 50) return { label: "⚡ Parcial", color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" };
  if (total >= 25) return { label: "🔍 Em Qualificação", color: "text-info", bg: "bg-info/10", border: "border-info/30" };
  return { label: "⏳ Coletando Dados", color: "text-text-muted", bg: "bg-arkos-surface-2", border: "border-arkos-border" };
}

export function BANTLiveMeter({ bant, compact = false }: BANTLiveMeterProps) {
  const total = bant.total || 0;
  const status = getTotalStatus(total);

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-arkos-surface-2 border border-arkos-border">
        <div className="flex items-end gap-1 h-6">
          {DIMENSIONS.map((dim) => {
            const pct = ((bant[dim.key] || 0) / 25) * 100;
            const color = getColor(bant[dim.key] || 0);
            return (
              <div key={dim.key} className="flex flex-col items-center gap-0.5">
                <div className="w-2 h-5 bg-arkos-surface-3 rounded-sm overflow-hidden relative">
                  <div
                    className={cn("absolute bottom-0 w-full rounded-sm transition-all duration-700", color.bar)}
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-2xs text-text-muted">{dim.short}</span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col">
          <span className={cn("text-lg font-bold", status.color)}>
            {total}
            <span className="text-xs text-text-muted font-normal">/100</span>
          </span>
          <span className="text-2xs text-text-muted">{status.label}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Status total */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 rounded-xl border",
        status.bg, status.border
      )}>
        <div>
          <p className="text-2xs text-text-muted">BANT Score</p>
          <p className={cn("text-sm font-bold", status.color)}>{status.label}</p>
        </div>
        <div className="text-right">
          <p className={cn("text-3xl font-bold", status.color)}>{total}</p>
          <p className="text-2xs text-text-muted">/100 pontos</p>
        </div>
      </div>

      {/* Barra geral */}
      <div className="h-2 bg-arkos-surface-3 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            total >= 75 ? "bg-success" : total >= 50 ? "bg-warning" : "bg-info"
          )}
          style={{ width: `${Math.min(total, 100)}%` }}
        />
      </div>

      {/* Dimensões individuais */}
      <div className="grid grid-cols-2 gap-2">
        {DIMENSIONS.map((dim) => {
          const value = bant[dim.key] || 0;
          const pct = (value / 25) * 100;
          const color = getColor(value);
          const textValue = bant[`${dim.key}Text` as keyof BANTCollection] as string | undefined;

          return (
            <div
              key={dim.key}
              className={cn(
                "p-3 rounded-xl border transition-all duration-300",
                value > 0 ? cn(color.ring, "bg-arkos-surface-2") : "border-arkos-border bg-arkos-surface"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-arkos-surface-3 flex items-center justify-center text-2xs font-bold text-text-muted">
                    {dim.short}
                  </span>
                  <span className="text-xs font-medium text-text-secondary">
                    {dim.desc}
                  </span>
                </div>
                <span className={cn("text-xs font-bold", color.text)}>
                  {value}/25
                </span>
              </div>

              <div className="h-1 bg-arkos-surface-3 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", color.bar)}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {textValue && (
                <p className="text-2xs text-text-muted mt-1.5 leading-relaxed line-clamp-2 italic">
                  &quot;{textValue}&quot;
                </p>
              )}

              {value === 0 && (
                <p className="text-2xs text-text-muted mt-1.5">
                  Aguardando informação...
                </p>
              )}
            </div>
          );
        })}
      </div>

      {total >= 70 && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-success/10 border border-success/30">
          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
          <p className="text-xs text-success font-medium">
            Lead qualificado! Pronto para criar negócio no pipeline.
          </p>
        </div>
      )}
    </div>
  );
}
