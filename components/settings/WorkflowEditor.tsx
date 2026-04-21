"use client";

import { useState } from "react";
import { Workflow, WorkflowTrigger, WorkflowActionType } from "@/lib/types/settings";
import { cn } from "@/lib/utils";
import { Button, Badge, Input } from "@/components/ui";
import {
  X, Plus, Zap, ChevronRight, Trash2,
  GripVertical, Settings, Bot, Clock,
  Save, Eye, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const TRIGGERS: Array<{ id: WorkflowTrigger; label: string; emoji: string; description: string }> = [
  { id: "lead_inbound", label: "Lead Inbound", emoji: "📥", description: "Novo lead chegou pelo site/chatbot" },
  { id: "lead_qualified", label: "Lead Qualificado", emoji: "🎯", description: "BANT Score atingiu o mínimo" },
  { id: "bant_score_reached", label: "BANT Score", emoji: "📊", description: "Lead atingiu score mínimo configurado" },
  { id: "deal_created", label: "Deal Criado", emoji: "📋", description: "Novo negócio adicionado ao pipeline" },
  { id: "deal_stage_changed", label: "Etapa Alterada", emoji: "🔄", description: "Deal movido para outra etapa" },
  { id: "deal_won", label: "Deal Ganho", emoji: "🏆", description: "Negócio marcado como ganho" },
  { id: "deal_lost", label: "Deal Perdido", emoji: "❌", description: "Negócio marcado como perdido" },
  { id: "proposal_sent", label: "Proposta Enviada", emoji: "📄", description: "Proposta enviada ao cliente" },
  { id: "proposal_viewed", label: "Proposta Visualizada", emoji: "👁️", description: "Cliente abriu a proposta" },
  { id: "proposal_signed", label: "Proposta Assinada", emoji: "✍️", description: "Cliente assinou o documento" },
  { id: "no_activity_days", label: "Sem Atividade", emoji: "⚠️", description: "X dias sem atividade no deal" },
  { id: "task_overdue", label: "Tarefa Atrasada", emoji: "⏰", description: "Tarefa passou do prazo" },
  { id: "meeting_scheduled", label: "Reunião Agendada", emoji: "📅", description: "Nova reunião agendada" },
  { id: "meeting_completed", label: "Reunião Realizada", emoji: "✅", description: "Reunião foi concluída" },
];

const ACTIONS: Array<{ type: WorkflowActionType; label: string; emoji: string; description: string; isAI?: boolean }> = [
  { type: "send_email", label: "Enviar E-mail", emoji: "📧", description: "Envia e-mail para o lead ou equipe" },
  { type: "send_whatsapp", label: "Enviar WhatsApp", emoji: "💬", description: "Envia mensagem no WhatsApp" },
  { type: "create_task", label: "Criar Tarefa", emoji: "✅", description: "Cria tarefa para o vendedor" },
  { type: "notify_user", label: "Notificar Usuário", emoji: "🔔", description: "Envia notificação push/WhatsApp" },
  { type: "move_deal_stage", label: "Mover Etapa", emoji: "🔄", description: "Move o deal para outra etapa" },
  { type: "start_sequence", label: "Iniciar Sequência", emoji: "🔁", description: "Inicia sequência de follow-up" },
  { type: "assign_deal", label: "Atribuir Deal", emoji: "👤", description: "Atribui o deal a um vendedor" },
  { type: "add_tag", label: "Adicionar Tag", emoji: "🏷️", description: "Adiciona tag ao deal ou contato" },
  { type: "create_deal", label: "Criar Deal", emoji: "📋", description: "Cria novo deal no pipeline" },
  { type: "ai_qualify", label: "IA: Qualificar", emoji: "🤖", description: "Agente Qualificador inicia conversa", isAI: true },
  { type: "ai_write_email", label: "IA: Redigir E-mail", emoji: "✍️", description: "Agente Redator gera conteúdo", isAI: true },
  { type: "webhook", label: "Webhook", emoji: "🌐", description: "Envia dados para URL externa" },
];

interface WorkflowEditorProps {
  workflow?: Workflow;
  onSave: (workflow: Partial<Workflow>) => void;
  onClose: () => void;
}

export function WorkflowEditor({ workflow, onSave, onClose }: WorkflowEditorProps) {
  const [name, setName] = useState(workflow?.name || "");
  const [description, setDescription] = useState(workflow?.description || "");
  const [selectedTrigger, setSelectedTrigger] = useState<WorkflowTrigger | null>(
    workflow?.trigger || null
  );
  const [selectedActions, setSelectedActions] = useState<Array<{
    id: string;
    type: WorkflowActionType;
    label: string;
    emoji: string;
    delay: number;
  }>>(
    workflow?.actions.map(a => ({
      id: a.id,
      type: a.type,
      label: ACTIONS.find(ac => ac.type === a.type)?.label || a.type,
      emoji: ACTIONS.find(ac => ac.type === a.type)?.emoji || "⚡",
      delay: a.delayMinutes || 0,
    })) || []
  );
  const [step, setStep] = useState<"trigger" | "actions" | "settings">("trigger");
  const isEditing = !!workflow;

  const handleAddAction = (actionType: WorkflowActionType) => {
    const actionDef = ACTIONS.find(a => a.type === actionType);
    if (!actionDef) return;
    setSelectedActions(prev => [...prev, {
      id: `act-new-${Date.now()}`,
      type: actionType,
      label: actionDef.label,
      emoji: actionDef.emoji,
      delay: 0,
    }]);
  };

  const handleRemoveAction = (id: string) => {
    setSelectedActions(prev => prev.filter(a => a.id !== id));
  };

  const handleSave = () => {
    if (!name.trim()) { toast.error("Digite um nome para o workflow"); return; }
    if (!selectedTrigger) { toast.error("Selecione um gatilho"); return; }
    if (selectedActions.length === 0) { toast.error("Adicione pelo menos uma ação"); return; }

    onSave({
      name,
      description,
      trigger: selectedTrigger,
      conditions: workflow?.conditions || [],
      actions: selectedActions.map((a, i) => ({
        id: a.id,
        type: a.type,
        order: i + 1,
        delayMinutes: a.delay,
        config: {},
        label: a.label,
      })),
      status: "draft",
    });
    toast.success(isEditing ? "Workflow atualizado!" : "Workflow criado!");
    onClose();
  };

  const steps = [
    { id: "trigger", label: "Gatilho", done: !!selectedTrigger },
    { id: "actions", label: "Ações", done: selectedActions.length > 0 },
    { id: "settings", label: "Configurar", done: !!name },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-arkos-surface border border-arkos-border rounded-3xl shadow-arkos-lg animate-scale-in overflow-hidden">

        {/* ─── HEADER ─── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-arkos-border shrink-0">
          <div>
            <h2 className="text-base font-bold text-text-primary">
              {isEditing ? "Editar Workflow" : "Novo Workflow"}
            </h2>
            <p className="text-xs text-text-muted">
              {isEditing ? workflow.name : "Configure o gatilho e as ações"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-arkos-surface-2 text-text-muted hover:text-text-primary transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ─── STEPPER ─── */}
        <div className="flex items-center gap-0 px-6 py-3 border-b border-arkos-border shrink-0">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <button
                onClick={() => setStep(s.id as typeof step)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                  step === s.id
                    ? "bg-arkos-blue/10 text-arkos-blue-light border border-arkos-blue/30"
                    : s.done
                    ? "text-success hover:bg-success/10"
                    : "text-text-muted hover:bg-arkos-surface-2"
                )}
              >
                {s.done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                ) : (
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center text-2xs font-bold",
                    step === s.id ? "border-arkos-blue text-arkos-blue-light" : "border-arkos-border text-text-muted"
                  )}>
                    {i + 1}
                  </div>
                )}
                {s.label}
              </button>
              {i < steps.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-text-muted mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* ─── CONTEÚDO ─── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* STEP 1: TRIGGER */}
          {step === "trigger" && (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">
                Selecione o evento que irá disparar este workflow:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TRIGGERS.map((trigger) => (
                  <button
                    key={trigger.id}
                    onClick={() => {
                      setSelectedTrigger(trigger.id);
                      setStep("actions");
                    }}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                      selectedTrigger === trigger.id
                        ? "bg-arkos-gold/10 border-arkos-gold/40"
                        : "border-arkos-border bg-arkos-surface-2 hover:border-arkos-blue/30 hover:bg-arkos-blue/5"
                    )}
                  >
                    <span className="text-xl shrink-0">{trigger.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-text-primary">
                        {trigger.label}
                      </p>
                      <p className="text-2xs text-text-muted mt-0.5">
                        {trigger.description}
                      </p>
                    </div>
                    {selectedTrigger === trigger.id && (
                      <CheckCircle2 className="h-4 w-4 text-arkos-gold shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: ACTIONS */}
          {step === "actions" && (
            <div className="space-y-4">
              {/* Ações selecionadas */}
              {selectedActions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                    Sequência de Ações
                  </p>

                  {/* Gatilho */}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-arkos-gold/10 border border-arkos-gold/20">
                    <Zap className="h-4 w-4 text-arkos-gold shrink-0" />
                    <div>
                      <p className="text-2xs text-text-muted">Gatilho</p>
                      <p className="text-xs font-bold text-arkos-gold">
                        {TRIGGERS.find(t => t.id === selectedTrigger)?.emoji}{" "}
                        {TRIGGERS.find(t => t.id === selectedTrigger)?.label}
                      </p>
                    </div>
                  </div>

                  {selectedActions.map((action, i) => (
                    <div key={action.id} className="flex items-center gap-2">
                      {/* Linha conectora */}
                      <div className="flex flex-col items-center w-5 shrink-0">
                        <div className="w-px h-3 bg-arkos-border" />
                        <ChevronRight className="h-3 w-3 text-text-muted rotate-90" />
                      </div>

                      <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-arkos-surface-2 border border-arkos-border">
                        <GripVertical className="h-4 w-4 text-text-muted cursor-grab shrink-0" />
                        <span className="text-lg">{action.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-text-primary">
                            {action.label}
                          </p>
                          {action.delay > 0 && (
                            <p className="text-2xs text-text-muted">
                              <Clock className="h-2.5 w-2.5 inline mr-0.5" />
                              Aguardar {action.delay}min
                            </p>
                          )}
                        </div>

                        {/* Delay input */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Clock className="h-3 w-3 text-text-muted" />
                          <input
                            type="number"
                            min={0}
                            value={action.delay}
                            onChange={(e) => {
                              const delay = Number(e.target.value);
                              setSelectedActions(prev =>
                                prev.map(a => a.id === action.id ? { ...a, delay } : a)
                              );
                            }}
                            className="w-14 h-6 px-2 rounded-lg text-2xs bg-arkos-bg border border-arkos-border text-text-primary focus:outline-none focus:border-arkos-blue text-center"
                            title="Delay em minutos"
                          />
                          <span className="text-2xs text-text-muted">min</span>
                        </div>

                        <button
                          onClick={() => handleRemoveAction(action.id)}
                          className="p-1 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-all shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar ação */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  Adicionar Ação
                </p>

                {/* IA Actions */}
                <div className="space-y-1.5">
                  <p className="text-2xs font-semibold text-arkos-gold flex items-center gap-1.5">
                    <Bot className="h-3 w-3" />
                    Ações com IA
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ACTIONS.filter(a => a.isAI).map((action) => (
                      <button
                        key={action.type}
                        onClick={() => handleAddAction(action.type)}
                        className="flex items-start gap-3 p-3 rounded-xl border border-arkos-gold/20 bg-arkos-gold/5 hover:bg-arkos-gold/10 text-left transition-all"
                      >
                        <span className="text-lg">{action.emoji}</span>
                        <div>
                          <p className="text-xs font-bold text-text-primary">{action.label}</p>
                          <p className="text-2xs text-text-muted">{action.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Regular Actions */}
                <div className="space-y-1.5">
                  <p className="text-2xs font-semibold text-text-muted uppercase tracking-wide">
                    Ações Padrão
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {ACTIONS.filter(a => !a.isAI).map((action) => (
                      <button
                        key={action.type}
                        onClick={() => handleAddAction(action.type)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-arkos-border bg-arkos-surface-2 hover:border-arkos-blue/30 hover:bg-arkos-blue/5 text-left transition-all"
                      >
                        <span className="text-base">{action.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-text-primary">
                            {action.label}
                          </p>
                          <p className="text-2xs text-text-muted truncate">
                            {action.description}
                          </p>
                        </div>
                        <Plus className="h-3.5 w-3.5 text-text-muted ml-auto shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SETTINGS */}
          {step === "settings" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Input
                  label="Nome do Workflow *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Alerta — Proposta Visualizada"
                  required
                />
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                    Descrição
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o objetivo deste workflow..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl text-sm resize-none bg-arkos-bg border border-arkos-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arkos-blue transition-all"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-2xl border border-arkos-border bg-arkos-surface-2 p-4 space-y-3">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  Preview do Workflow
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-arkos-gold/10 border border-arkos-gold/20 text-xs font-medium text-arkos-gold">
                    <Zap className="h-3 w-3" />
                    {TRIGGERS.find(t => t.id === selectedTrigger)?.emoji}{" "}
                    {TRIGGERS.find(t => t.id === selectedTrigger)?.label || "Gatilho"}
                  </div>
                  {selectedActions.map((action, i) => (
                    <div key={action.id} className="flex items-center gap-1">
                      <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-arkos-surface-3 text-2xs font-medium text-text-secondary">
                        {action.emoji} {action.label}
                      </div>
                    </div>
                  ))}
                </div>
                {name && (
                  <p className="text-xs font-bold text-text-primary">{name}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── FOOTER ─── */}
        <div className="px-6 py-4 border-t border-arkos-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {step !== "trigger" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(step === "actions" ? "trigger" : "actions")}
              >
                Voltar
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            {step !== "settings" ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setStep(step === "trigger" ? "actions" : "settings")}
                disabled={step === "trigger" ? !selectedTrigger : selectedActions.length === 0}
              >
                Próximo
              </Button>
            ) : (
              <Button
                variant="gold"
                size="sm"
                onClick={handleSave}
                icon={<Save className="h-3.5 w-3.5" />}
                disabled={!name || !selectedTrigger || selectedActions.length === 0}
              >
                {isEditing ? "Salvar Alterações" : "Criar Workflow"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
