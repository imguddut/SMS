-- ============================================================================
-- AGRAGATI SCHOOL OS — SUPABASE AUTH & MULTI-PORTAL DUMMY SEED SCRIPT
-- Provisions sovereign school, auth.users credentials, profiles, and roles
-- Default Master Password for all accounts: Agragati@2025
-- ============================================================================

-- Ensure pgcrypto is available for bcrypt password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
DECLARE
    v_school_id UUID := '11111111-1111-1111-1111-111111111111';
    v_ay_id UUID := '22222222-2222-2222-2222-222222222222';
    v_term_id UUID := '33333333-3333-3333-3333-333333333333';
    v_class_id UUID := '44444444-4444-4444-4444-444444444444';
    v_section_id UUID := '55555555-5555-5555-5555-555555555555';
    v_subject_id UUID := '66666666-6666-6666-6666-666666666666';

    -- Auth User UUIDs
    v_superadmin_auth_id UUID := 'a0000000-0000-0000-0000-000000000001';
    v_owner_auth_id      UUID := 'a0000000-0000-0000-0000-000000000002';
    v_principal_auth_id  UUID := 'a0000000-0000-0000-0000-000000000003';
    v_admin_auth_id      UUID := 'a0000000-0000-0000-0000-000000000004';
    v_teacher_auth_id    UUID := 'a0000000-0000-0000-0000-000000000005';
    v_finance_auth_id    UUID := 'a0000000-0000-0000-0000-000000000006';
    v_parent_auth_id     UUID := 'a0000000-0000-0000-0000-000000000007';
    v_student_auth_id    UUID := 'a0000000-0000-0000-0000-000000000008';

    -- Profile UUIDs
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

    -- Encrypted Password for 'Agragati@2025'
    v_encrypted_pw TEXT := crypt('Agragati@2025', gen_salt('bf'));
BEGIN

    -- 1. Create Sovereign School Tenant
    INSERT INTO schools (id, legal_name, slug, domain, jurisdiction, base_currency, status)
    VALUES (
        v_school_id,
        'The King''s College & Academy',
        'kingscollege',
        'kingscollege.agragati.edu',
        'Geneva, Switzerland',
        'CHF',
        'ACTIVE'
    ) ON CONFLICT (id) DO UPDATE SET
        legal_name = EXCLUDED.legal_name,
        slug = EXCLUDED.slug;

    -- 2. Insert into Supabase auth.users & auth.identities
    -- 2.1 Super Admin
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
    VALUES (
        v_superadmin_auth_id,
        '00000000-0000-0000-0000-000000000000',
        'superadmin@agragati.edu',
        v_encrypted_pw,
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Eleanor Vance","role":"SUPER_ADMIN"}'::jsonb,
        'authenticated',
        'authenticated',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = v_encrypted_pw;

    -- 2.2 Owner (Chancellor & CFO)
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
    VALUES (
        v_owner_auth_id,
        '00000000-0000-0000-0000-000000000000',
        'owner@kingscollege.edu',
        v_encrypted_pw,
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Julian Vance-Moreau, D.Phil","role":"OWNER"}'::jsonb,
        'authenticated',
        'authenticated',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = v_encrypted_pw;

    -- 2.3 Principal (Head of School)
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
    VALUES (
        v_principal_auth_id,
        '00000000-0000-0000-0000-000000000000',
        'principal@kingscollege.edu',
        v_encrypted_pw,
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Mme. Claire De La Tour","role":"PRINCIPAL"}'::jsonb,
        'authenticated',
        'authenticated',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = v_encrypted_pw;

    -- 2.4 School Admin
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
    VALUES (
        v_admin_auth_id,
        '00000000-0000-0000-0000-000000000000',
        'admin@kingscollege.edu',
        v_encrypted_pw,
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Henrietta Sterling","role":"SCHOOL_ADMIN"}'::jsonb,
        'authenticated',
        'authenticated',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = v_encrypted_pw;

    -- 2.5 Teacher (Faculty)
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
    VALUES (
        v_teacher_auth_id,
        '00000000-0000-0000-0000-000000000000',
        'teacher@kingscollege.edu',
        v_encrypted_pw,
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Dr. Alistair Finch","role":"TEACHER"}'::jsonb,
        'authenticated',
        'authenticated',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = v_encrypted_pw;

    -- 2.6 Accountant (Chief Bursar)
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
    VALUES (
        v_finance_auth_id,
        '00000000-0000-0000-0000-000000000000',
        'finance@kingscollege.edu',
        v_encrypted_pw,
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Arthur M. Vance","role":"ACCOUNTANT"}'::jsonb,
        'authenticated',
        'authenticated',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = v_encrypted_pw;

    -- 2.7 Parent (Guardian)
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
    VALUES (
        v_parent_auth_id,
        '00000000-0000-0000-0000-000000000000',
        'parent@kingscollege.edu',
        v_encrypted_pw,
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Marcus Laurent","role":"PARENT"}'::jsonb,
        'authenticated',
        'authenticated',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = v_encrypted_pw;

    -- 2.8 Student (Scholar)
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
    VALUES (
        v_student_auth_id,
        '00000000-0000-0000-0000-000000000000',
        'student@kingscollege.edu',
        v_encrypted_pw,
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Genevieve Laurent","role":"STUDENT"}'::jsonb,
        'authenticated',
        'authenticated',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET encrypted_password = v_encrypted_pw;

    -- 3. Link Profiles in public.users_profiles
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
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;

    -- 4. Academic Calendar Structure
    INSERT INTO academic_years (id, school_id, name, start_date, end_date, is_current)
    VALUES (v_ay_id, v_school_id, 'Academic Year 2024–2025', '2024-09-01', '2025-06-30', true)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO academic_terms (id, academic_year_id, name, term_code, start_date, end_date, is_current)
    VALUES (v_term_id, v_ay_id, 'Term 3 Cycle (Trinity / Michaelmas)', 'TERM-3-2025', '2025-04-01', '2025-06-30', true)
    ON CONFLICT (id) DO NOTHING;

    -- 5. Rostering Entities
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

    -- 6. Scholar & Guardian Linking
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
