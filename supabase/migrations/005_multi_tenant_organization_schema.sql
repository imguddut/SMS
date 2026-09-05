-- ============================================================================
-- AGRAGATI PLATFORM — MULTI-TENANT SaaS SCHEMA & SECURITY MIGRATION (PHASE 1)
-- Migration: 005_multi_tenant_organization_schema.sql
--
-- Hierarchy:
--   AGRAGATI PLATFORM (Platform)
--        ↓
--   ORGANIZATION (Primary Tenant)
--        ↓
--   SCHOOLS (Organization's child entity)
--        ↓
--   MEMBERSHIPS (Organization & School Memberships)
--        ↓
--   GLOBAL USERS (users_profiles)
--        ↓
--   SCHOOL OPERATIONAL DATA
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PLATFORMS & ORGANIZATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(64) UNIQUE NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Agragati Platform
INSERT INTO platforms (id, name, slug, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'AGRAGATI', 'agragati', 'ACTIVE')
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

-- Seed Initial Organizations (Org A: King's Trust, Org B: ABC Society)
INSERT INTO organizations (
    id, platform_id, name, slug, legal_name, organization_type, status, subscription_plan, subscription_status
) VALUES 
(
    'e0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'King''s Educational Trust',
    'kings-trust',
    'The King''s Educational Trust & Foundation',
    'TRUST',
    'ACTIVE',
    'ENTERPRISE_FLEET',
    'ACTIVE'
),
(
    'e0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'ABC Education Society',
    'abc-society',
    'ABC Education Society Foundation',
    'SOCIETY',
    'ACTIVE',
    'STANDARD',
    'ACTIVE'
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    legal_name = EXCLUDED.legal_name;

-- ============================================================================
-- 2. SCHOOL TENANTS (Attach to Organization)
-- ============================================================================

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'schools' AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE schools ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'schools' AND column_name = 'school_code'
    ) THEN
        ALTER TABLE schools ADD COLUMN school_code VARCHAR(64);
    END IF;
END $$;

-- Migrate existing schools to Org A if organization_id is NULL
UPDATE schools 
SET organization_id = 'e0000000-0000-0000-0000-000000000001'
WHERE organization_id IS NULL;

-- Seed School B under Org B for cross-tenant isolation testing
INSERT INTO schools (
    id, organization_id, legal_name, slug, domain, status, base_currency
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'e0000000-0000-0000-0000-000000000002',
    'ABC Public Senior School',
    'abc-senior-school',
    'abcschool.agragati.edu',
    'ACTIVE',
    'INR'
) ON CONFLICT (id) DO UPDATE SET
    organization_id = EXCLUDED.organization_id;

-- ============================================================================
-- 3. GLOBAL USER IDENTITIES (Decouple school_id and role)
-- ============================================================================

DO $$ BEGIN
    -- Make school_id and role nullable in users_profiles to support global identity
    ALTER TABLE users_profiles ALTER COLUMN school_id DROP NOT NULL;
    ALTER TABLE users_profiles ALTER COLUMN role DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN
    -- Ignore if already nullable
END $$;

-- ============================================================================
-- 4. ORGANIZATION MEMBERSHIPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
    role VARCHAR(64) NOT NULL, -- 'ORGANIZATION_OWNER', 'ORGANIZATION_ADMIN', 'ORGANIZATION_FINANCE', 'ORGANIZATION_VIEWER'
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_org_member UNIQUE (organization_id, profile_id)
);

-- ============================================================================
-- 5. SCHOOL MEMBERSHIPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS school_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
    role VARCHAR(64) NOT NULL, -- 'PRINCIPAL', 'SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT'
    status VARCHAR(32) DEFAULT 'ACTIVE',
    is_primary BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_school_member_role UNIQUE (school_id, profile_id, role)
);

-- ============================================================================
-- 6. SAAS BILLING PLANS, SUBSCRIPTIONS & FEATURE FLAGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(64) UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(12,2) DEFAULT 0,
    billing_cycle VARCHAR(32) DEFAULT 'ANNUAL',
    limits JSONB DEFAULT '{"max_schools": 10, "max_students": 10000, "max_users": 1000, "storage_gb": 200}'::jsonb,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO plans (id, name, slug, description, price, billing_cycle, limits, status)
