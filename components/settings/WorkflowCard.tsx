"use client";

import { Workflow, WorkflowStatus } from "@/lib/types/settings";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Badge, Button } from "@/components/ui";
import {
  Play, Pause, Edit, Copy, Trash2,
  ChevronRight, CheckCircle2, AlertCircle,
  Zap, Clock, MoreHorizontal, Activity,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TRIGGER_LABELS: Record<string, { label: string; emoji: string }> = {
  deal_created: { label: "Deal criado", emoji: "📋" },
  deal_stage_changed: { label: "Etapa alterada", emoji: "🔄" },
  deal_won: { label: "Deal ganho", emoji: "🏆" },
  deal_lost: { label: "Deal perdido", emoji: "❌" },
  proposal_sent: { label: "Proposta enviada", emoji: "📄" },
  proposal_viewed: { label: "Proposta visualizada", emoji: "👁️" },
  proposal_signed: { label: "Proposta assinada", emoji: "✍️" },
  lead_qualified: { label: "Lead qualificado", emoji: "🎯" },
  lead_inbound: { label: "Lead inbound", emoji: "📥" },
  no_activity_days: { label: "Sem atividade", emoji: "⚠️" },
  bant_score_reached: { label: "BANT atingido", emoji: "📊" },
  contact_created: { label: "Contato criado", emoji: "👤" },
  meeting_scheduled: { label: "Reunião agendada", emoji: "📅" },
  meeting_completed: { label: "Reunião realizada", emoji: "✅" },
  task_overdue: { label: "Tarefa atrasada", emoji: "⏰" },
};

const ACTION_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  send_email: { label: "Enviar e-mail", emoji: "📧", color: "text-info" },
  send_whatsapp: { label: "Enviar WhatsApp", emoji: "💬", color: "text-success" },
  create_task: { label: "Criar tarefa", emoji: "✅", color: "text-warning" },
  move_deal_stage: { label: "Mover etapa", emoji: "🔄", color: "text-arkos-blue-light" },
  assign_deal: { label: "Atribuir deal", emoji: "👤", color: "text-text-secondary" },
  add_tag: { label: "Adicionar tag", emoji: "🏷️", color: "text-purple-400" },
  start_sequence: { label: "Iniciar sequência", emoji: "🔁", color: "text-warning" },
  notify_user: { label: "Notificar usuário", emoji: "🔔", color: "text-arkos-gold" },
  create_deal: { label: "Criar deal", emoji: "📋", color: "text-arkos-blue-light" },
  update_field: { label: "Atualizar campo", emoji: "✏️", color: "text-text-secondary" },
  ai_qualify: { label: "IA Qualificador", emoji: "🤖", color: "text-arkos-gold" },
  ai_write_email: { label: "IA Redator", emoji: "✍️", color: "text-arkos-gold" },
  webhook: { label: "Webhook", emoji: "🌐", color: "text-info" },
};

const STATUS_CONFIG: Record<WorkflowStatus, {
  variant: "success" | "warning" | "default" | "danger";
  label: string;
  dot: boolean;
  animate: boolean;
}> = {
  active: { variant: "success", label: "Ativo", dot: true, animate: true },
  paused: { variant: "warning", label: "Pausado", dot: true, animate: false },
  draft: { variant: "default", label: "Rascunho", dot: false, animate: false },
  error: { variant: "danger", label: "Erro", dot: true, animate: false },
};

interface WorkflowCardProps {
  workflow: Workflow;
  onToggle: (id: string) => void;
  onEdit: (workflow: Workflow) => void;
  onDuplicate: (workflow: Workflow) => void;
  onDelete: (id: string) => void;
}

