import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mbvnljezznpgzworwpag.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idm5samV6em5wZ3p3b3J3cGFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUzMTIwNSwiZXhwIjoyMTA0MTA3MjA1fQ.HDRClM_DmdHxb7PdRL28idFn-tKG_b72AqeHcJe57_U";
const anonKey = "sb_publishable_XRjpZNU0JXOTOgosqnx2kQ_m-bpWC_N";

console.log("Testing Supabase Connection to:", supabaseUrl);

async function testConnection() {
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  console.log("\n1. Testing Service Role Key...");
  try {
    const { data: users, error: userError } = await adminClient.auth.admin.listUsers();
    if (userError) {
      console.log("❌ Auth Admin Error:", userError.message);
    } else {
      console.log("✅ Successfully connected to Supabase Auth Admin!");
      console.log(`📊 Found ${users?.users?.length || 0} users in auth.users.`);
      if (users?.users?.length > 0) {
        users.users.forEach((u) => console.log(`   - ${u.email} (ID: ${u.id})`));
      }
    }
  } catch (err) {
    console.log("❌ Auth Exception:", err.message);
  }

  console.log("\n2. Testing Database Tables (schools, users_profiles)...");
  try {
    const { data: schools, error: schoolError } = await adminClient
      .from("schools")
      .select("id, legal_name, slug")
      .limit(5);

    if (schoolError) {
      console.log("⚠️ Database Table Note (schools):", schoolError.message);
      console.log("   (This means migrations/tables need to be created via SQL Editor).");
    } else {
      console.log("✅ Successfully queried 'schools' table!");
      console.log("📊 Records found:", schools);
    }
  } catch (err) {
    console.log("❌ DB Exception:", err.message);
  }
}

testConnection();
