export type GoalPeriod = "weekly" | "monthly" | "quarterly" | "yearly";
export type GoalType = "revenue" | "deals_closed" | "calls" | "meetings" | "proposals" | "demos" | "win_rate";
export type BadgeCategory = "performance" | "activity" | "streak" | "special";
export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

// ─── META ───
export interface Goal {
  id: string;
  userId: string;
  type: GoalType;
  period: GoalPeriod;
  targetValue: number;
  currentValue: number;
  unit: string;
  periodStart: string;
  periodEnd: string;
  status: "active" | "completed" | "failed";
  completedAt?: string;
}

// ─── BADGE ───
export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  condition: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  progress?: number;       // 0-100 para badges em progresso
}

// ─── TRANSAÇÃO DE PONTOS ───
export interface PointTransaction {
  id: string;
  userId: string;
  points: number;
  reason: string;
  referenceType: "deal" | "activity" | "goal" | "badge" | "streak";
  createdAt: string;
}

// ─── PERFIL DE GAMIFICAÇÃO DO VENDEDOR ───
export interface GamificationProfile {
  userId: string;
  name: string;
  role: string;
  avatar?: string;
  totalPoints: number;
  monthlyPoints: number;
  weeklyPoints: number;
  level: number;
  levelName: string;
  levelProgress: number;     // 0-100 para próximo nível
  pointsToNextLevel: number;
  streakDays: number;
  longestStreak: number;
  badges: Badge[];
  goals: Goal[];
  rank: number;              // posição no ranking geral
  rankMonthly: number;
  transactions: PointTransaction[];
}

// ─── CONFIGURAÇÃO DO SISTEMA DE PONTOS ───
export interface PointsConfig {
  dealClosed: number;        // por R$1k
  callMade: number;
  meetingHeld: number;
  proposalSent: number;
  followUpDone: number;
  demoGiven: number;
  goalCompleted: number;
  streakBonus: number;       // por dia de streak
  badgeUnlocked: number;
}

export const POINTS_CONFIG: PointsConfig = {
  dealClosed: 100,           // por R$1k de receita
  callMade: 5,
  meetingHeld: 15,
  proposalSent: 20,
  followUpDone: 5,
  demoGiven: 25,
  goalCompleted: 500,
  streakBonus: 10,
  badgeUnlocked: 50,
};
