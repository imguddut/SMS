-- ============================================================================
-- AGRAGATI SCHOOL OS — FOUNDATION & EXTENDED SCHEMA MIGRATION (PHASE 1)
-- Migration: 007_immutable_audit_and_extended_tables.sql
--
-- Adds:
-- 1. Admissions Pipeline (Applicant -> Admitted -> Enrolled)
-- 2. Vendors & Expense Vouchers with Principal Approval Workflow
-- 3. Leave Requests (Student / Teacher / Staff)
-- 4. Discipline & Incident Records
-- 5. Immutability trigger on audit_logs (append-only)
-- 6. Performance Composite Indexes
-- 7. Complete Row Level Security (RLS) policies
-- ============================================================================

-- 1. ADMISSIONS PIPELINE
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admission_status') THEN
        CREATE TYPE admission_status AS ENUM (
            'PENDING',
            'UNDER_REVIEW',
            'INTERVIEW_SCHEDULED',
            'APPROVED',
            'REJECTED',
            'ENROLLED'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    application_number VARCHAR(64) UNIQUE NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    grade_applying_for INTEGER NOT NULL,
    parent_name VARCHAR(255) NOT NULL,
    parent_email VARCHAR(255) NOT NULL,
    parent_phone VARCHAR(50) NOT NULL,
    address TEXT,
    previous_school VARCHAR(255),
    status admission_status DEFAULT 'PENDING',
    review_notes TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    enrolled_student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES users_profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VENDORS & PROCUREMENT
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Books, IT, Uniforms, Lab Equipment, Catering, Transportation
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    tax_id_gst VARCHAR(64),
    bank_account_details JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_vendor_name_per_school UNIQUE (school_id, name)
);

-- 3. EXPENSES & VOUCHERS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expense_status') THEN
        CREATE TYPE expense_status AS ENUM (
            'DRAFT',
            'PENDING_APPROVAL',
            'APPROVED',
            'REJECTED',
            'PAID',
            'CANCELLED'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    voucher_number VARCHAR(64) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'INR',
    invoice_number VARCHAR(100),
    invoice_date DATE,
    due_date DATE,
    status expense_status DEFAULT 'DRAFT',
    created_by UUID NOT NULL REFERENCES users_profiles(id) ON DELETE RESTRICT,
    approved_by UUID REFERENCES users_profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    paid_at TIMESTAMPTZ,
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LEAVE REQUESTS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'leave_status') THEN
        CREATE TYPE leave_status AS ENUM (
            'PENDING',
            'APPROVED',
            'REJECTED',
            'CANCELLED'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
    requester_type VARCHAR(32) NOT NULL, -- 'STUDENT', 'TEACHER', 'STAFF'
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status leave_status DEFAULT 'PENDING',
    reviewed_by UUID REFERENCES users_profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_leave_dates CHECK (end_date >= start_date)
);

-- 5. DISCIPLINARY & INCIDENT RECORDS
CREATE TABLE IF NOT EXISTS discipline_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES users_profiles(id) ON DELETE RESTRICT,
    incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    severity VARCHAR(32) DEFAULT 'LOW',
    description TEXT NOT NULL,
    action_taken TEXT,
    status VARCHAR(32) DEFAULT 'LOGGED',
    reviewed_by UUID REFERENCES users_profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. IMMUTABLE AUDIT LOG RULE
CREATE OR REPLACE RULE no_update_audit_logs AS
    ON UPDATE TO audit_logs DO INSTEAD NOTHING;

CREATE OR REPLACE RULE no_delete_audit_logs AS
    ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- 7. PERFORMANCE COMPOSITE INDEXES
CREATE INDEX IF NOT EXISTS idx_admissions_school_status ON admissions(school_id, status);
CREATE INDEX IF NOT EXISTS idx_vendors_school_status ON vendors(school_id, status);
CREATE INDEX IF NOT EXISTS idx_expenses_school_status ON expenses(school_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leave_school_status ON leave_requests(school_id, status, start_date);
CREATE INDEX IF NOT EXISTS idx_leave_student ON leave_requests(student_id, start_date);
CREATE INDEX IF NOT EXISTS idx_discipline_student ON discipline_records(student_id, incident_date DESC);

-- 8. ROW LEVEL SECURITY POLICIES
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipline_records ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    -- Admissions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admissions_school_access') THEN
        CREATE POLICY admissions_school_access ON admissions
            FOR ALL USING (
                school_id = NULLIF(current_setting('app.current_school_id', true), '')::uuid
                OR EXISTS (
                    SELECT 1 FROM school_memberships sm
                    WHERE sm.school_id = admissions.school_id
                      AND sm.profile_id = auth.uid()
                      AND sm.role IN ('PRINCIPAL', 'SCHOOL_ADMIN')
                )
            );
    END IF;

    -- Vendors
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vendors_school_access') THEN
        CREATE POLICY vendors_school_access ON vendors
            FOR ALL USING (
                school_id = NULLIF(current_setting('app.current_school_id', true), '')::uuid
                OR EXISTS (
                    SELECT 1 FROM school_memberships sm
                    WHERE sm.school_id = vendors.school_id
                      AND sm.profile_id = auth.uid()
                      AND sm.role IN ('PRINCIPAL', 'SCHOOL_ADMIN', 'ACCOUNTANT')
                )
            );
    END IF;

    -- Expenses
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'expenses_school_access') THEN
        CREATE POLICY expenses_school_access ON expenses
            FOR ALL USING (
                school_id = NULLIF(current_setting('app.current_school_id', true), '')::uuid
                OR EXISTS (
                    SELECT 1 FROM school_memberships sm
                    WHERE sm.school_id = expenses.school_id
                      AND sm.profile_id = auth.uid()
                      AND sm.role IN ('PRINCIPAL', 'ACCOUNTANT', 'SCHOOL_ADMIN')
                )
            );
    END IF;

    -- Leave Requests
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'leave_school_staff_access') THEN
        CREATE POLICY leave_school_staff_access ON leave_requests
            FOR ALL USING (
                requester_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM student_guardians sg
                    WHERE sg.guardian_id = auth.uid()
                      AND sg.student_id = leave_requests.student_id
                )
                OR EXISTS (
                    SELECT 1 FROM school_memberships sm
                    WHERE sm.school_id = leave_requests.school_id
                      AND sm.profile_id = auth.uid()
                      AND sm.role IN ('PRINCIPAL', 'SCHOOL_ADMIN', 'TEACHER')
                )
            );
    END IF;

    -- Discipline Records
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'discipline_school_access') THEN
        CREATE POLICY discipline_school_access ON discipline_records
            FOR ALL USING (
                reporter_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM school_memberships sm
                    WHERE sm.school_id = discipline_records.school_id
                      AND sm.profile_id = auth.uid()
                      AND sm.role IN ('PRINCIPAL', 'SCHOOL_ADMIN', 'TEACHER')
                )
                OR EXISTS (
                    SELECT 1 FROM student_guardians sg
                    WHERE sg.guardian_id = auth.uid()
                      AND sg.student_id = discipline_records.student_id
                )
            );
    END IF;
END $$;

