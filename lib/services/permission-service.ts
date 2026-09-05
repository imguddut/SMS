/**
 * AGRAGATI PLATFORM — Centralized Permission Evaluation Engine
 *
 * Authoritative evaluation engine for Platform, Organization, School,
 * Assignment, Relationship, and Self scopes.
 */

import { CanonicalUserRole, UserRole, normalizeRole } from "@/types/roles";
import { Permission } from "@/types/permissions";

const ALL_PERMISSIONS: Permission[] = [
  "platform.manage",
  "platform.organizations.create",
  "platform.organizations.read",
  "platform.organizations.update",
  "platform.organizations.archive",
  "organization.schools.create",
  "organization.schools.read",
  "organization.schools.update",
  "organization.schools.archive",
  "organization.users.invite",
  "organization.users.read",
  "organization.users.update",
  "organization.users.deactivate",
  "organization.reports.read",
  "organization.subscriptions.manage",
  "organization.settings.manage",
  "school.create", "school.read", "school.update", "school.archive",
  "student.create", "student.read", "student.update", "student.archive",
  "guardian.create", "guardian.read", "guardian.update",
  "teacher.create", "teacher.read", "teacher.update", "teacher.archive",
  "class.create", "class.read", "class.update", "class.archive",
  "section.create", "section.read", "section.update", "section.archive",
  "subject.create", "subject.read", "subject.update", "subject.archive",
  "attendance.create", "attendance.read", "attendance.update", "attendance.correct",
  "homework.create", "homework.read", "homework.update", "homework.archive",
  "submission.create", "submission.read", "submission.update",
  "assessment.create", "assessment.read", "assessment.update", "assessment.archive",
  "marks.create", "marks.read", "marks.update", "marks.publish",
  "fee_category.create", "fee_category.read", "fee_category.update", "fee_category.archive",
  "fee_structure.create", "fee_structure.read", "fee_structure.update", "fee_structure.archive",
  "invoice.create", "invoice.read", "invoice.update", "invoice.cancel",
  "payment.create", "payment.read", "payment.update", "payment.reverse",
  "bank_statement.create", "bank_statement.read", "bank_statement.update",
  "reconciliation.create", "reconciliation.read", "reconciliation.update", "reconciliation.reverse",
  "approval.create", "approval.read", "approval.approve", "approval.reject",
  "notice.create", "notice.read", "notice.update", "notice.archive",
  "notification.read", "notification.update",
  "audit.read",
  "user.create", "user.read", "user.update", "user.deactivate",
  "timetable.create", "timetable.read", "timetable.update", "timetable.archive",
];

const ORG_LEADERSHIP_PERMISSIONS: Permission[] = [
  "platform.organizations.read",
  "organization.schools.create", "organization.schools.read", "organization.schools.update", "organization.schools.archive",
  "organization.users.invite", "organization.users.read", "organization.users.update", "organization.users.deactivate",
  "organization.reports.read", "organization.subscriptions.manage", "organization.settings.manage",
  "school.read", "school.update",
  "student.read",
  "teacher.read",
  "class.read", "section.read", "subject.read",
  "attendance.read",
  "assessment.read", "marks.read",
  "fee_category.read", "fee_structure.read",
  "invoice.read",
  "payment.read",
  "bank_statement.read",
  "reconciliation.read",
  "approval.create", "approval.read", "approval.approve", "approval.reject",
  "notice.create", "notice.read", "notice.update", "notice.archive",
  "notification.read", "notification.update",
  "audit.read",
  "user.read",
  "timetable.read",
];

