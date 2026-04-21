"use client";

import useSWR, { mutate } from "swr";
import { useEffect } from "react";
import {
  getNotifications, markAsRead, markAllAsRead,
  getUnreadCount, subscribeToNotifications,
  NotificationRow,
} from "@/lib/supabase/services/notifications";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useNotifications() {
  const { user } = useAuth();
  const key = user ? ["notifications", user.id] : null;
  const countKey = user ? ["notifications-count", user.id] : null;

  const { data, isLoading } = useSWR(
    key,
    () => getNotifications(user!.id),
    { revalidateOnFocus: true }
  );

  const { data: unreadCount } = useSWR(
    countKey,
    () => getUnreadCount(user!.id),
    { revalidateOnFocus: true }
  );

  // Realtime
  useEffect(() => {
    if (!user) return;

    const channel = subscribeToNotifications(user.id, (notification) => {
      mutate(key);
      mutate(countKey);

      // Toast automático para novas notificações
      toast(notification.title, {
        description: notification.message,
      });
    });

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [user, key, countKey]);

  const handleMarkAsRead = async (id: string) => {
    mutate(
      key,
      (current: NotificationRow[] | undefined) =>
        current?.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      false
    );
    await markAsRead(id);
    mutate(countKey);
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    mutate(
      key,
      (current: NotificationRow[] | undefined) =>
        current?.map((n) => ({ ...n, is_read: true })),
      false
    );
    await markAllAsRead(user.id);
    mutate(countKey);
  };

  return {
    notifications: data || [],
    unreadCount: unreadCount || 0,
    isLoading,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refresh: () => { mutate(key); mutate(countKey); },
  };
}
