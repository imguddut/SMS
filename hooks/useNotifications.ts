/**
 * AGRAGATI SCHOOL OS — useNotifications React Hook
 *
 * Provides reactive notifications list and unread counters for the topbar / notification drawer.
 */
"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/auth-context";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/services/notification-service";
import { PlatformNotification } from "@/types/events";

export function useNotifications() {
  const { userId } = useAuth();
  const currentUserId = userId || "b0000000-0000-0000-0000-000000000003";

  const [notifications, setNotifications] = React.useState<PlatformNotification[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadNotifications = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications(currentUserId);
      setNotifications(data);
    } catch (err) {
      console.error("useNotifications load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = React.useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  const markAsRead = React.useCallback(
    async (id: string) => {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    },
    []
  );

  const markAllRead = React.useCallback(async () => {
    await markAllNotificationsRead(currentUserId);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, [currentUserId]);

  return {
    notifications,
    unreadCount,
    isLoading,
    refresh: loadNotifications,
    markAsRead,
    markAllRead,
  };
}
