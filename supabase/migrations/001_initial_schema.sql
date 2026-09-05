-- ============================================================================
-- AGRAGATI SCHOOL OS — SOVEREIGN MULTI-TENANT DATABASE SCHEMA
-- PostgreSQL 15+ / Supabase Schema Definition
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAIN TYPES
CREATE TYPE user_role AS ENUM (
    'SUPER_ADMIN',
    'OWNER',
    'PRINCIPAL',
    'SCHOOL_ADMIN',
    'TEACHER',
    'ACCOUNTANT',
    'PARENT',
    'STUDENT'
);

CREATE TYPE school_status AS ENUM (
    'PROVISIONING',
    'ACTIVE',
    'TRIAL',
    'SUSPENDED'
);

CREATE TYPE user_status AS ENUM (
    'ACTIVE',
    'INVITED',
    'SUSPENDED'
);

CREATE TYPE student_status AS ENUM (
    'ACTIVE',
    'GRADUATED',
    'WITHDRAWN',
    'SUSPENDED'
);

CREATE TYPE attendance_status AS ENUM (
    'PRESENT',
    'ABSENT',
    'EXCUSED',
    'LATE'
);

CREATE TYPE invoice_status AS ENUM (
    'DRAFT',
    'ISSUED',
    'PARTIALLY_PAID',
    'PAID',
    'OVERDUE',
    'CANCELLED',
    'REFUNDED'
);

CREATE TYPE payment_method AS ENUM (
    'BANK_TRANSFER',
    'CARD',
    'CASH',
    'CHEQUE',
    'DIRECT_DEBIT'
);

CREATE TYPE reconciliation_status AS ENUM (
    'UNMATCHED',
    'MATCHED',
    'FLAGGED',
    'RECONCILED'
);

CREATE TYPE homework_status AS ENUM (
    'ASSIGNED',
    'SUBMITTED',
    'GRADED',
    'LATE',
    'RESUBMIT_REQUESTED'
);

CREATE TYPE approval_type AS ENUM (
    'BURSARY_WAIVER',
    'LEAVE_REQUEST',
    'EXCURSION_AUTHORIZATION',
    'GRADEBOOK_PUBLICATION',
    'STAFF_APPOINTMENT'
);

CREATE TYPE approval_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'ESCROW'
);

-- ============================================================================
-- 3. CORE TENANT & IDENTITY TABLES
-- ============================================================================

-- Sovereign School Tenants
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name VARCHAR(255) NOT NULL,
    slug VARCHAR(64) UNIQUE NOT NULL,
    domain VARCHAR(255) UNIQUE,
    institution_type VARCHAR(100) DEFAULT 'K-12 Independent Boarding & Day School',
    curriculum_framework VARCHAR(100) DEFAULT 'IB & Cambridge IGCSE',
    jurisdiction VARCHAR(100) DEFAULT 'Geneva, Switzerland',
    base_currency VARCHAR(3) DEFAULT 'CHF',
    capacity_target INTEGER DEFAULT 2500,
    status school_status DEFAULT 'ACTIVE',
    hsm_enclave_enabled BOOLEAN DEFAULT true,
    logo_url TEXT,
    settings JSONB DEFAULT '{
        "mfa_enforced": true,
        "biometric_sync": true,
        "ai_insights_enabled": true,
        "cryptographic_ledger": true
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (Linked to Supabase auth.users)
CREATE TABLE users_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    title VARCHAR(100),
    status user_status DEFAULT 'ACTIVE',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_email_per_school UNIQUE (school_id, email)
);

-- Academic Years & Terms
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. "Academic Year 2024–2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_year_dates CHECK (end_date > start_date)
);

CREATE TABLE academic_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. "Term 1 (Michaelmas)", "Term 2 (Hilary)", "Term 3 (Trinity)"
    term_code VARCHAR(32) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_term_dates CHECK (end_date > start_date)
);

-- ============================================================================
-- 4. ACADEMIC STRUCTURE & ROSTERING
-- ============================================================================

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. "Grade 11", "Grade 12"
    grade_level INTEGER NOT NULL,
    curriculum_code VARCHAR(50) DEFAULT 'IB_DIPLOMA',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
    employee_id VARCHAR(64) NOT NULL,
    department VARCHAR(100) NOT NULL,
    qualification VARCHAR(255),
    joining_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_teacher_employee_id UNIQUE (school_id, employee_id)
);

CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL, -- e.g. "11-A (Classical Arts)", "11-B (Natural Sciences)"
    room_number VARCHAR(50),
    max_capacity INTEGER DEFAULT 28,
    form_tutor_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL, -- e.g. "Higher Level Physics", "Pure Mathematics HL"
    code VARCHAR(32) NOT NULL, -- e.g. "PHY-HL-301"
    department VARCHAR(100) NOT NULL,
    credits NUMERIC(3,1) DEFAULT 1.0,
    is_elective BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_subject_code UNIQUE (school_id, code)
);

CREATE TABLE teacher_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_teacher_assignment UNIQUE (teacher_id, section_id, subject_id, academic_year_id)
);

