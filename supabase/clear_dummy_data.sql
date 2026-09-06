-- =========================================================================
-- AGRAGATI SCHOOL OS — COMPLETE SUPABASE DATABASE RESET / PURGE SCRIPT
-- Purges all dummy records, emails, passwords, and auth accounts from Supabase.
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- =========================================================================

-- 1. Single TRUNCATE CASCADE for all public schema tables
TRUNCATE TABLE 
  academic_terms,
  academic_years,
  admissions,
  approvals,
  assessments,
  attendance_entries,
  attendance_records,
  audit_logs,
  bank_statements,
  bank_transactions,
  classes,
  discipline_records,
  enrollments,
  expenses,
  fee_allocations,
  fee_categories,
  fee_structures,
  guardians,
  homework_assignments,
  homework_submissions,
  invoice_items,
  invoices,
  leave_requests,
  marks_entries,
  notices,
  notification_preferences,
  notifications,
  organization_memberships,
  organizations,
  payment_reconciliations,
  payments,
  periods,
  platforms,
  school_memberships,
  schools,
  sections,
  student_guardians,
  students,
  subjects,
  teacher_assignments,
  teachers,
  timetable_entries,
  timetables,
  users_profiles,
  vendors
CASCADE;

-- 2. Delete all auth credentials & accounts from auth.users
DELETE FROM auth.users;
