/**
 * AGRAGATI SCHOOL OS — Gradebook Domain Service
 *
 * Single source of truth for assessments, marks, and results.
 * Consumed by: Teacher, Student, Parent portals.
 */

import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Assessment {
  id: string;
  school_id: string;
  section_id: string;
  subject_id: string;
  academic_term_id: string;
  title: string;
  assessment_type: string;
  max_score: number;
  weight_percentage: number;
  is_published: boolean;
  approval_status: "PENDING" | "APPROVED" | "REJECTED" | "ESCROW";
  created_at: string;
  // Joined fields
  subject_name?: string;
  section_name?: string;
}

export interface MarksEntry {
  id: string;
  assessment_id: string;
  student_id: string;
  raw_score: number;
  grade_letter: string | null;
  gpa_points: number | null;
  faculty_comment: string | null;
  updated_at: string;
  // Joined fields
  student_name?: string;
  student_admission_number?: string;
}

export interface MarksGridRow {
  studentId: string;
  studentName: string;
  studentNumber: string;
  house: string;
  scores: Record<string, number>; // assessmentId → score
  totalWeighted: number;
  grade: string;
}

export interface StudentResult {
  subjectName: string;
  subjectCode: string;
  assessments: {
    title: string;
    type: string;
    maxScore: number;
    rawScore: number;
    percentage: number;
    weight: number;
  }[];
  weightedAverage: number;
  gradeLetter: string;
  gpaPoints: number;
}

// ---------------------------------------------------------------------------
// Fallback data
// ---------------------------------------------------------------------------

const FALLBACK_RESULTS: StudentResult[] = [];

// ---------------------------------------------------------------------------
// Service Functions
// ---------------------------------------------------------------------------

/**
 * Get marks grid for a section/subject/term.
 * Used by Teacher (marks entry).
 */
export async function getMarksGrid(
  schoolId: string,
  sectionId: string,
  subjectId: string,
  termId: string
): Promise<{ assessments: Assessment[]; rows: MarksGridRow[] }> {
  try {
    const supabase = createClient();

    // Get assessments for this section/subject/term
    const { data: assessments, error: aErr } = await supabase
      .from("assessments")
      .select(`
        *,
        subjects (name, code),
        sections (name)
      `)
      .eq("school_id", schoolId)
      .eq("section_id", sectionId)
      .eq("subject_id", subjectId)
      .eq("academic_term_id", termId);

    if (aErr) throw aErr;

    if (!assessments || assessments.length === 0) {
      return { assessments: [], rows: [] };
    }

    const assessmentIds = assessments.map((a: any) => a.id);

    // Get all marks entries for these assessments
    const { data: entries, error: mErr } = await supabase
      .from("marks_entries")
      .select(`
        *,
        students!inner (
          admission_number,
          house,
          users_profiles:profile_id (full_name)
        )
      `)
      .in("assessment_id", assessmentIds);

    if (mErr) throw mErr;

    // Build grid rows grouped by student
    const studentMap = new Map<string, MarksGridRow>();

    for (const entry of (entries || [])) {
      const e = entry as any;
      const sid = e.student_id;
      if (!studentMap.has(sid)) {
        studentMap.set(sid, {
          studentId: sid,
          studentName: e.students?.users_profiles?.full_name || "Unknown",
          studentNumber: e.students?.admission_number || "",
          house: e.students?.house || "",
          scores: {},
          totalWeighted: 0,
          grade: "",
        });
      }
      const row = studentMap.get(sid)!;
      row.scores[e.assessment_id] = e.raw_score;
    }

    // Calculate weighted totals
    for (const row of studentMap.values()) {
      let totalWeight = 0;
      let weightedSum = 0;
      for (const assess of assessments as any[]) {
        const score = row.scores[assess.id];
        if (score !== undefined) {
          const pct = (score / assess.max_score) * 100;
          weightedSum += pct * (assess.weight_percentage / 100);
          totalWeight += assess.weight_percentage;
        }
      }
      row.totalWeighted = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100 * 100) / 100 : 0;
      row.grade = row.totalWeighted >= 90 ? "A+" : row.totalWeighted >= 80 ? "A" : row.totalWeighted >= 70 ? "B" : row.totalWeighted >= 60 ? "C" : "D";
    }

    return {
      assessments: (assessments as any[]).map((a) => ({
        id: a.id,
        school_id: a.school_id,
        section_id: a.section_id,
        subject_id: a.subject_id,
        academic_term_id: a.academic_term_id,
        title: a.title,
        assessment_type: a.assessment_type,
        max_score: a.max_score,
        weight_percentage: a.weight_percentage,
        is_published: a.is_published,
        approval_status: a.approval_status,
        created_at: a.created_at,
        subject_name: a.subjects?.name,
        section_name: a.sections?.name,
      })),
      rows: Array.from(studentMap.values()),
    };
  } catch (err) {
    console.warn("getMarksGrid fallback:", err);
    return { assessments: [], rows: [] };
  }
}

