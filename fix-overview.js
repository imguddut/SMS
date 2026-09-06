const fs = require('fs');

const actionStr = `
export async function fetchPlatformStatsAction() {
  const supabase = getServiceSupabase();
  
  // 1. Fetch real schools
  const { data: schools } = await supabase.from("schools").select("*").is("deleted_at", null);
  const schoolList = schools || [];
  
  // 2. Fetch real counts
  const { count: studentCount } = await supabase.from("students").select("*", { count: "exact", head: true });
  const { count: userCount } = await supabase.from("users_profiles").select("*", { count: "exact", head: true });
  
  // 3. Fetch real revenue from platform_invoices
  const { data: invoices } = await supabase
    .from("platform_invoices")
    .select("amount, status");
    
  let arrInr = 0;
  let invoicedInr = 0;
  if (invoices && invoices.length > 0) {
    invoicedInr = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const totalCollected = invoices
      .filter((inv) => inv.status === "PAID")
      .reduce((sum, inv) => sum + Number(inv.amount), 0);
    arrInr = totalCollected;
  }

  return {
    totalSchools: schoolList.length,
    activeStudents: studentCount || 0,
    activeUsers: userCount || 0,
    arrInr,
    invoicedInr,
    schools: schoolList,
  };
}
`;

fs.appendFileSync('app/actions/schools.ts', actionStr);

// Update overview page
let pageContent = fs.readFileSync('app/(platform-admin)/platform-admin/overview/page.tsx', 'utf8');
pageContent = pageContent.replace(/import \{ fetchPlatformStats \} from "@\/lib\/db\/platform-admin";/, 'import { fetchPlatformStatsAction } from "@/app/actions/schools";\nimport { SchoolWithDetails } from "@/lib/db/platform-admin";');
pageContent = pageContent.replace(/const data = await fetchPlatformStats\(\);/g, 'const data = await fetchPlatformStatsAction();');
fs.writeFileSync('app/(platform-admin)/platform-admin/overview/page.tsx', pageContent);

