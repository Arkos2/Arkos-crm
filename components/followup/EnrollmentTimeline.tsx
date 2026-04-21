"use client";

import { Enrollment, EnrollmentStep } from "@/lib/types/followup";
import { cn, formatRelativeTime, formatDate } from "@/lib/utils";
import { Avatar, Badge, Button } from "@/components/ui";
import {
  Mail, MessageSquare, Phone, CheckSquare,
  Check, Clock, Send, Eye, Reply,
  AlertCircle, SkipForward, Play, Pause,
  ArrowRight, Bot,
} from "lucide-react";

const STEP_CONFIG = {
  email: { icon: Mail, label: "E-mail", color: "text-info", bg: "bg-info/10", border: "border-info/20" },
  whatsapp: { icon: MessageSquare, label: "WhatsApp", color: "text-success", bg: "bg-success/10", border: "border-success/20" },
  call: { icon: Phone, label: "Ligação", color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
  linkedin: { icon: ArrowRight, label: "LinkedIn", color: "text-info", bg: "bg-info/10", border: "border-info/20" },
  task: { icon: CheckSquare, label: "Tarefa", color: "text-text-secondary", bg: "bg-arkos-surface-3", border: "border-arkos-border" },
};

const STATUS_CONFIG: Record<string, {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
}> = {
  pending: { icon: Clock, label: "Aguardando", color: "text-text-muted", bg: "bg-arkos-surface-3" },
  scheduled: { icon: Clock, label: "Agendado", color: "text-info", bg: "bg-info/10" },
  sent: { icon: Send, label: "Enviado", color: "text-text-secondary", bg: "bg-arkos-surface-3" },
  delivered: { icon: Check, label: "Entregue", color: "text-success", bg: "bg-success/10" },
  opened: { icon: Eye, label: "Aberto", color: "text-warning", bg: "bg-warning/10" },
  replied: { icon: Reply, label: "Respondeu!", color: "text-success", bg: "bg-success/10" },
  failed: { icon: AlertCircle, label: "Falhou", color: "text-danger", bg: "bg-danger/10" },
  skipped: { icon: SkipForward, label: "Pulado", color: "text-text-muted", bg: "bg-arkos-surface-2" },
};

const ENROLLMENT_STATUS_CONFIG = {
  active: { label: "Ativa", variant: "info" as const, dot: true },
  paused: { label: "Pausada", variant: "warning" as const, dot: false },
  completed: { label: "Concluída", variant: "default" as const, dot: false },
  replied: { label: "Respondeu", variant: "success" as const, dot: false },
  converted: { label: "Convertido", variant: "success" as const, dot: false },
  unsubscribed: { label: "Descadastrou", variant: "danger" as const, dot: false },
};

interface EnrollmentTimelineProps {
  enrollment: Enrollment;
  onPause?: (id: string) => void;
  onConvert?: (id: string) => void;
}

export function EnrollmentTimeline({
  enrollment,
  onPause,
  onConvert,
}: EnrollmentTimelineProps) {
  const statusCfg = ENROLLMENT_STATUS_CONFIG[enrollment.status];
  const progress = (enrollment.currentStep / enrollment.totalSteps) * 100;

  return (
    <div className="rounded-2xl border border-arkos-border bg-arkos-surface overflow-hidden">
      {/* ─── HEADER ─── */}
      <div className="p-4 border-b border-arkos-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={enrollment.leadName} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-text-primary truncate">
                {enrollment.leadName}
              </p>
              <p className="text-xs text-text-muted truncate">
                {enrollment.company} · {enrollment.sequenceName}
              </p>
            </div>
          </div>
          <Badge
            variant={statusCfg.variant}
            size="sm"
            dot={statusCfg.dot}
            dotAnimate={statusCfg.dot}
          >
            {statusCfg.label}
          </Badge>
        </div>

        {/* Progresso */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-2xs text-text-muted">
            <span>
              Passo {enrollment.currentStep} de {enrollment.totalSteps}
            </span>
            {enrollment.nextActionAt && enrollment.status === "active" && (
              <span className="flex items-center gap-1 text-warning">
                <Clock className="h-3 w-3" />
                Próxima ação: {formatRelativeTime(enrollment.nextActionAt)}
              </span>
            )}
          </div>
          <div className="h-1.5 bg-arkos-surface-3 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                enrollment.status === "replied" || enrollment.status === "converted"
                  ? "bg-success"
                  : "bg-arkos-blue"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── PASSOS ─── */}
      <div className="p-4 relative">
        {/* Linha vertical */}
        <div className="absolute left-7 top-4 bottom-4 w-px bg-arkos-border" />

        <div className="space-y-4">
          {enrollment.steps.map((step, i) => {
            const stepCfg = STEP_CONFIG[step.type] || STEP_CONFIG.email;
            const statusCfg = STATUS_CONFIG[step.status];
            const StepIcon = stepCfg.icon;
            const StatusIcon = statusCfg.icon;
            const isCurrent = i + 1 === enrollment.currentStep;
            const isPast = step.status !== "pending" && step.status !== "scheduled";
            const isReplied = step.status === "replied";

            return (
              <div key={step.stepId} className="flex gap-4 relative">
                {/* Ícone */}
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10",
                    "border transition-all",
                    isCurrent
                      ? cn(stepCfg.bg, stepCfg.border, "ring-2 ring-arkos-blue/30")
                      : isPast
                      ? "bg-arkos-surface-3 border-arkos-border"
                      : "bg-arkos-bg border-arkos-border opacity-50"
                  )}
                >
                  <StepIcon
                    className={cn(
                      "h-3 w-3",
                      isCurrent ? stepCfg.color : "text-text-muted"
                    )}
                  />
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        "text-xs font-semibold",
                        isCurrent ? "text-text-primary" : "text-text-secondary"
                      )}>
                        D+{i === 0 ? 0 : i * 2} · {stepCfg.label}
                      </span>

                      <div
                        className={cn(
                          "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-2xs font-medium",
                          statusCfg.bg, statusCfg.color
                        )}
                      >
                        <StatusIcon className="h-2.5 w-2.5" />
                        {statusCfg.label}
                      </div>

                      {isReplied && (
                        <span className="text-2xs text-success font-bold">
                          🎯 Respondeu!
                        </span>
                      )}
                    </div>

                    {/* Timestamps */}
                    <div className="text-right shrink-0">
                      {step.executedAt && (
                        <p className="text-2xs text-text-muted">
                          {formatRelativeTime(step.executedAt)}
                        </p>
                      )}
                      {step.scheduledAt && !step.executedAt && (
                        <p className="text-2xs text-text-muted">
                          Prev: {formatDate(step.scheduledAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Assunto do e-mail */}
                  {step.subject && (
                    <p className="text-2xs text-text-muted mt-0.5 truncate">
                      {step.subject}
                    </p>
                  )}

                  {/* Preview do conteúdo */}
                  {step.content && (
                    <p className="text-2xs text-text-secondary mt-1 line-clamp-2 italic">
                      &quot;{step.content}&quot;
                    </p>
                  )}

                  {/* Indicadores de interação */}
                  {(step.openedAt || step.repliedAt) && (
                    <div className="flex items-center gap-3 mt-1">
                      {step.openedAt && (
                        <div className="flex items-center gap-1 text-2xs text-warning">
                          <Eye className="h-3 w-3" />
                          Aberto {formatRelativeTime(step.openedAt)}
                        </div>
                      )}
                      {step.repliedAt && (
                        <div className="flex items-center gap-1 text-2xs text-success">
                          <Reply className="h-3 w-3" />
                          Respondido {formatRelativeTime(step.repliedAt)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <div className="px-4 py-3 border-t border-arkos-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-2xs text-text-muted">
          <Bot className="h-3.5 w-3.5 text-arkos-gold" />
          <span>Iniciado {formatRelativeTime(enrollment.enrolledAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          {enrollment.status === "active" && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onPause?.(enrollment.id)}
              icon={<Pause className="h-3 w-3" />}
            >
              Pausar
            </Button>
          )}
          {enrollment.status === "paused" && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onPause?.(enrollment.id)}
              icon={<Play className="h-3 w-3" />}
            >
              Retomar
            </Button>
          )}
          {(enrollment.status === "replied" || enrollment.status === "active") && (
            <Button
              variant="gold"
              size="xs"
              onClick={() => onConvert?.(enrollment.id)}
              icon={<ArrowRight className="h-3 w-3" />}
            >
              Criar Negócio
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
