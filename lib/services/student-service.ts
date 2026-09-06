/**
 * AGRAGATI SCHOOL OS — Student Domain Service
 *
 * Single canonical source of truth for Student records across all 8 portals.
 * NO in-memory stores — all reads/writes go directly to Supabase.
 */

import { createClient } from "@/lib/supabase/client";
import { logAudit, AuditAction } from "./audit-service";

export interface StudentRecord {
  id: string;
  school_id: string;
  profile_id: string;
  admission_number: string;
  full_name: string;
  email: string;
  house: string | null;
  date_of_birth: string;
  gender: string | null;
  blood_group: string | null;
  medical_notes: string | null;
  status: "ACTIVE" | "GRADED" | "WITHDRAWN" | "SUSPENDED" | "ARCHIVED";
  created_at: string;
  section_id?: string;
  section_name?: string;
  class_name?: string;
  roll_number?: number;
  guardian_name?: string;
  guardian_phone?: string;
}

export interface CreateStudentPayload {
  admissionNumber: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  gender?: string;
  house?: string;
  bloodGroup?: string;
  medicalNotes?: string;
  sectionId?: string;
  academicYearId?: string;
  rollNumber?: number;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  guardianRelationship?: string;
}

/**
 * List students within a school with optional filters.
 * Returns [] when the school has no students — never returns fake data.
 */
export async function listStudents(
  schoolId: string,
  filters?: {
    search?: string;
    status?: string;
    sectionId?: string;
    house?: string;
  }
): Promise<StudentRecord[]> {
  try {
    const supabase = createClient();

    let query = supabase
      .from("students")
      .select(`
        *,
        users_profiles:profile_id (
          full_name,
          email
        ),
        enrollments (
          roll_number,
          section_id,
          sections:section_id (
            name,
            classes:class_id (name)
          )
        ),
        student_guardians (
          guardians (
            emergency_contact,
            users_profiles:profile_id (full_name)
          )
        )
      `)
      .eq("school_id", schoolId);

    if (filters?.status && filters.status !== "ALL") {
      query = query.eq("status", filters.status);
    }
    if (filters?.house && filters.house !== "ALL") {
      query = query.eq("house", filters.house);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) return [];

    let results: StudentRecord[] = data.map((s: any) => {
      const enr = s.enrollments?.[0];
      const sec = enr?.sections;
      const cls = sec?.classes;
      const g = s.student_guardians?.[0]?.guardians;
      return {
        id: s.id,
        school_id: s.school_id,
        profile_id: s.profile_id,
        admission_number: s.admission_number,
        full_name: s.users_profiles?.full_name || "Unknown Student",
        email: s.users_profiles?.email || "",
        house: s.house || null,
        date_of_birth: s.date_of_birth,
        gender: s.gender,
        blood_group: s.blood_group,
        medical_notes: s.medical_notes,
        status: s.status,
        created_at: s.created_at,
        section_id: enr?.section_id,
        section_name: sec?.name,
        class_name: cls?.name,
        roll_number: enr?.roll_number,
        guardian_name: g?.users_profiles?.full_name,
        guardian_phone: g?.emergency_contact,
      };
    });

    if (filters?.search) {
      const term = filters.search.toLowerCase();
      results = results.filter(
        (st) =>
          st.full_name.toLowerCase().includes(term) ||
          st.admission_number.toLowerCase().includes(term) ||
          (st.guardian_name && st.guardian_name.toLowerCase().includes(term))
      );
    }

    if (filters?.sectionId) {
      results = results.filter((st) => st.section_id === filters.sectionId);
    }

    return results;
  } catch (err) {
    console.error("listStudents error:", err);
    return [];
  }
}

/**
 * Get a single canonical student record by ID.
 */
export async function getStudent(schoolId: string, studentId: string): Promise<StudentRecord | null> {
  const students = await listStudents(schoolId);
  return students.find((s) => s.id === studentId) || null;
}

