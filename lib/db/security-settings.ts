import { createClient } from "@/lib/supabase/client";

export interface PlatformSecuritySettings {
  id: string;
  mfa_required: boolean;
  session_ttl_hours: number;
  geo_fencing_enabled: boolean;
  metadata: any;
}

export async function fetchSecuritySettings(): Promise<PlatformSecuritySettings | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("security_settings")
      .select("*")
      .is("organization_id", null)
      .single();

    if (error || !data) return null;
    return data as PlatformSecuritySettings;
  } catch (err) {
    console.error("fetchSecuritySettings error:", err);
    return null;
  }
}

export async function updateSecuritySettings(settings: Partial<PlatformSecuritySettings>) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("security_settings")
      .update(settings)
      .is("organization_id", null)
      .select()
      .single();

    if (error) throw error;

    // Log the change in platform audit logs
    const { data: user } = await supabase.auth.getUser();
    if (user?.user?.id) {
      const { data: profile } = await supabase.from('users_profiles').select('id').eq('auth_user_id', user.user.id).single();
      if (profile) {
         await supabase.from("platform_audit_logs").insert({
           actor_user_id: profile.id,
           action: "UPDATE_SECURITY_SETTINGS",
           resource_type: "platform_settings",
           metadata: settings as any
         });
      }
    }

    return data;
  } catch (err) {
    console.error("updateSecuritySettings error:", err);
    throw err;
  }
}
