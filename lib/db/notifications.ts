/**
 * AGRAGATI SCHOOL OS — Notifications Module
 *
 * Real Supabase-backed notifications with mock fallback.
 * Reads from the `notifications` table created by 003_notifications_table.sql.
 */

import { createClient } from "@/lib/supabase/client";
import { UserRole } from "@/types/auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NotificationItem {
  id: string;
  roleTarget: UserRole | "ALL";
  category: "TREASURY" | "ACADEMIC" | "ATTENDANCE" | "SECURITY" | "SYSTEM";
  title: string;
  message: string;
  timestamp: string;
  priority: "URGENT" | "HIGH" | "NORMAL";
  isRead: boolean;
  linkUrl?: string;
  actionText?: string;
}

export interface WebhookEventItem {
  id: string;
  eventName: string;
  targetEndpoint: string;
  payloadJson: Record<string, any>;
  status: "DELIVERED" | "RETRYING" | "FAILED";
  responseCode: number;
  latencyMs: number;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Fallback data (for when notifications table doesn't exist yet)
// ---------------------------------------------------------------------------

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-01",
    roleTarget: "ACCOUNTANT",
    category: "TREASURY",
    title: "BHIM UPI Payment Settled (₹75,000)",
    message: "Ramesh Sharma settled Term 2 Composite Fees for Aarav Sharma (INV-2025-001). Auto-matched via UPI UTR #401299884210.",
    timestamp: "10 mins ago",
    priority: "HIGH",
    isRead: false,
    linkUrl: "/finance/invoices",
    actionText: "View Receipt",
  },
  {
    id: "notif-02",
    roleTarget: "PRINCIPAL",
    category: "SECURITY",
    title: "CBSE Roll-Number List Ready for Seal",
    message: "Class 12 Board Examination LOC (List of Candidates) awaits Principal cryptographic e-Sign and CBSE portal upload.",
    timestamp: "25 mins ago",
    priority: "URGENT",
    isRead: false,
    linkUrl: "/school/approvals",
    actionText: "Review & Sign",
  },
  {
    id: "notif-03",
    roleTarget: "TEACHER",
    category: "ACADEMIC",
    title: "Homework Submission Received",
    message: "Genevieve Laurent submitted 'Electromagnetic Induction Lab Report' for Higher Level Physics.",
    timestamp: "1 hour ago",
    priority: "NORMAL",
    isRead: false,
    linkUrl: "/teacher/homework/review",
    actionText: "Review",
  },
  {
    id: "notif-04",
    roleTarget: "PARENT",
    category: "ATTENDANCE",
    title: "Attendance Alert",
    message: "Your ward Genevieve Laurent was marked LATE for Period 1 today.",
    timestamp: "2 hours ago",
    priority: "HIGH",
    isRead: false,
    linkUrl: "/parent/attendance",
    actionText: "View Details",
  },
  {
    id: "notif-05",
    roleTarget: "STUDENT",
    category: "ACADEMIC",
    title: "New Homework Assigned",
    message: "Dr. Alistair Finch assigned 'Quantum Mechanics Problem Set #4' — due in 7 days.",
    timestamp: "3 hours ago",
    priority: "NORMAL",
    isRead: false,
    linkUrl: "/student/homework",
    actionText: "View Assignment",
  },
  {
    id: "notif-06",
    roleTarget: "SUPER_ADMIN",
    category: "SYSTEM",
    title: "Multi-Tenant Fleet Status Nominal",
    message: "National hardware security modules active. All organization tenants synchronized.",
    timestamp: "4 hours ago",
    priority: "NORMAL",
    isRead: false,
    linkUrl: "/platform-admin/overview",
    actionText: "View Fleet",
  },
  {
    id: "notif-07",
    roleTarget: "ORGANIZATION_OWNER",
    category: "TREASURY",
    title: "Consolidated Treasury Payout Processed",
    message: "Monthly multi-school fee collection settled to Trust Central Reserve Account.",
    timestamp: "5 hours ago",
    priority: "NORMAL",
    isRead: false,
    linkUrl: "/organization",
    actionText: "View Treasury",
  },
];

// Category mapping from DB to UI
const CATEGORY_MAP: Record<string, NotificationItem["category"]> = {
  TREASURY: "TREASURY",
  ACADEMIC: "ACADEMIC",
  ATTENDANCE: "ATTENDANCE",
  SECURITY: "SECURITY",
  SYSTEM: "SYSTEM",
  FINANCE: "TREASURY",
  HOMEWORK: "ACADEMIC",
  MARKS: "ACADEMIC",
  NOTICE: "SYSTEM",
  APPROVAL: "SYSTEM",
};

