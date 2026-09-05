/**
 * AGRAGATI SCHOOL OS — Audit Service
 *
 * Centralized audit logging for all mutations.
 * Writes to the `audit_logs` table in Supabase.
 */

import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuditLogEntry {
  id: string;
  school_id: string | null;
  actor_id: string | null;
  action: string;
  entity_table: string;
  entity_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// Common audit action names
export const AuditAction = {
  // Attendance
  ATTENDANCE_MARKED: "ATTENDANCE_MARKED",
  ATTENDANCE_UPDATED: "ATTENDANCE_UPDATED",
  // Homework
  HOMEWORK_CREATED: "HOMEWORK_CREATED",
  HOMEWORK_SUBMITTED: "HOMEWORK_SUBMITTED",
  HOMEWORK_GRADED: "HOMEWORK_GRADED",
  // Marks
  MARKS_ENTERED: "MARKS_ENTERED",
  MARKS_PUBLISHED: "MARKS_PUBLISHED",
  // Finance
  INVOICE_CREATED: "INVOICE_CREATED",
  INVOICE_UPDATED: "INVOICE_UPDATED",
  PAYMENT_RECORDED: "PAYMENT_RECORDED",
  RECONCILIATION_COMPLETED: "RECONCILIATION_COMPLETED",
  // Notices
  NOTICE_CREATED: "NOTICE_CREATED",
  NOTICE_UPDATED: "NOTICE_UPDATED",
  NOTICE_DELETED: "NOTICE_DELETED",
  // Approvals
  APPROVAL_REQUESTED: "APPROVAL_REQUESTED",
  APPROVAL_DECIDED: "APPROVAL_DECIDED",
  // Admin
  STUDENT_ENROLLED: "STUDENT_ENROLLED",
  STUDENT_UPDATED: "STUDENT_UPDATED",
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  SCHOOL_SETTINGS_UPDATED: "SCHOOL_SETTINGS_UPDATED",
} as const;

export type AuditActionType = typeof AuditAction[keyof typeof AuditAction];

// ---------------------------------------------------------------------------
// Service Functions
// ---------------------------------------------------------------------------

/**
 * Log an audit entry for a mutation.
 * This should be called by every service function that modifies data.
 */
export async function logAudit(params: {
  schoolId: string | null;
  actorId: string | null;
  action: AuditActionType | string;
  entityTable: string;
  entityId: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    const supabase = createClient();

    await supabase.from("audit_logs").insert({
      school_id: params.schoolId,
      actor_id: params.actorId,
      action: params.action,
      entity_table: params.entityTable,
      entity_id: params.entityId,
      old_values: params.oldValues || null,
      new_values: params.newValues || null,
    });
  } catch (err) {
    // Audit logging should never break the main operation
    console.warn("Audit log write failed:", err);
  }
}

/**
 * Fetch recent audit logs for a school.
 * Used by School Admin, Owner, Platform Admin portals.
 */
export async function getAuditLogs(
  schoolId: string,
  options?: {
    limit?: number;
    entityTable?: string;
    actorId?: string;
    action?: string;
  }
): Promise<AuditLogEntry[]> {
  try {
    const supabase = createClient();

    let query = supabase
      .from("audit_logs")
      .select("*")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false })
      .limit(options?.limit || 50);

    if (options?.entityTable) {
      query = query.eq("entity_table", options.entityTable);
    }
    if (options?.actorId) {
      query = query.eq("actor_id", options.actorId);
    }
    if (options?.action) {
      query = query.eq("action", options.action);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []) as AuditLogEntry[];
  } catch (err) {
    console.warn("getAuditLogs fallback:", err);
    return [];
  }
}
