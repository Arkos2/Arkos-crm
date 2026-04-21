export type AgentType =
  | "prospector"
  | "qualifier"
  | "writer"
  | "followup"
  | "analyst"
  | "coach";

export type AgentStatus = "active" | "paused" | "error" | "processing";

export type MessageRole = "user" | "assistant" | "system";

export type ConversationChannel = "whatsapp" | "webchat" | "email" | "manual";

export type ConversationStatus =
  | "active"
  | "qualified"
  | "disqualified"
  | "nurturing"
  | "transferred";

// ─── BANT COLETADO ───
export interface BANTCollection {
  budget: number;       // 0–25
  authority: number;    // 0–25
  need: number;         // 0–25
  timeline: number;     // 0–25
  total: number;
  budgetText?: string;
  authorityText?: string;
  needText?: string;
  timelineText?: string;
}

// ─── MENSAGEM DO CHAT ───
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  isAI?: boolean;
  agentType?: AgentType;
  metadata?: {
    bantUpdate?: Partial<BANTCollection>;
    confidence?: number;
    tokensUsed?: number;
  };
}

// ─── CONVERSA DE QUALIFICAÇÃO ───
export interface QualifierConversation {
  id: string;
  leadName: string;
  leadEmail?: string;
  leadPhone?: string;
  company?: string;
  channel: ConversationChannel;
  messages: ChatMessage[];
  bant: BANTCollection;
  status: ConversationStatus;
  assignedTo?: string;
  outcome?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── LOG DO AGENTE ───
export interface AgentLog {
  id: string;
  agentType: AgentType;
  action: string;
  details: string;
  leadName?: string;
  result?: "success" | "failure" | "pending";
  timestamp: string;
}

// ─── MÉTRICA DO AGENTE ───
export interface AgentMetrics {
  type: AgentType;
  status: AgentStatus;
  todayActions: number;
  weekActions: number;
  successRate: number;
  lastAction?: string;
  lastActionAt?: string;
  primaryMetric: { label: string; value: string };
  secondaryMetric?: { label: string; value: string };
}

// ─── CONFIGURAÇÃO DO AGENTE ───
export interface AgentConfig {
  type: AgentType;
  name: string;
  description: string;
  icon: string;
  color: string;
  accentColor: string;
  capabilities: string[];
  systemPrompt: string;
}

// ─── CONTEÚDO GERADO (REDATOR) ───
export type ContentType =
  | "email_prospecting"
  | "email_followup"
  | "email_post_meeting"
  | "whatsapp_message"
  | "call_script"
  | "proposal"
  | "meeting_summary";

export interface GeneratedContent {
  id: string;
  type: ContentType;
  title: string;
  content: string;
  leadContext?: string;
  tone: "formal" | "professional" | "casual";
  createdAt: string;
  tokensUsed?: number;
}

// ─── INSIGHT DO ANALISTA ───
export type InsightLevel = "urgent" | "opportunity" | "win" | "trend";

export interface AnalystInsight {
  id: string;
  level: InsightLevel;
  title: string;
  description: string;
  dataPoints: string[];
  actions: Array<{ label: string; action: string }>;
  confidence: number;
  createdAt: string;
  dismissed?: boolean;
}