// ---------------------------------------------------------------------------
// Service Functions
// ---------------------------------------------------------------------------

/**
 * Fetch notifications for a specific user from Supabase.
 */
export async function fetchNotifications(
  userProfileId: string,
  role?: UserRole
): Promise<NotificationItem[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_user_id", userProfileId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    if (data && data.length > 0) {
      return data.map((n: any) => ({
        id: n.id,
        roleTarget: role || "ALL",
        category: CATEGORY_MAP[n.category] || "SYSTEM",
        title: n.title,
        message: n.message,
        timestamp: formatRelativeTime(n.created_at),
        priority: (n.priority || "NORMAL") as "URGENT" | "HIGH" | "NORMAL",
        isRead: n.is_read,
        linkUrl: n.link_url || undefined,
        actionText: n.action_text || undefined,
      }));
    }

    // Fall back to mock if no real notifications exist yet
    if (role) {
      return MOCK_NOTIFICATIONS.filter(
        (n) => n.roleTarget === role || n.roleTarget === "ALL"
      );
    }
    return MOCK_NOTIFICATIONS;
  } catch (err) {
    console.warn("fetchNotifications fallback:", err);
    if (role) {
      return MOCK_NOTIFICATIONS.filter(
        (n) => n.roleTarget === role || n.roleTarget === "ALL"
      );
    }
    return MOCK_NOTIFICATIONS;
  }
}

/**
 * Mark a notification as read.
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);
  } catch (err) {
    console.warn("markNotificationRead failed:", err);
  }
}

export const markNotificationAsRead = markNotificationRead;

/**
 * Mark all notifications as read for a user or role.
 */
export async function markAllRead(userProfileIdOrRole: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_user_id", userProfileIdOrRole)
      .eq("is_read", false);
  } catch (err) {
    console.warn("markAllRead failed:", err);
  }
}

export async function markAllNotificationsAsRead(role: UserRole): Promise<void> {
  await markAllRead(role);
}

/**
 * Fetch notifications for a user/role with unread count.
 */
export async function fetchUserNotifications(role: UserRole): Promise<{
  notifications: NotificationItem[];
  unreadCount: number;
}> {
  const items = await fetchNotifications(role, role);
  const unreadCount = items.filter((n) => !n.isRead).length;
  return {
    notifications: items,
    unreadCount,
  };
}


/**
 * Get unread count for a user.
 */
export async function getUnreadCount(userProfileId: string): Promise<number> {
  try {
    const supabase = createClient();
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("recipient_user_id", userProfileId)
      .eq("is_read", false);

    if (error) throw error;
    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Create a notification for a user.
 * Used by services when creating cross-portal notifications.
 */
export async function createNotification(params: {
  schoolId: string;
  recipientUserId: string;
  category: string;
  title: string;
  message: string;
  linkUrl?: string;
  actionText?: string;
  priority?: "URGENT" | "HIGH" | "NORMAL";
  sourceTable?: string;
  sourceId?: string;
}): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from("notifications").insert({
      school_id: params.schoolId,
      recipient_user_id: params.recipientUserId,
      category: params.category,
      title: params.title,
      message: params.message,
      priority: params.priority || "NORMAL",
      source_table: params.sourceTable || null,
      source_id: params.sourceId || null,
    });
  } catch (err) {
    console.warn("createNotification failed:", err);
  }
}

export async function fetchUserNotifications(
  role?: UserRole
): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
  const items = await fetchNotifications("default-user", role);
  const unreadCount = items.filter((n) => !n.isRead).length;
  return { notifications: items, unreadCount };
}

export async function markNotificationAsRead(id: string): Promise<void> {
  return markNotificationRead(id);
}

export async function markAllNotificationsAsRead(userProfileId?: string): Promise<void> {
  return markAllRead(userProfileId || "default-user");
}

// Webhook events (still mock for now, planned for future)
export async function fetchWebhookEvents(): Promise<WebhookEventItem[]> {
  return [
    {
      id: "wh-01",
      eventName: "payment.settled",
      targetEndpoint: "https://erp.kingscollege.edu/api/webhooks/tally",
      payloadJson: { invoice_id: "INV-2025-001", amount: 75000 },
      status: "DELIVERED",
      responseCode: 200,
      latencyMs: 142,
      timestamp: "10 mins ago",
    },
  ];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
