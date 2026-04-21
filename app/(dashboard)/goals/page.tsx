"use client";

import { useState, useEffect } from "react";
import { GamificationProfile, Badge, Goal, BadgeRarity } from "@/lib/types/goals";
import { MOCK_GAMIFICATION } from "@/lib/mock/goals";
import { Card, Badge as UIBadge, Button, Avatar, ProgressBar } from "@/components/ui";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
import {
  Trophy, Target, Zap, TrendingUp, Star,
  Flame, Award, Gift,
  BarChart3, Users, CheckCircle2,
  Clock, ArrowUp, Sparkles,
  Medal,
} from "lucide-react";

// ─── CONFIGURAÇÕES ───
const RARITY_CONFIG: Record<BadgeRarity, {
  label: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
}> = {
  common: {
    label: "Comum",
    color: "text-text-secondary",
    bg: "bg-arkos-surface-2",
    border: "border-arkos-border",
    glow: "",
  },
  rare: {
    label: "Raro",
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/30",
    glow: "shadow-[0_0_12px_rgba(59,130,246,0.3)]",
  },
  epic: {
    label: "Épico",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    glow: "shadow-[0_0_12px_rgba(168,85,247,0.3)]",
  },
  legendary: {
    label: "Lendário",
    color: "text-arkos-gold",
    bg: "bg-arkos-gold/10",
    border: "border-arkos-gold/30",
    glow: "shadow-[0_0_20px_rgba(201,168,76,0.4)]",
  },
};

const GOAL_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  revenue: { label: "Receita", icon: "💰", color: "text-success" },
  deals_closed: { label: "Negócios Fechados", icon: "🤝", color: "text-arkos-blue-light" },
  calls: { label: "Ligações", icon: "📞", color: "text-warning" },
  meetings: { label: "Reuniões", icon: "📅", color: "text-info" },
  proposals: { label: "Propostas", icon: "📄", color: "text-purple-400" },
  demos: { label: "Demos", icon: "🖥️", color: "text-arkos-gold" },
  win_rate: { label: "Win Rate", icon: "🎯", color: "text-success" },
};

// ─── COMPONENTE: BADGE CARD ───
function BadgeCard({ badge }: { badge: Badge }) {
  const rarCfg = RARITY_CONFIG[badge.rarity];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-2 p-4 rounded-2xl border",
        "transition-all duration-300",
        badge.isUnlocked
          ? cn(rarCfg.bg, rarCfg.border, rarCfg.glow, "hover:scale-105")
          : "bg-arkos-surface border-arkos-border opacity-50 grayscale"
      )}
    >
      {/* Rarity indicator */}
      {badge.rarity !== "common" && (
        <div
          className={cn(
            "absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-2xs font-bold",
            rarCfg.bg, rarCfg.color
          )}
        >
          {badge.rarity === "legendary" ? "✨" : badge.rarity === "epic" ? "💜" : "💙"}
        </div>
      )}

      {/* Emoji grande */}
      <div
        className={cn(
          "text-4xl transition-all duration-300",
          badge.isUnlocked ? "drop-shadow-lg" : "opacity-50"
        )}
      >
        {badge.emoji}
      </div>

      {/* Nome */}
      <div className="text-center">
        <p
          className={cn(
            "text-xs font-bold",
            badge.isUnlocked ? "text-text-primary" : "text-text-muted"
          )}
        >
          {badge.name}
        </p>
        <p className="text-2xs text-text-muted mt-0.5 line-clamp-2 text-center">
          {badge.description}
        </p>
      </div>

      {/* Status */}
      {badge.isUnlocked ? (
        <div className="flex items-center gap-1 text-2xs text-success">
          <CheckCircle2 className="h-3 w-3" />
          <span>Desbloqueado</span>
        </div>
      ) : badge.progress !== undefined ? (
        <div className="w-full space-y-1">
          <div className="flex justify-between text-2xs text-text-muted">
            <span>Progresso</span>
            <span>{badge.progress}%</span>
          </div>
          <ProgressBar value={badge.progress} size="xs" animate />
        </div>
      ) : (
        <div className="text-2xs text-text-muted">🔒 Bloqueado</div>
      )}

      {badge.isUnlocked && badge.unlockedAt && (
        <p className="text-2xs text-text-muted text-center">
          {formatRelativeTime(badge.unlockedAt)}
        </p>
      )}
    </div>
  );
}

