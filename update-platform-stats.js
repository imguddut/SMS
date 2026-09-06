const fs = require('fs');

let content = fs.readFileSync('lib/db/platform-admin.ts', 'utf8');

const newFetchPlatformStats = `export async function fetchPlatformStats() {
  try {
    const supabase = createClient();
    
    // 1. Fetch real schools
    const { data: schools } = await supabase.from("schools").select("*");
    const schoolList = schools || [];
    
    // 2. Fetch real counts
    const { count: studentCount } = await supabase.from("students").select("*", { count: "exact", head: true });
    const { count: userCount } = await supabase.from("users_profiles").select("*", { count: "exact", head: true });
    
    // 3. Fetch real revenue from platform_invoices
    // Assuming 'amount' for PAID invoices represents revenue
    const { data: invoices } = await supabase
      .from("platform_invoices")
      .select("amount, status");
      
    let arrInr = 0;
    if (invoices && invoices.length > 0) {
      // Very naive ARR calculation: SUM of all PAID invoices * 12 (assuming monthly)
      // Since we don't have historical data, let's just SUM everything as total revenue
      const totalCollected = invoices
        .filter(inv => inv.status === 'PAID')
        .reduce((sum, inv) => sum + Number(inv.amount), 0);
      arrInr = totalCollected; // Just showing total collected revenue instead of fake ARR
    }

    const activeSchools = schoolList.filter((s) => s.status === "ACTIVE").length;
    const trialSchools = schoolList.filter((s) => s.status === "TRIAL").length;
    const totalStudents = studentCount || 0;
    const totalUsers = userCount || 0;
    const monthlyRunRate = arrInr > 0 ? arrInr / 12 : 0;

    return {
      totalSchools: schoolList.length,
      activeSchools,
      trialSchools,
      totalStudents,
      totalUsers,
      monthlyRunRate,
      arrInr,
      aiInferenceVolume: "N/A",
      hsmHealth: "N/A",
      clusterStatus: "Operational",
      activeJurisdictions: new Set(schoolList.map((s) => s.jurisdiction).filter(Boolean)).size,
    };
  } catch (err) {
    return {
      totalSchools: 0,
      activeSchools: 0,
      trialSchools: 0,
      totalStudents: 0,
      totalUsers: 0,
      monthlyRunRate: 0,
      arrInr: 0,
      aiInferenceVolume: "N/A",
      hsmHealth: "N/A",
      clusterStatus: "Unknown",
      activeJurisdictions: 0,
    };
  }
}`;

content = content.replace(/export async function fetchPlatformStats\(\) \{[\s\S]*?activeJurisdictions: 0,\n    \};\n  \}\n\}/, newFetchPlatformStats);

fs.writeFileSync('lib/db/platform-admin.ts', content);
