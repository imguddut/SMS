/**
 * AGRAGATI SCHOOL OS — Notification Domain Service
 *
 * Centralized service for creating, storing, and delivering cross-portal notifications.
 * Persists to `notifications` table in Supabase.
 */

import { createClient } from "@/lib/supabase/client";
import { PlatformEventType, PlatformNotification } from "@/types/events";

export interface CreateNotificationInput {
  schoolId: string | null;
  recipientUserId: string;
  type: PlatformEventType;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  linkUrl?: string;
}

const FALLBACK_NOTIFICATIONS: PlatformNotification[] = [];

export async function dispatchNotification(input: CreateNotificationInput): Promise<{ id: string }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        school_id: input.schoolId,
        recipient_user_id: input.recipientUserId,
        category: input.type,
        title: input.title,
        message: input.message,
        source_table: input.entityType,
        source_id: input.entityId,
        link_url: input.linkUrl || null,
        is_read: false,
      })
      .select("id")
      .single();

    if (error) throw error;
    return { id: data!.id };
  } catch (err) {
    console.warn("dispatchNotification fallback:", err);
    return { id: "notif-" + Date.now() };
  }
}

export async function getNotifications(userId: string): Promise<PlatformNotification[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((n: any) => ({
        id: n.id,
        recipient_id: n.recipient_user_id,
        school_id: n.school_id,
        type: n.category as PlatformEventType,
        title: n.title,
        message: n.message,
        entity_type: n.source_table || "system",
        entity_id: n.source_id || "",
        is_read: n.is_read,
        link_url: n.link_url,
        created_at: n.created_at,
      }));
    }
    return FALLBACK_NOTIFICATIONS;
  } catch (err) {
    console.warn("getNotifications fallback:", err);
    return FALLBACK_NOTIFICATIONS;
  }
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);
  } catch (err) {
    console.warn("markNotificationRead fallback:", err);
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("recipient_user_id", userId);
  } catch (err) {
    console.warn("markAllNotificationsRead fallback:", err);
  }
}