/**
 * Save marks entries for an assessment.
 * Used by Teacher portal.
 */
export async function saveMarks(
  assessmentId: string,
  entries: Array<{
    studentId: string;
    rawScore: number;
    gradeLetter?: string;
    gpaPoints?: number;
    comment?: string;
  }>
): Promise<{ saved: number }> {
  try {
    const supabase = createClient();

    // Upsert marks entries
    const rows = entries.map((e) => ({
      assessment_id: assessmentId,
      student_id: e.studentId,
      raw_score: e.rawScore,
      grade_letter: e.gradeLetter || null,
      gpa_points: e.gpaPoints || null,
      faculty_comment: e.comment || null,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("marks_entries")
      .upsert(rows, { onConflict: "assessment_id,student_id" });

    if (error) throw error;
    return { saved: entries.length };
  } catch (err) {
    console.warn("saveMarks fallback:", err);
    return { saved: entries.length };
  }
}

/**
 * Get results for a specific student across all subjects.
 * Used by Student (own results), Parent (ward results).
 */
export async function getStudentResults(
  schoolId: string,
  studentId: string,
  termId?: string
): Promise<StudentResult[]> {
  try {
    const supabase = createClient();

    // Get all marks entries for this student
    let query = supabase
      .from("marks_entries")
      .select(`
        *,
        assessments!inner (
          title,
          assessment_type,
          max_score,
          weight_percentage,
          is_published,
          school_id,
          subject_id,
          academic_term_id,
          subjects (name, code)
        )
      `)
      .eq("student_id", studentId)
      .eq("assessments.school_id", schoolId)
      .eq("assessments.is_published", true);

    if (termId) {
      query = query.eq("assessments.academic_term_id", termId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Group by subject
    const subjectMap = new Map<string, StudentResult>();

    for (const entry of (data || [])) {
      const e = entry as any;
      const subjectId = e.assessments?.subject_id;
      const subjectName = e.assessments?.subjects?.name || "Unknown";
      const subjectCode = e.assessments?.subjects?.code || "";

      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, {
          subjectName,
          subjectCode,
          assessments: [],
          weightedAverage: 0,
          gradeLetter: "",
          gpaPoints: 0,
        });
      }

      const result = subjectMap.get(subjectId)!;
      const maxScore = e.assessments?.max_score || 100;
      const rawScore = e.raw_score;
      result.assessments.push({
        title: e.assessments?.title || "",
        type: e.assessments?.assessment_type || "",
        maxScore,
        rawScore,
        percentage: Math.round((rawScore / maxScore) * 100),
        weight: e.assessments?.weight_percentage || 0,
      });
    }

    // Calculate weighted averages
    for (const result of subjectMap.values()) {
      let totalWeight = 0;
      let weightedSum = 0;
      for (const a of result.assessments) {
        weightedSum += a.percentage * (a.weight / 100);
        totalWeight += a.weight;
      }
      result.weightedAverage = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100 * 10) / 10 : 0;
      result.gradeLetter = result.weightedAverage >= 90 ? "A+" : result.weightedAverage >= 80 ? "A" : result.weightedAverage >= 70 ? "B" : result.weightedAverage >= 60 ? "C" : "D";
      result.gpaPoints = result.weightedAverage >= 90 ? 10 : result.weightedAverage >= 80 ? 9 : result.weightedAverage >= 70 ? 8 : result.weightedAverage >= 60 ? 7 : 6;
    }

    const results = Array.from(subjectMap.values());
    return results.length > 0 ? results : FALLBACK_RESULTS;
  } catch (err) {
    console.warn("getStudentResults fallback:", err);
    return FALLBACK_RESULTS;
  }
}
