-- =========================================================================
-- AGRAGATI SCHOOL OS — DYNAMIC SUPABASE DATABASE RESET / PURGE SCRIPT
-- Safely truncates all existing tables in public schema and purges dummy users
-- while preserving your Super Admin account (navalkishkre@gmail.com).
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- =========================================================================

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- 1. Truncate all tables that currently exist in the public schema dynamically
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE;';
    END LOOP;

    -- 2. Remove all profiles EXCEPT your Super Admin account
    DELETE FROM public.users_profiles WHERE LOWER(email) <> 'navalkishkre@gmail.com';

    -- 3. Remove all auth accounts EXCEPT your Super Admin account
    DELETE FROM auth.users WHERE LOWER(email) <> 'navalkishkre@gmail.com';

    RAISE NOTICE '✅ All database tables truncated and dummy accounts purged!';
END $$;