// ─── COMPONENTE: GOAL CARD ───
function GoalCard({ goal }: { goal: Goal }) {
  const config = GOAL_TYPE_CONFIG[goal.type];
  const pct = Math.min(
    Math.round((goal.currentValue / goal.targetValue) * 100),
    100
  );
  const isCompleted = goal.status === "completed";
  const remaining = goal.targetValue - goal.currentValue;
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(goal.periodEnd).getTime() - Date.now()) / 86400000
    )
  );

  const formatGoalValue = (value: number) => {
    if (goal.unit === "R$") return formatCurrency(value);
    return `${value} ${goal.unit}`;
  };

  return (
    <div
      className={cn(
        "p-4 rounded-2xl border transition-all",
        isCompleted
          ? "border-success/30 bg-success/5"
          : "border-arkos-border bg-arkos-surface hover:border-arkos-border-2"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <p className="text-xs font-semibold text-text-primary">
              {config.label}
            </p>
            <p className="text-2xs text-text-muted capitalize">
              {goal.period === "weekly"
                ? "Semanal"
                : goal.period === "monthly"
                ? "Mensal"
                : goal.period === "quarterly"
                ? "Trimestral"
                : "Anual"}
            </p>
          </div>
        </div>

        {isCompleted ? (
          <UIBadge variant="success" size="sm">
            ✅ Batida!
          </UIBadge>
        ) : (
          <div className="text-right">
            <p className={cn("text-lg font-black", config.color)}>{pct}%</p>
            <p className="text-2xs text-text-muted">{daysLeft}d restantes</p>
          </div>
        )}
      </div>

      {/* Valores */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className={cn("text-xl font-bold", config.color)}>
          {formatGoalValue(goal.currentValue)}
        </span>
        <span className="text-sm text-text-muted">
          / {formatGoalValue(goal.targetValue)}
        </span>
      </div>

      {/* Barra */}
      <ProgressBar
        value={pct}
        autoColor
        size="md"
        animate
      />

      {/* Faltando */}
      {!isCompleted && remaining > 0 && (
        <p className="text-2xs text-text-muted mt-2">
          Faltam{" "}
          <strong className="text-text-secondary">
            {formatGoalValue(remaining)}
          </strong>{" "}
          para bater a meta
        </p>
      )}
    </div>
  );
}

// ─── COMPONENTE: LEADERBOARD ROW ───
function LeaderboardRow({
  profile,
  isCurrentUser,
  rank,
}: {
  profile: GamificationProfile;
  isCurrentUser: boolean;
  rank: number;
}) {
  const medals = ["🥇", "🥈", "🥉"];
  const medalEl = medals[rank - 1] || null;

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl border transition-all",
        isCurrentUser
          ? "border-arkos-gold/30 bg-arkos-gold/5 shadow-[0_0_16px_rgba(201,168,76,0.1)]"
          : "border-arkos-border bg-arkos-surface hover:border-arkos-border-2"
      )}
    >
      {/* Rank */}
      <div className="w-8 text-center shrink-0">
        {medalEl ? (
          <span className="text-2xl">{medalEl}</span>
        ) : (
          <span className="text-sm font-bold text-text-muted">{rank}</span>
        )}
      </div>

      {/* Avatar + nome */}
      <Avatar name={profile.name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-text-primary truncate">
            {profile.name}
          </p>
          {isCurrentUser && (
            <UIBadge variant="gold" size="sm">Você</UIBadge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-2xs text-text-muted">{profile.role}</p>
          <span className="text-2xs text-arkos-blue-light">
            Nv. {profile.level} · {profile.levelName}
          </span>
        </div>
      </div>

      {/* Streak */}
      <div className="text-center shrink-0">
        <div className="flex items-center gap-1">
          <Flame className={cn(
            "h-4 w-4",
            profile.streakDays >= 7 ? "text-danger" : "text-warning"
          )} />
          <span className={cn(
            "text-sm font-bold",
            profile.streakDays >= 7 ? "text-danger" : "text-warning"
          )}>
            {profile.streakDays}
          </span>
        </div>
        <p className="text-2xs text-text-muted">streak</p>
      </div>

      {/* Badges count */}
      <div className="text-center shrink-0">
        <p className="text-sm font-bold text-arkos-gold">
          {profile.badges.filter((b) => b.isUnlocked).length}
        </p>
        <p className="text-2xs text-text-muted">badges</p>
      </div>

      {/* Pontos */}
      <div className="text-right shrink-0">
        <p className="text-lg font-black text-text-primary">
          {profile.monthlyPoints.toLocaleString()}
        </p>
        <p className="text-2xs text-text-muted">pts/mês</p>
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ───
export default function GoalsPage() {
  const [profiles] = useState<GamificationProfile[]>(MOCK_GAMIFICATION);
  const [selectedUserId, setSelectedUserId] = useState("u-002");
  const [activeTab, setActiveTab] = useState<
    "ranking" | "my-goals" | "badges" | "history"
  >("ranking");
  const [confettiLoaded, setConfettiLoaded] = useState(false);

  const selectedProfile = profiles.find((p) => p.userId === selectedUserId)!;
  const unlockedBadges = selectedProfile.badges.filter((b) => b.isUnlocked);
  const lockedBadges = selectedProfile.badges.filter((b) => !b.isUnlocked);

  // Carregar confetti
  useEffect(() => {
    import("canvas-confetti").then(() => setConfettiLoaded(true));
  }, []);

  const triggerConfetti = async () => {
    if (!confettiLoaded) return;
    const confetti = (await import("canvas-confetti")).default;
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#C9A84C", "#2b588a", "#10B981", "#F59E0B"],
    });
  };

  return (
    <div className="space-y-6">

      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Trophy className="h-6 w-6 text-arkos-gold" />
            Metas & Gamificação
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Performance, ranking e conquistas da equipe
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={triggerConfetti}
            icon={<Sparkles className="h-3.5 w-3.5" />}
          >
            Celebrar!
          </Button>
          <Button
            variant="gold"
            size="sm"
            icon={<Target className="h-3.5 w-3.5" />}
          >
            Nova Meta
          </Button>
        </div>
      </div>

      {/* ─── HERO: MEU PERFIL ─── */}
      <div className="rounded-3xl border border-arkos-gold/20 bg-gradient-to-br from-arkos-surface via-arkos-surface-2 to-arkos-surface overflow-hidden relative p-6 sm:p-8">
        {/* Decoração */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-arkos-gold/5 -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-arkos-blue/5 translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">

          {/* Perfil + Level */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar name={selectedProfile.name} size="xl" />
              {/* Level badge */}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-arkos-gold border-2 border-arkos-bg flex items-center justify-center text-2xs font-black text-arkos-bg">
                {selectedProfile.level}
              </div>
            </div>
            <div>
              <p className="text-xl font-black text-text-primary">
                {selectedProfile.name}
              </p>
              <p className="text-sm text-arkos-gold font-semibold">
                {selectedProfile.levelName}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {selectedProfile.role}
              </p>
            </div>
          </div>

          {/* Level progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Progresso para Nível {selectedProfile.level + 1}</span>
              <span className="font-bold text-arkos-gold">
                {selectedProfile.levelProgress}%
              </span>
            </div>
            <div className="h-3 bg-arkos-bg rounded-full overflow-hidden border border-arkos-border relative">
              <div
                className="h-full rounded-full bg-gradient-gold transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${selectedProfile.levelProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer" />
              </div>
            </div>
            <p className="text-2xs text-text-muted text-center">
              {selectedProfile.pointsToNextLevel.toLocaleString()} pts para o próximo nível
            </p>
          </div>

          {/* Stats rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            {[
              {
                icon: Trophy,
                label: "Ranking",
                value: `#${selectedProfile.rankMonthly}`,
                color: selectedProfile.rankMonthly === 1 ? "text-arkos-gold" : "text-text-primary",
              },
              {
                icon: Zap,
                label: "Pts/mês",
                value: selectedProfile.monthlyPoints.toLocaleString(),
                color: "text-arkos-blue-light",
              },
              {
                icon: Flame,
                label: "Streak",
                value: `${selectedProfile.streakDays}d 🔥`,
                color: selectedProfile.streakDays >= 7 ? "text-danger" : "text-warning",
              },
              {
                icon: Award,
                label: "Badges",
                value: `${unlockedBadges.length}/${selectedProfile.badges.length}`,
                color: "text-purple-400",
              },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-arkos-bg border border-arkos-border"
              >
                <Icon className={cn("h-4 w-4", color)} />
                <span className={cn("text-lg font-black", color)}>{value}</span>
                <span className="text-2xs text-text-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── TABS ─── */}
      <div className="flex border-b border-arkos-border overflow-x-auto scrollbar-hide">
        {[
          { id: "ranking", label: "🏆 Ranking", count: null },
          { id: "my-goals", label: "🎯 Minhas Metas", count: selectedProfile.goals.filter(g => g.status === "active").length },
          { id: "badges", label: "🏅 Badges", count: unlockedBadges.length },
          { id: "history", label: "⚡ Histórico", count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap",
              "border-b-2 -mb-px transition-all",
              activeTab === tab.id
                ? "border-arkos-gold text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-2xs font-bold",
                activeTab === tab.id
                  ? "bg-arkos-gold/10 text-arkos-gold"
                  : "bg-arkos-surface-3 text-text-muted"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── TAB: RANKING ─── */}
      {activeTab === "ranking" && (
        <div className="space-y-4">
          {/* Seletor de período */}
          <div className="flex items-center gap-2">
            {["Mensal", "Semanal", "Geral"].map((period) => (
              <button
                key={period}
                className={cn(
                  "px-3 py-1.5 rounded-xl border text-xs font-medium transition-all",
                  period === "Mensal"
                    ? "bg-arkos-blue/10 border-arkos-blue/40 text-arkos-blue-light"
                    : "border-arkos-border text-text-muted hover:border-arkos-border-2"
                )}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Pódio top 3 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[profiles[1], profiles[0], profiles[2]].map((profile, i) => {
              const positions = [2, 1, 3];
              const pos = positions[i];
              const isFirst = pos === 1;
              const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };

              return (
                <div
                  key={profile.userId}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-2xl border",
                    isFirst
                      ? "border-arkos-gold/40 bg-arkos-gold/5 shadow-[0_0_24px_rgba(201,168,76,0.15)]"
                      : "border-arkos-border bg-arkos-surface",
                    isFirst && "order-first sm:order-none -mt-4"
                  )}
                >
                  <span className="text-3xl">{medals[pos as 1 | 2 | 3]}</span>
                  <Avatar name={profile.name} size={isFirst ? "lg" : "md"} />
                  <div className="text-center">
                    <p className="text-xs font-bold text-text-primary">
                      {profile.name.split(" ")[0]}
                    </p>
                    <p className={cn(
                      "text-lg font-black mt-0.5",
                      isFirst ? "text-arkos-gold" : "text-text-primary"
                    )}>
                      {profile.monthlyPoints.toLocaleString()}
                    </p>
                    <p className="text-2xs text-text-muted">pts</p>
                  </div>
                  {profile.streakDays >= 5 && (
                    <div className="flex items-center gap-1 text-2xs text-warning">
                      <Flame className="h-3 w-3" />
                      {profile.streakDays}d
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Lista completa */}
          <div className="space-y-2">
            {profiles
              .sort((a, b) => b.monthlyPoints - a.monthlyPoints)
              .map((profile, i) => (
                <LeaderboardRow
                  key={profile.userId}
                  profile={profile}
                  isCurrentUser={profile.userId === selectedUserId}
                  rank={i + 1}
                />
              ))}
          </div>
        </div>
      )}

      {/* ─── TAB: MINHAS METAS ─── */}
      {activeTab === "my-goals" && (
        <div className="space-y-6">
          {/* Seletor de vendedor */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {profiles.map((profile) => (
              <button
                key={profile.userId}
                onClick={() => setSelectedUserId(profile.userId)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium whitespace-nowrap transition-all shrink-0",
                  selectedUserId === profile.userId
                    ? "bg-arkos-blue/10 border-arkos-blue/40 text-arkos-blue-light"
                    : "border-arkos-border text-text-muted hover:border-arkos-border-2"
                )}
              >
                <Avatar name={profile.name} size="xs" />
                {profile.name.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Grid de metas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedProfile.goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}

            {/* Adicionar meta */}
            <button className={cn(
              "flex flex-col items-center justify-center gap-2 p-6 rounded-2xl",
              "border-2 border-dashed border-arkos-border",
              "hover:border-arkos-blue/40 hover:bg-arkos-blue/5",
              "transition-all text-text-muted hover:text-arkos-blue-light"
            )}>
              <Target className="h-8 w-8" />
              <p className="text-sm font-semibold">Nova Meta</p>
              <p className="text-xs opacity-70">Definir objetivo personalizado</p>
            </button>
          </div>

          {/* Resumo de pontos */}
          <Card className="border-arkos-gold/20 bg-arkos-gold/5">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-5 w-5 text-arkos-gold" />
              <h3 className="text-sm font-bold text-arkos-gold">
                Sistema de Pontos
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Deal fechado", value: "+100 pts/R$1k", emoji: "🤝" },
                { label: "Ligação", value: "+5 pts", emoji: "📞" },
                { label: "Reunião", value: "+15 pts", emoji: "📅" },
                { label: "Demo", value: "+25 pts", emoji: "🖥️" },
                { label: "Proposta", value: "+20 pts", emoji: "📄" },
                { label: "Follow-up", value: "+5 pts", emoji: "🔄" },
                { label: "Meta batida", value: "+500 pts", emoji: "🎯" },
                { label: "Streak bonus", value: "+10 pts/dia", emoji: "🔥" },
              ].map(({ label, value, emoji }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-arkos-bg border border-arkos-gold/10 text-center"
                >
                  <span className="text-xl">{emoji}</span>
                  <span className="text-xs font-bold text-arkos-gold">{value}</span>
                  <span className="text-2xs text-text-muted">{label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB: BADGES ─── */}
      {activeTab === "badges" && (
        <div className="space-y-6">
          {/* Seletor */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {profiles.map((profile) => (
              <button
                key={profile.userId}
                onClick={() => setSelectedUserId(profile.userId)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium whitespace-nowrap transition-all shrink-0",
                  selectedUserId === profile.userId
                    ? "bg-arkos-gold/10 border-arkos-gold/40 text-arkos-gold"
                    : "border-arkos-border text-text-muted hover:border-arkos-border-2"
                )}
              >
                <Avatar name={profile.name} size="xs" />
                {profile.name.split(" ")[0]}
                <span className="text-arkos-gold font-bold">
                  ({profile.badges.filter((b) => b.isUnlocked).length})
                </span>
              </button>
            ))}
          </div>

          {/* Stats de badges */}
          <div className="grid grid-cols-4 gap-3">
            {(["common", "rare", "epic", "legendary"] as BadgeRarity[]).map(
              (rarity) => {
                const cfg = RARITY_CONFIG[rarity];
                const count = selectedProfile.badges.filter(
                  (b) => b.rarity === rarity && b.isUnlocked
                ).length;
                const total = selectedProfile.badges.filter(
                  (b) => b.rarity === rarity
                ).length;

                return (
                  <div
                    key={rarity}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-2xl border",
                      cfg.bg,
                      cfg.border
                    )}
                  >
                    <span className={cn("text-sm font-bold capitalize", cfg.color)}>
                      {cfg.label}
                    </span>
                    <span className={cn("text-2xl font-black", cfg.color)}>
                      {count}/{total}
                    </span>
                  </div>
                );
              }
            )}
          </div>

          {/* Desbloqueados */}
          {unlockedBadges.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Desbloqueados ({unlockedBadges.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {unlockedBadges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </div>
          )}

          {/* Bloqueados / em progresso */}
          {lockedBadges.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                <Medal className="h-4 w-4 text-text-muted" />
                Próximas Conquistas ({lockedBadges.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {lockedBadges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: HISTÓRICO ─── */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {/* Seletor */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {profiles.map((profile) => (
              <button
                key={profile.userId}
                onClick={() => setSelectedUserId(profile.userId)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium whitespace-nowrap transition-all shrink-0",
                  selectedUserId === profile.userId
                    ? "bg-arkos-blue/10 border-arkos-blue/40 text-arkos-blue-light"
                    : "border-arkos-border text-text-muted hover:border-arkos-border-2"
                )}
              >
                <Avatar name={profile.name} size="xs" />
                {profile.name.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Resumo de pontos */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: selectedProfile.totalPoints, color: "text-text-primary" },
              { label: "Este mês", value: selectedProfile.monthlyPoints, color: "text-arkos-blue-light" },
              { label: "Esta semana", value: selectedProfile.weeklyPoints, color: "text-success" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-arkos-surface border border-arkos-border"
              >
                <p className="text-2xs text-text-muted">{label}</p>
                <p className={cn("text-2xl font-black", color)}>
                  {value.toLocaleString()}
                </p>
                <p className="text-2xs text-text-muted">pontos</p>
              </div>
            ))}
          </div>

          {/* Histórico de transações */}
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-4">
              Últimas Transações
            </h3>
            <div className="space-y-2">
              {selectedProfile.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-arkos-surface-2 transition-colors"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                    tx.points > 0
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  )}>
                    {tx.points > 0 ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowUp className="h-4 w-4 rotate-180" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">
                      {tx.reason}
                    </p>
                    <p className="text-2xs text-text-muted">
                      {formatRelativeTime(tx.createdAt)}
                    </p>
                  </div>

                  <span className={cn(
                    "text-sm font-black shrink-0",
                    tx.points > 0 ? "text-success" : "text-danger"
                  )}>
                    {tx.points > 0 ? "+" : ""}
                    {tx.points} pts
                  </span>
                </div>
              ))}

              {selectedProfile.transactions.length === 0 && (
                <p className="text-center text-sm text-text-muted py-8">
                  Nenhuma transação ainda
                </p>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
