export type DealStage =
  | "prospecting"
  | "qualification"
  | "diagnosis"
  | "proposal"
  | "negotiation"
  | "closing"
  | "won"
  | "lost";

export type DealStatus = "active" | "won" | "lost";
export type DealTemperature = "hot" | "warm" | "cold" | "rotting";
export type GapLevel = "low" | "medium" | "high";
export type ActivityType =
  | "call"
  | "email"
  | "meeting"
  | "note"
  | "whatsapp"
  | "stage_change"
  | "ai_action"
  | "document"
  | "task";

// ─── BANT ───
export interface BANTScore {
  budget: number;      // 0–25
  authority: number;   // 0–25
  need: number;        // 0–25
  timeline: number;    // 0–25
  total: number;       // 0–100 (calculado)
}

// ─── GAP DIAGNOSIS ───
export interface GAPDiagnosis {
  currentState: string;
  desiredState: string;
  gapLevel: GapLevel;
  urgency: number; // 1–5
}

// ─── CONTATO ───
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  jobTitle?: string;
  isDecisionMaker?: boolean;
  avatarUrl?: string;
}

// ─── ORGANIZAÇÃO ───
export interface Organization {
  id: string;
  name: string;
  industry?: string;
  size?: string;
  website?: string;
  logoUrl?: string;
}

// ─── ATIVIDADE ───
export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  createdAt: string;
  userId?: string;
  userName?: string;
  isAI?: boolean;
  metadata?: Record<string, unknown>;
}

// ─── DOCUMENTO ───
export interface DealDocument {
  id: string;
  title: string;
  type: "proposal" | "contract" | "nda" | "invoice" | "other";
  status: "draft" | "sent" | "viewed" | "signed";
  fileUrl?: string;
  viewCount?: number;
  lastViewedAt?: string;
  signedAt?: string;
  createdAt: string;
}

// ─── TAREFA ───
export interface DealTask {
  id: string;
  title: string;
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  assignedTo?: string;
  priority: "low" | "medium" | "high";
}

// ─── AI SUGGESTION ───
export interface AISuggestion {
  id: string;
  type: "action" | "insight" | "warning" | "opportunity";
  text: string;
  actions?: Array<{
    label: string;
    action: string;
  }>;
  confidence?: number;
  createdAt: string;
}

// ─── NEGÓCIO COMPLETO ───
export interface Deal {
  id: string;
  title: string;
  pipelineId: string;
  stage: DealStage;
  contact: Contact;
  organization: Organization;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  value: number;
  currency: string;
  probability: number;
  expectedCloseDate?: string;

  // BANT
  bant: BANTScore;

  // GAP
  gap: GAPDiagnosis;

  // Status
  status: DealStatus;
  temperature: DealTemperature;
  lostReason?: string;

  // IA
  aiScore?: number;
  aiSuggestions?: AISuggestion[];
  aiPrediction?: {
    probability: number;
    confidence: number;
    reasoning: string;
  };

  // Timeline
  activities: Activity[];
  documents: DealDocument[];
  tasks: DealTask[];

  // Timestamps
  lastActivityAt?: string;
  stageEnteredAt: string;
  createdAt: string;
  updatedAt: string;
  wonAt?: string;
  lostAt?: string;

  // Rotting
  rottingDays?: number;
  isRotting?: boolean;
}

// ─── ETAPA DO PIPELINE ───
export interface PipelineStage {
  id: DealStage;
  name: string;
  probability: number;
  color: string;
  rottingAfterDays: number;
  order: number;
}

// ─── PIPELINE ───
export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  isDefault?: boolean;
}
