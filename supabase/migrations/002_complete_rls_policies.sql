-- ============================================================================
-- AGRAGATI SCHOOL OS — COMPLETE RLS POLICIES
-- Run in Supabase SQL Editor to add missing tenant-isolation policies
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Drop existing policies to recreate cleanly (idempotent)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  -- Schools
  DROP POLICY IF EXISTS super_admin_all_schools ON schools;
  DROP POLICY IF EXISTS own_school_read ON schools;
  -- Users Profiles
  DROP POLICY IF EXISTS super_admin_all_profiles ON users_profiles;
  DROP POLICY IF EXISTS own_profile_read ON users_profiles;
  DROP POLICY IF EXISTS same_school_profiles_read ON users_profiles;
  -- Tenant isolation
  DROP POLICY IF EXISTS school_tenant_isolation_classes ON classes;
  DROP POLICY IF EXISTS school_tenant_isolation_students ON students;
  DROP POLICY IF EXISTS school_tenant_isolation_invoices ON invoices;
  DROP POLICY IF EXISTS school_tenant_isolation_notices ON notices;
  DROP POLICY IF EXISTS school_tenant_isolation_approvals ON approvals;
END $$;

-- ---------------------------------------------------------------------------
-- SCHOOLS — Super Admin sees all, others see own school
-- ---------------------------------------------------------------------------
CREATE POLICY schools_super_admin ON schools
  FOR ALL USING (is_super_admin());

CREATE POLICY schools_own ON schools
  FOR SELECT USING (id = get_user_school_id());

-- ---------------------------------------------------------------------------
-- USERS_PROFILES — Super Admin all, users see own school members
-- ---------------------------------------------------------------------------
CREATE POLICY profiles_super_admin ON users_profiles
  FOR ALL USING (is_super_admin());

CREATE POLICY profiles_own ON users_profiles
  FOR SELECT USING (
    auth_user_id = auth.uid()
    OR school_id = get_user_school_id()
  );

CREATE POLICY profiles_update_own ON users_profiles
  FOR UPDATE USING (auth_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- ACADEMIC_YEARS — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY ay_tenant ON academic_years
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- ACADEMIC_TERMS — through academic_years
-- ---------------------------------------------------------------------------
CREATE POLICY at_tenant ON academic_terms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM academic_years ay
      WHERE ay.id = academic_terms.academic_year_id
      AND (ay.school_id = get_user_school_id() OR is_super_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- CLASSES — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY classes_tenant ON classes
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- SECTIONS — through classes
-- ---------------------------------------------------------------------------
CREATE POLICY sections_tenant ON sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = sections.class_id
      AND (c.school_id = get_user_school_id() OR is_super_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- TEACHERS — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY teachers_tenant ON teachers
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- SUBJECTS — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY subjects_tenant ON subjects
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- TEACHER_ASSIGNMENTS — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY ta_tenant ON teacher_assignments
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- TIMETABLES — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY timetables_tenant ON timetables
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- STUDENTS — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY students_tenant ON students
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- GUARDIANS — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY guardians_tenant ON guardians
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- STUDENT_GUARDIANS — through students
-- ---------------------------------------------------------------------------
CREATE POLICY sg_tenant ON student_guardians
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = student_guardians.student_id
      AND (s.school_id = get_user_school_id() OR is_super_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- ENROLLMENTS — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY enrollments_tenant ON enrollments
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- ATTENDANCE_RECORDS — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY ar_tenant ON attendance_records
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- ATTENDANCE_ENTRIES — through attendance_records
-- ---------------------------------------------------------------------------
CREATE POLICY ae_tenant ON attendance_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM attendance_records ar
      WHERE ar.id = attendance_entries.attendance_record_id
      AND (ar.school_id = get_user_school_id() OR is_super_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- HOMEWORK_ASSIGNMENTS — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY ha_tenant ON homework_assignments
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- HOMEWORK_SUBMISSIONS — through homework_assignments
-- ---------------------------------------------------------------------------
CREATE POLICY hs_tenant ON homework_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM homework_assignments ha
      WHERE ha.id = homework_submissions.homework_id
      AND (ha.school_id = get_user_school_id() OR is_super_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- ASSESSMENTS — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY assessments_tenant ON assessments
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- MARKS_ENTRIES — through assessments
-- ---------------------------------------------------------------------------
CREATE POLICY me_tenant ON marks_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = marks_entries.assessment_id
      AND (a.school_id = get_user_school_id() OR is_super_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- FEE_STRUCTURES — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY fs_tenant ON fee_structures
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- FEE_CATEGORIES — through fee_structures
-- ---------------------------------------------------------------------------
CREATE POLICY fc_tenant ON fee_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM fee_structures fs
      WHERE fs.id = fee_categories.fee_structure_id
      AND (fs.school_id = get_user_school_id() OR is_super_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- FEE_ALLOCATIONS — through fee_structures
-- ---------------------------------------------------------------------------
CREATE POLICY fa_tenant ON fee_allocations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM fee_structures fs
      WHERE fs.id = fee_allocations.fee_structure_id
      AND (fs.school_id = get_user_school_id() OR is_super_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- INVOICES — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY invoices_tenant ON invoices
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- INVOICE_ITEMS — through invoices
-- ---------------------------------------------------------------------------
CREATE POLICY ii_tenant ON invoice_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_items.invoice_id
      AND (i.school_id = get_user_school_id() OR is_super_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- PAYMENTS — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY payments_tenant ON payments
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- BANK_STATEMENTS — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY bs_tenant ON bank_statements
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- BANK_TRANSACTIONS — through bank_statements
-- ---------------------------------------------------------------------------
CREATE POLICY bt_tenant ON bank_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM bank_statements bs
      WHERE bs.id = bank_transactions.bank_statement_id
      AND (bs.school_id = get_user_school_id() OR is_super_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- PAYMENT_RECONCILIATIONS — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY pr_tenant ON payment_reconciliations
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- APPROVALS — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY approvals_tenant ON approvals
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- NOTICES — tenant isolation
-- ---------------------------------------------------------------------------
CREATE POLICY notices_tenant ON notices
  FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

-- ---------------------------------------------------------------------------
-- AUDIT_LOGS — tenant isolation + super admin
-- ---------------------------------------------------------------------------
CREATE POLICY al_tenant ON audit_logs
  FOR SELECT USING (school_id = get_user_school_id() OR is_super_admin());

CREATE POLICY al_insert ON audit_logs
  FOR INSERT WITH CHECK (school_id = get_user_school_id() OR is_super_admin());
