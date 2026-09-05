import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mbvnljezznpgzworwpag.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idm5samV6em5wZ3p3b3J3cGFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUzMTIwNSwiZXhwIjoyMTA0MTA3MjA1fQ.HDRClM_DmdHxb7PdRL28idFn-tKG_b72AqeHcJe57_U";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const defaultPassword = "Agragati@2025";

// School A: The King's College & Academy (Geneva)
const schoolA = {
  id: "11111111-1111-1111-1111-111111111111",
  legal_name: "The King's College & Academy",
  slug: "kingscollege",
  domain: "kingscollege.agragati.edu",
  jurisdiction: "Geneva, Switzerland",
  base_currency: "CHF",
  status: "ACTIVE",
};

// School B: Institut Le Rosey (Rolle)
const schoolB = {
  id: "99999999-9999-9999-9999-999999999999",
  legal_name: "Institut Le Rosey",
  slug: "lerosey",
  domain: "lerosey.agragati.edu",
  jurisdiction: "Rolle, Switzerland",
  base_currency: "EUR",
  status: "ACTIVE",
};

async function seedPhase2() {
  console.log("==================================================");
  console.log("🛡️  PHASE 2: MULTI-TENANT SEED & DATA PROVISIONING");
  console.log("==================================================\n");

  // 1. Seed School A & School B
  console.log("1. Upserting Schools (Tenant A & Tenant B)...");
  await supabase.from("schools").upsert([schoolA, schoolB]);
  console.log("✅ School A and School B seeded!");

  // 2. Academic Years
  const ayA = {
    id: "22222222-2222-2222-2222-222222222222",
    school_id: schoolA.id,
    name: "AY 2024–2025 (King's College)",
    start_date: "2024-09-01",
    end_date: "2025-06-30",
    is_current: true,
  };
  const ayB = {
    id: "88888888-8888-8888-8888-888888888888",
    school_id: schoolB.id,
    name: "AY 2024–2025 (Le Rosey)",
    start_date: "2024-09-01",
    end_date: "2025-06-30",
    is_current: true,
  };
  await supabase.from("academic_years").upsert([ayA, ayB]);

  // 3. Academic Terms
  const termA = {
    id: "33333333-3333-3333-3333-333333333333",
    academic_year_id: ayA.id,
    name: "Trinity Term 2025 (School A)",
    term_code: "T3-2025-KCA",
    start_date: "2025-04-01",
    end_date: "2025-06-30",
    is_current: true,
  };
  const termB = {
    id: "77777777-7777-7777-7777-777777777777",
    academic_year_id: ayB.id,
    name: "Spring Term 2025 (School B)",
    term_code: "T3-2025-ROSEY",
    start_date: "2025-04-01",
    end_date: "2025-06-30",
    is_current: true,
  };
  await supabase.from("academic_terms").upsert([termA, termB]);

  // 4. Classes & Sections for School A & B
  const classA = {
    id: "44444444-4444-4444-4444-444444444444",
    school_id: schoolA.id,
    academic_year_id: ayA.id,
    name: "Grade 11 (IB Diploma)",
    grade_level: 11,
    curriculum_code: "IB_DIPLOMA",
  };
  const classB = {
    id: "66666666-4444-4444-4444-444444444444",
    school_id: schoolB.id,
    academic_year_id: ayB.id,
    name: "Baccalauréat Français Terminale",
    grade_level: 12,
    curriculum_code: "FRENCH_BACC",
  };
  await supabase.from("classes").upsert([classA, classB]);

  // 5. Create School B Owner in Auth
  console.log("\n2. Provisioning School B Chancellor in Auth...");
  const schoolBOwnerEmail = "owner.rosey@lerosey.ch";
  const { data: listUsers } = await supabase.auth.admin.listUsers();
  let userBId = listUsers?.users?.find((u) => u.email === schoolBOwnerEmail)?.id;

  if (!userBId) {
    const { data: newUserB } = await supabase.auth.admin.createUser({
      email: schoolBOwnerEmail,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: { full_name: "Philippe Gray, Baron", role: "OWNER" },
    });
    userBId = newUserB.user.id;
  }

  await supabase.from("users_profiles").upsert({
    auth_user_id: userBId,
    school_id: schoolB.id,
    role: "OWNER",
    full_name: "Philippe Gray, Baron",
    email: schoolBOwnerEmail,
    title: "President & Director General",
    status: "ACTIVE",
    metadata: { demo_password: defaultPassword },
  }, { onConflict: "auth_user_id" });
  console.log(`✅ School B Owner created: ${schoolBOwnerEmail}`);

  // 6. Seed Invoices for School A and School B
  console.log("\n3. Seeding Invoices & Ledgers for Tenant A & Tenant B...");
  const invA = {
    id: "aaaa0000-0000-0000-0000-000000000001",
    school_id: schoolA.id,
    invoice_number: "INV-2025-0842",
    student_id: "c0000000-0000-0000-0000-000000000008", // Genevieve
    issue_date: "2025-04-02",
    due_date: "2025-05-01",
    total_amount: 5600.0,
    balance_due: 1400.0,
    status: "OVERDUE",
    notes: "School A - Term 2 Tuition & Residency Module",
  };

  const invB = {
    id: "bbbb0000-0000-0000-0000-000000000002",
    school_id: schoolB.id,
    invoice_number: "INV-ROSEY-2025-9901",
    issue_date: "2025-04-01",
    due_date: "2025-04-30",
    total_amount: 18500.0,
    balance_due: 0.0,
    status: "PAID",
    notes: "School B - Le Rosey Alpine Winter Term Boarding",
  };
  await supabase.from("invoices").upsert([invA, invB]);

  // 7. Seed Notices for School A and School B
  console.log("\n4. Seeding Institutional Bulletins...");
  const authorA = (await supabase.from("users_profiles").select("id").eq("email", "admin@kingscollege.edu").single()).data?.id;
  const authorB = (await supabase.from("users_profiles").select("id").eq("email", schoolBOwnerEmail).single()).data?.id;

  if (authorA) {
    await supabase.from("notices").upsert({
      id: "aaaa1111-0000-0000-0000-000000000001",
      school_id: schoolA.id,
      author_id: authorA,
      title: "Whitmore Hall Alpine Topography Excursion (King's College)",
      content_markdown: "Expedition brief and emergency telemetry for the Zermatt field trip.",
      target_audiences: ["ALL_SCHOOL", "PARENTS"],
      location_tag: "Geneva Campus",
      is_pinned: true,
    });
  }

  if (authorB) {
    await supabase.from("notices").upsert({
      id: "bbbb1111-0000-0000-0000-000000000002",
      school_id: schoolB.id,
      author_id: authorB,
      title: "Le Rosey Gstaad Winter Campus Transition Notice",
      content_markdown: "Annual migration instructions to the Gstaad campus for winter trimester.",
      target_audiences: ["ALL_SCHOOL"],
      location_tag: "Rolle Campus",
      is_pinned: true,
    });
  }

  console.log("\n==================================================");
  console.log("✅ MULTI-TENANT DATA SUCCESSFULLY SEEDED!");
  console.log("==================================================");
}

seedPhase2();
