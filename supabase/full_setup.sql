-- ============================================================================
-- AGRAGATI SCHOOL OS — FULL ONE-SHOT DATABASE DDL SCHEMA & SETUP SCRIPT
-- Paste this entire script into your Supabase Dashboard -> SQL Editor and click RUN.
-- This will reconstruct all tables, types, foreign keys, indexes, and RLS policies.
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAIN TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'SUPER_ADMIN', 'OWNER', 'PRINCIPAL', 'SCHOOL_ADMIN', 
        'TEACHER', 'ACCOUNTANT', 'PARENT', 'STUDENT'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE school_status AS ENUM ('PROVISIONING', 'ACTIVE', 'TRIAL', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE student_status AS ENUM ('ACTIVE', 'GRADUATED', 'WITHDRAWN', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'EXCUSED', 'LATE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('BANK_TRANSFER', 'CARD', 'CASH', 'CHEQUE', 'DIRECT_DEBIT', 'UPI');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'UPI';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'BANK_TRANSFER';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'CARD';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'CASH';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'CHEQUE';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'DIRECT_DEBIT';

DO $$ BEGIN
    CREATE TYPE reconciliation_status AS ENUM ('UNMATCHED', 'MATCHED', 'FLAGGED', 'RECONCILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE homework_status AS ENUM ('ASSIGNED', 'SUBMITTED', 'GRADED', 'LATE', 'RESUBMIT_REQUESTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE approval_type AS ENUM (
        'BURSARY_WAIVER', 'LEAVE_REQUEST', 'EXCURSION_AUTHORIZATION', 
        'GRADEBOOK_PUBLICATION', 'STAFF_APPOINTMENT', 'GATE_PASS', 'FEE_CONCESSION', 'BUDGET_REQUISITION'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TYPE approval_type ADD VALUE IF NOT EXISTS 'GATE_PASS';
ALTER TYPE approval_type ADD VALUE IF NOT EXISTS 'FEE_CONCESSION';
ALTER TYPE approval_type ADD VALUE IF NOT EXISTS 'BUDGET_REQUISITION';

DO $$ BEGIN
    CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ESCROW');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE admission_status AS ENUM ('PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENT_VERIFICATION', 'INTERVIEW_SCHEDULED', 'OFFERED', 'APPROVED', 'REJECTED', 'ENROLLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TYPE admission_status ADD VALUE IF NOT EXISTS 'SUBMITTED';
ALTER TYPE admission_status ADD VALUE IF NOT EXISTS 'DOCUMENT_VERIFICATION';
ALTER TYPE admission_status ADD VALUE IF NOT EXISTS 'OFFERED';

DO $$ BEGIN
    CREATE TYPE expense_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. PLATFORMS & ORGANIZATIONS
CREATE TABLE IF NOT EXISTS platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(64) UNIQUE NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO platforms (id, name, slug, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'AGRAGATI PLATFORM', 'agragati', 'ACTIVE')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id UUID NOT NULL REFERENCES platforms(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(64) UNIQUE NOT NULL,
    legal_name VARCHAR(255),
    organization_type VARCHAR(64) NOT NULL DEFAULT 'TRUST',
    registration_number VARCHAR(128),
    email VARCHAR(255),
    phone VARCHAR(50),
    logo_url TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(32),
    status VARCHAR(32) DEFAULT 'ACTIVE',
    subscription_plan VARCHAR(64) DEFAULT 'ENTERPRISE',
    subscription_status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SCHOOL TENANTS
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    legal_name VARCHAR(255) NOT NULL,
    slug VARCHAR(64) UNIQUE NOT NULL,
    school_code VARCHAR(64),
    domain VARCHAR(255) UNIQUE,
    institution_type VARCHAR(100) DEFAULT '10+2 Institutional',
    curriculum_framework VARCHAR(100) DEFAULT 'CBSE 10+2 Standard',
    jurisdiction VARCHAR(100) DEFAULT 'India',
    base_currency VARCHAR(3) DEFAULT 'INR',
    capacity_target INTEGER DEFAULT 2500,
    status school_status DEFAULT 'ACTIVE',
    hsm_enclave_enabled BOOLEAN DEFAULT true,
    logo_url TEXT,
    settings JSONB DEFAULT '{"mfa_enforced":true,"biometric_sync":true,"ai_insights_enabled":true,"cryptographic_ledger":true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USER PROFILES & MEMBERSHIPS
CREATE TABLE IF NOT EXISTS users_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    role user_role,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    title VARCHAR(100),
    password_hash VARCHAR(255),
    status user_status DEFAULT 'ACTIVE',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_email_per_school UNIQUE (school_id, email)
);

ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

CREATE TABLE IF NOT EXISTS organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
    role VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_org_member UNIQUE (organization_id, profile_id)
);

CREATE TABLE IF NOT EXISTS school_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
    role VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    is_primary BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_school_member_role UNIQUE (school_id, profile_id, role)
);

-- 6. ACADEMIC STRUCTURE
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    term_code VARCHAR(32) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    grade_level INTEGER NOT NULL,
    curriculum_code VARCHAR(50) DEFAULT 'CBSE_10PLUS2',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teachers (
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

CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    room_number VARCHAR(50),
    max_capacity INTEGER DEFAULT 40,
    form_tutor_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(32) NOT NULL,
    department VARCHAR(100) NOT NULL,
    credits NUMERIC(3,1) DEFAULT 1.0,
    is_elective BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_subject_code UNIQUE (school_id, code)
);

CREATE TABLE IF NOT EXISTS teacher_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    period_number SMALLINT NOT NULL CHECK (period_number BETWEEN 1 AND 10),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_location VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. STUDENTS & GUARDIANS
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
    admission_number VARCHAR(64) NOT NULL,
    house VARCHAR(64) DEFAULT 'Tagore House',
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    medical_notes TEXT,
    status student_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_admission_number UNIQUE (school_id, admission_number)
);

CREATE TABLE IF NOT EXISTS guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
    relationship_type VARCHAR(64) NOT NULL,
    occupation VARCHAR(128),
    emergency_contact VARCHAR(50) NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
    is_primary_guarantor BOOLEAN DEFAULT true,
    authorization_level VARCHAR(64) DEFAULT 'FULL_CUSTODIAL',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    roll_number INTEGER,
    enrolled_at DATE DEFAULT CURRENT_DATE,
    status student_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ATTENDANCE & ACADEMICS
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    period_number SMALLINT DEFAULT 0,
    marked_by_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_section_date_period UNIQUE (school_id, section_id, date, period_number)
);

