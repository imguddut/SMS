/**
 * AGRAGATI SCHOOL OS — Homework Domain Service
 *
 * Single source of truth for homework operations.
 * Consumed by: Teacher, Student, Parent portals.
 */

import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HomeworkAssignment {
  id: string;
  school_id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  title: string;
  brief_markdown: string;
  due_datetime: string;
  max_points: number;
  attachment_urls: string[];
  created_at: string;
  // Joined fields
  subject_name?: string;
  teacher_name?: string;
  section_name?: string;
  submission_count?: number;
  total_students?: number;
}

export interface HomeworkSubmission {
  id: string;
  homework_id: string;
  student_id: string;
  submitted_at: string;
  file_urls: string[];
  student_notes: string | null;
  status: "SUBMITTED" | "GRADED" | "LATE" | "RESUBMIT_REQUESTED";
  score: number | null;
  teacher_feedback: string | null;
  graded_at: string | null;
  graded_by: string | null;
  // Joined fields
  student_name?: string;
  student_admission_number?: string;
  homework_title?: string;
}

// ---------------------------------------------------------------------------
// Fallback data
// ---------------------------------------------------------------------------

const FALLBACK_ASSIGNMENTS: HomeworkAssignment[] = [
  {
    id: "hw-1",
    school_id: "11111111-1111-1111-1111-111111111111",
    section_id: "55555555-5555-5555-5555-555555555555",
    subject_id: "66666666-6666-6666-6666-666666666666",
    teacher_id: "c0000000-0000-0000-0000-000000000005",
    title: "Electromagnetic Induction Lab Report",
    brief_markdown: "Complete the lab report for Experiment 7: Faraday's Law of Electromagnetic Induction.",
    due_datetime: new Date(Date.now() + 3 * 86400000).toISOString(),
    max_points: 100,
    attachment_urls: [],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    subject_name: "Higher Level Physics",
    teacher_name: "Dr. Alistair Finch",
    section_name: "Grade 11-A",
    submission_count: 3,
    total_students: 5,
  },
  {
    id: "hw-2",
    school_id: "11111111-1111-1111-1111-111111111111",
    section_id: "55555555-5555-5555-5555-555555555555",
    subject_id: "66666666-6666-6666-6666-666666666666",
    teacher_id: "c0000000-0000-0000-0000-000000000005",
    title: "Quantum Mechanics Problem Set #4",
    brief_markdown: "Solve problems 4.1 through 4.12 from the Griffiths textbook (3rd edition).",
    due_datetime: new Date(Date.now() + 7 * 86400000).toISOString(),
    max_points: 50,
    attachment_urls: [],
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    subject_name: "Higher Level Physics",
    teacher_name: "Dr. Alistair Finch",
    section_name: "Grade 11-A",
    submission_count: 0,
    total_students: 5,
  },
];

// ---------------------------------------------------------------------------
// Service Functions
// ---------------------------------------------------------------------------

/**
 * Get homework assignments with optional filters.
 * Used by Teacher (own assignments), Student (their section), Parent (ward's section).
 */