export function WorkflowCard({
  workflow,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
}: WorkflowCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const trigger = TRIGGER_LABELS[workflow.trigger];
  const statusCfg = STATUS_CONFIG[workflow.status];
  const successRate = workflow.executionCount > 0
    ? Math.round((workflow.successCount / workflow.executionCount) * 100)
    : 0;

  return (
    <div className={cn(
      "rounded-2xl border bg-arkos-surface transition-all duration-300",
      "hover:shadow-arkos hover:-translate-y-0.5",
      workflow.status === "active" ? "border-arkos-border hover:border-arkos-blue/30" :
      workflow.status === "error" ? "border-danger/30" :
      workflow.status === "draft" ? "border-dashed border-arkos-border-2" :
      "border-arkos-border opacity-75"
    )}>

      {/* ─── HEADER ─── */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge
                variant={statusCfg.variant}
                size="sm"
                dot={statusCfg.dot}
                dotAnimate={statusCfg.animate}
              >
                {statusCfg.label}
              </Badge>

              {/* Trigger */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-arkos-surface-2 border border-arkos-border text-2xs font-medium text-text-secondary">
                <Zap className="h-3 w-3 text-arkos-gold" />
                {trigger?.emoji} {trigger?.label}
              </div>

              {/* Condições */}
              {workflow.conditions.length > 0 && (
                <div className="text-2xs text-text-muted">
                  + {workflow.conditions.length} condição
                  {workflow.conditions.length > 1 ? "ões" : ""}
                </div>
              )}
            </div>

            <h3 className="text-sm font-bold text-text-primary">
              {workflow.name}
            </h3>

            {workflow.description && (
              <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                {workflow.description}
              </p>
            )}
          </div>

          {/* Menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg hover:bg-arkos-surface-2 text-text-muted hover:text-text-primary transition-all"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-44 bg-arkos-surface-3 border border-arkos-border rounded-xl shadow-arkos-lg z-40 overflow-hidden animate-scale-in">
                  {[
                    { icon: Edit, label: "Editar", action: () => { onEdit(workflow); setShowMenu(false); } },
                    { icon: Copy, label: "Duplicar", action: () => { onDuplicate(workflow); setShowMenu(false); } },
                    {
                      icon: workflow.status === "active" ? Pause : Play,
                      label: workflow.status === "active" ? "Pausar" : "Ativar",
                      action: () => { onToggle(workflow.id); setShowMenu(false); }
                    },
                    { icon: Trash2, label: "Excluir", action: () => { onDelete(workflow.id); setShowMenu(false); }, danger: true },
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

        {/* ─── FLUXO VISUAL ─── */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
          {/* Trigger box */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-arkos-gold/10 border border-arkos-gold/20 shrink-0">
            <span className="text-xs">{trigger?.emoji}</span>
            <span className="text-2xs font-semibold text-arkos-gold">
              Gatilho
            </span>
          </div>

          <ChevronRight className="h-3.5 w-3.5 text-text-muted shrink-0" />

          {/* Actions */}
          {workflow.actions.slice(0, showActions ? undefined : 3).map((action, i) => {
            const actionCfg = ACTION_LABELS[action.type];
            return (
              <div key={action.id} className="flex items-center gap-1 shrink-0">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-arkos-surface-2 border border-arkos-border">
                  <span className="text-xs">{actionCfg?.emoji}</span>
                  <span className={cn("text-2xs font-medium", actionCfg?.color)}>
                    {actionCfg?.label}
                  </span>
                  {action.delayMinutes && action.delayMinutes > 0 && (
                    <span className="text-2xs text-text-muted">
                      +{action.delayMinutes}min
                    </span>
                  )}
                </div>
                {i < workflow.actions.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-text-muted" />
                )}
              </div>
            );
          })}

          {!showActions && workflow.actions.length > 3 && (
            <button
              onClick={() => setShowActions(true)}
              className="text-2xs text-arkos-blue-light hover:text-arkos-gold transition-colors shrink-0 ml-1"
            >
              +{workflow.actions.length - 3} mais
            </button>
          )}
        </div>
      </div>

      {/* ─── STATS ─── */}
      <div className="px-4 py-3 border-t border-arkos-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Execuções */}
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-text-muted" />
            <span className="text-xs text-text-secondary">
              <strong className="text-text-primary">{workflow.executionCount}</strong> execuções
            </span>
          </div>

          {/* Taxa de sucesso */}
          {workflow.executionCount > 0 && (
            <div className="flex items-center gap-1.5">
              {successRate >= 95 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              ) : successRate >= 80 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-warning" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-danger" />
              )}
              <span className={cn(
                "text-xs font-semibold",
                successRate >= 95 ? "text-success" :
                successRate >= 80 ? "text-warning" : "text-danger"
              )}>
                {successRate}% sucesso
              </span>
            </div>
          )}

          {/* Última execução */}
          {workflow.lastExecutedAt && (
            <div className="flex items-center gap-1.5 text-2xs text-text-muted">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(workflow.lastExecutedAt)}
            </div>
          )}
        </div>

        {/* Toggle rápido */}
        <Button
          variant={workflow.status === "active" ? "secondary" : "primary"}
          size="xs"
          onClick={() => onToggle(workflow.id)}
          icon={
            workflow.status === "active" ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )
          }
        >
          {workflow.status === "active" ? "Pausar" : "Ativar"}
        </Button>
      </div>
    </div>
  );
}
