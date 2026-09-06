const fs = require('fs');

const actionStr = `
export async function fetchAllSchoolsAction(filters?: { search?: string; status?: string; jurisdiction?: string }) {
  const supabase = getServiceSupabase();
  let query = supabase
    .from("schools")
    .select(\`
      *,
      users_profiles (
        id,
        full_name,
        email,
        role,
        title
      ),
      academic_years (
        id,
        name,
        is_current
      )
    \`)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "ALL") {
    query = query.eq("status", filters.status);
  }
  if (filters?.jurisdiction && filters.jurisdiction !== "ALL") {
    query = query.eq("jurisdiction", filters.jurisdiction);
  }

  const { data: schools, error } = await query;
  if (error || !schools) return [];
  return schools;
}
`;

fs.appendFileSync('app/actions/schools.ts', actionStr);

// Now update the page to use it
let pageContent = fs.readFileSync('app/(platform-admin)/platform-admin/schools/page.tsx', 'utf8');
pageContent = pageContent.replace(/import \{ updateSchoolStatusAction, deleteSchoolAction \} from "@\/app\/actions\/schools";/, 'import { updateSchoolStatusAction, deleteSchoolAction, fetchAllSchoolsAction } from "@/app/actions/schools";');
pageContent = pageContent.replace(/import \{\n  fetchAllSchools,\n  SchoolWithDetails,/, 'import {\n  SchoolWithDetails,');
pageContent = pageContent.replace(/const data = await fetchAllSchools\(/, 'const data = await fetchAllSchoolsAction(');
fs.writeFileSync('app/(platform-admin)/platform-admin/schools/page.tsx', pageContent);