VALUES 
(
    'p0000000-0000-0000-0000-000000000001',
    'Standard Trust Plan',
    'standard',
    'Comprehensive management for single and small multi-school trusts.',
    450000.00,
    'ANNUAL',
    '{"max_schools": 3, "max_students": 3000, "max_users": 300, "storage_gb": 100}'::jsonb,
    'ACTIVE'
),
(
    'p0000000-0000-0000-0000-000000000002',
    'Enterprise Fleet Plan',
    'enterprise-fleet',
    'High-volume sovereign multi-school federation with unlimited analytics.',
    1250000.00,
    'ANNUAL',
    '{"max_schools": 50, "max_students": 50000, "max_users": 5000, "storage_gb": 1000}'::jsonb,
    'ACTIVE'
)
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS organization_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    renewal_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 year',
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    feature VARCHAR(64) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_org_feature UNIQUE (organization_id, feature)
);

-- Seed feature flags for Org A
INSERT INTO organization_features (organization_id, feature, enabled) VALUES
('e0000000-0000-0000-0000-000000000001', 'finance', true),
('e0000000-0000-0000-0000-000000000001', 'attendance', true),
('e0000000-0000-0000-0000-000000000001', 'homework', true),
('e0000000-0000-0000-0000-000000000001', 'gradebook', true),
('e0000000-0000-0000-0000-000000000001', 'biometric', true),
('e0000000-0000-0000-0000-000000000001', 'online_payment', true)
ON CONFLICT (organization_id, feature) DO NOTHING;

