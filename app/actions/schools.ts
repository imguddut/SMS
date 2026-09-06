"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function updateSchoolStatusAction(id: string, status: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("schools")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function deleteSchoolAction(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) throw new Error("Unauthorized");

  // We are using soft-delete archiving
  const { error } = await supabase
    .from("schools")
    .update({ deleted_at: new Date().toISOString(), status: 'ARCHIVED' })
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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: userAuth } = await supabase.auth.getUser();
  if (!userAuth.user) throw new Error("Unauthorized");

  const { data: school, error: schoolErr } = await supabase
    .from("schools")
    .insert({
      legal_name: payload.legal_name,
      slug: payload.slug.toLowerCase().replace(/\\s+/g, "-"),
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
