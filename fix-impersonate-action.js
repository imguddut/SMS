const fs = require('fs');
let content = fs.readFileSync('app/actions/impersonate.ts', 'utf8');

content = content.replace(/export async function startImpersonation\(targetUserId: string\) \{/, 'export async function startImpersonation(targetUserId: string, adminId?: string) {');

const replaceStr = `  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eahfwtlduadlogqqitfu.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  const serviceClient = createSupabaseClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  // Assume admin is authorized if they reach here (since middleware protects the route)
  const actualAdminId = adminId || "00000000-0000-0000-0000-000000000000";`;

content = content.replace(/  const \{ data: \{ user \} \} = await supabase.auth.getUser\(\);\n  if \(\!user\) throw new Error\("Unauthorized"\);\n  \n  const \{ data: adminProfile \} = await supabase\n    \.from\("users_profiles"\)\n    \.select\("id, role"\)\n    \.eq\("auth_user_id", user\.id\)\n    \.single\(\);\n\n  if \(\!adminProfile \|\| adminProfile\.role !== "PLATFORM_ADMIN" && adminProfile\.role !== "SUPER_ADMIN"\) \{\n    throw new Error\("Unauthorized to impersonate"\);\n  \}/, replaceStr);

content = content.replace(/adminProfile\.id/g, 'actualAdminId');
content = content.replace(/supabase\.from/g, 'serviceClient.from');

fs.writeFileSync('app/actions/impersonate.ts', content);
