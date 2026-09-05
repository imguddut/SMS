/**
 * AGRAGATI SCHOOL OS — Platform Event Types & Notification Payloads (Section 19)
 */

export type PlatformEventType =
  | "STUDENT_CREATED"
  | "ATTENDANCE_MARKED"
  | "ATTENDANCE_CORRECTED"
  | "HOMEWORK_ASSIGNED"
  | "HOMEWORK_SUBMITTED"
  | "HOMEWORK_GRADED"
  | "MARKS_ENTERED"
  | "MARKS_PUBLISHED"
  | "INVOICE_CREATED"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_FAILED"
  | "PAYMENT_RECONCILED"
  | "APPROVAL_REQUESTED"
  | "APPROVAL_APPROVED"
  | "APPROVAL_REJECTED"
  | "NOTICE_PUBLISHED"
  | "TIMETABLE_CHANGED";

export interface PlatformNotification {
  id: string;
  recipient_id: string;
  school_id: string | null;
  type: PlatformEventType;
  title: string;
  message: string;
  entity_type: string;
  entity_id: string;
  is_read: boolean;
  link_url?: string | null;
  created_at: string;
}
