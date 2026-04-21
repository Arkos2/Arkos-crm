"use client";

import { useState } from "react";
import { Deal, Activity, ActivityType } from "@/lib/types/deal";
import { cn, formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import { Avatar, Badge, Button, Card, ProgressBar } from "@/components/ui";
import { BANTMeterFull } from "./BANTMeter";
import { GAPDiagnosisCard } from "./GAPDiagnosis";
import {
  X, Star, Pin, MoreHorizontal, Bot, Phone, Mail,
  MessageSquare, Calendar, FileText, CheckSquare,
  Clock, Building2, User, Link as LinkIcon,
  TrendingUp, AlertTriangle, Check, Plus,
  ChevronDown, ExternalLink, Download, Send,
  Zap,
} from "lucide-react";

interface DealDetailSheetProps {
  deal: Deal | null;
  onClose: () => void;
  onUpdate?: (dealId: string, updates: Partial<Deal>) => void;
}

type TabId = "summary" | "timeline" | "tasks" | "documents" | "ai";

const TABS: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
  { id: "summary", label: "Resumo", icon: Building2 },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "tasks", label: "Tarefas", icon: CheckSquare },
  { id: "documents", label: "Documentos", icon: FileText },
  { id: "ai", label: "IA Insights", icon: Bot },
];

const ACTIVITY_CONFIG: Record<ActivityType, { icon: React.ElementType; color: string; bg: string }> = {
  call: { icon: Phone, color: "text-success", bg: "bg-success/10" },
  email: { icon: Mail, color: "text-info", bg: "bg-info/10" },
  meeting: { icon: Calendar, color: "text-arkos-gold", bg: "bg-arkos-gold/10" },
  note: { icon: FileText, color: "text-text-secondary", bg: "bg-arkos-surface-3" },
  whatsapp: { icon: MessageSquare, color: "text-success", bg: "bg-success/10" },
  stage_change: { icon: TrendingUp, color: "text-arkos-blue-light", bg: "bg-arkos-blue/10" },
  ai_action: { icon: Bot, color: "text-arkos-gold", bg: "bg-arkos-gold/10" },
  document: { icon: FileText, color: "text-warning", bg: "bg-warning/10" },
  task: { icon: CheckSquare, color: "text-info", bg: "bg-info/10" },
};

const DOC_STATUS_CONFIG = {
  draft: { label: "Rascunho", color: "text-text-muted", badge: "default" as const },
  sent: { label: "Enviado", color: "text-info", badge: "info" as const },
  viewed: { label: "Visualizado", color: "text-warning", badge: "warning" as const },
  signed: { label: "Assinado", color: "text-success", badge: "success" as const },
};

