import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mbvnljezznpgzworwpag.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idm5samV6em5wZ3p3b3J3cGFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUzMTIwNSwiZXhwIjoyMTA0MTA3MjA1fQ.HDRClM_DmdHxb7PdRL28idFn-tKG_b72AqeHcJe57_U";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const [,, email, newPassword] = process.argv;

if (!email || !newPassword) {
  console.log("Usage: node scripts/change-password.mjs <email> <new_password>");
  console.log("Example: node scripts/change-password.mjs owner@kingscollege.edu MyNewSecret123!");
  process.exit(1);
}

async function changeUserPassword() {
  console.log(`Searching for user: ${email}...`);

  const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error("❌ Failed to list users:", listErr.message);
    process.exit(1);
  }

  const user = usersData.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    console.error(`❌ User not found with email: ${email}`);
    process.exit(1);
  }

  // 1. Update password in Supabase Auth
  const { error: updateAuthErr } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true,
  });

  if (updateAuthErr) {
    console.error("❌ Failed to update Supabase Auth password:", updateAuthErr.message);
    process.exit(1);
  }

  // 2. Update metadata in public.users_profiles
  const { error: updateProfErr } = await supabase
    .from("users_profiles")
    .update({
      metadata: { demo_password: newPassword, login_hint: `Use password ${newPassword}` }
    })
    .eq("auth_user_id", user.id);

  if (updateProfErr) {
    console.warn("⚠️ Warning updating profile metadata:", updateProfErr.message);
  }

  console.log("==================================================");
  console.log("✅ PASSWORD SUCCESSFULLY UPDATED!");
  console.log(`👤 Email:        ${email}`);
  console.log(`🔑 New Password: ${newPassword}`);
  console.log("==================================================");
}

changeUserPassword();
