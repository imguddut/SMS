/**
 * AGRAGATI PLATFORM — Centralized Permission System (Section 36 & 37)
 *
 * Defines all fine-grained CRUD permissions across Platform, Organization,
 * School, Assignment, Relationship, and Self scopes.
 */

export type Permission =
  // Platform Administration
  | "platform.manage"
  | "platform.organizations.create"
  | "platform.organizations.read"
  | "platform.organizations.update"
  | "platform.organizations.archive"

  // Organization Administration
  | "organization.schools.create"
  | "organization.schools.read"
  | "organization.schools.update"
  | "organization.schools.archive"
  | "organization.users.invite"
  | "organization.users.read"
  | "organization.users.update"
  | "organization.users.deactivate"
  | "organization.reports.read"
  | "organization.subscriptions.manage"
  | "organization.settings.manage"

  // School Operations
  | "school.create"
  | "school.read"
  | "school.update"
  | "school.archive"

  // Students
  | "student.create"
  | "student.read"
  | "student.update"
  | "student.archive"

  // Guardians
  | "guardian.create"
  | "guardian.read"
  | "guardian.update"

  // Teachers / Staff
  | "teacher.create"
  | "teacher.read"
  | "teacher.update"
  | "teacher.archive"

  // Classes
  | "class.create"
  | "class.read"
  | "class.update"
  | "class.archive"

  // Sections
  | "section.create"
  | "section.read"
  | "section.update"
  | "section.archive"

  // Subjects
  | "subject.create"
  | "subject.read"
  | "subject.update"
  | "subject.archive"

  // Attendance
  | "attendance.create"
  | "attendance.read"
  | "attendance.update"
  | "attendance.correct"

  // Homework
  | "homework.create"
  | "homework.read"
  | "homework.update"
  | "homework.archive"

  // Submissions
  | "submission.create"
  | "submission.read"
  | "submission.update"

  // Assessments
  | "assessment.create"
  | "assessment.read"
  | "assessment.update"
  | "assessment.archive"

  // Marks & Gradebook
  | "marks.create"
  | "marks.read"
  | "marks.update"
  | "marks.publish"

  // Fee Categories
  | "fee_category.create"
  | "fee_category.read"
  | "fee_category.update"
  | "fee_category.archive"

  // Fee Structures
  | "fee_structure.create"
  | "fee_structure.read"
  | "fee_structure.update"
  | "fee_structure.archive"

  // Invoices
  | "invoice.create"
  | "invoice.read"
  | "invoice.update"
  | "invoice.cancel"

  // Payments
  | "payment.create"
  | "payment.read"
  | "payment.update"
  | "payment.reverse"

  // Bank Statements
  | "bank_statement.create"
  | "bank_statement.read"
  | "bank_statement.update"

  // Reconciliation
  | "reconciliation.create"
  | "reconciliation.read"
  | "reconciliation.update"
  | "reconciliation.reverse"

  // Approvals
  | "approval.create"
  | "approval.read"
  | "approval.approve"
  | "approval.reject"

  // Notices
  | "notice.create"
  | "notice.read"
  | "notice.update"
  | "notice.archive"

  // Notifications
  | "notification.read"
  | "notification.update"

  // Audit Logs
  | "audit.read"

  // Users
  | "user.create"
  | "user.read"
  | "user.update"
  | "user.deactivate"

  // Timetable
  | "timetable.create"
  | "timetable.read"
  | "timetable.update"
  | "timetable.archive"

  // Admissions
  | "admission.create"
  | "admission.read"
  | "admission.update"
  | "admission.approve"
  | "admission.reject"
  | "admission.enroll"

  // Expenses & Vouchers
  | "expense.create"
  | "expense.read"
  | "expense.update"
  | "expense.approve"
  | "expense.reject"
  | "expense.pay"

  // Vendors
  | "vendor.create"
  | "vendor.read"
  | "vendor.update"
  | "vendor.archive"

  // Leave Requests
  | "leave.create"
  | "leave.read"
  | "leave.approve"
  | "leave.reject"

  // Discipline & Behavioral
  | "discipline.create"
  | "discipline.read"
  | "discipline.update"
  | "discipline.resolve";
