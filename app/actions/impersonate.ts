"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function startImpersonation(targetUserId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Verify caller is Platform Admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: adminProfile } = await supabase
    .from("users_profiles")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .single();

  if (!adminProfile || adminProfile.role !== "PLATFORM_ADMIN" && adminProfile.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized to impersonate");
  }

  // 2. Verify target user exists
  const { data: targetProfile, error } = await supabase
    .from("users_profiles")
    .select("id, role")
    .eq("id", targetUserId)
    .single();

  if (error || !targetProfile) {
    throw new Error("Target user not found");
  }

  // 3. Create impersonation session in DB
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour session

  const { data: sessionData, error: sessionErr } = await supabase
    .from("impersonation_sessions")
    .insert({
      admin_id: adminProfile.id,
      target_user_id: targetUserId,
      expires_at: expiresAt.toISOString(),
      status: "ACTIVE"
    })
    .select()
    .single();

  if (sessionErr || !sessionData) {
    throw new Error("Failed to create impersonation session");
  }

  // 4. Log audit event
  await supabase.from("platform_audit_logs").insert({
    actor_user_id: adminProfile.id,
    action: "START_IMPERSONATION",
    resource_type: "user",
    resource_id: targetUserId
  });

  // 5. Set secure HttpOnly cookie
  cookieStore.set("agragati_impersonation_id", sessionData.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt
  });

  return { success: true, sessionId: sessionData.id };
}

export async function stopImpersonation() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("agragati_impersonation_id")?.value;
  
  if (sessionId) {
    const supabase = createClient(cookieStore);
    await supabase.from("impersonation_sessions").update({ status: "REVOKED" }).eq("id", sessionId);
    cookieStore.delete("agragati_impersonation_id");
  }

  return { success: true };
}
