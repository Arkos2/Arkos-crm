export type ProjectStatus =
  | "contract_signed"
  | "kickoff"
  | "setup"
  | "training"
  | "go_live"
  | "completed";

export type DocumentStatus =
  | "pending"
  | "sent"
  | "viewed"
  | "signed"
  | "expired";

export type ChecklistStatus = "pending" | "in_progress" | "completed" | "blocked";

export type MilestoneStatus = "completed" | "in_progress" | "upcoming" | "delayed";

// ─── ETAPA DO PROJETO ───
export interface ProjectStage {
  id: ProjectStatus;
  label: string;
  description: string;
  icon: string;
  status: MilestoneStatus;
  completedAt?: string;
  scheduledAt?: string;
  responsibleName?: string;
  notes?: string;
  deliverables?: string[];
}

// ─── DOCUMENTO ───
export interface PortalDocument {
  id: string;
  title: string;
  type: "contract" | "proposal" | "scope" | "manual" | "report" | "nda" | "invoice";
  status: DocumentStatus;
  fileUrl?: string;
  fileSize?: string;
  viewCount?: number;
  lastViewedAt?: string;
  signedAt?: string;
  signedBy?: string;
  expiresAt?: string;
  uploadedAt: string;
  requiredBy?: string;       // quem precisa assinar/aprovar
}

// ─── ITEM DO CHECKLIST ───
export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  status: ChecklistStatus;
  dueDate?: string;
  completedAt?: string;
  assignedTo: "client" | "arkos";
  priority: "high" | "medium" | "low";
  blockedReason?: string;
  category: string;
}

// ─── REUNIÃO ───
export interface ProjectMeeting {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;          // minutos
  platform: "zoom" | "meet" | "teams" | "presencial";
  meetingUrl?: string;
  location?: string;
  attendees: string[];
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  notes?: string;
  recordingUrl?: string;
}

// ─── ATUALIZAÇÃO / UPDATE ───
export interface ProjectUpdate {
  id: string;
  title: string;
  message: string;
  type: "progress" | "milestone" | "alert" | "info";
  createdAt: string;
  createdBy: string;
  isRead?: boolean;
}

// ─── PROJETO DO CLIENTE ───
export interface ClientProject {
  id: string;
  accessToken: string;       // UUID para acesso público
  dealId?: string;
  companyName: string;
  companyLogo?: string;
  clientName: string;
  clientEmail?: string;
  projectName: string;
  projectDescription?: string;

  // Gestor da conta
  managerName: string;
  managerEmail: string;
  managerPhone?: string;
  managerAvatar?: string;

  // Progresso
  currentStage: ProjectStatus;
  overallProgress: number;   // 0-100
  stages: ProjectStage[];
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;

  // Conteúdo
  documents: PortalDocument[];
  checklist: ChecklistItem[];
  meetings: ProjectMeeting[];
  updates: ProjectUpdate[];

  // Status
  status: "active" | "on_hold" | "completed" | "cancelled";
  npsScore?: number;
  satisfaction?: number;     // 1-5

  createdAt: string;
  updatedAt: string;
}
