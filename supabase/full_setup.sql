-- ============================================================================
-- AGRAGATI SCHOOL OS — FULL ONE-SHOT DATABASE SETUP & DUMMY SEED SCRIPT
-- Paste this entire file into your Supabase Dashboard -> SQL Editor and click RUN.
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAIN TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'OWNER', 'PRINCIPAL', 'SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT', 'PARENT', 'STUDENT');
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
    CREATE TYPE payment_method AS ENUM ('BANK_TRANSFER', 'CARD', 'CASH', 'CHEQUE', 'DIRECT_DEBIT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE reconciliation_status AS ENUM ('UNMATCHED', 'MATCHED', 'FLAGGED', 'RECONCILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE homework_status AS ENUM ('ASSIGNED', 'SUBMITTED', 'GRADED', 'LATE', 'RESUBMIT_REQUESTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE approval_type AS ENUM ('BURSARY_WAIVER', 'LEAVE_REQUEST', 'EXCURSION_AUTHORIZATION', 'GRADEBOOK_PUBLICATION', 'STAFF_APPOINTMENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ESCROW');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. CORE TENANT & IDENTITY TABLES
CREATE TABLE IF NOT EXISTS schools (
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
    settings JSONB DEFAULT '{"mfa_enforced":true,"biometric_sync":true,"ai_insights_enabled":true,"cryptographic_ledger":true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users_profiles (
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
    curriculum_code VARCHAR(50) DEFAULT 'IB_DIPLOMA',
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
    max_capacity INTEGER DEFAULT 28,
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

CREATE TABLE IF NOT EXISTS students (
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

CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    period_number SMALLINT DEFAULT 0,
    marked_by_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_record_id UUID NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status attendance_status NOT NULL DEFAULT 'PRESENT',
    reason VARCHAR(255),
    time_in TIME,
    time_out TIME,
    verification_method VARCHAR(64) DEFAULT 'BIOMETRIC_CARD_TAP',
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
    approval_status approval_status DEFAULT 'PENDING',
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
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    frequency VARCHAR(32) DEFAULT 'TRI_TERM',
    currency VARCHAR(3) DEFAULT 'CHF',
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
    created_at TIMESTAMPTZ DEFAULT NOW()
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
    payment_method payment_method NOT NULL DEFAULT 'BANK_TRANSFER',
    transaction_reference VARCHAR(128),
    settled_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(32) DEFAULT 'SETTLED',
    notes TEXT
);

CREATE TABLE IF NOT EXISTS bank_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    bank_name VARCHAR(128) DEFAULT 'Pictet & Cie (Geneva)',
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

-- ============================================================================
-- 4. DUMMY SEED DATA (PROVISIONING ALL 8 ROLES & AUTH IDENTITIES)
-- ============================================================================

DO $$
DECLARE
    v_school_id UUID := '11111111-1111-1111-1111-111111111111';
    v_ay_id UUID := '22222222-2222-2222-2222-222222222222';
    v_term_id UUID := '33333333-3333-3333-3333-333333333333';
    v_class_id UUID := '44444444-4444-4444-4444-444444444444';
    v_section_id UUID := '55555555-5555-5555-5555-555555555555';
    v_subject_id UUID := '66666666-6666-6666-6666-666666666666';

    v_superadmin_auth_id UUID := 'a0000000-0000-0000-0000-000000000001';
    v_owner_auth_id      UUID := 'a0000000-0000-0000-0000-000000000002';
    v_principal_auth_id  UUID := 'a0000000-0000-0000-0000-000000000003';
    v_admin_auth_id      UUID := 'a0000000-0000-0000-0000-000000000004';
    v_teacher_auth_id    UUID := 'a0000000-0000-0000-0000-000000000005';
    v_finance_auth_id    UUID := 'a0000000-0000-0000-0000-000000000006';
    v_parent_auth_id     UUID := 'a0000000-0000-0000-0000-000000000007';
    v_student_auth_id    UUID := 'a0000000-0000-0000-0000-000000000008';

    v_superadmin_prof_id UUID := 'b0000000-0000-0000-0000-000000000001';
    v_owner_prof_id      UUID := 'b0000000-0000-0000-0000-000000000002';
    v_principal_prof_id  UUID := 'b0000000-0000-0000-0000-000000000003';
    v_admin_prof_id      UUID := 'b0000000-0000-0000-0000-000000000004';
    v_teacher_prof_id    UUID := 'b0000000-0000-0000-0000-000000000005';
    v_finance_prof_id    UUID := 'b0000000-0000-0000-0000-000000000006';
    v_parent_prof_id     UUID := 'b0000000-0000-0000-0000-000000000007';
    v_student_prof_id    UUID := 'b0000000-0000-0000-0000-000000000008';

    v_teacher_id         UUID := 'c0000000-0000-0000-0000-000000000005';
    v_student_id         UUID := 'c0000000-0000-0000-0000-000000000008';
    v_guardian_id        UUID := 'c0000000-0000-0000-0000-000000000007';

    v_encrypted_pw TEXT := crypt('Agragati@2025', gen_salt('bf'));
BEGIN

    -- School
    INSERT INTO schools (id, legal_name, slug, domain, jurisdiction, base_currency, status)
    VALUES (v_school_id, 'The King''s College & Academy', 'kingscollege', 'kingscollege.agragati.edu', 'Geneva, Switzerland', 'CHF', 'ACTIVE')
    ON CONFLICT (id) DO UPDATE SET legal_name = EXCLUDED.legal_name, slug = EXCLUDED.slug;

    -- Supabase auth.users
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
    VALUES
        (v_superadmin_auth_id, '00000000-0000-0000-0000-000000000000', 'superadmin@agragati.edu', v_encrypted_pw, NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Eleanor Vance","role":"SUPER_ADMIN"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW()),
        (v_owner_auth_id, '00000000-0000-0000-0000-000000000000', 'owner@kingscollege.edu', v_encrypted_pw, NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Julian Vance-Moreau, D.Phil","role":"OWNER"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW()),
        (v_principal_auth_id, '00000000-0000-0000-0000-000000000000', 'principal@kingscollege.edu', v_encrypted_pw, NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Mme. Claire De La Tour","role":"PRINCIPAL"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW()),
        (v_admin_auth_id, '00000000-0000-0000-0000-000000000000', 'admin@kingscollege.edu', v_encrypted_pw, NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Henrietta Sterling","role":"SCHOOL_ADMIN"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW()),
        (v_teacher_auth_id, '00000000-0000-0000-0000-000000000000', 'teacher@kingscollege.edu', v_encrypted_pw, NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Dr. Alistair Finch","role":"TEACHER"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW()),
        (v_finance_auth_id, '00000000-0000-0000-0000-000000000000', 'finance@kingscollege.edu', v_encrypted_pw, NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Arthur M. Vance","role":"ACCOUNTANT"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW()),
        (v_parent_auth_id, '00000000-0000-0000-0000-000000000000', 'parent@kingscollege.edu', v_encrypted_pw, NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Marcus Laurent","role":"PARENT"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW()),
        (v_student_auth_id, '00000000-0000-0000-0000-000000000000', 'student@kingscollege.edu', v_encrypted_pw, NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Genevieve Laurent","role":"STUDENT"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET encrypted_password = v_encrypted_pw;

    -- Profiles
    INSERT INTO users_profiles (id, auth_user_id, school_id, role, full_name, email, title, status)
    VALUES
        (v_superadmin_prof_id, v_superadmin_auth_id, NULL, 'SUPER_ADMIN', 'Eleanor Vance', 'superadmin@agragati.edu', 'Platform Lead & Super Admin', 'ACTIVE'),
        (v_owner_prof_id, v_owner_auth_id, v_school_id, 'OWNER', 'Julian Vance-Moreau, D.Phil', 'owner@kingscollege.edu', 'Chancellor & CFO', 'ACTIVE'),
        (v_principal_prof_id, v_principal_auth_id, v_school_id, 'PRINCIPAL', 'Mme. Claire De La Tour', 'principal@kingscollege.edu', 'Head of School / Principal', 'ACTIVE'),
        (v_admin_prof_id, v_admin_auth_id, v_school_id, 'SCHOOL_ADMIN', 'Henrietta Sterling', 'admin@kingscollege.edu', 'School Operations Administrator', 'ACTIVE'),
        (v_teacher_prof_id, v_teacher_auth_id, v_school_id, 'TEACHER', 'Dr. Alistair Finch', 'teacher@kingscollege.edu', 'Senior Faculty • Physics', 'ACTIVE'),
        (v_finance_prof_id, v_finance_auth_id, v_school_id, 'ACCOUNTANT', 'Arthur M. Vance', 'finance@kingscollege.edu', 'Chief Bursar & Comptroller', 'ACTIVE'),
        (v_parent_prof_id, v_parent_auth_id, v_school_id, 'PARENT', 'Marcus Laurent', 'parent@kingscollege.edu', 'Guardian • Senior Form', 'ACTIVE'),
        (v_student_prof_id, v_student_auth_id, v_school_id, 'STUDENT', 'Genevieve Laurent', 'student@kingscollege.edu', 'Scholar • Grade 11-IB', 'ACTIVE')
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

    -- Academic Structure
    INSERT INTO academic_years (id, school_id, name, start_date, end_date, is_current)
    VALUES (v_ay_id, v_school_id, 'Academic Year 2024–2025', '2024-09-01', '2025-06-30', true)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO academic_terms (id, academic_year_id, name, term_code, start_date, end_date, is_current)
    VALUES (v_term_id, v_ay_id, 'Term 3 Cycle (Trinity / Michaelmas)', 'TERM-3-2025', '2025-04-01', '2025-06-30', true)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO classes (id, school_id, academic_year_id, name, grade_level, curriculum_code)
    VALUES (v_class_id, v_school_id, v_ay_id, 'Grade 11', 11, 'IB_DIPLOMA')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO teachers (id, school_id, profile_id, employee_id, department, title, qualification)
    VALUES (v_teacher_id, v_school_id, v_teacher_prof_id, 'EMP-PHYS-042', 'Natural Sciences & Physics', 'Senior Lecturer', 'Ph.D. Theoretical Physics (ETH Zürich)')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO sections (id, class_id, name, room_number, max_capacity, form_tutor_id)
    VALUES (v_section_id, v_class_id, 'Grade 11-A — Classical & Sciences', 'Newton Hall Lab 304', 28, v_teacher_id)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO subjects (id, school_id, name, code, department, credits)
    VALUES (v_subject_id, v_school_id, 'Higher Level Physics', 'PHY-HL-301', 'Natural Sciences', 1.0)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO teacher_assignments (school_id, teacher_id, section_id, subject_id, academic_year_id)
    VALUES (v_school_id, v_teacher_id, v_section_id, v_subject_id, v_ay_id)
    ON CONFLICT DO NOTHING;

    INSERT INTO students (id, school_id, profile_id, admission_number, house, date_of_birth, gender, status)
    VALUES (v_student_id, v_school_id, v_student_prof_id, 'KC-2025-0842', 'House Valois', '2008-04-16', 'Female', 'ACTIVE')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO guardians (id, school_id, profile_id, relationship_type, occupation, emergency_contact, address)
    VALUES (v_guardian_id, v_school_id, v_parent_prof_id, 'Father', 'Managing Director, Pictet Asset Management', '+41 22 705 2211', 'Chemin de la Colline 14, 1223 Cologny, Geneva')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO student_guardians (student_id, guardian_id, is_primary_guarantor, authorization_level)
    VALUES (v_student_id, v_guardian_id, true, 'FULL_CUSTODIAL')
    ON CONFLICT DO NOTHING;

    INSERT INTO enrollments (school_id, student_id, section_id, academic_year_id, roll_number, status)
    VALUES (v_school_id, v_student_id, v_section_id, v_ay_id, 14, 'ACTIVE')
    ON CONFLICT DO NOTHING;

END $$;