-- ============================================================================
-- 7. AUDIT LOGS & NOTIFICATIONS MULTI-TENANT ATTRIBUTES
-- ============================================================================

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'platform_id'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN platform_id UUID REFERENCES platforms(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE notifications ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update existing audit logs & notifications with organization_id
UPDATE audit_logs al
SET organization_id = s.organization_id
FROM schools s
WHERE al.school_id = s.id AND al.organization_id IS NULL;

UPDATE notifications n
SET organization_id = s.organization_id
FROM schools s
WHERE n.school_id = s.id AND n.organization_id IS NULL;

-- ============================================================================
-- 8. MIGRATE EXISTING USERS INTO MEMBERSHIPS
-- ============================================================================

-- 8.1 Organization Owner/Chairman membership for Profile 2
INSERT INTO organization_memberships (organization_id, profile_id, role, status)
SELECT 
    'e0000000-0000-0000-0000-000000000001',
    id,
    'ORGANIZATION_OWNER',
    'ACTIVE'
FROM users_profiles
WHERE id = 'b0000000-0000-0000-0000-000000000002'
ON CONFLICT (organization_id, profile_id) DO NOTHING;

-- 8.2 School Memberships for School 1
-- Principal
INSERT INTO school_memberships (school_id, profile_id, role, status)
SELECT '11111111-1111-1111-1111-111111111111', id, 'PRINCIPAL', 'ACTIVE'
FROM users_profiles WHERE id = 'b0000000-0000-0000-0000-000000000003'
ON CONFLICT (school_id, profile_id, role) DO NOTHING;

-- School Admin
INSERT INTO school_memberships (school_id, profile_id, role, status)
SELECT '11111111-1111-1111-1111-111111111111', id, 'SCHOOL_ADMIN', 'ACTIVE'
FROM users_profiles WHERE id = 'b0000000-0000-0000-0000-000000000004'
ON CONFLICT (school_id, profile_id, role) DO NOTHING;

-- Teacher
INSERT INTO school_memberships (school_id, profile_id, role, status)
SELECT '11111111-1111-1111-1111-111111111111', id, 'TEACHER', 'ACTIVE'
FROM users_profiles WHERE id = 'b0000000-0000-0000-0000-000000000005'
ON CONFLICT (school_id, profile_id, role) DO NOTHING;

-- Accountant
INSERT INTO school_memberships (school_id, profile_id, role, status)
SELECT '11111111-1111-1111-1111-111111111111', id, 'ACCOUNTANT', 'ACTIVE'
FROM users_profiles WHERE id = 'b0000000-0000-0000-0000-000000000006'
ON CONFLICT (school_id, profile_id, role) DO NOTHING;

-- ============================================================================
-- 9. AUTHORITATIVE MULTI-TENANT RLS SECURITY FUNCTIONS (SECTION 24)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_current_profile_id()
RETURNS UUID AS $$
    SELECT id FROM users_profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM users_profiles u
        WHERE u.auth_user_id = auth.uid()
        AND (
            u.email LIKE '%@agragati.edu'
            OR u.email LIKE 'superadmin@%'
            OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('PLATFORM_ADMIN', 'SUPER_ADMIN')
        )
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_org_member(target_organization_id UUID)
RETURNS BOOLEAN AS $$
    SELECT is_platform_admin() OR EXISTS (
        SELECT 1 FROM organization_memberships om
        JOIN users_profiles u ON om.profile_id = u.id
        WHERE u.auth_user_id = auth.uid()
        AND om.organization_id = target_organization_id
        AND om.status = 'ACTIVE'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_org_permission(target_organization_id UUID, permission VARCHAR)
RETURNS BOOLEAN AS $$
    SELECT is_platform_admin() OR EXISTS (
        SELECT 1 FROM organization_memberships om
        JOIN users_profiles u ON om.profile_id = u.id
        WHERE u.auth_user_id = auth.uid()
        AND om.organization_id = target_organization_id
        AND om.status = 'ACTIVE'
        AND (
            om.role IN ('ORGANIZATION_OWNER', 'ORGANIZATION_ADMIN')
            OR (om.role = 'ORGANIZATION_FINANCE' AND permission LIKE 'finance.%')
            OR (om.role = 'ORGANIZATION_VIEWER' AND permission LIKE '%.read')
        )
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_school_member(target_school_id UUID)
RETURNS BOOLEAN AS $$
    SELECT is_platform_admin()
    -- Direct school membership
    OR EXISTS (
        SELECT 1 FROM school_memberships sm
        JOIN users_profiles u ON sm.profile_id = u.id
        WHERE u.auth_user_id = auth.uid()
        AND sm.school_id = target_school_id
        AND sm.status = 'ACTIVE'
    )
    -- Organization Owner / Admin for the school's organization
    OR EXISTS (
        SELECT 1 FROM schools s
        JOIN organization_memberships om ON s.organization_id = om.organization_id
        JOIN users_profiles u ON om.profile_id = u.id
        WHERE s.id = target_school_id
        AND u.auth_user_id = auth.uid()
        AND om.status = 'ACTIVE'
        AND om.role IN ('ORGANIZATION_OWNER', 'ORGANIZATION_ADMIN', 'ORGANIZATION_FINANCE')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_school_role(target_school_id UUID, p_role VARCHAR)
RETURNS BOOLEAN AS $$
    SELECT is_platform_admin()
    OR EXISTS (
        SELECT 1 FROM school_memberships sm
        JOIN users_profiles u ON sm.profile_id = u.id
        WHERE u.auth_user_id = auth.uid()
        AND sm.school_id = target_school_id
        AND sm.role = p_role
        AND sm.status = 'ACTIVE'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_school_permission(target_school_id UUID, permission VARCHAR)
RETURNS BOOLEAN AS $$
    SELECT is_platform_admin()
    -- School leadership (Principal, School Admin)
    OR EXISTS (
        SELECT 1 FROM school_memberships sm
        JOIN users_profiles u ON sm.profile_id = u.id
        WHERE u.auth_user_id = auth.uid()
        AND sm.school_id = target_school_id
        AND sm.status = 'ACTIVE'
        AND (
            sm.role IN ('PRINCIPAL', 'SCHOOL_ADMIN')
            OR (sm.role = 'ACCOUNTANT' AND (permission LIKE 'fee%' OR permission LIKE 'invoice%' OR permission LIKE 'payment%' OR permission LIKE 'reconciliation%'))
            OR (sm.role = 'TEACHER' AND (permission LIKE 'attendance%' OR permission LIKE 'homework%' OR permission LIKE 'marks%'))
        )
    )
    -- Org Admin / Owner
    OR EXISTS (
        SELECT 1 FROM schools s
        JOIN organization_memberships om ON s.organization_id = om.organization_id
        JOIN users_profiles u ON om.profile_id = u.id
        WHERE s.id = target_school_id
        AND u.auth_user_id = auth.uid()
        AND om.status = 'ACTIVE'
        AND om.role IN ('ORGANIZATION_OWNER', 'ORGANIZATION_ADMIN')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_teacher_assigned(
    p_school_id UUID,
    p_section_id UUID,
    p_subject_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM teacher_assignments ta
        JOIN teachers t ON ta.teacher_id = t.id
        JOIN users_profiles u ON t.profile_id = u.id
        WHERE u.auth_user_id = auth.uid()
        AND ta.school_id = p_school_id
        AND ta.section_id = p_section_id
        AND (p_subject_id IS NULL OR ta.subject_id = p_subject_id)
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_parent_of_student(p_student_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM student_guardians sg
        JOIN guardians g ON sg.guardian_id = g.id
        JOIN users_profiles u ON g.profile_id = u.id
        WHERE u.auth_user_id = auth.uid()
        AND sg.student_id = p_student_id
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_student_self(p_student_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM students s
        JOIN users_profiles u ON s.profile_id = u.id
        WHERE u.auth_user_id = auth.uid()
        AND s.id = p_student_id
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- 10. MULTI-TENANT ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_features ENABLE ROW LEVEL SECURITY;

-- 10.1 ORGANIZATIONS RLS (Section 25)
DROP POLICY IF EXISTS org_select_policy ON organizations;
CREATE POLICY org_select_policy ON organizations
    FOR SELECT USING (
        is_platform_admin()
        OR is_org_member(id)
    );

DROP POLICY IF EXISTS org_modify_policy ON organizations;
CREATE POLICY org_modify_policy ON organizations
    FOR UPDATE USING (
        is_platform_admin()
        OR has_org_permission(id, 'organizations.update')
    );

-- 10.2 SCHOOLS RLS (Section 26 & 28)
DROP POLICY IF EXISTS schools_isolation_select ON schools;
CREATE POLICY schools_isolation_select ON schools
    FOR SELECT USING (
        is_platform_admin()
        OR is_org_member(organization_id)
        OR is_school_member(id)
    );

DROP POLICY IF EXISTS schools_isolation_insert ON schools;
CREATE POLICY schools_isolation_insert ON schools
    FOR INSERT WITH CHECK (
        is_platform_admin()
        OR has_org_permission(organization_id, 'schools.create')
    );

DROP POLICY IF EXISTS schools_isolation_update ON schools;
CREATE POLICY schools_isolation_update ON schools
    FOR UPDATE USING (
        is_platform_admin()
        OR has_org_permission(organization_id, 'schools.update')
        OR has_school_role(id, 'SCHOOL_ADMIN')
        OR has_school_role(id, 'PRINCIPAL')
    );

-- 10.3 STUDENTS RLS (Section 27 & 51)
DROP POLICY IF EXISTS students_multi_tenant_select ON students;
CREATE POLICY students_multi_tenant_select ON students
    FOR SELECT USING (
        is_platform_admin()
        OR has_school_permission(school_id, 'student.read')
        OR (has_school_role(school_id, 'TEACHER') AND EXISTS (
            SELECT 1 FROM enrollments e
            WHERE e.student_id = students.id
            AND is_teacher_assigned(students.school_id, e.section_id)
        ))
        OR is_parent_of_student(id)
        OR is_student_self(id)
    );

DROP POLICY IF EXISTS students_multi_tenant_insert ON students;
CREATE POLICY students_multi_tenant_insert ON students
    FOR INSERT WITH CHECK (
        is_platform_admin()
        OR has_school_permission(school_id, 'student.create')
    );

-- 10.4 ATTENDANCE ENTRIES RLS
DROP POLICY IF EXISTS attendance_entries_multi_tenant_select ON attendance_entries;
CREATE POLICY attendance_entries_multi_tenant_select ON attendance_entries
    FOR SELECT USING (
        is_platform_admin()
        OR is_parent_of_student(student_id)
        OR is_student_self(student_id)
        OR EXISTS (
            SELECT 1 FROM attendance_records ar
            WHERE ar.id = attendance_entries.attendance_record_id
            AND (
                has_school_permission(ar.school_id, 'attendance.read')
                OR is_teacher_assigned(ar.school_id, ar.section_id)
            )
        )
    );

-- 10.5 INVOICES & PAYMENTS RLS
DROP POLICY IF EXISTS invoices_multi_tenant_select ON invoices;
CREATE POLICY invoices_multi_tenant_select ON invoices
    FOR SELECT USING (
        is_platform_admin()
        OR has_school_permission(school_id, 'invoice.read')
        OR is_parent_of_student(student_id)
        OR is_student_self(student_id)
    );

DROP POLICY IF EXISTS payments_multi_tenant_select ON payments;
CREATE POLICY payments_multi_tenant_select ON payments
    FOR SELECT USING (
        is_platform_admin()
        OR has_school_permission(school_id, 'payment.read')
        OR EXISTS (
            SELECT 1 FROM invoices i
            WHERE i.id = payments.invoice_id
            AND (is_parent_of_student(i.student_id) OR is_student_self(i.student_id))
        )
    );

-- 10.6 NOTIFICATIONS RLS (Section 41)
DROP POLICY IF EXISTS notifications_multi_tenant_select ON notifications;
CREATE POLICY notifications_multi_tenant_select ON notifications
    FOR SELECT USING (
        is_platform_admin()
        OR recipient_user_id = get_current_profile_id()
    );

-- ============================================================================
-- 11. INDEXES FOR MULTI-TENANT QUERY ACCELERATION (SECTION 48)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_organizations_platform ON organizations(platform_id);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_schools_organization ON schools(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_profile ON organization_memberships(profile_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_school_members_profile ON school_memberships(profile_id);
CREATE INDEX IF NOT EXISTS idx_school_members_school ON school_memberships(school_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_school ON audit_logs(organization_id, school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_org_recipient ON notifications(organization_id, recipient_user_id, is_read);
