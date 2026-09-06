const fs = require('fs');
let content = fs.readFileSync('lib/db/platform-admin.ts', 'utf8');

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

content = content.replace(/export async function updateSchoolStatus\([\s\S]*?return \{ success: true, school \};\n\}/, newUpdateSchoolStatus);

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

content = content.replace(/export async function deleteSchool\([\s\S]*?return \{ success: true \};\n\}/, newDeleteSchool);

fs.writeFileSync('lib/db/platform-admin.ts', content);
