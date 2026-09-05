import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mbvnljezznpgzworwpag.supabase.co";
const anonKey = "sb_publishable_XRjpZNU0JXOTOgosqnx2kQ_m-bpWC_N";
const defaultPassword = "Agragati@2025";

const schoolA_Id = "11111111-1111-1111-1111-111111111111"; // The King's College & Academy
const schoolB_Id = "99999999-9999-9999-9999-999999999999"; // Institut Le Rosey

async function testTenantIsolation() {
  console.log("==================================================");
  console.log("🔒 PHASE 2: AUTOMATED TENANT ISOLATION SECURITY TEST");
  console.log("==================================================\n");

  let allTestsPassed = true;

  // TEST 1: Authenticate as School A Owner (Julian Vance)
  console.log("--------------------------------------------------");
  console.log("TEST 1: School A Owner (owner@kingscollege.edu)");
  console.log("--------------------------------------------------");
  const clientA = createClient(supabaseUrl, anonKey);
  const { data: authA, error: errA } = await clientA.auth.signInWithPassword({
    email: "owner@kingscollege.edu",
    password: defaultPassword,
  });

  if (errA) {
    console.error("❌ Failed to authenticate School A user:", errA.message);
    allTestsPassed = false;
  } else {
    console.log(`✅ Authenticated as: ${authA.user.email}`);

    // Query Invoices
    const { data: invA, error: invErrA } = await clientA.from("invoices").select("invoice_number, school_id");
    const hasSchoolBInvoices = invA?.some((inv) => inv.school_id === schoolB_Id);

    console.log(`   📊 Invoices returned: ${invA?.length || 0}`);
    if (hasSchoolBInvoices) {
      console.error("   ❌ SECURITY LEAK: School A saw School B invoices!");
      allTestsPassed = false;
    } else {
      console.log("   ✅ PASS: School A cannot see School B invoices.");
    }

    // Query Notices
    const { data: notA } = await clientA.from("notices").select("title, school_id");
    const hasSchoolBNotices = notA?.some((n) => n.school_id === schoolB_Id);
    if (hasSchoolBNotices) {
      console.error("   ❌ SECURITY LEAK: School A saw School B bulletins!");
      allTestsPassed = false;
    } else {
      console.log("   ✅ PASS: School A cannot see School B bulletins.");
    }
  }

  // TEST 2: Authenticate as School B Owner (Philippe Gray)
  console.log("\n--------------------------------------------------");
  console.log("TEST 2: School B Owner (owner.rosey@lerosey.ch)");
  console.log("--------------------------------------------------");
  const clientB = createClient(supabaseUrl, anonKey);
  const { data: authB, error: errB } = await clientB.auth.signInWithPassword({
    email: "owner.rosey@lerosey.ch",
    password: defaultPassword,
  });

  if (errB) {
    console.error("❌ Failed to authenticate School B user:", errB.message);
    allTestsPassed = false;
  } else {
    console.log(`✅ Authenticated as: ${authB.user.email}`);

    // Query Invoices
    const { data: invB } = await clientB.from("invoices").select("invoice_number, school_id");
    const hasSchoolAInvoices = invB?.some((inv) => inv.school_id === schoolA_Id);

    console.log(`   📊 Invoices returned: ${invB?.length || 0}`);
    if (hasSchoolAInvoices) {
      console.error("   ❌ SECURITY LEAK: School B saw School A invoices!");
      allTestsPassed = false;
    } else {
      console.log("   ✅ PASS: School B cannot see School A invoices.");
    }

    // Query Notices
    const { data: notB } = await clientB.from("notices").select("title, school_id");
    const hasSchoolANotices = notB?.some((n) => n.school_id === schoolA_Id);
    if (hasSchoolANotices) {
      console.error("   ❌ SECURITY LEAK: School B saw School A bulletins!");
      allTestsPassed = false;
    } else {
      console.log("   ✅ PASS: School B cannot see School A bulletins.");
    }
  }

  // TEST 3: Authenticate as SUPER ADMIN (Eleanor Vance)
  console.log("\n--------------------------------------------------");
  console.log("TEST 3: Super Admin Global Access (superadmin@agragati.edu)");
  console.log("--------------------------------------------------");
  const clientSuper = createClient(supabaseUrl, anonKey);
  const { data: authSuper, error: errSuper } = await clientSuper.auth.signInWithPassword({
    email: "superadmin@agragati.edu",
    password: defaultPassword,
  });

  if (errSuper) {
    console.error("❌ Failed to authenticate Super Admin:", errSuper.message);
    allTestsPassed = false;
  } else {
    console.log(`✅ Authenticated as: ${authSuper.user.email}`);

    // Query Schools
    const { data: allSchools } = await clientSuper.from("schools").select("legal_name, slug");
    console.log(`   📊 Schools accessible by Super Admin: ${allSchools?.length || 0}`);
    allSchools?.forEach((s) => console.log(`      - ${s.legal_name} (${s.slug})`));

    if (allSchools && allSchools.length >= 2) {
      console.log("   ✅ PASS: Super Admin has global visibility across all tenants.");
    } else {
      console.error("   ⚠️ Note: Super Admin could not see multiple schools.");
    }
  }

  console.log("\n==================================================");
  if (allTestsPassed) {
    console.log("🏆 ALL PHASE 2 TENANT ISOLATION TESTS PASSED 100%!");
  } else {
    console.log("❌ SOME TENANT ISOLATION TESTS FAILED.");
  }
  console.log("==================================================");
}

testTenantIsolation();
