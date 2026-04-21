"use client";

import { Sequence } from "@/lib/types/followup";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Badge, Button } from "@/components/ui";
import {
  Mail, MessageSquare, Phone, Linkedin,
  CheckSquare, MoreHorizontal, Play, Pause,
  Users, TrendingUp, Clock, Zap, Edit,
  Copy, Trash2,
} from "lucide-react";
import { useState } from "react";

const STEP_ICONS: Record<string, React.ElementType> = {
  email: Mail,
  whatsapp: MessageSquare,
  call: Phone,
  linkedin: Linkedin,
  task: CheckSquare,
};

const STEP_COLORS: Record<string, string> = {
  email: "text-info bg-info/10 border-info/20",
  whatsapp: "text-success bg-success/10 border-success/20",
  call: "text-warning bg-warning/10 border-warning/20",
  linkedin: "text-info bg-info/10 border-info/20",
  task: "text-text-secondary bg-arkos-surface-3 border-arkos-border",
};

const TRIGGER_LABELS: Record<string, string> = {
  manual: "Manual",
  deal_stage_changed: "Mudança de etapa",
  proposal_sent: "Proposta enviada",
  demo_completed: "Demo realizada",
  no_reply_days: "Sem resposta",
  lead_qualified: "Lead qualificado",
};

interface SequenceCardProps {
  sequence: Sequence;
  onToggle?: (id: string) => void;
  onEdit?: (id: string) => void;
  onClick?: (sequence: Sequence) => void;
}

export function SequenceCard({
  sequence,
  onToggle,
  onEdit,
  onClick,
}: SequenceCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-arkos-surface",
        "transition-all duration-300 hover:shadow-arkos hover:-translate-y-0.5",
        sequence.isActive
          ? "border-arkos-border hover:border-arkos-blue/30"
          : "border-arkos-border opacity-70"
      )}
    >
      {/* ─── HEADER ─── */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => onClick?.(sequence)}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-text-primary">
                {sequence.name}
              </h3>
              <Badge
                variant={sequence.isActive ? "success" : "default"}
                size="sm"
                dot
                dotAnimate={sequence.isActive}
              >
                {sequence.isActive ? "Ativa" : "Pausada"}
              </Badge>
            </div>
            {sequence.description && (
              <p className="text-xs text-text-muted mt-0.5 truncate">
                {sequence.description}
              </p>
            )}
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg hover:bg-arkos-surface-2 text-text-muted hover:text-text-primary transition-all"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-44 bg-arkos-surface-3 border border-arkos-border rounded-xl shadow-arkos-lg z-40 overflow-hidden">
                  {[
                    { icon: Edit, label: "Editar", action: () => { onEdit?.(sequence.id); setShowMenu(false); } },
                    { icon: Copy, label: "Duplicar", action: () => setShowMenu(false) },
                    { icon: sequence.isActive ? Pause : Play, label: sequence.isActive ? "Pausar" : "Ativar", action: () => { onToggle?.(sequence.id); setShowMenu(false); } },
                    { icon: Trash2, label: "Excluir", action: () => setShowMenu(false), danger: true },
                  ].map(({ icon: Icon, label, action, danger }) => (
                    <button
                      key={label}
                      onClick={action}
                      className={cn(
                        "flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-medium",
                        "hover:bg-arkos-surface-2 transition-colors text-left",
                        danger ? "text-danger hover:bg-danger/10" : "text-text-secondary hover:text-text-primary"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Gatilho */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-arkos-surface-2 border border-arkos-border">
            <Zap className="h-3 w-3 text-arkos-gold" />
            <span className="text-2xs font-medium text-text-secondary">
              {TRIGGER_LABELS[sequence.trigger] || sequence.trigger}
            </span>
          </div>
          {sequence.tags?.map((tag) => (
            <Badge key={tag} variant="default" size="sm">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Passos visuais */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
          {sequence.steps.map((step, i) => {
            const Icon = STEP_ICONS[step.type] || Mail;
            const colorClass = STEP_COLORS[step.type];

            return (
              <div key={step.id} className="flex items-center gap-1 shrink-0">
                <div
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl border",
                    colorClass
                  )}
                  title={`Dia ${step.dayOffset}: ${step.type}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-2xs font-bold">D+{step.dayOffset}</span>
                </div>
                {i < sequence.steps.length - 1 && (
                  <div className="w-4 h-px bg-arkos-border shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── STATS ─── */}
      <div className="px-4 py-3 border-t border-arkos-border grid grid-cols-4 gap-3">
        {[
          {
            icon: Users,
            label: "Ativos",
            value: sequence.stats.activeNow,
            color: "text-info",
          },
          {
            icon: TrendingUp,
            label: "Reply",
            value: `${sequence.stats.replyRate}%`,
            color: sequence.stats.replyRate >= 50 ? "text-success" : "text-warning",
          },
          {
            icon: Zap,
            label: "Conversão",
            value: `${sequence.stats.conversionRate}%`,
            color: sequence.stats.conversionRate >= 30 ? "text-success" : "text-text-secondary",
          },
          {
            icon: Clock,
            label: "Total",
            value: sequence.stats.totalEnrolled,
            color: "text-text-secondary",
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <Icon className={cn("h-3.5 w-3.5", color)} />
            <span className={cn("text-sm font-bold", color)}>{value}</span>
            <span className="text-2xs text-text-muted">{label}</span>
          </div>
        ))}
      </div>

      {/* ─── FOOTER ─── */}
      <div className="px-4 py-2.5 border-t border-arkos-border flex items-center justify-between">
        <span className="text-2xs text-text-muted">
          Atualizado {formatRelativeTime(sequence.updatedAt)}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onToggle?.(sequence.id)}
            icon={
              sequence.isActive ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )
            }
          >
            {sequence.isActive ? "Pausar" : "Ativar"}
          </Button>
          <Button
            variant="secondary"
            size="xs"
            onClick={() => onClick?.(sequence)}
          >
            Ver Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
}
