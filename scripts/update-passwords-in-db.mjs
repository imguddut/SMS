import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mbvnljezznpgzworwpag.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idm5samV6em5wZ3p3b3J3cGFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUzMTIwNSwiZXhwIjoyMTA0MTA3MjA1fQ.HDRClM_DmdHxb7PdRL28idFn-tKG_b72AqeHcJe57_U";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function addDemoPasswordColumn() {
  console.log("Updating public.users_profiles to store demo_password for every user...");

  // Update existing users_profiles with demo_password in metadata or column
  const { data: users, error: fetchErr } = await supabase
    .from("users_profiles")
    .select("id, email, role, full_name");

  if (fetchErr) {
    console.error("Fetch error:", fetchErr.message);
    return;
  }

  console.log(`Found ${users.length} users. Updating password field...`);

  for (const user of users) {
    const { error: updateErr } = await supabase
      .from("users_profiles")
      .update({
        metadata: { demo_password: "Agragati@2025", login_hint: "Use password Agragati@2025" }
      })
      .eq("id", user.id);

    if (updateErr) {
      console.error(`Error updating user ${user.email}:`, updateErr.message);
    } else {
      console.log(`✅ Updated ${user.email} (${user.role}) -> password: Agragati@2025`);
    }
  }

  console.log("\nQuerying updated table data:");
  const { data: finalData } = await supabase
    .from("users_profiles")
    .select("role, full_name, email, metadata");

  console.table(finalData.map(u => ({
    Role: u.role,
    Name: u.full_name,
    Email: u.email,
    Password: u.metadata?.demo_password
  })));
}

addDemoPasswordColumn();
