-- ============================================================================
-- AGRAGATI SCHOOL OS — RELATIONSHIP & ASSIGNMENT-SCOPED RLS POLICIES (PHASE 13)
-- Enforces Section 17 & 26 Granular Access:
-- - Teachers: Assignment-scoped (assigned section/subject)
-- - Parents: Child-scoped (linked via student_guardians)
-- - Students: Self-scoped (own profile/student id)
-- - Accountants: School-scoped finance records (no marks access)
-- - Platform Admin: Global access
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. HELPER SECURITY FUNCTIONS
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_auth_profile_id()
RETURNS UUID AS $$
    SELECT id FROM users_profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS VARCHAR AS $$
    SELECT role FROM users_profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_auth_teacher_id()
RETURNS UUID AS $$
    SELECT t.id FROM teachers t
    JOIN users_profiles u ON t.profile_id = u.id
    WHERE u.auth_user_id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_teacher_assigned_to_section(p_section_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM teacher_assignments ta
        JOIN teachers t ON ta.teacher_id = t.id
        JOIN users_profiles u ON t.profile_id = u.id
        WHERE u.auth_user_id = auth.uid()
        AND ta.section_id = p_section_id
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

CREATE OR REPLACE FUNCTION is_own_student(p_student_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM students s
        JOIN users_profiles u ON s.profile_id = u.id
        WHERE u.auth_user_id = auth.uid()
        AND s.id = p_student_id
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 2. STUDENTS TABLE RLS
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS students_tenant_scoped ON students;
DROP POLICY IF EXISTS students_tenant ON students;

-- Select policy considering role + relationship:
CREATE POLICY students_relationship_select ON students
    FOR SELECT USING (
        is_super_admin()
        -- School Admin & Principal have full school roster access
        OR (school_id = get_user_school_id() AND get_auth_role() IN ('SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT'))
        -- Teachers can view students enrolled in sections they are assigned to
        OR (school_id = get_user_school_id() AND get_auth_role() = 'TEACHER' AND EXISTS (
            SELECT 1 FROM enrollments e
            WHERE e.student_id = students.id
            AND is_teacher_assigned_to_section(e.section_id)
        ))
        -- Parents can view only their own linked children
        OR (get_auth_role() = 'PARENT' AND is_parent_of_student(id))
        -- Students can view only their own student record
        OR (get_auth_role() = 'STUDENT' AND is_own_student(id))
    );

-- ---------------------------------------------------------------------------
-- 3. ATTENDANCE_ENTRIES RLS
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS ae_tenant ON attendance_entries;

CREATE POLICY attendance_entries_scoped_select ON attendance_entries
    FOR SELECT USING (
        is_super_admin()
        OR EXISTS (
            SELECT 1 FROM attendance_records ar
            WHERE ar.id = attendance_entries.attendance_record_id
            AND ar.school_id = get_user_school_id()
            AND (
                get_auth_role() IN ('SCHOOL_ADMIN', 'PRINCIPAL')
                OR (get_auth_role() = 'TEACHER' AND is_teacher_assigned_to_section(ar.section_id))
                OR (get_auth_role() = 'PARENT' AND is_parent_of_student(attendance_entries.student_id))
                OR (get_auth_role() = 'STUDENT' AND is_own_student(attendance_entries.student_id))
            )
        )
    );

CREATE POLICY attendance_entries_teacher_modify ON attendance_entries
    FOR ALL USING (
        is_super_admin()
        OR (
            get_auth_role() IN ('SCHOOL_ADMIN', 'PRINCIPAL')
            AND EXISTS (
                SELECT 1 FROM attendance_records ar
                WHERE ar.id = attendance_entries.attendance_record_id
                AND ar.school_id = get_user_school_id()
            )
        )
        OR (
            get_auth_role() = 'TEACHER'
            AND EXISTS (
                SELECT 1 FROM attendance_records ar
                WHERE ar.id = attendance_entries.attendance_record_id
                AND ar.school_id = get_user_school_id()
                AND is_teacher_assigned_to_section(ar.section_id)
            )
        )
    );

-- ---------------------------------------------------------------------------
-- 4. HOMEWORK_SUBMISSIONS RLS
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS hs_tenant ON homework_submissions;

CREATE POLICY homework_submissions_scoped_select ON homework_submissions
    FOR SELECT USING (
        is_super_admin()
        OR get_auth_role() IN ('SCHOOL_ADMIN', 'PRINCIPAL')
        -- Student sees only their own submissions
        OR (get_auth_role() = 'STUDENT' AND is_own_student(student_id))
        -- Parent sees only their linked children's submissions
        OR (get_auth_role() = 'PARENT' AND is_parent_of_student(student_id))
        -- Teacher sees submissions for assignments they created or sections they teach
        OR (get_auth_role() = 'TEACHER' AND EXISTS (
            SELECT 1 FROM homework_assignments ha
            WHERE ha.id = homework_submissions.homework_id
            AND (ha.teacher_id = get_auth_teacher_id() OR is_teacher_assigned_to_section(ha.section_id))
        ))
    );

-- Student can submit solutions
CREATE POLICY homework_submissions_student_insert ON homework_submissions
    FOR INSERT WITH CHECK (
        is_super_admin()
        OR (get_auth_role() = 'STUDENT' AND is_own_student(student_id))
    );

-- Teacher can grade submissions
CREATE POLICY homework_submissions_teacher_grade ON homework_submissions
    FOR UPDATE USING (
        is_super_admin()
        OR (get_auth_role() = 'TEACHER' AND EXISTS (
            SELECT 1 FROM homework_assignments ha
            WHERE ha.id = homework_submissions.homework_id
            AND (ha.teacher_id = get_auth_teacher_id() OR is_teacher_assigned_to_section(ha.section_id))
        ))
        OR get_auth_role() IN ('SCHOOL_ADMIN', 'PRINCIPAL')
    );

-- ---------------------------------------------------------------------------
-- 5. MARKS_ENTRIES RLS
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS me_tenant ON marks_entries;

CREATE POLICY marks_entries_scoped_select ON marks_entries
    FOR SELECT USING (
        is_super_admin()
        OR get_auth_role() IN ('SCHOOL_ADMIN', 'PRINCIPAL')
        -- Teacher sees marks for their assigned sections
        OR (get_auth_role() = 'TEACHER' AND EXISTS (
            SELECT 1 FROM assessments a
            WHERE a.id = marks_entries.assessment_id
            AND is_teacher_assigned_to_section(a.section_id)
        ))
        -- Students and Parents see marks ONLY IF the assessment is published
        OR (
            EXISTS (
                SELECT 1 FROM assessments a
                WHERE a.id = marks_entries.assessment_id
                AND a.is_published = true
            )
            AND (
                (get_auth_role() = 'STUDENT' AND is_own_student(student_id))
                OR (get_auth_role() = 'PARENT' AND is_parent_of_student(student_id))
            )
        )
    );

-- ---------------------------------------------------------------------------
-- 6. INVOICES & PAYMENTS RLS
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS invoices_tenant ON invoices;
DROP POLICY IF EXISTS payments_tenant ON payments;

CREATE POLICY invoices_scoped_select ON invoices
    FOR SELECT USING (
        is_super_admin()
        -- Finance, School Admin, Principal see within school
        OR (school_id = get_user_school_id() AND get_auth_role() IN ('ACCOUNTANT', 'SCHOOL_ADMIN', 'PRINCIPAL'))
        -- Parent sees invoices for their linked children
        OR (get_auth_role() = 'PARENT' AND is_parent_of_student(student_id))
        -- Student sees their own invoices
        OR (get_auth_role() = 'STUDENT' AND is_own_student(student_id))
    );

CREATE POLICY payments_scoped_select ON payments
    FOR SELECT USING (
        is_super_admin()
        OR (school_id = get_user_school_id() AND get_auth_role() IN ('ACCOUNTANT', 'SCHOOL_ADMIN', 'PRINCIPAL'))
        OR (get_auth_role() = 'PARENT' AND EXISTS (
            SELECT 1 FROM invoices inv
            WHERE inv.id = payments.invoice_id
            AND is_parent_of_student(inv.student_id)
        ))
        OR (get_auth_role() = 'STUDENT' AND EXISTS (
            SELECT 1 FROM invoices inv
            WHERE inv.id = payments.invoice_id
            AND is_own_student(inv.student_id)
        ))
    );

-- Only Accountant and School Admin can directly create invoices
CREATE POLICY invoices_accountant_insert ON invoices
    FOR INSERT WITH CHECK (
        is_super_admin()
        OR (school_id = get_user_school_id() AND get_auth_role() IN ('ACCOUNTANT', 'SCHOOL_ADMIN'))
    );
