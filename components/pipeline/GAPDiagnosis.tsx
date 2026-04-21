"use client";

import { useState } from "react";
import { GAPDiagnosis as GAPType, GapLevel } from "@/lib/types/deal";
import { cn } from "@/lib/utils";
import { ArrowRight, Flame, Edit3, Check, X } from "lucide-react";
import { Button } from "@/components/ui";

interface GAPDiagnosisProps {
  gap: GAPType;
  onUpdate?: (gap: Partial<GAPType>) => void;
  readOnly?: boolean;
}

const GAP_CONFIG: Record<GapLevel, { label: string; color: string; bg: string; border: string }> = {
  low: {
    label: "Baixo",
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/20",
  },
  medium: {
    label: "Médio",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
  high: {
    label: "Alto",
    color: "text-danger",
    bg: "bg-danger/10",
    border: "border-danger/20",
  },
};

function UrgencyStars({
  value,
  onChange,
  readOnly,
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={cn(
            "text-lg transition-all duration-150",
            !readOnly && "cursor-pointer hover:scale-110",
            readOnly && "cursor-default",
            (hover || value) >= star
              ? "text-arkos-gold"
              : "text-arkos-surface-3"
          )}
        >
          ★
        </button>
      ))}
      <span className="text-xs text-text-muted ml-1">
        {value === 5
          ? "Crítico"
          : value === 4
          ? "Alto"
          : value === 3
          ? "Médio"
          : value === 2
          ? "Baixo"
          : "Mínimo"}
      </span>
    </div>
  );
}

export function GAPDiagnosisCard({ gap, onUpdate, readOnly = false }: GAPDiagnosisProps) {
  const [editing, setEditing] = useState<"current" | "desired" | null>(null);
  const [tempValue, setTempValue] = useState("");
  const gapConfig = GAP_CONFIG[gap.gapLevel];

  const handleEdit = (field: "current" | "desired") => {
    if (readOnly) return;
    setTempValue(
      field === "current" ? gap.currentState : gap.desiredState
    );
    setEditing(field);
  };

  const handleSave = () => {
    if (!editing) return;
    onUpdate?.({
      [editing === "current" ? "currentState" : "desiredState"]: tempValue,
    });
    setEditing(null);
  };

  const handleCancel = () => {
    setEditing(null);
    setTempValue("");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary">
          Diagnóstico GAP
        </h4>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-2xs font-semibold px-2 py-0.5 rounded-full border",
            gapConfig.color, gapConfig.bg, gapConfig.border
          )}>
            GAP {gapConfig.label}
          </span>
        </div>
      </div>

      {/* Estado Atual → Desejado */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-start">

        {/* Estado Atual */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-danger shrink-0" />
            <span className="text-2xs font-semibold text-text-secondary uppercase tracking-wide">
              Estado Atual
            </span>
          </div>
          <div
            className={cn(
              "group relative p-3 rounded-xl border min-h-[80px]",
              "bg-danger/5 border-danger/20",
              !readOnly && "cursor-text hover:border-danger/40 transition-colors"
            )}
            onClick={() => handleEdit("current")}
          >
            {editing === "current" ? (
              <div className="space-y-2">
                <textarea
                  autoFocus
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-full bg-transparent text-xs text-text-primary resize-none outline-none"
                  rows={3}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSave(); }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-success/10 border border-success/20 text-2xs text-success"
                  >
                    <Check className="h-3 w-3" /> Salvar
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCancel(); }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-arkos-surface-3 text-2xs text-text-muted"
                  >
                    <X className="h-3 w-3" /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {gap.currentState || (
                    <span className="italic text-text-muted">
                      Descreva o estado atual do cliente...
                    </span>
                  )}
                </p>
                {!readOnly && (
                  <Edit3 className="absolute top-2 right-2 h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </>
            )}
          </div>
        </div>

        {/* Seta central */}
        <div className="flex items-center justify-center py-4 sm:pt-8">
          <div className="flex flex-col items-center gap-1">
            <ArrowRight className="h-5 w-5 text-arkos-gold" />
            <span className="text-2xs text-text-muted text-center hidden sm:block">
              GAP<br />
              <span className={cn("font-bold", gapConfig.color)}>
                {gapConfig.label}
              </span>
            </span>
          </div>
        </div>

        {/* Estado Desejado */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success shrink-0" />
            <span className="text-2xs font-semibold text-text-secondary uppercase tracking-wide">
              Estado Desejado
            </span>
          </div>
          <div
            className={cn(
              "group relative p-3 rounded-xl border min-h-[80px]",
              "bg-success/5 border-success/20",
              !readOnly && "cursor-text hover:border-success/40 transition-colors"
            )}
            onClick={() => handleEdit("desired")}
          >
            {editing === "desired" ? (
              <div className="space-y-2">
                <textarea
                  autoFocus
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-full bg-transparent text-xs text-text-primary resize-none outline-none"
                  rows={3}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSave(); }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-success/10 border border-success/20 text-2xs text-success"
                  >
                    <Check className="h-3 w-3" /> Salvar
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCancel(); }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-arkos-surface-3 text-2xs text-text-muted"
                  >
                    <X className="h-3 w-3" /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {gap.desiredState || (
                    <span className="italic text-text-muted">
                      Descreva o estado desejado pelo cliente...
                    </span>
                  )}
                </p>
                {!readOnly && (
                  <Edit3 className="absolute top-2 right-2 h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Urgência */}
      <div className="flex items-center justify-between pt-2 border-t border-arkos-border">
        <div className="flex items-center gap-2">
          <Flame className="h-3.5 w-3.5 text-arkos-gold" />
          <span className="text-xs font-medium text-text-secondary">
            Urgência do Cliente
          </span>
        </div>
        <UrgencyStars
          value={gap.urgency}
          onChange={(v) => onUpdate?.({ urgency: v })}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}