CREATE TABLE timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1 = Monday
    period_number SMALLINT NOT NULL CHECK (period_number BETWEEN 1 AND 10),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_location VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_period_times CHECK (end_time > start_time)
);

-- ============================================================================
-- 5. SCHOLARS & GUARDIANS
-- ============================================================================

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
    admission_number VARCHAR(64) NOT NULL,
    house VARCHAR(64) DEFAULT 'House Valois',
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    medical_notes TEXT,
    status student_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_admission_number UNIQUE (school_id, admission_number)
);

CREATE TABLE guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
    relationship_type VARCHAR(64) NOT NULL, -- e.g. "Father", "Mother", "Legal Trustee"
    occupation VARCHAR(128),
    emergency_contact VARCHAR(50) NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE student_guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
    is_primary_guarantor BOOLEAN DEFAULT true,
    authorization_level VARCHAR(64) DEFAULT 'FULL_CUSTODIAL',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_guardian UNIQUE (student_id, guardian_id)
);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    roll_number INTEGER,
    enrolled_at DATE DEFAULT CURRENT_DATE,
    status student_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_year_enrollment UNIQUE (student_id, academic_year_id)
);

-- ============================================================================
-- 6. ATTENDANCE SYSTEM
-- ============================================================================

CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    period_number SMALLINT DEFAULT 0, -- 0 = Morning Daily Roll-Call, 1..N = Period
    marked_by_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_attendance_session UNIQUE (section_id, date, period_number)
);

CREATE TABLE attendance_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_record_id UUID NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status attendance_status NOT NULL DEFAULT 'PRESENT',
    reason VARCHAR(255),
    time_in TIME,
    time_out TIME,
    verification_method VARCHAR(64) DEFAULT 'BIOMETRIC_CARD_TAP', -- or 'MANUAL_OVERRIDE'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_attendance_entry UNIQUE (attendance_record_id, student_id)
);

-- ============================================================================
-- 7. HOMEWORK & ACADEMIC EVALUATIONS
-- ============================================================================

CREATE TABLE homework_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    brief_markdown TEXT NOT NULL,
    due_datetime TIMESTAMPTZ NOT NULL,
    max_points NUMERIC(5,2) DEFAULT 100.0,
    attachment_urls JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE homework_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    homework_id UUID NOT NULL REFERENCES homework_assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    file_urls JSONB DEFAULT '[]'::jsonb,
    student_notes TEXT,
    status homework_status DEFAULT 'SUBMITTED',
    score NUMERIC(5,2),
    teacher_feedback TEXT,
    graded_at TIMESTAMPTZ,
    graded_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
    CONSTRAINT unique_homework_submission UNIQUE (homework_id, student_id)
);

CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    academic_term_id UUID NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL, -- e.g. "Michaelmas Term Mock Exam", "IA Portfolio"
    assessment_type VARCHAR(64) DEFAULT 'SUMMATIVE_EXAM',
    max_score NUMERIC(5,2) DEFAULT 100.0,
    weight_percentage NUMERIC(5,2) DEFAULT 30.0,
    is_published BOOLEAN DEFAULT false,
    approval_status approval_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE marks_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    raw_score NUMERIC(5,2) NOT NULL,
    grade_letter VARCHAR(5), -- e.g. "7", "6", "A*"
    gpa_points NUMERIC(3,2),
    faculty_comment TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_assessment_mark UNIQUE (assessment_id, student_id)
);

-- ============================================================================
-- 8. FINANCIAL LEDGER, INVOICING & RECONCILIATION
-- ============================================================================

CREATE TABLE fee_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL, -- e.g. "AY 2024-2025 Standard Senior Matriculation"
    frequency VARCHAR(32) DEFAULT 'TRI_TERM', -- e.g. 'ANNUAL', 'TRI_TERM', 'MONTHLY'
    currency VARCHAR(3) DEFAULT 'CHF',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fee_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_structure_id UUID NOT NULL REFERENCES fee_structures(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL, -- e.g. "Senior Tuition", "Residency & Boarding", "Laboratory Levy"
    code VARCHAR(32) NOT NULL,
    is_mandatory BOOLEAN DEFAULT true,
    default_amount NUMERIC(12,2) NOT NULL,
    description TEXT
);

