const fs = require('fs');

let content = fs.readFileSync('lib/db/platform-admin.ts', 'utf8');

// Remove FALLBACK_SCHOOLS definition and export function clearPlatformDummyData()
content = content.replace(/let FALLBACK_SCHOOLS: SchoolWithDetails\[\] = \[\];\n\nexport function clearPlatformDummyData\(\) \{\n  FALLBACK_SCHOOLS\.length = 0;\n\}\n\n/, '');

// Rewrite fetchAllSchools
const newFetchAllSchools = `export async function fetchAllSchools(filters?: {
  search?: string;
  status?: string;
  jurisdiction?: string;
}) {
  try {
    const supabase = createClient();
    let query = supabase.from("schools").select("*");

    if (filters?.status && filters.status !== "ALL") {
      query = query.eq("status", filters.status);
    }
    if (filters?.jurisdiction && filters.jurisdiction !== "ALL") {
      query = query.eq("jurisdiction", filters.jurisdiction);
    }
    
    // We filter deleted schools if using soft delete
    query = query.is("deleted_at", null);

    const { data: schools, error } = await query;
    if (error || !schools) return [];

    let results = schools as SchoolWithDetails[];

    if (filters?.search) {
      const s = filters.search.toLowerCase();
      results = results.filter(
        (item) =>
          item.legal_name?.toLowerCase().includes(s) ||
          item.slug?.toLowerCase().includes(s) ||
          item.domain?.toLowerCase().includes(s)
      );
    }
    return results;
  } catch (err) {
    console.error("fetchAllSchools catch:", err);
    return [];
  }
}`;

content = content.replace(/export async function fetchAllSchools\([\s\S]*?\}\n\}/, newFetchAllSchools);

// Remove FALLBACK_SCHOOLS.unshift from createSchoolWithAdmin
content = content.replace(/FALLBACK_SCHOOLS\.unshift\(\{[\s\S]*?\}\);\n/, '');

// Remove FALLBACK_SCHOOLS logic from updateSchoolStatus
const newUpdateSchoolStatus = `export async function updateSchoolStatus(id: string, status: SchoolStatus) {
  const supabase = createClient();
  const { data: school, error } = await supabase
    .from("schools")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateSchoolStatus error:", error);
    throw error;
  }

  await logAudit({
    schoolId: id,
    actorId: "b0000000-0000-0000-0000-000000000001",
    action: "SCHOOL_STATUS_UPDATED",
    entityTable: "schools",
    entityId: id,
    newValues: { status },
  });

  return { success: true, school };
}`;

content = content.replace(/export async function updateSchoolStatus\([\s\S]*?\}\n\}/, newUpdateSchoolStatus);

// Fix deleteSchool to do soft delete
const newDeleteSchool = `export async function deleteSchool(id: string) {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("schools")
      .update({ deleted_at: new Date().toISOString(), status: 'ARCHIVED' })
      .eq("id", id);
      
    if (error) throw error;
    
    await logAudit({
      schoolId: id,
      actorId: "b0000000-0000-0000-0000-000000000001",
      action: "SCHOOL_ARCHIVED" as any,
      entityTable: "schools",
      entityId: id,
    });
    
    return { success: true };
  } catch (err) {
    console.error("deleteSchool error:", err);
    throw err;
  }
}`;

content = content.replace(/const deletedPlatformSchoolIds = new Set<string>\(\);[\s\S]*?export async function deleteSchool[\s\S]*?return \{ success: true \};\n\}/, newDeleteSchool);

fs.writeFileSync('lib/db/platform-admin.ts', content);
