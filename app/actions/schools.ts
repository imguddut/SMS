"use server";

import { createClient } from "@supabase/supabase-js";

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eahfwtlduadlogqqitfu.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
  
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function updateSchoolStatusAction(id: string, status: string) {
  const supabase = getServiceSupabase();
  
  const { error } = await supabase
    .from("schools")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function deleteSchoolAction(id: string) {
  const supabase = getServiceSupabase();

  // We are using soft-delete archiving
  const { error } = await supabase
    .from("schools")
    .update({ deleted_at: new Date().toISOString(), status: 'SUSPENDED' })
    .eq("id", id);
      
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function createSchoolAction(payload: {
  legal_name: string;
  slug: string;
  domain: string;
  institution_type: string;
  curriculum_framework: string;
  jurisdiction: string;
  base_currency: string;
  capacity_target: number;
  owner_name: string;
  owner_email: string;
  owner_phone?: string;
  owner_title?: string;
  initial_password?: string;
  plan_tier: string;
  hsm_enclave?: boolean;
  biometric_sync?: boolean;
}) {
  const supabase = getServiceSupabase();

  const { data: school, error: schoolErr } = await supabase
    .from("schools")
    .insert({
      legal_name: payload.legal_name,
      slug: payload.slug.toLowerCase().replace(/\s+/g, "-"),
      domain: payload.domain || `${payload.slug.toLowerCase()}.agragati.edu`,
      institution_type: payload.institution_type,
      curriculum_framework: payload.curriculum_framework,
      jurisdiction: payload.jurisdiction,
      base_currency: payload.base_currency,
      capacity_target: payload.capacity_target,
      status: "ACTIVE",
      hsm_enclave_enabled: payload.hsm_enclave ?? true,
      settings: {
        plan_tier: payload.plan_tier,
        mfa_enforced: true,
        biometric_sync: payload.biometric_sync ?? true,
        ai_insights_enabled: true,
        cluster_node: `${payload.jurisdiction.toUpperCase().slice(0, 3)}-SECURE-01`,
      },
    })
    .select()
    .single();

  if (schoolErr || !school) throw new Error(schoolErr?.message || "Failed to create school");

  const { data: profile, error: profErr } = await supabase
    .from("users_profiles")
    .insert({
      school_id: school.id,
      role: "OWNER",
      full_name: payload.owner_name,
      email: payload.owner_email,
      phone: payload.owner_phone || null,
      title: payload.owner_title || "Chancellor & Executive",
      status: "ACTIVE",
      metadata: { initial_password: payload.initial_password || "" },
    })
    .select()
    .single();

  if (profErr) throw new Error(profErr.message);

  const { data: ayRow } = await supabase
    .from("academic_years")
    .insert({
      school_id: school.id,
      name: "2024-2025",
      start_date: "2024-04-01",
      end_date: "2025-03-31",
      is_current: true,
    })
    .select()
    .single();

  return { success: true, school, profile };
}

export async function fetchAllSchoolsAction(filters?: { search?: string; status?: string; jurisdiction?: string }) {
  const supabase = getServiceSupabase();
  let query = supabase
    .from("schools")
    .select(`
      *,
      users_profiles (
        id,
        full_name,
        email,
        role,
        title
      ),
      academic_years (
        id,
        name,
        is_current
      )
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "ALL") {
    query = query.eq("status", filters.status);
  }
  if (filters?.jurisdiction && filters.jurisdiction !== "ALL") {
    query = query.eq("jurisdiction", filters.jurisdiction);
  }

  const { data: schools, error } = await query;
  if (error || !schools) return [];
  return schools;
}

export async function fetchPlatformStatsAction() {
  const supabase = getServiceSupabase();
  
  // 1. Fetch real schools
  const { data: schools } = await supabase.from("schools").select("*").is("deleted_at", null);
  const schoolList = schools || [];
  
  // 2. Fetch real counts
  const { count: studentCount } = await supabase.from("students").select("*", { count: "exact", head: true });
  const { count: userCount } = await supabase.from("users_profiles").select("*", { count: "exact", head: true });
  
  // 3. Fetch real revenue from platform_invoices
  const { data: invoices } = await supabase
    .from("platform_invoices")
    .select("amount, status");
    
  let arrInr = 0;
  let invoicedInr = 0;
  if (invoices && invoices.length > 0) {
    invoicedInr = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const totalCollected = invoices
      .filter((inv) => inv.status === "PAID")
      .reduce((sum, inv) => sum + Number(inv.amount), 0);
    arrInr = totalCollected;
  }

  return {
    totalSchools: schoolList.length,
    activeStudents: studentCount || 0,
    activeUsers: userCount || 0,
    arrInr,
    invoicedInr,
    schools: schoolList,
  };
}
