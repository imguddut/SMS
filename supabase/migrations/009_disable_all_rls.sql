-- Disable Row Level Security on all public tables

DO $$
DECLARE
    row record;
BEGIN
    FOR row IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(row.tablename) || ' DISABLE ROW LEVEL SECURITY;';
    END LOOP;
END
$$;

-- Optionally, to also drop existing policies so they don't linger:
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END
$$;
