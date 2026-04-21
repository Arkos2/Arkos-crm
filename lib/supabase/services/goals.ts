import { createClient } from "@/lib/supabase/client";
import { Goal } from "@/lib/types/goals";

const supabase = createClient();

// ─── METAS ───
export async function getUserGoals(userId: string) {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    type: row.type,
    period: row.period,
    targetValue: row.target_value,
    currentValue: row.current_value,
    unit: row.unit,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    status: row.status,
    completedAt: row.completed_at,
  } as Goal));
}

export async function createGoal(input: {
  userId: string;
  type: string;
  period: string;
  targetValue: number;
  unit: string;
  periodStart: string;
  periodEnd: string;
}) {
  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: input.userId,
      type: input.type,
      period: input.period,
      target_value: input.targetValue,
      unit: input.unit,
      period_start: input.periodStart,
      period_end: input.periodEnd,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGoalProgress(id: string, currentValue: number) {
  const { data: goal } = await supabase
    .from("goals")
    .select("target_value, status")
    .eq("id", id)
    .single();

  const isCompleted = goal && currentValue >= goal.target_value;

  const { data, error } = await supabase
    .from("goals")
    .update({
      current_value: currentValue,
      status: isCompleted ? "completed" : "active",
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── PONTOS ───
export async function getUserPoints(userId: string) {
  const { data, error } = await supabase
    .from("user_points")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function addPoints(input: {
  userId: string;
  points: number;
  reason: string;
  referenceType: string;
  referenceId?: string;
}) {
  // Registrar transação
  await supabase.from("point_transactions").insert({
    user_id: input.userId,
    points: input.points,
    reason: input.reason,
    reference_type: input.referenceType,
    reference_id: input.referenceId,
  });

  // Buscar pontos atuais
  const { data: current } = await supabase
    .from("user_points")
    .select("*")
    .eq("user_id", input.userId)
    .single();

  if (current) {
    const newTotal = current.total_points + input.points;
    const newMonthly = current.monthly_points + input.points;
    const newWeekly = current.weekly_points + input.points;
    const newLevel = calculateLevel(newTotal);

    await supabase
      .from("user_points")
      .update({
        total_points: newTotal,
        monthly_points: newMonthly,
        weekly_points: newWeekly,
        level: newLevel.level,
        level_name: newLevel.name,
        level_progress: newLevel.progress,
      })
      .eq("user_id", input.userId);
  } else {
    // Criar registro de pontos
    const newLevel = calculateLevel(input.points);
    await supabase.from("user_points").insert({
      user_id: input.userId,
      total_points: input.points,
      monthly_points: input.points,
      weekly_points: input.points,
      level: newLevel.level,
      level_name: newLevel.name,
      level_progress: newLevel.progress,
    });
  }
}

export async function getLeaderboard() {
  const { data, error } = await supabase
    .from("user_points")
    .select(`
      *,
      profile:profiles(id, full_name, avatar_url, role)
    `)
    .order("monthly_points", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}

export async function getPointHistory(userId: string) {
  const { data, error } = await supabase
    .from("point_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

// ─── CALCULAR NÍVEL ───
function calculateLevel(totalPoints: number): {
  level: number;
  name: string;
  progress: number;
} {
  const thresholds = [
    0, 500, 1200, 2500, 4500, 7000,
    10000, 14000, 19000, 25000, 32000,
    40000, 50000, 62000, 76000,
  ];

  const names = [
    "Iniciante", "Aprendiz", "Desenvolvedor",
    "Vendedor Júnior", "Vendedor", "Vendedor Pleno",
    "Vendedor Experiente", "Vendedor Sênior", "Especialista",
    "Expert", "Mestre das Vendas", "Grande Mestre",
    "Elite", "Lendário", "Top 1%",
  ];

  let level = 1;
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (totalPoints >= thresholds[i]) level = i + 1;
  }

  const currentThreshold = thresholds[level - 1] || 0;
  const nextThreshold = thresholds[level] || thresholds[thresholds.length - 1];
  const progress = Math.round(
    ((totalPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100
  );

  return {
    level,
    name: names[level - 1] || "Lendário",
    progress: Math.min(progress, 100),
  };
}