export function DealDetailSheet({ deal, onClose, onUpdate }: DealDetailSheetProps) {
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const [noteText, setNoteText] = useState("");

  if (!deal) return null;

  const pendingTasks = deal.tasks.filter((t) => !t.isCompleted);
  const completedTasks = deal.tasks.filter((t) => t.isCompleted);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 z-50",
          "w-full max-w-2xl",
          "bg-arkos-surface border-l border-arkos-border",
          "flex flex-col",
          "shadow-arkos-lg animate-slide-in-right"
        )}
      >
        {/* ─── HEADER ─── */}
        <div className="shrink-0 border-b border-arkos-border">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  deal.bant.total >= 75
                    ? "success"
                    : deal.bant.total >= 50
                    ? "warning"
                    : "danger"
                }
                dot
              >
                BANT {deal.bant.total}/100
              </Badge>

              {deal.isRotting && (
                <Badge variant="danger" dot dotAnimate>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Parado
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg text-text-muted hover:text-arkos-gold hover:bg-arkos-gold/10 transition-all">
                <Star className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-arkos-surface-2 transition-all">
                <Pin className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-arkos-surface-2 transition-all">
                <MoreHorizontal className="h-4 w-4" />
              </button>
              <div className="w-px h-4 bg-arkos-border mx-1" />
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-arkos-surface-2 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Título e valor */}
          <div className="px-5 pb-4 space-y-1">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-text-primary truncate">
                  {deal.organization.name}
                </h2>
                <p className="text-sm text-text-secondary truncate">
                  {deal.title}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-2xl font-bold text-text-primary">
                  {formatCurrency(deal.value)}
                </p>
                <div className="flex items-center gap-1 justify-end">
                  <div className="w-12 h-1.5 bg-arkos-surface-3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-arkos-blue rounded-full"
                      style={{ width: `${deal.probability}%` }}
                    />
                  </div>
                  <span className="text-2xs text-text-muted">
                    {deal.probability}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2 pt-2">
              {[
                { icon: Phone, label: "Ligar", variant: "secondary" as const },
                { icon: Mail, label: "E-mail", variant: "secondary" as const },
                { icon: MessageSquare, label: "WhatsApp", variant: "secondary" as const },
                { icon: Calendar, label: "Reunião", variant: "secondary" as const },
              ].map(({ icon: Icon, label, variant }) => (
                <Button
                  key={label}
                  variant={variant}
                  size="xs"
                  icon={<Icon className="h-3 w-3" />}
                >
                  {label}
                </Button>
              ))}
              <Button
                variant="gold"
                size="xs"
                icon={<Zap className="h-3 w-3" />}
                className="ml-auto"
              >
                IA Agir
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-t border-arkos-border overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium",
                    "border-b-2 transition-all duration-200 whitespace-nowrap",
                    activeTab === tab.id
                      ? "border-arkos-gold text-text-primary"
                      : "border-transparent text-text-secondary hover:text-text-primary hover:border-arkos-border-2"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {tab.id === "tasks" && pendingTasks.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-warning/10 text-warning text-2xs font-bold">
                      {pendingTasks.length}
                    </span>
                  )}
                  {tab.id === "ai" && deal.aiSuggestions && deal.aiSuggestions.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-arkos-gold/10 text-arkos-gold text-2xs font-bold">
                      {deal.aiSuggestions.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── CONTEÚDO DAS TABS ─── */}
        <div className="flex-1 overflow-y-auto">

          {/* ─── TAB: RESUMO ─── */}
          {activeTab === "summary" && (
            <div className="p-5 space-y-6">
              {/* Informações gerais */}
              <div>
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
                  Informações
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    { label: "Contato", value: `${deal.contact.firstName} ${deal.contact.lastName}`, icon: User },
                    { label: "Cargo", value: deal.contact.jobTitle || "—", icon: Building2 },
                    { label: "E-mail", value: deal.contact.email || "—", icon: Mail },
                    { label: "Telefone", value: deal.contact.phone || "—", icon: Phone },
                    { label: "Responsável", value: deal.ownerName, icon: User },
                    { label: "Fechamento Prev.", value: deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : "—", icon: Calendar },
                    { label: "Empresa", value: deal.organization.name, icon: Building2 },
                    { label: "Setor", value: deal.organization.industry || "—", icon: Building2 },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-start gap-2">
                      <Icon className="h-3.5 w-3.5 text-text-muted mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-2xs text-text-muted">{label}</p>
                        <p className="text-xs font-medium text-text-primary truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {deal.contact.isDecisionMaker && (
                  <div className="mt-3 flex items-center gap-1.5 text-2xs text-success">
                    <Check className="h-3 w-3" />
                    <span>Contato é o tomador de decisão</span>
                  </div>
                )}
              </div>

              <div className="border-t border-arkos-border" />

              {/* BANT */}
              <BANTMeterFull bant={deal.bant} />

              <div className="border-t border-arkos-border" />

              {/* GAP Diagnosis */}
              <GAPDiagnosisCard
                gap={deal.gap}
                onUpdate={(updates) => onUpdate?.(deal.id, { gap: { ...deal.gap, ...updates } })}
              />
            </div>
          )}

          {/* ─── TAB: TIMELINE ─── */}
          {activeTab === "timeline" && (
            <div className="p-5 space-y-4">
              {/* Adicionar nota */}
              <div className="space-y-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Adicionar nota, registrar ligação..."
                  className={cn(
                    "w-full px-3 py-2.5 rounded-xl text-sm min-h-[72px] resize-none",
                    "bg-arkos-bg border border-arkos-border",
                    "text-text-primary placeholder:text-text-muted",
                    "focus:outline-none focus:border-arkos-blue focus:ring-1 focus:ring-arkos-blue/40",
                    "transition-all duration-200"
                  )}
                />
                {noteText && (
                  <div className="flex gap-2">
                    {["Nota", "Ligação", "Reunião"].map((type) => (
                      <Button key={type} variant="secondary" size="xs">
                        {type}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Lista de atividades */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-arkos-border" />

                <div className="space-y-4">
                  {deal.activities.map((activity) => {
                    const config = ACTIVITY_CONFIG[activity.type];
                    const Icon = config.icon;

                    return (
                      <div key={activity.id} className="flex gap-4 relative">
                        {/* Ícone na linha do tempo */}
                        <div
                          className={cn(
                            "shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10",
                            config.bg,
                            activity.isAI && "ring-1 ring-arkos-gold/40"
                          )}
                        >
                          <Icon className={cn("h-3.5 w-3.5", config.color)} />
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 min-w-0 pb-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-text-primary">
                                {activity.title}
                              </span>
                              {activity.isAI && (
                                <Badge variant="gold" size="sm">
                                  <Bot className="h-2.5 w-2.5 mr-1" />
                                  IA
                                </Badge>
                              )}
                            </div>
                            <span className="text-2xs text-text-muted shrink-0">
                              {formatRelativeTime(activity.createdAt)}
                            </span>
                          </div>

                          {activity.description && (
                            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                              {activity.description}
                            </p>
                          )}

                          {activity.userName && (
                            <p className="text-2xs text-text-muted mt-1">
                              por {activity.userName}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB: TAREFAS ─── */}
          {activeTab === "tasks" && (
            <div className="p-5 space-y-4">
              {/* Nova tarefa */}
              <Button
                variant="secondary"
                size="sm"
                icon={<Plus className="h-3.5 w-3.5" />}
                fullWidth
              >
                Nova Tarefa
              </Button>

              {/* Pendentes */}
              {pendingTasks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-2xs font-semibold text-text-muted uppercase tracking-wide">
                    Pendentes ({pendingTasks.length})
                  </h4>
                  {pendingTasks.map((task) => {
                    const isOverdue =
                      task.dueDate && new Date(task.dueDate) < new Date();
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-xl border",
                          "bg-arkos-surface-2 transition-all hover:border-arkos-blue/30",
                          task.priority === "high"
                            ? "border-warning/20"
                            : "border-arkos-border"
                        )}
                      >
                        <button className="mt-0.5 w-4 h-4 rounded-full border-2 border-arkos-border-2 hover:border-success transition-colors shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text-primary">
                            {task.title}
                          </p>
                          {task.dueDate && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              <span
                                className={cn(
                                  "text-2xs",
                                  isOverdue ? "text-danger" : "text-text-muted"
                                )}
                              >
                                {isOverdue ? "Atrasado — " : ""}
                                {formatDate(task.dueDate)}
                              </span>
                            </div>
                          )}
                        </div>
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "warning"
                              : task.priority === "medium"
                              ? "info"
                              : "default"
                          }
                          size="sm"
                        >
                          {task.priority === "high"
                            ? "Alta"
                            : task.priority === "medium"
                            ? "Média"
                            : "Baixa"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Concluídas */}
              {completedTasks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-2xs font-semibold text-text-muted uppercase tracking-wide">
                    Concluídas ({completedTasks.length})
                  </h4>
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-xl border border-arkos-border opacity-60"
                    >
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-success/20 border-2 border-success flex items-center justify-center shrink-0">
                        <Check className="h-2.5 w-2.5 text-success" />
                      </div>
                      <p className="text-xs text-text-secondary line-through">
                        {task.title}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {deal.tasks.length === 0 && (
                <div className="text-center py-12">
                  <CheckSquare className="h-10 w-10 text-text-muted mx-auto mb-3" />
                  <p className="text-sm text-text-secondary">
                    Nenhuma tarefa ainda
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Crie tarefas para acompanhar este negócio
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: DOCUMENTOS ─── */}
          {activeTab === "documents" && (
            <div className="p-5 space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Bot className="h-3.5 w-3.5" />}
                >
                  Gerar Proposta via IA
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Plus className="h-3.5 w-3.5" />}
                >
                  Upload
                </Button>
              </div>

              {deal.documents.length > 0 ? (
                <div className="space-y-2">
                  {deal.documents.map((doc) => {
                    const statusConfig = DOC_STATUS_CONFIG[doc.status];
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-arkos-border bg-arkos-surface-2 hover:border-arkos-blue/30 transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-arkos-blue/10 shrink-0">
                          <FileText className="h-4 w-4 text-arkos-blue-light" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-text-primary truncate">
                            {doc.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant={statusConfig.badge} size="sm" dot>
                              {statusConfig.label}
                            </Badge>
                            {doc.viewCount !== undefined && doc.viewCount > 0 && (
                              <span className="text-2xs text-text-muted">
                                Visto {doc.viewCount}x
                              </span>
                            )}
                            {doc.lastViewedAt && (
                              <span className="text-2xs text-text-muted">
                                {formatRelativeTime(doc.lastViewedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded-lg hover:bg-arkos-surface-3 text-text-muted hover:text-text-primary transition-all">
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          {doc.status !== "signed" && (
                            <button className="p-1.5 rounded-lg hover:bg-arkos-blue/10 text-text-muted hover:text-arkos-blue-light transition-all">
                              <Send className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-10 w-10 text-text-muted mx-auto mb-3" />
                  <p className="text-sm text-text-secondary">
                    Nenhum documento ainda
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Gere uma proposta ou faça upload de um arquivo
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: IA INSIGHTS ─── */}
          {activeTab === "ai" && (
            <div className="p-5 space-y-4">
              {/* Score IA */}
              {deal.aiScore !== undefined && (
                <Card className="border-arkos-gold/20 bg-arkos-gold/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-arkos-gold" />
                      <span className="text-sm font-semibold text-text-primary">
                        Score de Fechamento — IA
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-arkos-gold">
                      {deal.aiScore}/100
                    </span>
                  </div>
                  <ProgressBar value={deal.aiScore} autoColor animate size="md" />

                  {deal.aiPrediction && (
                    <div className="mt-3 pt-3 border-t border-arkos-gold/20">
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {deal.aiPrediction.reasoning}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-2xs text-text-muted">
                          Confiança da IA:
                        </span>
                        <span className="text-2xs font-bold text-arkos-gold">
                          {deal.aiPrediction.confidence}%
                        </span>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Sugestões */}
              {deal.aiSuggestions && deal.aiSuggestions.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                    Sugestões Ativas
                  </h4>

                  {deal.aiSuggestions.map((suggestion) => (
                    <Card
                      key={suggestion.id}
                      className={cn(
                        "border",
                        suggestion.type === "warning" && "border-danger/30 bg-danger/5",
                        suggestion.type === "opportunity" && "border-success/30 bg-success/5",
                        suggestion.type === "insight" && "border-arkos-gold/30 bg-arkos-gold/5",
                        suggestion.type === "action" && "border-arkos-blue/30 bg-arkos-blue/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "p-1.5 rounded-lg shrink-0",
                            suggestion.type === "warning" && "bg-danger/10",
                            suggestion.type === "opportunity" && "bg-success/10",
                            suggestion.type === "insight" && "bg-arkos-gold/10",
                            suggestion.type === "action" && "bg-arkos-blue/10"
                          )}
                        >
                          <Bot
                            className={cn(
                              "h-4 w-4",
                              suggestion.type === "warning" && "text-danger",
                              suggestion.type === "opportunity" && "text-success",
                              suggestion.type === "insight" && "text-arkos-gold",
                              suggestion.type === "action" && "text-arkos-blue-light"
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                suggestion.type === "warning"
                                  ? "danger"
                                  : suggestion.type === "opportunity"
                                  ? "success"
                                  : suggestion.type === "insight"
                                  ? "gold"
                                  : "blue"
                              }
                              size="sm"
                            >
                              {suggestion.type === "warning"
                                ? "⚠️ Alerta"
                                : suggestion.type === "opportunity"
                                ? "🎯 Oportunidade"
                                : suggestion.type === "insight"
                                ? "💡 Insight"
                                : "⚡ Ação"}
                            </Badge>
                            {suggestion.confidence && (
                              <span className="text-2xs text-text-muted">
                                {suggestion.confidence}% confiança
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            {suggestion.text}
                          </p>
                          {suggestion.actions && suggestion.actions.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {suggestion.actions.map((action) => (
                                <Button
                                  key={action.action}
                                  variant="secondary"
                                  size="xs"
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-right">
                        <span className="text-2xs text-text-muted">
                          {formatRelativeTime(suggestion.createdAt)}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bot className="h-10 w-10 text-text-muted mx-auto mb-3" />
                  <p className="text-sm text-text-secondary">
                    Nenhum insight no momento
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    A IA está monitorando este negócio
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
