import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface ActivityRow {
  id: string;
  deal_id: string | null;
  contact_id: string | null;
  user_id: string | null;
  type: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  due_date: string | null;
  completed_at: string | null;
  duration_min: number | null;
  is_ai: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  user?: { id: string; full_name: string; avatar_url: string | null };
}

export async function getActivitiesByDeal(dealId: string) {
  const { data, error } = await supabase
    .from("activities")
    .select(`*, user:profiles(id, full_name, avatar_url)`)
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as ActivityRow[];
}

export async function createActivity(input: {
  dealId?: string;
  contactId?: string;
  userId: string;
  type: string;
  title: string;
  description?: string;
  isAI?: boolean;
  dueDate?: string;
  metadata?: Record<string, unknown>;
}) {
  const { data, error } = await supabase
    .from("activities")
    .insert({
      deal_id: input.dealId,
      contact_id: input.contactId,
      user_id: input.userId,
      type: input.type,
      title: input.title,
      description: input.description,
      is_ai: input.isAI || false,
      due_date: input.dueDate,
      metadata: input.metadata || {},
    })
    .select()
    .single();

  if (error) throw error;

  // Atualizar last_activity_at do deal
  if (input.dealId) {
    await supabase
      .from("deals")
      .update({ last_activity_at: new Date().toISOString() })
      .eq("id", input.dealId);
  }

  return data;
}

export async function completeActivity(id: string) {
  const { data, error } = await supabase
    .from("activities")
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPendingTasks(userId: string) {
  const { data, error } = await supabase
    .from("activities")
    .select(`*, deal:deals(id, title)`)
    .eq("user_id", userId)
    .eq("is_completed", false)
    .in("type", ["task", "call", "meeting"])
    .order("due_date", { ascending: true });

  if (error) throw error;
  return data;
}
