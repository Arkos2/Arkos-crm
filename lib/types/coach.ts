export type CoachTipType =
  | "performance"     // análise de performance
  | "deal_risk"       // risco em negócio específico
  | "best_practice"   // boa prática identificada
  | "timing"          // momento ideal para agir
  | "objection"       // como contornar objeção
  | "comparison"      // comparação com top performers
  | "celebration";    // conquista / parabéns

export type CoachTipPriority = "urgent" | "high" | "medium" | "low";

export type SellerLevel =
  | "junior"
  | "pleno"
  | "senior"
  | "top_performer";

// ─── TIP DO COACH ───
export interface CoachTip {
  id: string;
  type: CoachTipType;
  priority: CoachTipPriority;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  dealId?: string;
  dealTitle?: string;
  dataPoints?: string[];
  impact?: string;           // impacto estimado se seguir a dica
  dismissed?: boolean;
  createdAt: string;
}

// ─── MÉTRICA DE ATIVIDADE ───
export interface ActivityMetric {
  label: string;
  value: number;
  target: number;
  unit: string;
  trend: number;             // % vs período anterior
}

// ─── COMPARATIVO COM PEERS ───
export interface PeerComparison {
  metric: string;
  sellerValue: number;
  teamAvg: number;
  topPerformerValue: number;
  unit: string;
  higherIsBetter: boolean;
}

// ─── PADRÃO IDENTIFICADO ───
export interface SellerPattern {
  id: string;
  category: "timing" | "channel" | "approach" | "stage";
  title: string;
  description: string;
  impact: "positive" | "negative" | "neutral";
  confidence: number;
  dataPoints: string[];
}

// ─── PERFORMANCE DO VENDEDOR ───
export interface SellerPerformance {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  level: SellerLevel;
  period: string;

  // Resultados
  revenue: number;
  revenueTarget: number;
  dealsClosed: number;
  dealsClosedTarget: number;
  winRate: number;
  avgTicket: number;
  avgCycleLength: number;

  // Atividades
  activities: ActivityMetric[];

  // Comparativo
  peerComparisons: PeerComparison[];

  // Padrões
  patterns: SellerPattern[];

  // Score geral do Coach IA
  coachScore: number;        // 0-100
  coachScoreTrend: number;   // delta vs mês anterior
  strengths: string[];
  improvements: string[];

  // Tips ativos
  tips: CoachTip[];
}

// ─── PLAYBOOK ───
export interface Playbook {
  id: string;
  title: string;
  description: string;
  author: string;            // quem gerou (top performer ou IA)
  category: "approach" | "objection" | "timing" | "channel" | "closing";
  successRate: number;
  usageCount: number;
  steps: Array<{
    order: number;
    title: string;
    description: string;
    tip?: string;
  }>;
  createdAt: string;
}
