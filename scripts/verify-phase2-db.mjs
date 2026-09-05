import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mbvnljezznpgzworwpag.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idm5samV6em5wZ3p3b3J3cGFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUzMTIwNSwiZXhwIjoyMTA0MTA3MjA1fQ.HDRClM_DmdHxb7PdRL28idFn-tKG_b72AqeHcJe57_U";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const tablesToCheck = [
  "schools",
  "users_profiles",
  "academic_years",
  "academic_terms",
  "classes",
  "sections",
  "teachers",
  "subjects",
  "teacher_assignments",
  "timetables",
  "students",
  "guardians",
  "student_guardians",
  "enrollments",
  "attendance_records",
  "attendance_entries",
  "homework_assignments",
  "homework_submissions",
  "assessments",
  "marks_entries",
  "fee_structures",
  "fee_categories",
  "fee_allocations",
  "invoices",
  "invoice_items",
  "payments",
  "bank_statements",
  "bank_transactions",
  "payment_reconciliations",
  "approvals",
  "notices",
  "audit_logs",
];

async function checkDatabase() {
  console.log("==================================================");
  console.log("🔍 CHECKING ALL 32 DATABASE TABLES IN SUPABASE");
  console.log("==================================================\n");

  const results = [];

  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      results.push({ Table: table, Status: "❌ MISSING / ERROR", Error: error.message });
    } else {
      results.push({ Table: table, Status: "✅ OK", Rows: (data || []).length });
    }
  }

  console.table(results);
}

checkDatabase();
