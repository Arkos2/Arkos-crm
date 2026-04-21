"use client";

import { PeerComparison } from "@/lib/types/coach";
import { cn, formatCurrency } from "@/lib/utils";
import { Trophy, TrendingUp } from "lucide-react";

interface PeerComparisonChartProps {
  comparisons: PeerComparison[];
  sellerName: string;
}

function formatValue(value: number, unit: string): string {
  if (unit === "") return formatCurrency(value);
  return `${value}${unit}`;
}

export function PeerComparisonChart({
  comparisons,
  sellerName,
}: PeerComparisonChartProps) {
  return (
    <div className="space-y-4">
      {/* Legenda */}
      <div className="flex items-center gap-4 text-2xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-arkos-blue" />
          <span className="text-text-muted">{sellerName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-arkos-surface-3 border border-arkos-border" />
          <span className="text-text-muted">Média equipe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Trophy className="h-3 w-3 text-arkos-gold" />
          <span className="text-text-muted">Top performer</span>
        </div>
      </div>

      {/* Métricas */}
      <div className="space-y-5">
        {comparisons.map((comp) => {
          const maxValue = Math.max(
            comp.sellerValue,
            comp.teamAvg,
            comp.topPerformerValue
          );

          const sellerPct = (comp.sellerValue / maxValue) * 100;
          const teamPct = (comp.teamAvg / maxValue) * 100;
          const topPct = (comp.topPerformerValue / maxValue) * 100;

          // Para métricas onde menos é melhor (ex: ciclo), inverter a cor
          const isSellerGood = comp.higherIsBetter
            ? comp.sellerValue >= comp.teamAvg
            : comp.sellerValue <= comp.teamAvg;

          const isSellerTop = comp.higherIsBetter
            ? comp.sellerValue >= comp.topPerformerValue
            : comp.sellerValue <= comp.topPerformerValue;

          return (
            <div key={comp.metric} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary">
                  {comp.metric}
                </span>
                <div className="flex items-center gap-2">
                  {isSellerTop && (
                    <Trophy className="h-3.5 w-3.5 text-arkos-gold" />
                  )}
                  <span
                    className={cn(
                      "text-sm font-bold",
                      isSellerTop
                        ? "text-success"
                        : isSellerGood
                        ? "text-arkos-blue-light"
                        : "text-warning"
                    )}
                  >
                    {formatValue(comp.sellerValue, comp.unit)}
                  </span>
                </div>
              </div>

              {/* Barras */}
              <div className="space-y-1.5">
                {/* Vendedor */}
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-text-muted w-14 shrink-0 text-right">
                    Você
                  </span>
                  <div className="flex-1 h-2.5 bg-arkos-surface-3 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        isSellerTop
                          ? "bg-success"
                          : isSellerGood
                          ? "bg-arkos-blue"
                          : "bg-warning"
                      )}
                      style={{
                        width: `${comp.higherIsBetter ? sellerPct : 100 - sellerPct + topPct}%`,
                      }}
                    />
                  </div>
                  <span className="text-2xs font-bold text-text-primary w-16 shrink-0">
                    {formatValue(comp.sellerValue, comp.unit)}
                  </span>
                </div>

                {/* Média equipe */}
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-text-muted w-14 shrink-0 text-right">
                    Média
                  </span>
                  <div className="flex-1 h-2.5 bg-arkos-surface-3 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-arkos-surface-2 border border-arkos-border transition-all duration-700"
                      style={{
                        width: `${comp.higherIsBetter ? teamPct : 100 - teamPct + topPct}%`,
                      }}
                    />
                  </div>
                  <span className="text-2xs text-text-muted w-16 shrink-0">
                    {formatValue(comp.teamAvg, comp.unit)}
                  </span>
                </div>

                {/* Top performer */}
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-arkos-gold w-14 shrink-0 text-right">
                    Top 🏆
                  </span>
                  <div className="flex-1 h-2.5 bg-arkos-surface-3 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-arkos-gold/40 border border-arkos-gold/30 transition-all duration-700"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <span className="text-2xs text-arkos-gold font-bold w-16 shrink-0">
                    {formatValue(comp.topPerformerValue, comp.unit)}
                  </span>
                </div>
              </div>

              {/* Gap para o top */}
              {!isSellerTop && (
                <div className="flex items-center gap-1.5 text-2xs text-text-muted pl-16">
                  <TrendingUp className="h-3 w-3" />
                  <span>
                    Gap para o top:{" "}
                    <strong className="text-text-secondary">
                      {comp.higherIsBetter
                        ? formatValue(
                            comp.topPerformerValue - comp.sellerValue,
                            comp.unit
                          )
                        : formatValue(
                            comp.sellerValue - comp.topPerformerValue,
                            comp.unit
                          )}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