CREATE TABLE fee_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_structure_id UUID NOT NULL REFERENCES fee_structures(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    fee_category_id UUID NOT NULL REFERENCES fee_categories(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    CONSTRAINT unique_fee_allocation UNIQUE (fee_structure_id, class_id, fee_category_id)
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    invoice_number VARCHAR(64) NOT NULL, -- e.g. "#INV-2025-0842"
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    guarantor_id UUID REFERENCES guardians(id) ON DELETE SET NULL,
    academic_term_id UUID REFERENCES academic_terms(id) ON DELETE SET NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal_amount NUMERIC(12,2) NOT NULL DEFAULT 0.0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0.0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0.0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.0,
    balance_due NUMERIC(12,2) NOT NULL DEFAULT 0.0,
    status invoice_status DEFAULT 'ISSUED',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_invoice_number UNIQUE (school_id, invoice_number)
);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    fee_category_id UUID REFERENCES fee_categories(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,
    discount_amount NUMERIC(12,2) DEFAULT 0.0,
    line_total NUMERIC(12,2) NOT NULL
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    receipt_number VARCHAR(64) NOT NULL, -- e.g. "REC-2025-9921"
    amount NUMERIC(12,2) NOT NULL,
    payment_method payment_method NOT NULL DEFAULT 'BANK_TRANSFER',
    transaction_reference VARCHAR(128),
    settled_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(32) DEFAULT 'SETTLED',
    notes TEXT,
    CONSTRAINT unique_receipt_number UNIQUE (school_id, receipt_number)
);

CREATE TABLE bank_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    bank_name VARCHAR(128) DEFAULT 'Pictet & Cie (Geneva)',
    account_number VARCHAR(64) NOT NULL,
    statement_date DATE NOT NULL,
    opening_balance NUMERIC(14,2) NOT NULL,
    closing_balance NUMERIC(14,2) NOT NULL,
    imported_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_statement_id UUID NOT NULL REFERENCES bank_statements(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    reference_text TEXT NOT NULL,
    debit_amount NUMERIC(12,2) DEFAULT 0.0,
    credit_amount NUMERIC(12,2) DEFAULT 0.0,
    is_reconciled BOOLEAN DEFAULT false
);

CREATE TABLE payment_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    bank_transaction_id UUID REFERENCES bank_transactions(id) ON DELETE CASCADE,
    reconciliation_status reconciliation_status DEFAULT 'RECONCILED',
    matched_at TIMESTAMPTZ DEFAULT NOW(),
    matched_by UUID REFERENCES users_profiles(id) ON DELETE SET NULL,
    notes TEXT
);

-- ============================================================================
-- 9. GOVERNANCE, APPROVALS, NOTICES & AUDIT TRAIL
-- ============================================================================

CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    approval_type approval_type NOT NULL,
    reference_table VARCHAR(64),
    reference_id UUID,
    requested_by_id UUID NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
    decided_by_id UUID REFERENCES users_profiles(id) ON DELETE SET NULL,
    impact_amount NUMERIC(12,2) DEFAULT 0.0,
    status approval_status DEFAULT 'PENDING',
    petitioner_notes TEXT,
    decision_notes TEXT,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_markdown TEXT NOT NULL,
    target_audiences JSONB NOT NULL DEFAULT '["ALL_SCHOOL"]'::jsonb,
    is_pinned BOOLEAN DEFAULT false,
    image_url TEXT,
    location_tag VARCHAR(100),
    publish_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users_profiles(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL, -- e.g. 'INSERT', 'UPDATE', 'AUTHORIZE_BURSARY'
    entity_table VARCHAR(64) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. INDEXES FOR HIGH-VELOCITY QUERY PERFORMANCE
-- ============================================================================

CREATE INDEX idx_users_profiles_school_role ON users_profiles(school_id, role);
CREATE INDEX idx_students_school ON students(school_id);
CREATE INDEX idx_enrollments_section_year ON enrollments(section_id, academic_year_id);
CREATE INDEX idx_attendance_records_date ON attendance_records(section_id, date);
CREATE INDEX idx_invoices_school_status ON invoices(school_id, status);
CREATE INDEX idx_invoices_student ON invoices(student_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_homework_section_due ON homework_assignments(section_id, due_datetime);
CREATE INDEX idx_marks_assessment ON marks_entries(assessment_id);
CREATE INDEX idx_approvals_school_status ON approvals(school_id, status);
CREATE INDEX idx_notices_school_publish ON notices(school_id, publish_date);
CREATE INDEX idx_audit_logs_school_actor ON audit_logs(school_id, actor_id, created_at);

-- ============================================================================
-- 11. ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS & POLICIES
-- ============================================================================

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper: Get current authenticated user's profile
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS users_profiles AS $$
    SELECT * FROM users_profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: Check if caller is Super Admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM users_profiles
        WHERE auth_user_id = auth.uid() AND role = 'SUPER_ADMIN'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: Get caller's assigned school ID
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS UUID AS $$
    SELECT school_id FROM users_profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Super Admin Global Full Bypass Policy
CREATE POLICY super_admin_all_schools ON schools
    FOR ALL USING (is_super_admin());

CREATE POLICY super_admin_all_profiles ON users_profiles
    FOR ALL USING (is_super_admin());

-- Standard Tenant Isolation Policy (School-scoped)
CREATE POLICY school_tenant_isolation_classes ON classes
    FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

CREATE POLICY school_tenant_isolation_students ON students
    FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

CREATE POLICY school_tenant_isolation_invoices ON invoices
    FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

CREATE POLICY school_tenant_isolation_notices ON notices
    FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());

CREATE POLICY school_tenant_isolation_approvals ON approvals
    FOR ALL USING (school_id = get_user_school_id() OR is_super_admin());