CREATE TABLE IF NOT EXISTS attendance_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_record_id UUID NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status attendance_status NOT NULL DEFAULT 'PRESENT',
    reason VARCHAR(255),
    time_in TIME,
    time_out TIME,
    verification_method VARCHAR(64) DEFAULT 'RFID_TURNSTILE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS homework_assignments (
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

CREATE TABLE IF NOT EXISTS homework_submissions (
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
    graded_by UUID REFERENCES teachers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    academic_term_id UUID NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    assessment_type VARCHAR(64) DEFAULT 'SUMMATIVE_EXAM',
    max_score NUMERIC(5,2) DEFAULT 100.0,
    weight_percentage NUMERIC(5,2) DEFAULT 30.0,
    is_published BOOLEAN DEFAULT false,
    approval_status approval_status DEFAULT 'APPROVED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marks_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    raw_score NUMERIC(5,2) NOT NULL,
    grade_letter VARCHAR(5),
    gpa_points NUMERIC(3,2),
    faculty_comment TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_assessment_student_entry UNIQUE (assessment_id, student_id)
);

-- 9. FEES, INVOICES & FINANCE
CREATE TABLE IF NOT EXISTS fee_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    frequency VARCHAR(32) DEFAULT 'TERM_WISE',
    currency VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_structure_id UUID NOT NULL REFERENCES fee_structures(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(32) NOT NULL,
    is_mandatory BOOLEAN DEFAULT true,
    default_amount NUMERIC(12,2) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS fee_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_structure_id UUID NOT NULL REFERENCES fee_structures(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    fee_category_id UUID NOT NULL REFERENCES fee_categories(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    invoice_number VARCHAR(64) NOT NULL,
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
    CONSTRAINT unique_invoice_number_per_school UNIQUE (school_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    fee_category_id UUID REFERENCES fee_categories(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,
    discount_amount NUMERIC(12,2) DEFAULT 0.0,
    line_total NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    receipt_number VARCHAR(64) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    payment_method payment_method NOT NULL DEFAULT 'UPI',
    transaction_reference VARCHAR(128),
    settled_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(32) DEFAULT 'SETTLED',
    notes TEXT
);

CREATE TABLE IF NOT EXISTS bank_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    bank_name VARCHAR(128) DEFAULT 'State Bank of India',
    account_number VARCHAR(64) NOT NULL,
    statement_date DATE NOT NULL,
    opening_balance NUMERIC(14,2) NOT NULL,
    closing_balance NUMERIC(14,2) NOT NULL,
    imported_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_statement_id UUID NOT NULL REFERENCES bank_statements(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    reference_text TEXT NOT NULL,
    debit_amount NUMERIC(12,2) DEFAULT 0.0,
    credit_amount NUMERIC(12,2) DEFAULT 0.0,
    is_reconciled BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS payment_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    bank_transaction_id UUID REFERENCES bank_transactions(id) ON DELETE CASCADE,
    reconciliation_status reconciliation_status DEFAULT 'RECONCILED',
    matched_at TIMESTAMPTZ DEFAULT NOW(),
    matched_by UUID REFERENCES users_profiles(id) ON DELETE SET NULL,
    notes TEXT
);

-- 10. APPROVALS, NOTICES & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS approvals (
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

CREATE TABLE IF NOT EXISTS notices (
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

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    recipient_user_id UUID REFERENCES users_profiles(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL DEFAULT 'SYSTEM',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'NORMAL',
    source_table VARCHAR(64),
    source_id UUID,
    link_url TEXT,
    action_text VARCHAR(100),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users_profiles(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    entity_table VARCHAR(64) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ADMISSIONS, VENDORS, EXPENSES, LEAVES & DISCIPLINE
CREATE TABLE IF NOT EXISTS admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    application_number VARCHAR(64) NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    grade_applying_for VARCHAR(64) NOT NULL,
    parent_name VARCHAR(255) NOT NULL,
    parent_email VARCHAR(255) NOT NULL,
    parent_phone VARCHAR(50) NOT NULL,
    address TEXT,
    previous_school VARCHAR(255),
    previous_percentage NUMERIC(5,2),
    status admission_status DEFAULT 'PENDING',
    fee_paid BOOLEAN DEFAULT false,
    notes TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    enrolled_student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES users_profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_app_no_per_school UNIQUE (school_id, application_number)
);

CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    vendor_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    gst_number VARCHAR(64),
    bank_name VARCHAR(128),
    account_number VARCHAR(64),
    ifsc_code VARCHAR(32),
    payment_terms VARCHAR(64) DEFAULT 'NET_30',
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    vendor_name VARCHAR(255) NOT NULL,
    expense_number VARCHAR(64) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'INR',
    invoice_number VARCHAR(100),
    invoice_date DATE,
    due_date DATE,
    status expense_status DEFAULT 'PENDING_APPROVAL',
    approved_by VARCHAR(255),
    approved_at TIMESTAMPTZ,
    payment_reference VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_expense_no_per_school UNIQUE (school_id, expense_number)
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    applicant_type VARCHAR(32) NOT NULL DEFAULT 'STUDENT',
    applicant_id UUID REFERENCES users_profiles(id) ON DELETE CASCADE,
    applicant_name VARCHAR(255),
    form VARCHAR(64),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    leave_type VARCHAR(64) DEFAULT 'CASUAL',
    status leave_status DEFAULT 'PENDING',
    reviewed_by VARCHAR(255),
    review_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discipline_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    student_name VARCHAR(255),
    incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
    incident_type VARCHAR(100) NOT NULL,
    severity VARCHAR(32) DEFAULT 'LOW',
    description TEXT NOT NULL,
    action_taken TEXT,
    reported_by VARCHAR(255),
    parent_notified BOOLEAN DEFAULT false,
    status VARCHAR(32) DEFAULT 'RESOLVED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. IMMUTABLE AUDIT LOG RULE
CREATE OR REPLACE RULE no_update_audit_logs AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE OR REPLACE RULE no_delete_audit_logs AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- 13. PERFORMANCE COMPOSITE INDEXES
CREATE INDEX IF NOT EXISTS idx_schools_org ON schools(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_school ON users_profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_sections_class ON sections(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_entries_record ON attendance_entries(attendance_record_id);
CREATE INDEX IF NOT EXISTS idx_invoices_school_status ON invoices(school_id, status);
CREATE INDEX IF NOT EXISTS idx_admissions_school_status ON admissions(school_id, status);
CREATE INDEX IF NOT EXISTS idx_vendors_school ON vendors(school_id);
CREATE INDEX IF NOT EXISTS idx_expenses_school_status ON expenses(school_id, status);
CREATE INDEX IF NOT EXISTS idx_leave_school_status ON leave_requests(school_id, status);
CREATE INDEX IF NOT EXISTS idx_discipline_student ON discipline_records(student_id);

-- 14. ROW LEVEL SECURITY (PERMISSIVE ACCESS SETUP FOR SUPABASE SERVICE ROLE / CLIENTS)
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipline_records ENABLE ROW LEVEL SECURITY;

-- Permissive public read & write policies so application APIs and clients function smoothly
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Read Access" ON schools;
    DROP POLICY IF EXISTS "Public Write Access" ON schools;
    CREATE POLICY "Public Read Access" ON schools FOR SELECT USING (true);
    CREATE POLICY "Public Write Access" ON schools FOR ALL USING (true);

    DROP POLICY IF EXISTS "Profiles Public Access" ON users_profiles;
    CREATE POLICY "Profiles Public Access" ON users_profiles FOR ALL USING (true);

    DROP POLICY IF EXISTS "Academic Years Public Access" ON academic_years;
    CREATE POLICY "Academic Years Public Access" ON academic_years FOR ALL USING (true);

    DROP POLICY IF EXISTS "Academic Terms Public Access" ON academic_terms;
    CREATE POLICY "Academic Terms Public Access" ON academic_terms FOR ALL USING (true);

    DROP POLICY IF EXISTS "Classes Public Access" ON classes;
    CREATE POLICY "Classes Public Access" ON classes FOR ALL USING (true);

    DROP POLICY IF EXISTS "Sections Public Access" ON sections;
    CREATE POLICY "Sections Public Access" ON sections FOR ALL USING (true);

    DROP POLICY IF EXISTS "Subjects Public Access" ON subjects;
    CREATE POLICY "Subjects Public Access" ON subjects FOR ALL USING (true);

    DROP POLICY IF EXISTS "Students Public Access" ON students;
    CREATE POLICY "Students Public Access" ON students FOR ALL USING (true);

    DROP POLICY IF EXISTS "Guardians Public Access" ON guardians;
    CREATE POLICY "Guardians Public Access" ON guardians FOR ALL USING (true);

    DROP POLICY IF EXISTS "Attendance Records Public Access" ON attendance_records;
    CREATE POLICY "Attendance Records Public Access" ON attendance_records FOR ALL USING (true);

    DROP POLICY IF EXISTS "Attendance Entries Public Access" ON attendance_entries;
    CREATE POLICY "Attendance Entries Public Access" ON attendance_entries FOR ALL USING (true);

    DROP POLICY IF EXISTS "Homework Assignments Public Access" ON homework_assignments;
    CREATE POLICY "Homework Assignments Public Access" ON homework_assignments FOR ALL USING (true);

    DROP POLICY IF EXISTS "Homework Submissions Public Access" ON homework_submissions;
    CREATE POLICY "Homework Submissions Public Access" ON homework_submissions FOR ALL USING (true);

    DROP POLICY IF EXISTS "Invoices Public Access" ON invoices;
    CREATE POLICY "Invoices Public Access" ON invoices FOR ALL USING (true);

    DROP POLICY IF EXISTS "Payments Public Access" ON payments;
    CREATE POLICY "Payments Public Access" ON payments FOR ALL USING (true);

    DROP POLICY IF EXISTS "Approvals Public Access" ON approvals;
    CREATE POLICY "Approvals Public Access" ON approvals FOR ALL USING (true);

    DROP POLICY IF EXISTS "Notices Public Access" ON notices;
    CREATE POLICY "Notices Public Access" ON notices FOR ALL USING (true);

    DROP POLICY IF EXISTS "Notifications Public Access" ON notifications;
    CREATE POLICY "Notifications Public Access" ON notifications FOR ALL USING (true);

    DROP POLICY IF EXISTS "Admissions Public Access" ON admissions;
    CREATE POLICY "Admissions Public Access" ON admissions FOR ALL USING (true);

    DROP POLICY IF EXISTS "Vendors Public Access" ON vendors;
    CREATE POLICY "Vendors Public Access" ON vendors FOR ALL USING (true);

    DROP POLICY IF EXISTS "Expenses Public Access" ON expenses;
    CREATE POLICY "Expenses Public Access" ON expenses FOR ALL USING (true);

    DROP POLICY IF EXISTS "Leave Requests Public Access" ON leave_requests;
    CREATE POLICY "Leave Requests Public Access" ON leave_requests FOR ALL USING (true);

    DROP POLICY IF EXISTS "Discipline Records Public Access" ON discipline_records;
    CREATE POLICY "Discipline Records Public Access" ON discipline_records FOR ALL USING (true);
END $$;
