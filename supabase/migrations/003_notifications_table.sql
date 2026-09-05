-- ============================================================================
-- AGRAGATI SCHOOL OS — NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    recipient_user_id UUID NOT NULL REFERENCES users_profiles(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL DEFAULT 'SYSTEM',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    action_text VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'NORMAL',
    is_read BOOLEAN DEFAULT false,
    source_table VARCHAR(64),
    source_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY notifications_own ON notifications
    FOR SELECT USING (
        recipient_user_id IN (
            SELECT id FROM users_profiles WHERE auth_user_id = auth.uid()
        )
        OR is_super_admin()
    );

-- Users can mark their own notifications as read
CREATE POLICY notifications_update_own ON notifications
    FOR UPDATE USING (
        recipient_user_id IN (
            SELECT id FROM users_profiles WHERE auth_user_id = auth.uid()
        )
    );

-- System (authenticated users with correct school context) can insert
CREATE POLICY notifications_insert ON notifications
    FOR INSERT WITH CHECK (
        school_id = get_user_school_id() OR is_super_admin()
    );

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_notifications_recipient
    ON notifications (recipient_user_id, is_read, created_at DESC);
