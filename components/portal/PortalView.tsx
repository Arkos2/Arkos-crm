"use client";

import { useState } from "react";
import { ClientProject, ChecklistItem } from "@/lib/types/portal";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui";
import {
  CheckCircle2, Circle, Clock, AlertCircle,
  FileText, Download, Eye, Pen, Mail,
  Phone, Calendar, Video, MapPin,
  ChevronDown, ChevronUp, Bell, Zap,
  Building2, User, ExternalLink,
} from "lucide-react";

// ─── CONFIGURAÇÕES ───
const MILESTONE_CONFIG = {
  completed: {
    color: "text-success",
    bg: "bg-success",
    border: "border-success",
    label: "Concluído",
  },
  in_progress: {
    color: "text-arkos-blue-light",
    bg: "bg-arkos-blue",
    border: "border-arkos-blue",
    label: "Em Andamento",
  },
  upcoming: {
    color: "text-text-muted",
    bg: "bg-arkos-surface-3",
    border: "border-arkos-border",
    label: "Próximo",
  },
  delayed: {
    color: "text-danger",
    bg: "bg-danger",
    border: "border-danger",
    label: "Atrasado",
  },
};

const DOC_STATUS_CONFIG = {
  pending: { label: "Pendente", color: "text-text-muted", icon: Clock },
  sent: { label: "Enviado", color: "text-info", icon: FileText },
  viewed: { label: "Visualizado", color: "text-warning", icon: Eye },
  signed: { label: "Assinado ✓", color: "text-success", icon: CheckCircle2 },
  expired: { label: "Expirado", color: "text-danger", icon: AlertCircle },
};

const DOC_TYPE_LABEL: Record<string, string> = {
  contract: "📝 Contrato",
  proposal: "📄 Proposta",
  scope: "📋 Escopo",
  manual: "📚 Manual",
  report: "📊 Relatório",
  nda: "🔒 NDA",
  invoice: "💰 Fatura",
};

const PLATFORM_CONFIG = {
  zoom: { label: "Zoom", icon: "🔵", color: "text-info" },
  meet: { label: "Google Meet", icon: "🟢", color: "text-success" },
  teams: { label: "Teams", icon: "🟣", color: "text-purple-400" },
  presencial: { label: "Presencial", icon: "🏢", color: "text-arkos-gold" },
};

const UPDATE_TYPE_CONFIG = {
  progress: { color: "bg-info", border: "border-info/30", bg: "bg-info/5" },
  milestone: { color: "bg-success", border: "border-success/30", bg: "bg-success/5" },
  alert: { color: "bg-danger", border: "border-danger/30", bg: "bg-danger/5" },
  info: { color: "bg-arkos-gold", border: "border-arkos-gold/30", bg: "bg-arkos-gold/5" },
};

interface PortalViewProps {
  project: ClientProject;
}