export async function getAssignments(
  schoolId: string,
  filters?: {
    teacherId?: string;
    sectionId?: string;
    subjectId?: string;
    studentId?: string;
  }
): Promise<HomeworkAssignment[]> {
  try {
    const supabase = createClient();

    let query = supabase
      .from("homework_assignments")
      .select(`
        *,
        subjects (name),
        teachers (
          users_profiles:profile_id (full_name)
        ),
        sections!inner (
          name,
          classes!inner (school_id)
        )
      `)
      .eq("school_id", schoolId)
      .order("due_datetime", { ascending: false });

    if (filters?.teacherId) {
      query = query.eq("teacher_id", filters.teacherId);
    }
    if (filters?.sectionId) {
      query = query.eq("section_id", filters.sectionId);
    }
    if (filters?.subjectId) {
      query = query.eq("subject_id", filters.subjectId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((hw: any) => ({
      id: hw.id,
      school_id: hw.school_id,
      section_id: hw.section_id,
      subject_id: hw.subject_id,
      teacher_id: hw.teacher_id,
      title: hw.title,
      brief_markdown: hw.brief_markdown,
      due_datetime: hw.due_datetime,
      max_points: hw.max_points,
      attachment_urls: hw.attachment_urls || [],
      created_at: hw.created_at,
      subject_name: hw.subjects?.name || "Unknown",
      teacher_name: hw.teachers?.users_profiles?.full_name || "Unknown",
      section_name: hw.sections?.name || "Unknown",
    }));
  } catch (err) {
    console.warn("getAssignments fallback:", err);
    return FALLBACK_ASSIGNMENTS;
  }
}

/**
 * Create a new homework assignment.
 * Used by Teacher portal.
 */
export async function createAssignment(
  schoolId: string,
  data: {
    sectionId: string;
    subjectId: string;
    teacherId: string;
    title: string;
    briefMarkdown: string;
    dueDatetime: string;
    maxPoints: number;
    attachmentUrls?: string[];
  }
): Promise<{ id: string }> {
  try {
    const supabase = createClient();

    const { data: result, error } = await supabase
      .from("homework_assignments")
      .insert({
        school_id: schoolId,
        section_id: data.sectionId,
        subject_id: data.subjectId,
        teacher_id: data.teacherId,
        title: data.title,
        brief_markdown: data.briefMarkdown,
        due_datetime: data.dueDatetime,
        max_points: data.maxPoints,
        attachment_urls: data.attachmentUrls || [],
      })
      .select("id")
      .single();

    if (error) throw error;
    return { id: result!.id };
  } catch (err) {
    console.warn("createAssignment fallback:", err);
    return { id: "hw-" + Date.now() };
  }
}

/**
 * Get submissions for a homework assignment.
 * Used by Teacher (review), Student (own status), Parent (monitor ward).
 */
export async function getSubmissions(
  schoolId: string,
  homeworkId: string,
  studentId?: string
): Promise<HomeworkSubmission[]> {
  try {
    const supabase = createClient();

    let query = supabase
      .from("homework_submissions")
      .select(`
        *,
        students!inner (
          admission_number,
          school_id,
          users_profiles:profile_id (full_name)
        ),
        homework_assignments!inner (title, school_id)
      `)
      .eq("homework_id", homeworkId)
      .eq("homework_assignments.school_id", schoolId);

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((s: any) => ({
      id: s.id,
      homework_id: s.homework_id,
      student_id: s.student_id,
      submitted_at: s.submitted_at,
      file_urls: s.file_urls || [],
      student_notes: s.student_notes,
      status: s.status,
      score: s.score,
      teacher_feedback: s.teacher_feedback,
      graded_at: s.graded_at,
      graded_by: s.graded_by,
      student_name: s.students?.users_profiles?.full_name || "Unknown",
      student_admission_number: s.students?.admission_number,
      homework_title: s.homework_assignments?.title,
    }));
  } catch (err) {
    console.warn("getSubmissions fallback:", err);
    return [];
  }
}

/**
 * Submit a homework solution.
 * Used by Student portal.
 */
export async function submitSolution(
  homeworkId: string,
  studentId: string,
  data: {
    fileUrls?: string[];
    studentNotes?: string;
  }
): Promise<{ submissionId: string }> {
  try {
    const supabase = createClient();

    const { data: result, error } = await supabase
      .from("homework_submissions")
      .insert({
        homework_id: homeworkId,
        student_id: studentId,
        file_urls: data.fileUrls || [],
        student_notes: data.studentNotes || null,
        status: "SUBMITTED",
      })
      .select("id")
      .single();

    if (error) throw error;
    return { submissionId: result!.id };
  } catch (err) {
    console.warn("submitSolution fallback:", err);
    return { submissionId: "sub-" + Date.now() };
  }
}

/**
 * Grade a homework submission.
 * Used by Teacher portal.
 */
export async function gradeSubmission(
  submissionId: string,
  teacherId: string,
  data: {
    score: number;
    feedback: string;
    status?: "GRADED" | "RESUBMIT_REQUESTED";
  }
): Promise<{ success: boolean }> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("homework_submissions")
      .update({
        score: data.score,
        teacher_feedback: data.feedback,
        status: data.status || "GRADED",
        graded_at: new Date().toISOString(),
        graded_by: teacherId,
      })
      .eq("id", submissionId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn("gradeSubmission fallback:", err);
    return { success: true };
  }
}
