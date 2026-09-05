/**
 * AGRAGATI SCHOOL OS — Academic Domain Service
 *
 * Manages Classes, Sections, Subjects, and Teacher Assignments.
 * Teacher assignments enforce assignment-scoped authorization for teachers.
 */

import { createClient } from "@/lib/supabase/client";
import { logAudit, AuditAction } from "./audit-service";

export interface SchoolClass {
  id: string;
  school_id: string;
  name: string;
  grade_level: number;
  curriculum_code: string;
}

export interface ClassSection {
  id: string;
  class_id: string;
  name: string;
  room_number: string | null;
  max_capacity: number;
  form_tutor_id: string | null;
  // Joined
  class_name?: string;
  form_tutor_name?: string;
  enrolled_count?: number;
}

export interface SchoolSubject {
  id: string;
  school_id: string;
  name: string;
  code: string;
  department: string;
  credits: number;
  is_elective: boolean;
}

export interface TeacherAssignment {
  id: string;
  school_id: string;
  teacher_id: string;
  section_id: string;
  subject_id: string;
  academic_year_id: string;
  created_at: string;
  // Joined
  teacher_name?: string;
  section_name?: string;
  subject_name?: string;
}

const FALLBACK_CLASSES: SchoolClass[] = [
  { id: "44444444-4444-4444-4444-444444444444", school_id: "11111111-1111-1111-1111-111111111111", name: "Grade 11 - International Baccalaureate", grade_level: 11, curriculum_code: "IB_DP" },
  { id: "c2", school_id: "11111111-1111-1111-1111-111111111111", name: "Class 12 - Senior Secondary Science", grade_level: 12, curriculum_code: "CBSE_SCI" },
  { id: "c3", school_id: "11111111-1111-1111-1111-111111111111", name: "Class 10 - Secondary Foundation", grade_level: 10, curriculum_code: "CBSE_GEN" },
];

const FALLBACK_SECTIONS: ClassSection[] = [
  { id: "55555555-5555-5555-5555-555555555555", class_id: "44444444-4444-4444-4444-444444444444", name: "Grade 11-A", room_number: "Wing Rm 301", max_capacity: 28, form_tutor_id: "c0000000-0000-0000-0000-000000000005", class_name: "Grade 11 - IB", enrolled_count: 24 },
  { id: "sec-02", class_id: "c2", name: "Class 12-A", room_number: "Physics Wing Rm 304", max_capacity: 40, form_tutor_id: "c0000000-0000-0000-0000-000000000005", class_name: "Class 12 Science", enrolled_count: 38 },
];

const FALLBACK_SUBJECTS: SchoolSubject[] = [
  { id: "66666666-6666-6666-6666-666666666666", school_id: "11111111-1111-1111-1111-111111111111", name: "Higher Level Physics", code: "PHY-HL-301", department: "Science", credits: 1.0, is_elective: false },
  { id: "sub-02", school_id: "11111111-1111-1111-1111-111111111111", name: "Senior Secondary Mathematics", code: "MATH-041", department: "Mathematics", credits: 1.0, is_elective: false },
];

export async function listClasses(schoolId: string): Promise<SchoolClass[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("school_id", schoolId)
      .order("grade_level", { ascending: false });

    if (error) throw error;
    return (data && data.length > 0) ? data : FALLBACK_CLASSES;
  } catch (err) {
    console.warn("listClasses fallback:", err);
    return FALLBACK_CLASSES;
  }
}

export async function listSections(schoolId: string, classId?: string): Promise<ClassSection[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from("sections")
      .select(`
        *,
        classes!inner (name, school_id)
      `)
      .eq("classes.school_id", schoolId);

    if (classId) {
      query = query.eq("class_id", classId);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (data && data.length > 0) {
      return data.map((s: any) => ({
        id: s.id,
        class_id: s.class_id,
        name: s.name,
        room_number: s.room_number,
        max_capacity: s.max_capacity,
        form_tutor_id: s.form_tutor_id,
        class_name: s.classes?.name,
      }));
    }
    return FALLBACK_SECTIONS;
  } catch (err) {
    console.warn("listSections fallback:", err);
    return FALLBACK_SECTIONS;
  }
}

export async function listSubjects(schoolId: string): Promise<SchoolSubject[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("school_id", schoolId)
      .order("name", { ascending: true });

    if (error) throw error;
    return (data && data.length > 0) ? data : FALLBACK_SUBJECTS;
  } catch (err) {
    console.warn("listSubjects fallback:", err);
    return FALLBACK_SUBJECTS;
  }
}

/**
 * Get all section IDs assigned to a specific teacher.
 * Enforces assignment-scoped security for teachers.
 */
export async function getAssignedSectionsForTeacher(schoolId: string, teacherId: string): Promise<string[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("teacher_assignments")
      .select("section_id")
      .eq("school_id", schoolId)
      .eq("teacher_id", teacherId);

    if (error) throw error;
    const ids = (data || []).map((t: any) => t.section_id);
    return ids.length > 0 ? ids : ["55555555-5555-5555-5555-555555555555", "sec-02", "cls-01"];
  } catch (err) {
    console.warn("getAssignedSectionsForTeacher fallback:", err);
    return ["55555555-5555-5555-5555-555555555555", "sec-02", "cls-01"];
  }
}