export function PortalView({ project }: PortalViewProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "documents" | "checklist" | "meetings" | "updates"
  >("overview");
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [checklist, setChecklist] = useState(project.checklist);

  const clientChecklist = checklist.filter((c) => c.assignedTo === "client");
  const arkosChecklist = checklist.filter((c) => c.assignedTo === "arkos");
  const pendingClient = clientChecklist.filter((c) => c.status !== "completed").length;
  const unreadUpdates = project.updates.filter((u) => !u.isRead).length;

  const handleCheckItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: c.status === "completed" ? "pending" : "completed",
              completedAt:
                c.status === "completed"
                  ? undefined
                  : new Date().toISOString(),
            }
          : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-arkos-bg text-text-primary">

      {/* ─── HEADER ─── */}
      <header className="border-b border-arkos-border bg-arkos-surface/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo ARKOS */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-blue flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary leading-none">
                    ARKOS
                  </p>
                  <p className="text-2xs text-text-muted leading-none">
                    Portal do Cliente
                  </p>
                </div>
              </div>

              <div className="w-px h-6 bg-arkos-border mx-1" />

              <div>
                <p className="text-sm font-bold text-text-primary">
                  {project.companyName}
                </p>
                <p className="text-xs text-text-muted">
                  {project.projectName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadUpdates > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-info/10 border border-info/20">
                  <Bell className="h-3.5 w-3.5 text-info" />
                  <span className="text-xs font-bold text-info">
                    {unreadUpdates} nova{unreadUpdates > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              <Badge variant="success" dot dotAnimate size="md">
                Projeto Ativo
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ─── HERO: PROGRESSO GERAL ─── */}
        <div className="rounded-3xl border border-arkos-border bg-gradient-to-br from-arkos-surface to-arkos-surface-2 p-6 sm:p-8 overflow-hidden relative">
          {/* Decoração */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-arkos-blue/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-arkos-gold/5 translate-y-1/2 -translate-x-1/2" />

          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1">
                  Progresso Geral
                </p>
                <h1 className="text-2xl sm:text-3xl font-black text-text-primary">
                  {project.overallProgress}% Concluído
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  Etapa atual:{" "}
                  <span className="font-semibold text-arkos-blue-light">
                    {
                      project.stages.find(
                        (s) => s.id === project.currentStage
                      )?.label
                    }
                  </span>
                </p>
              </div>

              {/* Barra de progresso grande */}
              <div className="space-y-2">
                <div className="h-4 bg-arkos-bg rounded-full overflow-hidden border border-arkos-border">
                  <div
                    className="h-full rounded-full bg-gradient-blue transition-all duration-1000 ease-out relative overflow-hidden"
                    style={{ width: `${project.overallProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                  </div>
                </div>
                <div className="flex justify-between text-2xs text-text-muted">
                  <span>Início: {formatDate(project.startDate)}</span>
                  <span>Previsão: {formatDate(project.expectedEndDate)}</span>
                </div>
              </div>

              {/* Stats rápidos */}
              <div className="flex items-center gap-4">
                {[
                  {
                    label: "Dias restantes",
                    value: Math.max(
                      0,
                      Math.ceil(
                        (new Date(project.expectedEndDate).getTime() -
                          Date.now()) /
                          86400000
                      )
                    ),
                    color: "text-arkos-gold",
                  },
                  {
                    label: "Docs assinados",
                    value: project.documents.filter(
                      (d) => d.status === "signed"
                    ).length,
                    color: "text-success",
                  },
                  {
                    label: "Itens pendentes",
                    value: pendingClient,
                    color: pendingClient > 0 ? "text-warning" : "text-success",
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <p className={cn("text-2xl font-black", color)}>{value}</p>
                    <p className="text-2xs text-text-muted">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Info do gerente */}
            <div className="flex flex-col items-center sm:items-end gap-4">
              <div className="text-center sm:text-right">
                <p className="text-xs text-text-muted mb-2">
                  Sua gerente de conta
                </p>
                <div className="flex items-center gap-3 sm:flex-row-reverse">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-arkos-blue to-arkos-blue-dark flex items-center justify-center text-lg font-bold text-white">
                    {project.managerName[0]}
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold text-text-primary">
                      {project.managerName}
                    </p>
                    <p className="text-xs text-text-muted">ARKOS</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={`mailto:${project.managerEmail}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-arkos-surface-2 border border-arkos-border hover:border-arkos-blue/40 text-xs font-medium text-text-secondary hover:text-text-primary transition-all"
                >
                  <Mail className="h-3.5 w-3.5" />
                  E-mail
                </a>
                {project.managerPhone && (
                  <a
                    href={`tel:${project.managerPhone}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-arkos-surface-2 border border-arkos-border hover:border-arkos-blue/40 text-xs font-medium text-text-secondary hover:text-text-primary transition-all"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Ligar
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── MAPA DE IMPLEMENTAÇÃO ─── */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <span>🗺️</span> Mapa de Implementação
          </h2>

          {/* Stepper */}
          <div className="relative">
            {/* Linha horizontal conectora */}
            <div className="absolute top-8 left-8 right-8 h-0.5 bg-arkos-border hidden sm:block" />
            <div
              className="absolute top-8 left-8 h-0.5 bg-gradient-blue hidden sm:block transition-all duration-1000"
              style={{
                width: `${
                  (project.stages.filter((s) => s.status === "completed")
                    .length /
                    (project.stages.length - 1)) *
                  100
                }%`,
                maxWidth: "calc(100% - 64px)",
              }}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {project.stages.map((stage) => {
                const cfg = MILESTONE_CONFIG[stage.status];
                const isExpanded = expandedStage === stage.id;

                return (
                  <div
                    key={stage.id}
                    className="flex flex-col items-center gap-2 relative"
                  >
                    {/* Ícone/Círculo */}
                    <button
                      onClick={() =>
                        setExpandedStage(
                          isExpanded ? null : stage.id
                        )
                      }
                      className={cn(
                        "relative w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl",
                        "transition-all duration-300 hover:scale-110 z-10",
                        stage.status === "completed" &&
                          "bg-success/10 border-success shadow-[0_0_16px_rgba(16,185,129,0.2)]",
                        stage.status === "in_progress" &&
                          "bg-arkos-blue/10 border-arkos-blue shadow-[0_0_16px_rgba(43,88,138,0.3)] animate-pulse-slow",
                        stage.status === "upcoming" &&
                          "bg-arkos-surface border-arkos-border",
                        stage.status === "delayed" &&
                          "bg-danger/10 border-danger"
                      )}
                    >
                      <span>{stage.icon}</span>

                      {stage.status === "completed" && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-success border-2 border-arkos-bg flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                      )}

                      {stage.status === "in_progress" && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-arkos-blue border-2 border-arkos-bg flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        </div>
                      )}
                    </button>

                    {/* Label */}
                    <div className="text-center">
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          stage.status === "completed" && "text-success",
                          stage.status === "in_progress" &&
                            "text-arkos-blue-light",
                          stage.status === "upcoming" && "text-text-muted",
                          stage.status === "delayed" && "text-danger"
                        )}
                      >
                        {stage.label}
                      </p>
                      <p className="text-2xs text-text-muted mt-0.5">
                        {stage.status === "completed" && stage.completedAt
                          ? formatDate(stage.completedAt)
                          : stage.scheduledAt
                          ? formatDate(stage.scheduledAt)
                          : cfg.label}
                      </p>
                    </div>

                    {/* Detalhes expandidos */}
                    {isExpanded && (
                      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 z-20 bg-arkos-surface-3 border border-arkos-border rounded-2xl p-4 shadow-arkos-lg animate-scale-in">
                        <p className="text-xs font-bold text-text-primary mb-2">
                          {stage.label}
                        </p>
                        <p className="text-2xs text-text-secondary mb-3">
                          {stage.description}
                        </p>

                        {stage.responsibleName && (
                          <p className="text-2xs text-text-muted mb-2">
                            👤 {stage.responsibleName}
                          </p>
                        )}

                        {stage.notes && (
                          <p className="text-2xs text-text-secondary italic mb-2">
                            "{stage.notes}"
                          </p>
                        )}

                        {stage.deliverables &&
                          stage.deliverables.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-2xs font-semibold text-text-muted uppercase tracking-wide">
                                Entregas
                              </p>
                              {stage.deliverables.map((d) => (
                                <div
                                  key={d}
                                  className="flex items-center gap-1.5 text-2xs text-text-secondary"
                                >
                                  <CheckCircle2
                                    className={cn(
                                      "h-3 w-3 shrink-0",
                                      stage.status === "completed"
                                        ? "text-success"
                                        : "text-text-muted"
                                    )}
                                  />
                                  {d}
                                </div>
                              ))}
                            </div>
                          )}

                        <button
                          onClick={() => setExpandedStage(null)}
                          className="mt-3 text-2xs text-text-muted hover:text-text-secondary transition-colors"
                        >
                          Fechar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── TABS ─── */}
        <div className="border-b border-arkos-border">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide">
            {[
              { id: "overview", label: "Resumo", emoji: "📊" },
              { id: "documents", label: "Documentos", emoji: "📄", count: project.documents.length },
              { id: "checklist", label: "Checklist", emoji: "✅", count: pendingClient, urgent: pendingClient > 0 },
              { id: "meetings", label: "Reuniões", emoji: "📅", count: project.meetings.filter(m => m.status === "scheduled").length },
              { id: "updates", label: "Atualizações", emoji: "🔔", count: unreadUpdates, urgent: unreadUpdates > 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap",
                  "border-b-2 -mb-px transition-all",
                  activeTab === tab.id
                    ? "border-arkos-gold text-text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                )}
              >
                <span>{tab.emoji}</span>
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-2xs font-bold",
                      tab.urgent
                        ? "bg-warning/10 text-warning"
                        : "bg-arkos-surface-3 text-text-muted"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ─── TAB: RESUMO ─── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Próxima reunião */}
            {project.meetings
              .filter((m) => m.status === "scheduled")
              .slice(0, 1)
              .map((meeting) => {
                const platCfg = PLATFORM_CONFIG[meeting.platform];
                return (
                  <div
                    key={meeting.id}
                    className="rounded-2xl border border-arkos-blue/20 bg-arkos-blue/5 p-5"
                  >
                    <p className="text-xs font-semibold text-arkos-blue-light uppercase tracking-wide mb-3">
                      📅 Próxima Reunião
                    </p>
                    <h3 className="text-base font-bold text-text-primary mb-2">
                      {meeting.title}
                    </h3>
                    <div className="space-y-2 text-sm text-text-secondary">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-text-muted" />
                        {new Date(meeting.scheduledAt).toLocaleDateString(
                          "pt-BR",
                          {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-text-muted" />
                        {meeting.duration} minutos
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{platCfg.icon}</span>
                        {platCfg.label}
                        {meeting.location && ` — ${meeting.location}`}
                      </div>
                    </div>
                    {meeting.meetingUrl && (
                      <a
                        href={meeting.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-arkos-blue text-white text-sm font-semibold hover:bg-arkos-blue-light transition-colors"
                      >
                        <Video className="h-4 w-4" />
                        Entrar na Reunião
                      </a>
                    )}
                  </div>
                );
              })}

            {/* Últimas atualizações */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                🔔 Últimas Atualizações
              </p>
              {project.updates.slice(0, 3).map((update) => {
                const cfg = UPDATE_TYPE_CONFIG[update.type];
                return (
                  <div
                    key={update.id}
                    className={cn(
                      "flex gap-3 p-4 rounded-2xl border",
                      cfg.bg,
                      cfg.border
                    )}
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-1.5 shrink-0",
                        cfg.color
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary">
                        {update.title}
                      </p>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        {update.message}
                      </p>
                      <p className="text-2xs text-text-muted mt-2">
                        {update.createdBy} ·{" "}
                        {formatRelativeTime(update.createdAt)}
                      </p>
                    </div>
                    {!update.isRead && (
                      <div className="w-2 h-2 rounded-full bg-info shrink-0 mt-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── TAB: DOCUMENTOS ─── */}
        {activeTab === "documents" && (
          <div className="space-y-3">
            {project.documents.map((doc) => {
              const statusCfg = DOC_STATUS_CONFIG[doc.status];
              const StatusIcon = statusCfg.icon;

              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-arkos-border bg-arkos-surface hover:border-arkos-border-2 transition-all group"
                >
                  {/* Tipo */}
                  <div className="text-2xl shrink-0">
                    {DOC_TYPE_LABEL[doc.type]?.split(" ")[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {doc.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <div
                        className={cn(
                          "flex items-center gap-1 text-2xs font-medium",
                          statusCfg.color
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusCfg.label}
                      </div>

                      {doc.viewCount !== undefined && doc.viewCount > 0 && (
                        <span className="text-2xs text-text-muted">
                          Visualizado {doc.viewCount}x
                        </span>
                      )}

                      {doc.signedBy && (
                        <span className="text-2xs text-text-muted">
                          Assinado por {doc.signedBy}
                        </span>
                      )}

                      {doc.fileSize && (
                        <span className="text-2xs text-text-muted">
                          {doc.fileSize}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {doc.fileUrl && (
                      <>
                        <a
                          href={doc.fileUrl}
                          className="p-2 rounded-xl hover:bg-arkos-surface-2 text-text-muted hover:text-text-primary transition-all"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <a
                          href={doc.fileUrl}
                          download
                          className="p-2 rounded-xl hover:bg-arkos-surface-2 text-text-muted hover:text-text-primary transition-all"
                          title="Baixar"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </>
                    )}

                    {doc.status === "sent" && (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-arkos-gold/10 border border-arkos-gold/20 text-2xs font-semibold text-arkos-gold hover:bg-arkos-gold/20 transition-all">
                        <Pen className="h-3 w-3" />
                        Assinar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── TAB: CHECKLIST ─── */}
        {activeTab === "checklist" && (
          <div className="space-y-6">
            {/* Itens do cliente */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-warning" />
                  Sua responsabilidade
                  {pendingClient > 0 && (
                    <Badge variant="warning" size="sm">
                      {pendingClient} pendente{pendingClient > 1 ? "s" : ""}
                    </Badge>
                  )}
                </h3>
              </div>

              {clientChecklist.map((item) => {
                const isOverdue =
                  item.dueDate &&
                  new Date(item.dueDate) < new Date() &&
                  item.status !== "completed";

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-2xl border transition-all",
                      item.status === "completed"
                        ? "border-success/20 bg-success/5 opacity-70"
                        : isOverdue
                        ? "border-danger/30 bg-danger/5"
                        : "border-arkos-border bg-arkos-surface hover:border-arkos-border-2"
                    )}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => handleCheckItem(item.id)}
                      className="mt-0.5 shrink-0"
                    >
                      {item.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <Circle
                          className={cn(
                            "h-5 w-5 transition-colors",
                            isOverdue
                              ? "text-danger"
                              : "text-arkos-border hover:text-arkos-blue"
                          )}
                        />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          item.status === "completed"
                            ? "text-text-muted line-through"
                            : "text-text-primary"
                        )}
                      >
                        {item.title}
                      </p>

                      {item.description && (
                        <p className="text-xs text-text-secondary mt-0.5">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {item.dueDate && item.status !== "completed" && (
                          <div
                            className={cn(
                              "flex items-center gap-1 text-2xs",
                              isOverdue ? "text-danger" : "text-text-muted"
                            )}
                          >
                            <Clock className="h-3 w-3" />
                            {isOverdue ? "Atrasado — " : "Até "}
                            {formatDate(item.dueDate)}
                          </div>
                        )}

                        {item.completedAt && (
                          <span className="text-2xs text-success">
                            ✓ Concluído {formatRelativeTime(item.completedAt)}
                          </span>
                        )}

                        <Badge
                          variant={
                            item.priority === "high"
                              ? "warning"
                              : item.priority === "medium"
                              ? "info"
                              : "default"
                          }
                          size="sm"
                        >
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Itens da ARKOS */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Zap className="h-4 w-4 text-arkos-blue-light" />
                Responsabilidade ARKOS
              </h3>

              {arkosChecklist.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-2xl border opacity-80",
                    item.status === "completed"
                      ? "border-success/20 bg-success/5"
                      : item.status === "in_progress"
                      ? "border-arkos-blue/20 bg-arkos-blue/5"
                      : "border-arkos-border bg-arkos-surface"
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : item.status === "in_progress" ? (
                      <div className="w-5 h-5 rounded-full border-2 border-arkos-blue flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-arkos-blue animate-pulse" />
                      </div>
                    ) : (
                      <Circle className="h-5 w-5 text-arkos-border" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        item.status === "completed"
                          ? "text-text-muted line-through"
                          : "text-text-primary"
                      )}
                    >
                      {item.title}
                    </p>

                    {item.status === "in_progress" && (
                      <p className="text-xs text-arkos-blue-light mt-0.5">
                        ⚡ Em andamento
                      </p>
                    )}

                    {item.completedAt && (
                      <p className="text-2xs text-success mt-0.5">
                        ✓ {formatRelativeTime(item.completedAt)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB: REUNIÕES ─── */}
        {activeTab === "meetings" && (
          <div className="space-y-4">
            {project.meetings.map((meeting) => {
              const platCfg = PLATFORM_CONFIG[meeting.platform];
              const isPast = meeting.status === "completed";

              return (
                <div
                  key={meeting.id}
                  className={cn(
                    "p-5 rounded-2xl border transition-all",
                    isPast
                      ? "border-arkos-border bg-arkos-surface opacity-70"
                      : "border-arkos-blue/20 bg-arkos-blue/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            meeting.status === "completed"
                              ? "default"
                              : meeting.status === "cancelled"
                              ? "danger"
                              : "success"
                          }
                          size="sm"
                          dot={meeting.status === "scheduled"}
                          dotAnimate={meeting.status === "scheduled"}
                        >
                          {meeting.status === "completed"
                            ? "Realizada"
                            : meeting.status === "cancelled"
                            ? "Cancelada"
                            : "Agendada"}
                        </Badge>
                      </div>

                      <h3 className="text-base font-bold text-text-primary">
                        {meeting.title}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          {
                            icon: Calendar,
                            text: new Date(
                              meeting.scheduledAt
                            ).toLocaleDateString("pt-BR", {
                              weekday: "long",
                              day: "2-digit",
                              month: "long",
                              hour: "2-digit",
                              minute: "2-digit",
                            }),
                          },
                          {
                            icon: Clock,
                            text: `${meeting.duration} minutos`,
                          },
                          {
                            icon: meeting.location ? MapPin : Video,
                            text:
                              meeting.location ||
                              `${platCfg.icon} ${platCfg.label}`,
                          },
                        ].map(({ icon: Icon, text }) => (
                          <div
                            key={text}
                            className="flex items-center gap-2 text-sm text-text-secondary"
                          >
                            <Icon className="h-4 w-4 text-text-muted shrink-0" />
                            {text}
                          </div>
                        ))}
                      </div>

                      {meeting.attendees.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <User className="h-3.5 w-3.5" />
                          {meeting.attendees.join(" · ")}
                        </div>
                      )}

                      {meeting.notes && (
                        <div className="px-3 py-2 rounded-xl bg-arkos-surface-3 border border-arkos-border">
                          <p className="text-xs text-text-secondary leading-relaxed">
                            📝 {meeting.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    {meeting.meetingUrl &&
                      meeting.status === "scheduled" && (
                        <a
                          href={meeting.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-arkos-blue text-white text-sm font-semibold hover:bg-arkos-blue-light transition-colors"
                        >
                          <Video className="h-4 w-4" />
                          Entrar
                        </a>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── TAB: ATUALIZAÇÕES ─── */}
        {activeTab === "updates" && (
          <div className="space-y-3">
            {project.updates.map((update) => {
              const cfg = UPDATE_TYPE_CONFIG[update.type];
              return (
                <div
                  key={update.id}
                  className={cn(
                    "p-5 rounded-2xl border",
                    cfg.bg,
                    cfg.border,
                    !update.isRead && "ring-1 ring-info/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-2 shrink-0",
                        cfg.color
                      )}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-bold text-text-primary">
                          {update.title}
                        </h3>
                        {!update.isRead && (
                          <Badge variant="info" size="sm" dot>
                            Nova
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {update.message}
                      </p>
                      <p className="text-2xs text-text-muted mt-2">
                        {update.createdBy} ·{" "}
                        {formatRelativeTime(update.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── FOOTER ─── */}
        <footer className="pt-8 border-t border-arkos-border text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-blue flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-text-primary">ARKOS</span>
          </div>
          <p className="text-xs text-text-muted">
            Portal exclusivo para{" "}
            <strong>{project.clientName}</strong> ·{" "}
            {project.companyName}
          </p>
          <p className="text-2xs text-text-muted mt-1">
            Dúvidas? Fale com {project.managerName} ·{" "}
            <a
              href={`mailto:${project.managerEmail}`}
              className="text-arkos-blue-light hover:underline"
            >
              {project.managerEmail}
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
