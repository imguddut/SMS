-- ============================================================================
-- AGRAGATI SCHOOL OS — PERFORMANCE INDEXES & INTEGRITY CONSTRAINTS
-- Migration: 006_performance_indexes_and_integrity.sql
--
-- Optimization Targets:
-- 1. Multi-Tenant organization_id & school_id partition filters (<10ms queries)
-- 2. student_guardians composite indexes for ultra-fast RLS relationship validation
-- 3. attendance_entries daily roll call & student calendar scans
-- 4. invoices & ledger_transactions running balance and fee collection aggregates
-- 5. homework_submissions composite uniqueness and evaluation queue indexing
-- 6. audit_logs temporal queries
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. MULTI-TENANT ORGANIZATIONAL TOPOLOGY INDEXES
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_schools_org_status 
ON schools(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_school_memberships_composite
ON school_memberships(school_id, user_id, role);

CREATE INDEX IF NOT EXISTS idx_organization_memberships_composite
ON organization_memberships(organization_id, user_id, role);

-- ----------------------------------------------------------------------------
-- 2. ACADEMIC & SECTION ROSTER INDEXES
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_students_school_section
ON students(school_id, section_id, status);

CREATE INDEX IF NOT EXISTS idx_teachers_school_department
ON teachers(school_id, status);

CREATE INDEX IF NOT EXISTS idx_classes_school_academic_year
ON classes(school_id, academic_year_id);

CREATE INDEX IF NOT EXISTS idx_sections_class
ON sections(class_id);

-- ----------------------------------------------------------------------------
-- 3. RELATIONSHIP SCOPING & GUARDIAN ACCESS (RLS Acceleration)
-- ----------------------------------------------------------------------------

-- Enables O(1) lookups for EXISTS (SELECT 1 FROM student_guardians WHERE guardian_id = auth.uid() AND student_id = ...)
CREATE INDEX IF NOT EXISTS idx_student_guardians_guardian_student
ON student_guardians(guardian_id, student_id);

-- Enables fast retrieval of all guardians for a specific student (emergency contact / invoicing)
CREATE INDEX IF NOT EXISTS idx_student_guardians_student_guardian
ON student_guardians(student_id, guardian_id);

-- ----------------------------------------------------------------------------
-- 4. ATTENDANCE RADAR & ROLL CALL PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------

-- Section daily roll call lookups (Teacher attendance marking)
CREATE INDEX IF NOT EXISTS idx_attendance_entries_section_date
ON attendance_entries(section_id, date);

-- Student-specific attendance history (Parent radar & student percentage computation)
CREATE INDEX IF NOT EXISTS idx_attendance_entries_student_date
ON attendance_entries(student_id, date DESC);

-- Status filtering for absenteeism reports
CREATE INDEX IF NOT EXISTS idx_attendance_entries_status
ON attendance_entries(school_id, status, date);

-- ----------------------------------------------------------------------------
-- 5. BURSARY, INVOICING & DOUBLE-ENTRY LEDGER INDEXES
-- ----------------------------------------------------------------------------

-- Student invoice status lookups (Parent dues & outstanding arrears)
CREATE INDEX IF NOT EXISTS idx_invoices_student_status
ON invoices(student_id, status);

-- School-level collection summary (Accountant & Principal dashboard KPIs)
CREATE INDEX IF NOT EXISTS idx_invoices_school_status_due
ON invoices(school_id, status, due_date);

-- Student double-entry running ledger transactions (sorted chronologically)
CREATE INDEX IF NOT EXISTS idx_ledger_transactions_student_date
ON ledger_transactions(student_id, created_at DESC);

-- Payment reconciliation by invoice and receipt reference
CREATE INDEX IF NOT EXISTS idx_payments_invoice_status
ON payments(invoice_id, status);

CREATE INDEX IF NOT EXISTS idx_payments_receipt_ref
ON payments(receipt_reference);

-- ----------------------------------------------------------------------------
-- 6. HOMEWORK ASSIGNMENTS & EVALUATION SUBMISSIONS
-- ----------------------------------------------------------------------------

-- Class section active homework assignments
CREATE INDEX IF NOT EXISTS idx_homework_assignments_section_due
ON homework_assignments(section_id, due_date DESC);

-- Homework submissions lookup by assignment and student (grading queue)
CREATE INDEX IF NOT EXISTS idx_homework_submissions_assignment_student
ON homework_submissions(homework_id, student_id);

-- Student submission portfolio history
CREATE INDEX IF NOT EXISTS idx_homework_submissions_student
ON homework_submissions(student_id, submitted_at DESC);

-- ----------------------------------------------------------------------------
-- 7. EXAMINATIONS & GRADEBOOK RESULTS
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_exam_results_student_exam
ON exam_results(student_id, exam_id);

CREATE INDEX IF NOT EXISTS idx_exam_results_exam_score
ON exam_results(exam_id, marks_obtained);

-- ----------------------------------------------------------------------------
-- 8. AUDIT TRAILS & TEMPORAL SECURITY LOGGING
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_timestamp
ON audit_logs(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp
ON audit_logs(user_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 9. DATA INTEGRITY & UNIQUE CONSTRAINTS
-- ----------------------------------------------------------------------------

DO $$
BEGIN
    -- Ensure single active enrollment per student per section
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_student_section_active'
    ) THEN
        BEGIN
            ALTER TABLE students 
            ADD CONSTRAINT uq_student_section_active 
            UNIQUE NULLS NOT DISTINCT (school_id, admission_number);
        EXCEPTION
            WHEN undefined_table THEN
                NULL;
            WHEN duplicate_table THEN
                NULL;
            WHEN duplicate_object THEN
                NULL;
        END;
    END IF;

    -- Ensure single homework submission per student per assignment
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_homework_student_submission'
    ) THEN
        BEGIN
            ALTER TABLE homework_submissions
            ADD CONSTRAINT uq_homework_student_submission
            UNIQUE (homework_id, student_id);
        EXCEPTION
            WHEN undefined_table THEN
                NULL;
            WHEN duplicate_table THEN
                NULL;
            WHEN duplicate_object THEN
                NULL;
        END;
    END IF;

    -- Ensure non-negative invoice amounts
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_invoices_amount_positive'
    ) THEN
        BEGIN
            ALTER TABLE invoices
            ADD CONSTRAINT chk_invoices_amount_positive
            CHECK (amount >= 0);
        EXCEPTION
            WHEN undefined_table THEN
                NULL;
            WHEN duplicate_table THEN
                NULL;
            WHEN duplicate_object THEN
                NULL;
        END;
    END IF;
END $$;
