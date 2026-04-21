"use client";

import { Playbook } from "@/lib/types/coach";
import { cn } from "@/lib/utils";
import { Badge, Button } from "@/components/ui";
import {
  BookOpen, Star, Users, ChevronDown,
  ChevronUp, Target, MessageSquare,
  Clock, Zap, Trophy,
} from "lucide-react";
import { useState } from "react";

const CATEGORY_CONFIG = {
  approach: { label: "Abordagem", icon: Target, color: "text-arkos-blue-light", bg: "bg-arkos-blue/10", border: "border-arkos-blue/20" },
  objection: { label: "Objeção", icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  timing: { label: "Timing", icon: Clock, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
  channel: { label: "Canal", icon: Zap, color: "text-success", bg: "bg-success/10", border: "border-success/20" },
  closing: { label: "Fechamento", icon: Trophy, color: "text-arkos-gold", bg: "bg-arkos-gold/10", border: "border-arkos-gold/20" },
};

interface PlaybookCardProps {
  playbook: Playbook;
}

export function PlaybookCard({ playbook }: PlaybookCardProps) {
  const [expanded, setExpanded] = useState(false);
  const catCfg = CATEGORY_CONFIG[playbook.category];
  const Icon = catCfg.icon;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-arkos-surface",
        "transition-all duration-300 hover:shadow-arkos",
        "border-arkos-border hover:border-arkos-border-2"
      )}
    >
      {/* ─── HEADER ─── */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-xl shrink-0", catCfg.bg)}>
            <Icon className={cn("h-4 w-4", catCfg.color)} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-text-primary">
              {playbook.title}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              {playbook.description}
            </p>
          </div>
        </div>

        {/* Badges e stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={
              playbook.category === "approach"
                ? "info"
                : playbook.category === "objection"
                ? "default"
                : playbook.category === "timing"
                ? "warning"
                : playbook.category === "closing"
                ? "gold"
                : "success"
            }
            size="sm"
          >
            {catCfg.label}
          </Badge>

          <div className="flex items-center gap-1 text-2xs text-text-muted">
            <Star className="h-3 w-3 text-arkos-gold" />
            <span className="font-bold text-arkos-gold">
              {playbook.successRate}%
            </span>
            <span>de sucesso</span>
          </div>

          <div className="flex items-center gap-1 text-2xs text-text-muted">
            <Users className="h-3 w-3" />
            <span>Usado {playbook.usageCount}x</span>
          </div>
        </div>

        {/* Autor */}
        <p className="text-2xs text-text-muted">
          Por:{" "}
          <span className="font-semibold text-text-secondary">
            {playbook.author}
          </span>
        </p>
      </div>

      {/* ─── PASSOS (expandível) ─── */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-arkos-border pt-4">
          {playbook.steps.map((step) => (
            <div key={step.order} className="flex gap-3">
              {/* Número */}
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                  "text-2xs font-bold border",
                  catCfg.bg,
                  catCfg.border,
                  catCfg.color
                )}
              >
                {step.order}
              </div>

              <div className="flex-1 space-y-1 pb-3 border-b border-arkos-border last:border-0 last:pb-0">
                <p className="text-xs font-bold text-text-primary">
                  {step.title}
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {step.description}
                </p>
                {step.tip && (
                  <div className="flex items-start gap-1.5 mt-1.5">
                    <span className="text-xs">💡</span>
                    <p className="text-2xs text-arkos-gold italic">
                      {step.tip}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── FOOTER ─── */}
      <div
        className={cn(
          "px-4 py-3 border-t border-arkos-border",
          "flex items-center justify-between"
        )}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="h-3.5 w-3.5" /> Fechar</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" /> Ver {playbook.steps.length} passos</>
          )}
        </button>

        <Button variant="secondary" size="xs">
          Usar Playbook
        </Button>
      </div>
    </div>
  );
}