const ROLE_PERMISSIONS: Record<CanonicalUserRole, Set<Permission>> = {
  // 1. PLATFORM ADMIN: National fleet management, organizations, cross-tenant audit & settings
  PLATFORM_ADMIN: new Set<Permission>(ALL_PERMISSIONS),

  // 2. ORGANIZATION OWNER: Trust Chairman / Society Founder / Owner
  ORGANIZATION_OWNER: new Set<Permission>(ORG_LEADERSHIP_PERMISSIONS),

  // 3. ORGANIZATION ADMIN: CEO / Managing Director
  ORGANIZATION_ADMIN: new Set<Permission>(ORG_LEADERSHIP_PERMISSIONS),

  // 4. ORGANIZATION FINANCE: Trust Bursar General / Financial Controller
  ORGANIZATION_FINANCE: new Set<Permission>([
    "organization.schools.read",
    "organization.reports.read",
    "school.read",
    "fee_category.read", "fee_structure.read",
    "invoice.read", "payment.read",
    "bank_statement.read", "reconciliation.read",
    "audit.read", "notification.read",
  ]),

  // 5. ORGANIZATION VIEWER: Trustee / Advisory Board Member / Auditor
  ORGANIZATION_VIEWER: new Set<Permission>([
    "organization.schools.read",
    "organization.reports.read",
    "school.read",
    "student.read",
    "teacher.read",
    "attendance.read",
    "marks.read",
    "invoice.read",
    "notice.read",
    "notification.read",
  ]),

  // 6. PRINCIPAL: Academic & operational oversight, publish marks, timetable, notices, approvals
  PRINCIPAL: new Set<Permission>([
    "school.read",
    "student.read", "student.update", "student.archive",
    "guardian.read",
    "teacher.read", "teacher.update", "teacher.archive",
    "class.create", "class.read", "class.update", "class.archive",
    "section.create", "section.read", "section.update", "section.archive",
    "subject.create", "subject.read", "subject.update", "subject.archive",
    "attendance.read", "attendance.correct",
    "homework.read", "homework.archive",
    "submission.read",
    "assessment.create", "assessment.read", "assessment.update", "assessment.archive",
    "marks.read", "marks.update", "marks.publish",
    "fee_category.read", "fee_structure.read",
    "invoice.read",
    "payment.read",
    "approval.create", "approval.read", "approval.approve", "approval.reject",
    "notice.create", "notice.read", "notice.update", "notice.archive",
    "notification.read", "notification.update",
    "audit.read",
    "timetable.create", "timetable.read", "timetable.update", "timetable.archive",
  ]),

  // 7. SCHOOL ADMIN: Operational registrar, user provisioning, timetables, classes
  SCHOOL_ADMIN: new Set<Permission>([
    "school.read", "school.update",
    "student.create", "student.read", "student.update", "student.archive",
    "guardian.create", "guardian.read", "guardian.update",
    "teacher.create", "teacher.read", "teacher.update", "teacher.archive",
    "class.create", "class.read", "class.update", "class.archive",
    "section.create", "section.read", "section.update", "section.archive",
    "subject.create", "subject.read", "subject.update", "subject.archive",
    "attendance.read", "attendance.correct",
    "homework.read",
    "submission.read",
    "assessment.read",
    "marks.read",
    "fee_category.read", "fee_structure.read",
    "invoice.read",
    "payment.read",
    "approval.create", "approval.read",
    "notice.create", "notice.read", "notice.update", "notice.archive",
    "notification.read", "notification.update",
    "audit.read",
    "user.create", "user.read", "user.update", "user.deactivate",
    "timetable.create", "timetable.read", "timetable.update", "timetable.archive",
  ]),

  // 8. TEACHER: Assignment-scoped classroom instruction, attendance, homework, marks
  TEACHER: new Set<Permission>([
    "student.read",
    "class.read",
    "section.read",
    "subject.read",
    "attendance.create", "attendance.read", "attendance.update",
    "homework.create", "homework.read", "homework.update",
    "submission.read", "submission.update",
    "assessment.create", "assessment.read", "assessment.update",
    "marks.create", "marks.read", "marks.update",
    "notice.read",
    "notification.read", "notification.update",
    "timetable.read",
  ]),

  // 9. ACCOUNTANT: School-scoped finance, invoicing, collection, reconciliation
  ACCOUNTANT: new Set<Permission>([
    "school.read",
    "student.read",
    "fee_category.create", "fee_category.read", "fee_category.update", "fee_category.archive",
    "fee_structure.create", "fee_structure.read", "fee_structure.update", "fee_structure.archive",
    "invoice.create", "invoice.read", "invoice.update", "invoice.cancel",
    "payment.create", "payment.read", "payment.update", "payment.reverse",
    "bank_statement.create", "bank_statement.read", "bank_statement.update",
    "reconciliation.create", "reconciliation.read", "reconciliation.update", "reconciliation.reverse",
    "approval.create", "approval.read",
    "notice.read",
    "notification.read", "notification.update",
    "audit.read",
  ]),

  // 10. PARENT: Child relationship-scoped views, fee payment, absence filing
  PARENT: new Set<Permission>([
    "student.read",
    "guardian.read",
    "attendance.read",
    "homework.read",
    "submission.create", "submission.read",
    "assessment.read",
    "marks.read",
    "invoice.read",
    "payment.create", "payment.read",
    "approval.create", "approval.read",
    "notice.read",
    "notification.read", "notification.update",
    "timetable.read",
  ]),

  // 11. STUDENT: Self-scoped view of assignments, marks, schedule, notices
  STUDENT: new Set<Permission>([
    "student.read",
    "attendance.read",
    "homework.read",
    "submission.create", "submission.read",
    "assessment.read",
    "marks.read",
    "invoice.read",
    "notice.read",
    "notification.read", "notification.update",
    "timetable.read",
  ]),
};

/**
 * Authoritatively evaluates whether a role has a given permission.
 */
export function hasPermission(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  const canonicalRole = normalizeRole(role);
  const permissions = ROLE_PERMISSIONS[canonicalRole];
  if (!permissions) return false;
  return permissions.has(permission);
}

/**
 * Returns the complete set of permissions for a role.
 */
export function getRolePermissions(role: UserRole | null | undefined): Permission[] {
  if (!role) return [];
  const canonicalRole = normalizeRole(role);
  const permissions = ROLE_PERMISSIONS[canonicalRole];
  return permissions ? Array.from(permissions) : [];
}

/**
 * Checks if a role has all of the given permissions.
 */
export function hasAllPermissions(role: UserRole | null | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Checks if a role has any of the given permissions.
 */
export function hasAnyPermission(role: UserRole | null | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some((p) => hasPermission(role, p));
}