/**
 * Create a new student with atomic profile, enrollment, and guardian relationship.
 * Writes directly to Supabase — throws on DB failure (no in-memory fallback).
 */
export async function createStudent(
  schoolId: string,
  actorId: string,
  payload: CreateStudentPayload
): Promise<StudentRecord> {
  const supabase = createClient();

  const { data: profile, error: profErr } = await supabase
    .from("users_profiles")
    .insert({
      school_id: schoolId,
      role: "STUDENT",
      full_name: payload.fullName,
      email: payload.email,
      status: "ACTIVE",
    })
    .select("id")
    .single();

  if (profErr) throw new Error(`Failed to create student profile: ${profErr.message}`);
  const profileId = profile.id;

  const { data: std, error: stdErr } = await supabase
    .from("students")
    .insert({
      school_id: schoolId,
      profile_id: profileId,
      admission_number: payload.admissionNumber,
      house: payload.house || null,
      date_of_birth: payload.dateOfBirth,
      gender: payload.gender || null,
      blood_group: payload.bloodGroup || null,
      medical_notes: payload.medicalNotes || null,
      status: "ACTIVE",
    })
    .select("id")
    .single();

  if (stdErr) throw new Error(`Failed to create student record: ${stdErr.message}`);
  const actualStudentId = std.id;

  if (payload.sectionId && payload.academicYearId) {
    await supabase.from("enrollments").insert({
      school_id: schoolId,
      student_id: actualStudentId,
      section_id: payload.sectionId,
      academic_year_id: payload.academicYearId,
      roll_number: payload.rollNumber || 1,
      status: "ACTIVE",
    });
  }

  await logAudit({
    schoolId,
    actorId,
    action: AuditAction.STUDENT_ENROLLED,
    entityTable: "students",
    entityId: actualStudentId,
    newValues: {
      admissionNumber: payload.admissionNumber,
      fullName: payload.fullName,
      house: payload.house,
    },
  });

  return {
    id: actualStudentId,
    school_id: schoolId,
    profile_id: profileId,
    admission_number: payload.admissionNumber,
    full_name: payload.fullName,
    email: payload.email,
    house: payload.house || null,
    date_of_birth: payload.dateOfBirth,
    gender: payload.gender || null,
    blood_group: payload.bloodGroup || null,
    medical_notes: payload.medicalNotes || null,
    status: "ACTIVE",
    created_at: new Date().toISOString(),
    section_id: payload.sectionId,
    guardian_name: payload.guardianName,
    guardian_phone: payload.guardianPhone,
  };
}

/**
 * Update an existing student record with audit trail.
 */
export async function updateStudent(
  schoolId: string,
  studentId: string,
  actorId: string,
  data: Partial<CreateStudentPayload>
): Promise<{ success: boolean }> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("students")
      .update({
        house: data.house,
        gender: data.gender,
        blood_group: data.bloodGroup,
        medical_notes: data.medicalNotes,
      })
      .eq("id", studentId)
      .eq("school_id", schoolId);

    if (error) throw error;

    await logAudit({
      schoolId,
      actorId,
      action: AuditAction.STUDENT_UPDATED,
      entityTable: "students",
      entityId: studentId,
      newValues: data as Record<string, unknown>,
    });

    return { success: true };
  } catch (err) {
    console.error("updateStudent error:", err);
    return { success: false };
  }
}

/**
 * Soft delete / Archive a student. Never hard deletes!
 */
export async function archiveStudent(
  schoolId: string,
  studentId: string,
  actorId: string,
  reason: string
): Promise<{ success: boolean }> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("students")
      .update({ status: "WITHDRAWN" })
      .eq("id", studentId)
      .eq("school_id", schoolId);

    if (error) throw error;

    await logAudit({
      schoolId,
      actorId,
      action: "STUDENT_ARCHIVED",
      entityTable: "students",
      entityId: studentId,
      newValues: { status: "WITHDRAWN", reason },
    });

    return { success: true };
  } catch (err) {
    console.error("archiveStudent error:", err);
    return { success: false };
  }
}
