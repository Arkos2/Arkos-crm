import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "danger";
  is_read: boolean;
  action_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw error;
  return data as NotificationRow[];
}

export async function markAsRead(id: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) throw error;
}

export async function markAllAsRead(userId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
}

export async function createNotification(input: {
  userId: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "danger";
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}) {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: input.userId,
      title: input.title,
      message: input.message,
      type: input.type || "info",
      action_url: input.actionUrl,
      metadata: input.metadata || {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUnreadCount(userId: string) {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
  return count || 0;
}

// ─── REALTIME ───
export function subscribeToNotifications(
  userId: string,
  callback: (notification: NotificationRow) => void
) {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload: any) => callback(payload.new as NotificationRow)
    )
    .subscribe();
}
