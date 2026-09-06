-- ============================================================================
-- AGRAGATI PLATFORM — ADMIN FUNCTIONALITY MIGRATION
-- Migration: 008_platform_admin_functionality.sql
-- ============================================================================

-- 1. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    billing_interval VARCHAR(32) DEFAULT 'MONTHLY',
    currency VARCHAR(10) DEFAULT 'INR',
    max_students INTEGER,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial plans
INSERT INTO subscription_plans (name, price, max_students, features) VALUES
('Starter', 120000, 500, '["Core ERP", "Basic Support"]'),
('Professional', 250000, 2000, '["Advanced ERP", "Priority Support", "Analytics"]'),
('Enterprise', 450000, 5000, '["Custom ERP", "24/7 Support", "White-label"]');

-- 2. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(32) DEFAULT 'ACTIVE', -- ACTIVE, PAST_DUE, CANCELED, TRIALING
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PLATFORM INVOICES (B2B Billing)
CREATE TABLE IF NOT EXISTS platform_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_number VARCHAR(64) UNIQUE NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(32) DEFAULT 'DRAFT', -- DRAFT, OPEN, PAID, UNCOLLECTIBLE, VOID
    issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    payment_date TIMESTAMPTZ,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PLATFORM AUDIT LOGS
CREATE TABLE IF NOT EXISTS platform_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID NOT NULL REFERENCES users_profiles(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(128) NOT NULL,
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SECURITY SETTINGS
CREATE TABLE IF NOT EXISTS security_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL means Platform-wide
    mfa_required BOOLEAN DEFAULT FALSE,
    session_ttl_hours INTEGER DEFAULT 24,
    geo_fencing_enabled BOOLEAN DEFAULT FALSE,
    allowed_countries JSONB DEFAULT '[]',
    allowed_ips JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    updated_by UUID REFERENCES users_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize Global Platform Settings
INSERT INTO security_settings (organization_id) VALUES (NULL);

-- 6. IMPERSONATION SESSIONS
CREATE TABLE IF NOT EXISTS impersonation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
    status VARCHAR(32) DEFAULT 'ACTIVE', -- ACTIVE, REVOKED, EXPIRED
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SOFT DELETE FOR ORGANIZATIONS AND SCHOOLS
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 8. SECURE RPC TRANSACTIONS

CREATE OR REPLACE FUNCTION archive_school(p_school_id UUID, p_admin_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify admin
    IF NOT EXISTS (SELECT 1 FROM users_profiles WHERE id = p_admin_id AND role = 'PLATFORM_ADMIN') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Soft delete the school
    UPDATE schools SET deleted_at = NOW(), status = 'ARCHIVED' WHERE id = p_school_id;
    
    -- Log the action
    INSERT INTO platform_audit_logs (actor_user_id, action, resource_type, resource_id)
    VALUES (p_admin_id, 'ARCHIVE_SCHOOL', 'school', p_school_id);
    
    RETURN TRUE;
END;
$$;

