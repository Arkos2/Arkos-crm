"use client";

import { useState, useEffect } from "react";
import {
  Workflow, TeamMember, Integration,
  PipelineConfig, PipelineStageConfig, CustomField, TeamRole,
} from "@/lib/types/settings";

import { useWorkflows } from "@/hooks/useWorkflows";
import { WorkflowCard } from "@/components/settings/WorkflowCard";
import { WorkflowEditor } from "@/components/settings/WorkflowEditor";
import { Card, Badge, Button, Avatar, Input, ProgressBar, Skeleton } from "@/components/ui";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
import {
  Settings, Zap, Kanban, Users, Plug,
  Bell, Bot, Plus, Search, Filter,
  ToggleLeft, ToggleRight, Shield,
  AlertCircle, CheckCircle2, Clock,
  Trash2, Edit, Globe, Mail, MessageSquare,
  Key, Sliders, Building2, ChevronRight,
  ExternalLink, RefreshCw, Activity,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

// ─── CONSTANTES DE CONFIGURAÇÃO UI (não são dados fictícios) ───
const PIPELINE_STAGES_DEFAULT: PipelineStageConfig[] = [
  { id: "prospecting", name: "Prospecção", probability: 10, color: "slate", rottingAfterDays: 7, order: 0 },
  { id: "qualification", name: "Qualificação", probability: 25, color: "blue", rottingAfterDays: 5, order: 1 },
  { id: "proposal", name: "Proposta", probability: 60, color: "amber", rottingAfterDays: 4, order: 2 },
  { id: "closing", name: "Fechamento", probability: 95, color: "green", rottingAfterDays: 2, order: 5 },
];

const DEFAULT_PIPELINES: PipelineConfig[] = [
  {
    id: "default",
    name: "Funil de Vendas",
    description: "Pipeline padrão",
    isDefault: true,
    currency: "BRL",
    dealRotting: true,
    stages: PIPELINE_STAGES_DEFAULT,
    createdAt: new Date().toISOString(),
  }
];

const DEFAULT_INTEGRATIONS: Integration[] = [
  { id: "whatsapp", name: "WhatsApp Business", description: "Integração oficial via API", logo: "💬", category: "communication", status: "disconnected" },
  { id: "gmail", name: "Gmail / Google Workspace", description: "Sincronização de e-mails", logo: "📧", category: "communication", status: "disconnected" },
  { id: "zapsign", name: "ZapSign", description: "Assinatura de contratos", logo: "✍️", category: "signature", status: "disconnected" },
  { id: "anthropic", name: "Anthropic Claude", description: "Motor de IA (Claude 3.5 Sonnet)", logo: "🧠", category: "ai", status: "disconnected" },
];


type SettingsTab =
  | "general"
  | "workflows"
  | "pipelines"
  | "fields"
  | "team"
  | "integrations"
  | "notifications"
  | "ai";

interface AISettings {
  model: string;
  temperature: number;
  maxTokens: number;
  language: string;
  tone: 'formal' | 'professional' | 'casual';
  companyContext: string;
  agentAutonomy: {
    qualifier: 'off' | 'suggest' | 'full';
    writer: 'off' | 'suggest' | 'full';
    followup: 'off' | 'suggest' | 'full';
    prospector: 'off' | 'suggest' | 'full';
    analyst: 'off' | 'suggest' | 'full';
    coach: 'off' | 'suggest' | 'full';
  };
  monthlyTokenBudget: number;
  tokensUsedThisMonth: number;
}

const SETTINGS_NAV: Array<{
  id: SettingsTab;
  label: string;
  icon: React.ElementType;
  description: string;
}> = [
  { id: "general", label: "Geral", icon: Settings, description: "Nome, fuso horário e preferências" },
  { id: "workflows", label: "Workflows", icon: Zap, description: "Automações e gatilhos" },
  { id: "pipelines", label: "Funis", icon: Kanban, description: "Etapas e configurações do pipeline" },
  { id: "fields", label: "Campos", icon: Sliders, description: "Campos personalizados" },
  { id: "team", label: "Equipe", icon: Users, description: "Membros, papéis e permissões" },
  { id: "integrations", label: "Integrações", icon: Plug, description: "Apps e conexões externas" },
  { id: "notifications", label: "Notificações", icon: Bell, description: "Alertas e avisos" },
  { id: "ai", label: "IA & Agentes", icon: Bot, description: "Configurações dos agentes" },
];

const ROLE_CONFIG: Record<TeamRole, { label: string; color: string; variant: "danger" | "warning" | "info" | "default" }> = {
  admin: { label: "Admin", color: "text-danger", variant: "danger" },
  manager: { label: "Gerente", color: "text-warning", variant: "warning" },
  seller: { label: "Vendedor", color: "text-info", variant: "info" },
  viewer: { label: "Visualizador", color: "text-text-muted", variant: "default" },
};

const INTEGRATION_STATUS_CONFIG = {
  connected: { label: "Conectado", variant: "success" as const, dot: true, animate: false },
  disconnected: { label: "Desconectado", variant: "default" as const, dot: false, animate: false },
  error: { label: "Erro", variant: "danger" as const, dot: true, animate: true },
  pending: { label: "Pendente", variant: "warning" as const, dot: true, animate: true },
};

const STAGE_COLORS: Record<string, string> = {
  slate: "bg-slate-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  green: "bg-green-500",
  red: "bg-red-500",
};

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: "Texto", number: "Número", date: "Data",
  select: "Seleção única", multiselect: "Seleção múltipla",
  checkbox: "Checkbox", url: "URL", phone: "Telefone",
  email: "E-mail", textarea: "Área de texto",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("workflows");
  const {
    workflows,
    isLoading: isWorkflowsLoading,
    create: createWorkflow,
    update: updateWorkflow,
    toggle: toggleWorkflow,
    delete: deleteWorkflowService,
  } = useWorkflows();

  const [showWorkflowEditor, setShowWorkflowEditor] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | undefined>();
  const [workflowSearch, setWorkflowSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [integrationFilter, setIntegrationFilter] = useState<"all" | "connected" | "disconnected">("all");
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    whatsappNotifications: false,
    events: {
      dealStageChanged: true, newLeadAssigned: true, proposalViewed: true,
      proposalSigned: true, taskOverdue: true, dealRotting: true,
      goalAchieved: true, aiInsight: false, teamMention: true,
    },
    digestFrequency: "realtime" as const,
  });
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("arkos_ai_settings");
      if (saved) return JSON.parse(saved);
    }
    return {
      model: "gemini-1.5-flash",
      temperature: 0.7,
      maxTokens: 2048,
      language: "pt-BR",
      tone: "professional",
      companyContext: "",
      agentAutonomy: { qualifier: "suggest", writer: "suggest", followup: "suggest", prospector: "suggest", analyst: "suggest", coach: "suggest" },
      monthlyTokenBudget: 0,
      tokensUsedThisMonth: 0,
    };
  });

  // Autosave AI settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("arkos_ai_settings", JSON.stringify(aiSettings));
    }
  }, [aiSettings]);
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "",
    companyWebsite: "",
    timezone: "America/Sao_Paulo",
    currency: "BRL",
    dateFormat: "DD/MM/YYYY",
    language: "pt-BR",
    fiscalYearStart: "01/01",
  });

  // ─── WORKFLOW ACTIONS ───
  const handleToggleWorkflow = async (id: string) => {
    const wf = workflows.find(w => w.id === id);
    if (wf) {
      await toggleWorkflow(id, wf.status);
    }
  };

  const handleSaveWorkflow = async (data: Partial<Workflow>) => {
    if (editingWorkflow) {
      await updateWorkflow(editingWorkflow.id, data);
    } else {
      await createWorkflow(data);
    }
    setEditingWorkflow(undefined);
    setShowWorkflowEditor(false);
  };

  const handleDeleteWorkflow = async (id: string) => {
    await deleteWorkflowService(id);
  };

  const filteredWorkflows = workflows.filter(w =>
    !workflowSearch || w.name.toLowerCase().includes(workflowSearch.toLowerCase())
  );

  const activeWorkflowsCount = workflows.filter(w => w.status === "active").length;
  const totalExecutions = workflows.reduce((s, w) => s + w.executionCount, 0);
  const tokensPercent = Math.round((aiSettings.tokensUsedThisMonth / aiSettings.monthlyTokenBudget) * 100);

  const filteredIntegrations = DEFAULT_INTEGRATIONS.filter(i => {
    if (integrationFilter === "connected") return i.status === "connected";
    if (integrationFilter === "disconnected") return i.status === "disconnected";
    return true;
  });

  const connectedCount = DEFAULT_INTEGRATIONS.filter(i => i.status === "connected").length;

  return (
    <div className="space-y-5">
      {/* ─── HEADER ─── */}
      <div>
        <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <Settings className="h-5 w-5 text-text-muted" />
          Configurações
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          Personalize o ARKOS CRM para o seu processo
        </p>
      </div>

      {/* ─── LAYOUT ─── */}
      <div className="grid grid-cols-12 gap-5">

        {/* ─── SIDEBAR NAV ─── */}
        <div className="col-span-12 lg:col-span-3">
          <Card padding="sm">
            <nav className="space-y-0.5">
              {SETTINGS_NAV.map(({ id, label, icon: Icon, description }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                    "transition-all duration-200 text-left",
                    activeTab === id
                      ? "bg-arkos-blue/10 border border-arkos-blue/20 text-arkos-blue-light"
                      : "hover:bg-arkos-surface-2 text-text-secondary hover:text-text-primary border border-transparent"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 shrink-0",
                    activeTab === id ? "text-arkos-blue-light" : "text-text-muted"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{label}</p>
                    <p className="text-2xs text-text-muted truncate hidden lg:block">
                      {description}
                    </p>
                  </div>
                  {activeTab === id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-arkos-gold shrink-0" />
                  )}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* ─── CONTEÚDO PRINCIPAL ─── */}
        <div className="col-span-12 lg:col-span-9 space-y-4">

          {/* ══════════════════════════════════
              TAB: GERAL
          ══════════════════════════════════ */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <Card>
                <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-text-muted" />
                  Informações da Empresa
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nome da Empresa"
                    value={generalSettings.companyName}
                    onChange={(e) => setGeneralSettings(p => ({ ...p, companyName: e.target.value }))}
                  />
                  <Input
                    label="Website"
                    value={generalSettings.companyWebsite || ""}
                    onChange={(e) => setGeneralSettings(p => ({ ...p, companyWebsite: e.target.value }))}
                    prefix="🌐"
                  />
                </div>
              </Card>

              <Card>
                <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-text-muted" />
                  Regionalização
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Fuso Horário", value: generalSettings.timezone, options: ["America/Sao_Paulo", "America/Manaus", "America/Fortaleza"] },
                    { label: "Moeda", value: generalSettings.currency, options: ["BRL", "USD", "EUR"] },
                    { label: "Formato de Data", value: generalSettings.dateFormat, options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] },
                    { label: "Idioma", value: generalSettings.language, options: ["pt-BR", "en-US", "es-ES"] },
                  ].map(({ label, value, options }) => (
                    <div key={label}>
                      <label className="text-xs font-medium text-text-secondary mb-1.5 block">{label}</label>
                      <select
                        value={value}
                        className="w-full h-9 px-3 rounded-lg text-sm bg-arkos-bg border border-arkos-border text-text-primary focus:outline-none focus:border-arkos-blue transition-all"
                      >
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex justify-end">
                <Button variant="gold" size="sm" onClick={() => toast.success("Configurações salvas!")}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════
              TAB: WORKFLOWS
          ══════════════════════════════════ */}
          {activeTab === "workflows" && (
            <div className="space-y-4">

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Ativos", value: isWorkflowsLoading ? "..." : activeWorkflowsCount, color: "text-success" },
                  { label: "Execuções totais", value: isWorkflowsLoading ? "..." : totalExecutions.toLocaleString(), color: "text-arkos-blue-light" },
                  { label: "Taxa de sucesso", value: isWorkflowsLoading ? "..." : `${workflows.length > 0 ? Math.round(workflows.reduce((s, w) => s + (w.executionCount > 0 ? (w.successCount || 0) / w.executionCount : 1), 0) / workflows.length * 100) : 0}%`, color: "text-arkos-gold" },
                ].map(({ label, value, color }) => (
                  <Card key={label} padding="sm" className="text-center">
                    <p className={cn("text-2xl font-black", color)}>{value}</p>
                    <p className="text-2xs text-text-muted">{label}</p>
                  </Card>
                ))}
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                  <input
                    value={workflowSearch}
                    onChange={(e) => setWorkflowSearch(e.target.value)}
                    placeholder="Buscar workflow..."
                    className="w-full h-9 pl-9 pr-3 rounded-xl text-sm bg-arkos-surface border border-arkos-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arkos-blue transition-all"
                  />
                </div>
                <Button
                  variant="gold"
                  size="sm"
                  icon={<Plus className="h-3.5 w-3.5" />}
                  onClick={() => {
                    setEditingWorkflow(undefined);
                    setShowWorkflowEditor(true);
                  }}
                >
                  Novo Workflow
                </Button>
              </div>

              {/* Lista */}
              <div className="space-y-3">
                {isWorkflowsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                  ))
                ) : (
                  <>
                    {filteredWorkflows.map(workflow => (
                      <WorkflowCard
                        key={workflow.id}
                        workflow={workflow}
                        onToggle={handleToggleWorkflow}
                        onEdit={(wf) => {
                          setEditingWorkflow(wf);
                          setShowWorkflowEditor(true);
                        }}
                        onDuplicate={(wf) => {
                          const dup = { ...wf, id: `wf-${Date.now()}`, name: `${wf.name} (cópia)`, status: "draft" as const, executionCount: 0, successCount: 0 };
                          // Nota: Duplicação local ou via service? O service não tem duplicar ainda.
                          toast.info("Funcionalidade de duplicação em breve.");
                        }}
                        onDelete={handleDeleteWorkflow}
                      />
                    ))}

                    {filteredWorkflows.length === 0 && (
                      <div className="text-center py-16">
                        <Zap className="h-10 w-10 text-text-muted mx-auto mb-3" />
                        <p className="text-sm text-text-secondary">Nenhum workflow encontrado</p>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mt-3"
                          onClick={() => setShowWorkflowEditor(true)}
                        >
                          Criar primeiro workflow
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════
              TAB: PIPELINES
          ══════════════════════════════════ */}
          {activeTab === "pipelines" && (
            <div className="space-y-4">
              {DEFAULT_PIPELINES.map(pipeline => (
                <Card key={pipeline.id}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-text-primary">{pipeline.name}</h3>
                        {pipeline.isDefault && <Badge variant="gold" size="sm">Padrão</Badge>}
                      </div>
                      {pipeline.description && (
                        <p className="text-xs text-text-muted mt-0.5">{pipeline.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="xs" icon={<Edit className="h-3.5 w-3.5" />}>
                        Editar
                      </Button>
                    </div>
                  </div>

                  {/* Etapas */}
                  <div className="space-y-2">
                    {pipeline.stages.map((stage, i) => (
                      <div key={stage.id} className="flex items-center gap-3 p-3 rounded-xl bg-arkos-surface-2 border border-arkos-border group">
                        <div className="flex items-center gap-2 shrink-0">
                          <div className={cn("w-3 h-3 rounded-full", STAGE_COLORS[stage.color])} />
                          <span className="text-2xs text-text-muted w-4 text-center">{i + 1}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-text-primary">{stage.name}</p>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-center hidden sm:block">
                            <p className="text-xs font-bold text-text-primary">{stage.probability}%</p>
                            <p className="text-2xs text-text-muted">prob.</p>
                          </div>
                          <div className="text-center hidden sm:block">
                            <p className="text-xs font-bold text-warning">{stage.rottingAfterDays}d</p>
                            <p className="text-2xs text-text-muted">rotting</p>
                          </div>
                          <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-arkos-surface-3 text-text-muted hover:text-text-primary transition-all">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button className={cn(
                      "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl",
                      "border-2 border-dashed border-arkos-border",
                      "hover:border-arkos-blue/40 hover:bg-arkos-blue/5",
                      "text-text-muted hover:text-arkos-blue-light text-xs",
                      "transition-all"
                    )}>
                      <Plus className="h-3.5 w-3.5" />
                      Adicionar etapa
                    </button>
                  </div>
                </Card>
              ))}

              <Button
                variant="secondary"
                size="sm"
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => toast.info("Criar novo funil")}
              >
                Novo Funil
              </Button>
            </div>
          )}

          {/* ══════════════════════════════════
              TAB: CAMPOS CUSTOMIZADOS
          ══════════════════════════════════ */}
          {activeTab === "fields" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-secondary">
                  {[].length} campos configurados
                </p>
                <Button variant="gold" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
                  Novo Campo
                </Button>
              </div>

              {["deal", "contact", "organization"].map(entity => {
                const fields = ([] as CustomField[]).filter(f => f.entity === entity);
                if (fields.length === 0) return null;
                const entityLabels: Record<string, string> = {
                  deal: "Negócios 📋",
                  contact: "Contatos 👤",
                  organization: "Organizações 🏢",
                };

                return (
                  <Card key={entity}>
                    <h3 className="text-sm font-bold text-text-primary mb-3">
                      {entityLabels[entity]}
                    </h3>
                    <div className="space-y-2">
                      {fields.map(field => (
                        <div key={field.id} className="flex items-center gap-3 p-3 rounded-xl bg-arkos-surface-2 border border-arkos-border group">
                          <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <p className="text-xs font-semibold text-text-primary">{field.name}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="default" size="sm">{FIELD_TYPE_LABELS[field.type]}</Badge>
                              {field.isRequired && <Badge variant="danger" size="sm">Obrigatório</Badge>}
                            </div>
                            <div className="flex items-center gap-2 text-2xs text-text-muted">
                              <code className="px-1.5 py-0.5 rounded-md bg-arkos-surface-3 font-mono">
                                {field.fieldKey}
                              </code>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button className="p-1.5 rounded-lg hover:bg-arkos-surface-3 text-text-muted hover:text-text-primary transition-all">
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-all">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* ══════════════════════════════════
              TAB: EQUIPE
          ══════════════════════════════════ */}
          {activeTab === "team" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                  <input
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    placeholder="Buscar membro..."
                    className="w-full h-9 pl-9 pr-3 rounded-xl text-sm bg-arkos-surface border border-arkos-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arkos-blue transition-all"
                  />
                </div>
                <Button variant="gold" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
                  Convidar
                </Button>
              </div>

              <Card>
                <div className="space-y-2">
                  {([] as TeamMember[]).filter(m =>
                    !teamSearch || m.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
                    m.email.toLowerCase().includes(teamSearch.toLowerCase())
                  ).map(member => {
                    const roleCfg = ROLE_CONFIG[member.role];
                    return (
                      <div key={member.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-arkos-surface-2 transition-colors group">
                        <Avatar name={member.name} size="md" status={member.isActive ? "online" : "offline"} />

                        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                          <div>
                            <p className="text-xs font-bold text-text-primary">{member.name}</p>
                            <p className="text-2xs text-text-muted">{member.email}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant={roleCfg.variant} size="sm">
                              {roleCfg.label}
                            </Badge>
                          </div>

                          <div className="hidden sm:block">
                            <p className="text-xs font-bold text-success">
                              {member.revenueThisMonth > 0 ? formatCurrency(member.revenueThisMonth) : "—"}
                            </p>
                            <p className="text-2xs text-text-muted">{member.dealsAssigned} deals</p>
                          </div>

                          <div className="hidden sm:block text-right">
                            {member.lastActiveAt && (
                              <p className="text-2xs text-text-muted">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {formatRelativeTime(member.lastActiveAt)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button className="p-1.5 rounded-lg hover:bg-arkos-surface-3 text-text-muted hover:text-text-primary transition-all">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          {member.role !== "admin" && (
                            <button className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-all">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Permissões por papel */}
              <Card>
                <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-text-muted" />
                  Permissões por Papel
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-arkos-border">
                        <th className="text-left py-2 text-text-muted font-medium">Permissão</th>
                        {["Admin", "Gerente", "Vendedor", "Visualizador"].map(role => (
                          <th key={role} className="text-center py-2 text-text-muted font-medium px-4">{role}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "Ver todos os deals", perms: [true, true, false, false] },
                        { label: "Editar configurações", perms: [true, false, false, false] },
                        { label: "Gerenciar workflows", perms: [true, true, false, false] },
                        { label: "Ver relatórios da equipe", perms: [true, true, false, false] },
                        { label: "Convidar membros", perms: [true, true, false, false] },
                        { label: "Gerenciar integrações", perms: [true, false, false, false] },
                        { label: "Configurar IA", perms: [true, false, false, false] },
                      ].map(({ label, perms }) => (
                        <tr key={label} className="border-b border-arkos-border/50">
                          <td className="py-2.5 text-text-secondary">{label}</td>
                          {perms.map((allowed, i) => (
                            <td key={i} className="text-center py-2.5">
                              {allowed ? (
                                <CheckCircle2 className="h-4 w-4 text-success mx-auto" />
                              ) : (
                                <span className="text-text-muted">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ══════════════════════════════════
              TAB: INTEGRAÇÕES
          ══════════════════════════════════ */}
          {activeTab === "integrations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-text-secondary">
                    <strong className="text-text-primary">{connectedCount}</strong>/{DEFAULT_INTEGRATIONS.length} conectadas
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { id: "all", label: "Todas" },
                    { id: "connected", label: "✅ Conectadas" },
                    { id: "disconnected", label: "⚪ Disponíveis" },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setIntegrationFilter(f.id as typeof integrationFilter)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl border text-xs font-medium transition-all",
                        integrationFilter === f.id
                          ? "bg-arkos-blue/10 border-arkos-blue/40 text-arkos-blue-light"
                          : "border-arkos-border text-text-muted hover:border-arkos-border-2"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredIntegrations.map(integration => {
                  const statusCfg = INTEGRATION_STATUS_CONFIG[integration.status];
                  return (
                    <div key={integration.id} className={cn(
                      "flex items-start gap-4 p-4 rounded-2xl border transition-all",
                      integration.status === "connected"
                        ? "border-success/20 bg-success/5"
                        : integration.status === "error"
                        ? "border-danger/20 bg-danger/5"
                        : "border-arkos-border bg-arkos-surface hover:border-arkos-border-2"
                    )}>
                      <div className="text-3xl shrink-0">{integration.logo}</div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-text-primary">{integration.name}</p>
                            <Badge variant={statusCfg.variant} size="sm" dot={statusCfg.dot} dotAnimate={statusCfg.animate}>
                              {statusCfg.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-text-muted mt-0.5">{integration.description}</p>
                        </div>

                        {integration.connectedAt && (
                          <p className="text-2xs text-text-muted">
                            Conectado {formatRelativeTime(integration.connectedAt)}
                          </p>
                        )}

                        <div className="flex items-center gap-2">
                          {integration.status === "connected" ? (
                            <>
                              <Button variant="ghost" size="xs" icon={<Settings className="h-3 w-3" />}>
                                Configurar
                              </Button>
                              <Button variant="danger" size="xs">
                                Desconectar
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="primary"
                              size="xs"
                              onClick={() => toast.info(`Conectando ${integration.name}...`)}
                            >
                              Conectar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Webhook section */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-4 w-4 text-text-muted" />
                  <h3 className="text-sm font-bold text-text-primary">Webhooks & API</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-arkos-surface-2 border border-arkos-border">
                    <div>
                      <p className="text-xs font-bold text-text-primary">API Key</p>
                      <code className="text-2xs text-text-muted font-mono">ark_live_••••••••••••••••</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="xs" icon={<RefreshCw className="h-3 w-3" />}>
                        Regenerar
                      </Button>
                      <Button variant="secondary" size="xs">
                        Revelar
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-arkos-surface-2 border border-arkos-border">
                    <p className="text-xs font-bold text-text-primary mb-1">Webhook Endpoint</p>
                    <code className="text-2xs text-text-muted font-mono break-all">
                      https://crm.arkos.com.br/api/webhooks/inbound
                    </code>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ══════════════════════════════════
              TAB: NOTIFICAÇÕES
          ══════════════════════════════════ */}
          {activeTab === "notifications" && (
            <div className="space-y-4">

              {/* Canais */}
              <Card>
                <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-text-muted" />
                  Canais de Notificação
                </h3>
                <div className="space-y-3">
                  {[
                    { key: "emailNotifications", icon: Mail, label: "E-mail", desc: "Notificações por e-mail" },
                    { key: "pushNotifications", icon: Bell, label: "Push / Browser", desc: "Notificações no navegador" },
                    { key: "whatsappNotifications", icon: MessageSquare, label: "WhatsApp", desc: "Notificações pelo WhatsApp pessoal" },
                  ].map(({ key, icon: Icon, label, desc }) => {
                    const enabled = notifications[key as keyof typeof notifications] as boolean;
                    return (
                      <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-arkos-surface-2 border border-arkos-border">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl", enabled ? "bg-success/10" : "bg-arkos-surface-3")}>
                            <Icon className={cn("h-4 w-4", enabled ? "text-success" : "text-text-muted")} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-text-primary">{label}</p>
                            <p className="text-2xs text-text-muted">{desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setNotifications(p => ({ ...p, [key]: !enabled }))}
                          className={cn(
                            "w-10 h-6 rounded-full border-2 transition-all duration-300 relative",
                            enabled ? "bg-success border-success" : "bg-arkos-surface-3 border-arkos-border"
                          )}
                        >
                          <div className={cn(
                            "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
                            enabled ? "left-4" : "left-0.5"
                          )} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Eventos */}
              <Card>
                <h3 className="text-sm font-bold text-text-primary mb-4">
                  Eventos que me Notificam
                </h3>
                <div className="space-y-2">
                  {[
                    { key: "dealStageChanged", label: "Etapa do deal alterada" },
                    { key: "newLeadAssigned", label: "Novo lead atribuído a mim" },
                    { key: "proposalViewed", label: "Cliente visualizou proposta" },
                    { key: "proposalSigned", label: "Cliente assinou contrato" },
                    { key: "taskOverdue", label: "Tarefa com prazo vencido" },
                    { key: "dealRotting", label: "Deal parado sem atividade" },
                    { key: "goalAchieved", label: "Meta atingida" },
                    { key: "aiInsight", label: "Novo insight gerado pela IA" },
                    { key: "teamMention", label: "Menção em comentário" },
                  ].map(({ key, label }) => {
                    const enabled = notifications.events[key as keyof typeof notifications.events];
                    return (
                      <div key={key} className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-arkos-surface-2 transition-colors">
                        <p className="text-xs text-text-secondary">{label}</p>
                        <button
                          onClick={() => setNotifications(p => ({
                            ...p,
                            events: { ...p.events, [key]: !enabled }
                          }))}
                          className={cn(
                            "w-8 h-5 rounded-full border-2 transition-all duration-300 relative shrink-0",
                            enabled ? "bg-success border-success" : "bg-arkos-surface-3 border-arkos-border"
                          )}
                        >
                          <div className={cn(
                            "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300 shadow-sm",
                            enabled ? "left-3" : "left-0.5"
                          )} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <div className="flex justify-end">
                <Button variant="gold" size="sm" onClick={() => toast.success("Preferências de notificação salvas!")}>
                  Salvar Preferências
                </Button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════
              TAB: IA & AGENTES
          ══════════════════════════════════ */}
          {activeTab === "ai" && (
            <div className="space-y-4">

              {/* Uso de tokens */}
              <Card className="border-arkos-gold/20 bg-arkos-gold/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-arkos-gold" />
                    <h3 className="text-sm font-bold text-arkos-gold">Uso de Tokens este Mês</h3>
                  </div>
                  <Badge variant="gold" size="sm">
                    {tokensPercent}% usado
                  </Badge>
                </div>

                <ProgressBar
                  value={tokensPercent}
                  autoColor
                  size="md"
                  animate
                  showLabel
                  label={`${(aiSettings.tokensUsedThisMonth / 1000).toFixed(0)}k / ${(aiSettings.monthlyTokenBudget / 1000).toFixed(0)}k tokens`}
                />

                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: "Qualificador", value: "142k" },
                    { label: "Redator", value: "98k" },
                    { label: "Analista", value: "67k" },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center p-2 rounded-xl bg-arkos-bg border border-arkos-gold/10">
                      <p className="text-sm font-bold text-arkos-gold">{value}</p>
                      <p className="text-2xs text-text-muted">{label}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Modelo e parâmetros */}
              <Card>
                <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-text-muted" />
                  Modelo de IA
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1.5 block">Modelo de IA Principal</label>
                    <select 
                      value={aiSettings.model}
                      onChange={(e) => setAiSettings((p: AISettings) => ({ ...p, model: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg text-sm bg-arkos-bg border border-arkos-border text-text-primary focus:outline-none focus:border-arkos-blue transition-all"
                    >
                      <optgroup label="Google (Padrão)">
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra rápido)</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (Raciocínio complexo)</option>
                      </optgroup>
                      <optgroup label="Anthropic (Claude)">
                        <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Excelente escrita)</option>
                        <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Rápido e conciso)</option>
                      </optgroup>
                    </select>
                    <p className="text-2xs text-text-muted mt-1.5">
                      O ARKOS tentará usar este modelo primeiro. Se houver falha, ele alternará automaticamente para o outro provedor (Fallback).
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-xs font-medium text-text-secondary">Temperatura</label>
                        <span className="text-xs font-bold text-text-primary">{aiSettings.temperature}</span>
                      </div>
                      <input
                        type="range" min="0" max="1" step="0.1"
                        value={aiSettings.temperature}
                        onChange={(e) => setAiSettings((p: AISettings) => ({ ...p, temperature: Number(e.target.value) }))}
                        className="w-full accent-arkos-blue"
                      />
                      <div className="flex justify-between text-2xs text-text-muted mt-0.5">
                        <span>Preciso</span>
                        <span>Criativo</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                        Tom de Voz
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {["formal", "professional", "casual"].map(tone => (
                          <button
                            key={tone}
                            onClick={() => setAiSettings((p: AISettings) => ({ ...p, tone: tone as AISettings['tone'] }))}
                            className={cn(
                              "py-1.5 rounded-lg border text-2xs font-medium capitalize transition-all",
                              aiSettings.tone === tone
                                ? "bg-arkos-blue/10 border-arkos-blue/40 text-arkos-blue-light"
                                : "border-arkos-border text-text-muted hover:border-arkos-border-2"
                            )}
                          >
                            {tone === "formal" ? "Formal" : tone === "professional" ? "Profis." : "Casual"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                      Contexto da Empresa (para os agentes)
                    </label>
                    <textarea
                      value={aiSettings.companyContext}
                      onChange={(e) => setAiSettings((p: AISettings) => ({ ...p, companyContext: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2.5 rounded-xl text-sm resize-none bg-arkos-bg border border-arkos-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-arkos-blue transition-all"
                    />
                    <p className="text-2xs text-text-muted mt-2 leading-relaxed italic">
                      Dica: Descreva o tom de voz e produtos para os agentes.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Autonomia dos agentes */}
              <Card>
                <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-text-muted" />
                  Autonomia dos Agentes
                </h3>
                <div className="space-y-3">
                  {Object.entries(aiSettings.agentAutonomy).map(([agent, level]) => {
                    const agentLabels: Record<string, { label: string; emoji: string }> = {
                      qualifier: { label: "Qualificador", emoji: "💬" },
                      writer: { label: "Redator", emoji: "✍️" },
                      followup: { label: "Follow-Up", emoji: "🔄" },
                      prospector: { label: "Prospector", emoji: "🔍" },
                      analyst: { label: "Analista", emoji: "📊" },
                      coach: { label: "Coach", emoji: "🎯" },
                    };
                    const cfg = agentLabels[agent];

                    return (
                      <div key={agent} className="flex items-center justify-between p-3 rounded-xl bg-arkos-surface-2 border border-arkos-border">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{cfg.emoji}</span>
                          <p className="text-xs font-semibold text-text-primary">{cfg.label}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          {["off", "suggest", "full"].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setAiSettings((p: AISettings) => ({
                                ...p,
                                agentAutonomy: { ...p.agentAutonomy, [agent]: opt as AISettings['agentAutonomy']['qualifier'] }
                              }))}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-2xs font-medium capitalize transition-all border",
                                level === opt
                                  ? opt === "full" ? "bg-success/10 border-success/30 text-success"
                                    : opt === "suggest" ? "bg-warning/10 border-warning/30 text-warning"
                                    : "bg-arkos-surface-3 border-arkos-border text-text-muted"
                                  : "border-transparent text-text-muted hover:border-arkos-border"
                              )}
                            >
                              {opt === "full" ? "Autônomo" : opt === "suggest" ? "Sugerir" : "Off"}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-arkos-border grid grid-cols-3 gap-3 text-center text-2xs text-text-muted">
                  <div><span className="text-success font-bold">Autônomo</span> = Age sozinho</div>
                  <div><span className="text-warning font-bold">Sugerir</span> = Você aprova</div>
                  <div><span className="text-text-muted font-bold">Off</span> = Desativado</div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button 
                  variant="gold" 
                  size="sm" 
                  onClick={() => {
                    localStorage.setItem("arkos_ai_settings", JSON.stringify(aiSettings));
                    toast.success("Configurações de IA salvas no navegador!");
                  }}
                >
                  Salvar Configurações
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── WORKFLOW EDITOR MODAL ─── */}
      {showWorkflowEditor && (
        <WorkflowEditor
          workflow={editingWorkflow}
          onSave={handleSaveWorkflow}
          onClose={() => {
            setShowWorkflowEditor(false);
            setEditingWorkflow(undefined);
          }}
        />
      )}
    </div>
  );
}
