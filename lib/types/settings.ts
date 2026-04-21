export type WorkflowTrigger =
  | "deal_created"
  | "deal_stage_changed"
  | "deal_won"
  | "deal_lost"
  | "proposal_sent"
  | "proposal_viewed"
  | "proposal_signed"
  | "lead_qualified"
  | "lead_inbound"
  | "no_activity_days"
  | "bant_score_reached"
  | "contact_created"
  | "meeting_scheduled"
  | "meeting_completed"
  | "task_overdue";

export type WorkflowActionType =
  | "send_email"
  | "send_whatsapp"
  | "create_task"
  | "move_deal_stage"
  | "assign_deal"
  | "add_tag"
  | "start_sequence"
  | "notify_user"
  | "create_deal"
  | "update_field"
  | "ai_qualify"
  | "ai_write_email"
  | "webhook";

export type WorkflowConditionOperator =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "less_than"
  | "contains"
  | "not_contains"
  | "is_empty"
  | "is_not_empty";

export type WorkflowStatus = "active" | "paused" | "draft" | "error";

export type PipelineStageColor =
  | "slate"
  | "blue"
  | "purple"
  | "amber"
  | "orange"
  | "green"
  | "red";

export type TeamRole = "admin" | "manager" | "seller" | "viewer";

export type IntegrationStatus = "connected" | "disconnected" | "error" | "pending";

// ─── CONDIÇÃO DO WORKFLOW ───
export interface WorkflowCondition {
  id: string;
  field: string;
  operator: WorkflowConditionOperator;
  value: string | number | boolean;
  logicGate?: "AND" | "OR";
}

// ─── AÇÃO DO WORKFLOW ───
export interface WorkflowAction {
  id: string;
  type: WorkflowActionType;
  order: number;
  delayMinutes?: number;
  config: Record<string, unknown>;
  label?: string;
}

// ─── WORKFLOW ───
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  triggerConfig?: Record<string, unknown>;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  status: WorkflowStatus;
  executionCount: number;
  successCount: number;
  lastExecutedAt?: string;
  lastError?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── ETAPA DO PIPELINE ───
export interface PipelineStageConfig {
  id: string;
  name: string;
  probability: number;
  color: PipelineStageColor;
  rottingAfterDays: number;
  order: number;
  isWon?: boolean;
  isLost?: boolean;
}

// ─── PIPELINE ───
export interface PipelineConfig {
  id: string;
  name: string;
  description?: string;
  stages: PipelineStageConfig[];
  isDefault: boolean;
  currency: string;
  dealRotting: boolean;
  createdAt: string;
}

// ─── CAMPO CUSTOMIZADO ───
export interface CustomField {
  id: string;
  entity: "deal" | "contact" | "organization";
  name: string;
  fieldKey: string;
  type: "text" | "number" | "date" | "select" | "multiselect" | "checkbox" | "url" | "phone" | "email" | "textarea";
  options?: string[];
  isRequired: boolean;
  showInCard: boolean;
  order: number;
  createdAt: string;
}

// ─── MEMBRO DA EQUIPE ───
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  isActive: boolean;
  dealsAssigned: number;
  revenueThisMonth: number;
  joinedAt: string;
  lastActiveAt?: string;
}

// ─── INTEGRAÇÃO ───
export interface Integration {
  id: string;
  name: string;
  description: string;
  logo: string;
  category: "communication" | "signature" | "calendar" | "automation" | "analytics" | "ai";
  status: IntegrationStatus;
  connectedAt?: string;
  config?: Record<string, unknown>;
  webhookUrl?: string;
  apiKey?: string;
}

// ─── CONFIGURAÇÕES GERAIS ───
export interface GeneralSettings {
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  language: string;
  fiscalYearStart: string;
}

// ─── CONFIGURAÇÕES DE NOTIFICAÇÃO ───
export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  whatsappNotifications: boolean;
  events: {
    dealStageChanged: boolean;
    newLeadAssigned: boolean;
    proposalViewed: boolean;
    proposalSigned: boolean;
    taskOverdue: boolean;
    dealRotting: boolean;
    goalAchieved: boolean;
    aiInsight: boolean;
    teamMention: boolean;
  };
  digestFrequency: "realtime" | "hourly" | "daily" | "weekly";
}

// ─── CONFIGURAÇÕES DE IA ───
export interface AISettings {
  model: string;
  temperature: number;
  maxTokens: number;
  language: string;
  tone: "formal" | "professional" | "casual";
  companyContext: string;
  agentAutonomy: {
    qualifier: "full" | "suggest" | "off";
    writer: "full" | "suggest" | "off";
    followup: "full" | "suggest" | "off";
    prospector: "full" | "suggest" | "off";
    analyst: "full" | "suggest" | "off";
    coach: "full" | "suggest" | "off";
  };
  monthlyTokenBudget: number;
  tokensUsedThisMonth: number;
}
