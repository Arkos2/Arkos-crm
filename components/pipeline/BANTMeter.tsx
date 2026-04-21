"use client";

import { BANTScore } from "@/lib/types/deal";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";

interface BANTMeterProps {
  bant: BANTScore;
  compact?: boolean;
  showLabels?: boolean;
}

const BANT_LABELS = {
  budget: { short: "B", full: "Budget", desc: "Orçamento disponível" },
  authority: { short: "A", full: "Authority", desc: "Poder de decisão" },
  need: { short: "N", full: "Need", desc: "Necessidade real" },
  timeline: { short: "T", full: "Timeline", desc: "Prazo de implementação" },
};

function getBANTColor(value: number, max = 25) {
  const pct = (value / max) * 100;
  if (pct >= 80) return { bar: "bg-success", text: "text-success" };
  if (pct >= 50) return { bar: "bg-warning", text: "text-warning" };
  return { bar: "bg-danger", text: "text-danger" };
}

function getTotalColor(total: number) {
  if (total >= 75) return { ring: "border-success/40", bg: "bg-success/10", text: "text-success", label: "Qualificado" };
  if (total >= 50) return { ring: "border-warning/40", bg: "bg-warning/10", text: "text-warning", label: "Parcial" };
  return { ring: "border-danger/40", bg: "bg-danger/10", text: "text-danger", label: "Fraco" };
}

// ─── VERSÃO COMPACT (para o card do kanban) ───
export function BANTMeterCompact({ bant }: { bant: BANTScore }) {
  const totalColor = getTotalColor(bant.total);

  return (
    <div className="flex items-center gap-2">
      {/* Mini barras */}
      <div className="flex items-end gap-0.5 h-4">
        {(["budget", "authority", "need", "timeline"] as const).map((key) => {
          const pct = (bant[key] / 25) * 100;
          const color = getBANTColor(bant[key]);
          return (
            <div
              key={key}
              className="w-1.5 bg-arkos-surface-3 rounded-full overflow-hidden"
              style={{ height: "100%" }}
            >
              <div
                className={cn("w-full rounded-full transition-all duration-500", color.bar)}
                style={{ height: `${pct}%`, marginTop: "auto" }}
              />
            </div>
          );
        })}
      </div>

      {/* Score total */}
      <span className={cn("text-2xs font-bold", totalColor.text)}>
        {bant.total}/100
      </span>

      {/* Label */}
      <span
        className={cn(
          "text-2xs px-1.5 py-0.5 rounded-full border font-medium",
          totalColor.bg,
          totalColor.ring,
          totalColor.text
        )}
      >
        {totalColor.label}
      </span>
    </div>
  );
}

// ─── VERSÃO COMPLETA (para o detalhe do negócio) ───
export function BANTMeterFull({ bant, showLabels = true }: BANTMeterProps) {
  const totalColor = getTotalColor(bant.total);

  return (
    <div className="space-y-4">
      {/* Header com score total */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-text-primary">
            BANT Score
          </h4>
          <div className="group relative">
            <HelpCircle className="h-3.5 w-3.5 text-text-muted cursor-help" />
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-56 p-3 rounded-lg bg-arkos-surface-3 border border-arkos-border-2 text-2xs text-text-secondary opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-arkos">
              Metodologia BANT qualifica leads por Budget (orçamento),
              Authority (decisor), Need (necessidade) e Timeline (prazo).
              Score ≥ 75 indica lead qualificado.
            </div>
          </div>
        </div>

        {/* Badge total */}
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl border",
            totalColor.bg,
            totalColor.ring
          )}
        >
          <span className={cn("text-xl font-bold", totalColor.text)}>
            {bant.total}
          </span>
          <div className="flex flex-col">
            <span className="text-2xs text-text-muted leading-none">/100</span>
            <span className={cn("text-2xs font-semibold leading-none", totalColor.text)}>
              {totalColor.label}
            </span>
          </div>
        </div>
      </div>

      {/* Barras individuais */}
      <div className="space-y-3">
        {(["budget", "authority", "need", "timeline"] as const).map((key) => {
          const config = BANT_LABELS[key];
          const value = bant[key];
          const pct = (value / 25) * 100;
          const color = getBANTColor(value);

          return (
            <div key={key} className="space-y-1">
              {showLabels && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center text-2xs font-bold",
                        "bg-arkos-surface-3 text-text-secondary"
                      )}
                    >
                      {config.short}
                    </span>
                    <span className="text-xs font-medium text-text-secondary">
                      {config.full}
                    </span>
                    <span className="text-2xs text-text-muted hidden sm:inline">
                      — {config.desc}
                    </span>
                  </div>
                  <span className={cn("text-xs font-bold", color.text)}>
                    {value}/25
                  </span>
                </div>
              )}

              {/* Barra segmentada */}
              <div className="flex gap-0.5 h-2">
                {[1, 2, 3, 4, 5].map((segment) => {
                  const segmentThreshold = segment * 5;
                  const filled = value >= segmentThreshold;
                  const partial =
                    !filled && value > (segment - 1) * 5;
                  const partialPct = partial
                    ? ((value - (segment - 1) * 5) / 5) * 100
                    : 0;

                  return (
                    <div
                      key={segment}
                      className="flex-1 bg-arkos-surface-3 rounded-sm overflow-hidden relative"
                    >
                      {filled && (
                        <div className={cn("absolute inset-0", color.bar)} />
                      )}
                      {partial && (
                        <div
                          className={cn("absolute inset-y-0 left-0", color.bar)}
                          style={{ width: `${partialPct}%` }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Radar visual simplificado */}
      <div className="pt-2 border-t border-arkos-border">
        <div className="grid grid-cols-4 gap-2">
          {(["budget", "authority", "need", "timeline"] as const).map((key) => {
            const config = BANT_LABELS[key];
            const value = bant[key];
            const pct = Math.round((value / 25) * 100);
            const color = getBANTColor(value);

            return (
              <div key={key} className="flex flex-col items-center gap-1">
                {/* Círculo de progresso mini */}
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18" cy="18" r="14"
                      fill="none"
                      stroke="#1e2433"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18" cy="18" r="14"
                      fill="none"
                      stroke={
                        pct >= 80 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444"
                      }
                      strokeWidth="3"
                      strokeDasharray={`${(pct / 100) * 87.96} 87.96`}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xs font-bold text-text-primary">
                    {value}
                  </span>
                </div>
                <span className="text-2xs text-text-muted">{config.short}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
