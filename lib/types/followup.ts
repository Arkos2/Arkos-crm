export type SequenceStepType =
  | "email"
  | "whatsapp"
  | "call"
  | "linkedin"
  | "task";

export type SequenceStepStatus =
  | "pending"
  | "scheduled"
  | "sent"
  | "delivered"
  | "opened"
  | "replied"
  | "failed"
  | "skipped";

export type EnrollmentStatus =
  | "active"
  | "paused"
  | "completed"
  | "replied"
  | "converted"
  | "unsubscribed";

export type SequenceTrigger =
  | "manual"
  | "deal_stage_changed"
  | "proposal_sent"
  | "demo_completed"
  | "no_reply_days"
  | "lead_qualified";

// ─── PASSO DA SEQUÊNCIA ───
export interface SequenceStep {
  id: string;
  order: number;
  type: SequenceStepType;
  dayOffset: number;        // dias após o passo anterior
  timeOfDay?: string;       // "09:00", "14:30"
  subject?: string;         // e-mail
  template: string;         // corpo da mensagem
  variables: string[];      // {{firstName}}, {{company}}...
  aiPersonalize?: boolean;  // IA personaliza antes de enviar
  conditions?: {
    onlyIf?: "opened_previous" | "not_replied" | "always";
    skipIf?: "replied" | "opened";
  };
}

// ─── SEQUÊNCIA ───
export interface Sequence {
  id: string;
  name: string;
  description?: string;
  trigger: SequenceTrigger;
  steps: SequenceStep[];
  isActive: boolean;
  tags?: string[];
  stats: {
    totalEnrolled: number;
    activeNow: number;
    replyRate: number;
    conversionRate: number;
    avgStepsToReply: number;
  };
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── PASSO DE UM ENROLLMENT ───
export interface EnrollmentStep {
  stepId: string;
  order: number;
  type: SequenceStepType;
  status: SequenceStepStatus;
  scheduledAt?: string;
  executedAt?: string;
  subject?: string;
  content?: string;
  openedAt?: string;
  repliedAt?: string;
  errorMessage?: string;
}

// ─── ENROLLMENT (LEAD NA SEQUÊNCIA) ───
export interface Enrollment {
  id: string;
  sequenceId: string;
  sequenceName: string;
  leadId: string;
  leadName: string;
  company?: string;
  email?: string;
  phone?: string;
  dealId?: string;
  status: EnrollmentStatus;
  currentStep: number;
  totalSteps: number;
  steps: EnrollmentStep[];
  nextActionAt?: string;
  enrolledAt: string;
  updatedAt: string;
  completedAt?: string;
  repliedAt?: string;
  convertedAt?: string;
  tags?: string[];
  variables?: Record<string, string>;
}

// ─── STATS GERAIS ───
export interface FollowUpStats {
  activeSequences: number;
  totalEnrollments: number;
  activeEnrollments: number;
  avgReplyRate: number;
  avgConversionRate: number;
  stepsSentToday: number;
  repliesReceivedToday: number;
}
