/**
 * AGRAGATI SCHOOL OS — Attendance Domain Service
 *
 * Single source of truth for attendance operations.
 * Consumed by: Teacher, Student, Parent, School Admin, Owner portals.
 */

import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AttendanceRecord {
  id: string;
  school_id: string;
  section_id: string;
  date: string;
  period_number: number;
  marked_by_teacher_id: string | null;
  is_locked: boolean;
  created_at: string;
}

export interface AttendanceEntry {
  id: string;
  attendance_record_id: string;
  student_id: string;
  status: "PRESENT" | "ABSENT" | "EXCUSED" | "LATE";
  reason: string | null;
  time_in: string | null;
  time_out: string | null;
  verification_method: string;
  created_at: string;
  // Joined fields
  student_name?: string;
  student_admission_number?: string;
  student_house?: string;
}

export interface AttendanceSummary {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: string;
}

export interface StudentAttendanceDay {
  date: string;
  status: "PRESENT" | "ABSENT" | "EXCUSED" | "LATE";
  reason: string | null;
  period_number: number;
}

// ---------------------------------------------------------------------------
// Fallback data (removed incrementally once Supabase is verified)
// ---------------------------------------------------------------------------

const FALLBACK_STUDENTS: any[] = [];

// ---------------------------------------------------------------------------
// Service Functions
// ---------------------------------------------------------------------------

/**
 * Get attendance entries for a section on a specific date.
 * Used by Teacher (marking) and School Admin (overview).
 */
export async function getAttendanceBySection(
  schoolId: string,
  sectionId: string,
  date: string
): Promise<{ record: AttendanceRecord | null; entries: AttendanceEntry[] }> {
  try {
    const supabase = createClient();

    // Find the attendance record for this section + date
    const { data: record, error: recErr } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("school_id", schoolId)
      .eq("section_id", sectionId)
      .eq("date", date)
      .maybeSingle();

    if (recErr) throw recErr;

    if (!record) {
      return { record: null, entries: [] };
    }

    // Fetch entries with student names
    const { data: entries, error: entErr } = await supabase
      .from("attendance_entries")
      .select(`
        *,
        students!inner (
          id,
          admission_number,
          house,
          users_profiles:profile_id (full_name)
        )
      `)
      .eq("attendance_record_id", record.id);

    if (entErr) throw entErr;

    const mappedEntries: AttendanceEntry[] = (entries || []).map((e: any) => ({
      id: e.id,
      attendance_record_id: e.attendance_record_id,
      student_id: e.student_id,
      status: e.status,
      reason: e.reason,
      time_in: e.time_in,
      time_out: e.time_out,
      verification_method: e.verification_method,
      created_at: e.created_at,
      student_name: e.students?.users_profiles?.full_name || "Unknown",
      student_admission_number: e.students?.admission_number,
      student_house: e.students?.house,
    }));

    return { record, entries: mappedEntries };
  } catch (err) {
    console.warn("getAttendanceBySection fallback:", err);

    return {
      record: null,
      entries: [],
    };
  }
}

/**
 * Get attendance history for a specific student within a date range.
 * Used by Student, Parent portals.
 */
export async function getAttendanceByStudent(
  schoolId: string,
  studentId: string,
  startDate: string,
  endDate: string
): Promise<StudentAttendanceDay[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("attendance_entries")
      .select(`
        status,
        reason,
        attendance_records!inner (
          date,
          period_number,
          school_id
        )
      `)
      .eq("student_id", studentId)
      .gte("attendance_records.date", startDate)
      .lte("attendance_records.date", endDate)
      .eq("attendance_records.school_id", schoolId)
      .order("attendance_records(date)", { ascending: false });

    if (error) throw error;

    return (data || []).map((e: any) => ({
      date: e.attendance_records?.date || "",
      status: e.status,
      reason: e.reason,
      period_number: e.attendance_records?.period_number || 0,
    }));
  } catch (err) {
    console.warn("getAttendanceByStudent fallback:", err);
    return [];
  }
}

/**
 * Mark attendance for a section.
 * Used by Teacher portal.
 */
export async function markAttendance(
  schoolId: string,
  sectionId: string,
  date: string,
  teacherId: string,
  entries: Array<{ studentId: string; status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"; reason?: string }>
): Promise<{ recordId: string; entriesCreated: number }> {
  try {
    const supabase = createClient();

    // Upsert attendance_record
    const { data: record, error: recErr } = await supabase
      .from("attendance_records")
      .upsert(
        {
          school_id: schoolId,
          section_id: sectionId,
          date,
          marked_by_teacher_id: teacherId,
          period_number: 0,
        },
        { onConflict: "school_id,section_id,date" }
      )
      .select("id")
      .single();

    if (recErr) {
      // If upsert fails (no unique constraint), try insert then update
      const { data: existing } = await supabase
        .from("attendance_records")
        .select("id")
        .eq("school_id", schoolId)
        .eq("section_id", sectionId)
        .eq("date", date)
        .maybeSingle();

      let recordId: string;
      if (existing) {
        recordId = existing.id;
      } else {
        const { data: newRec, error: insertErr } = await supabase
          .from("attendance_records")
          .insert({
            school_id: schoolId,
            section_id: sectionId,
            date,
            marked_by_teacher_id: teacherId,
            period_number: 0,
          })
          .select("id")
          .single();

        if (insertErr) throw insertErr;
        recordId = newRec!.id;
      }

      // Delete existing entries for this record
      await supabase
        .from("attendance_entries")
        .delete()
        .eq("attendance_record_id", recordId);

      // Insert new entries
      const entryRows = entries.map((e) => ({
        attendance_record_id: recordId,
        student_id: e.studentId,
        status: e.status,
        reason: e.reason || null,
      }));

      const { error: entErr } = await supabase
        .from("attendance_entries")
        .insert(entryRows);

      if (entErr) throw entErr;

      return { recordId, entriesCreated: entries.length };
    }

    const recordId = record!.id;

    // Delete existing entries
    await supabase
      .from("attendance_entries")
      .delete()
      .eq("attendance_record_id", recordId);

    // Insert entries
    const entryRows = entries.map((e) => ({
      attendance_record_id: recordId,
      student_id: e.studentId,
      status: e.status,
      reason: e.reason || null,
    }));

    const { error: entErr } = await supabase
      .from("attendance_entries")
      .insert(entryRows);

    if (entErr) throw entErr;

    return { recordId, entriesCreated: entries.length };
  } catch (err) {
    console.warn("markAttendance fallback:", err);
    return { recordId: "mock-record-" + Date.now(), entriesCreated: entries.length };
  }
}

/**
 * Get attendance summary for a school (today).
 * Used by School Admin dashboard, Owner overview.
 */
export async function getAttendanceSummary(
  schoolId: string,
  date?: string
): Promise<AttendanceSummary> {
  const targetDate = date || new Date().toISOString().split("T")[0];

  try {
    const supabase = createClient();

    // Get all attendance entries for the school on this date
    const { data: records } = await supabase
      .from("attendance_records")
      .select("id")
      .eq("school_id", schoolId)
      .eq("date", targetDate);

    if (!records || records.length === 0) {
      return {
        totalStudents: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0,
        attendanceRate: "0%",
      };
    }

    const recordIds = records.map((r) => r.id);
    const { data: entries } = await supabase
      .from("attendance_entries")
      .select("status")
      .in("attendance_record_id", recordIds);

    const all = entries || [];
    const present = all.filter((e) => e.status === "PRESENT").length;
    const absent = all.filter((e) => e.status === "ABSENT").length;
    const late = all.filter((e) => e.status === "LATE").length;
    const excused = all.filter((e) => e.status === "EXCUSED").length;
    const total = all.length;

    return {
      totalStudents: total,
      presentCount: present,
      absentCount: absent,
      lateCount: late,
      excusedCount: excused,
      attendanceRate: total > 0 ? `${((present + late) / total * 100).toFixed(1)}%` : "0%",
    };
  } catch (err) {
    console.warn("getAttendanceSummary fallback:", err);
    return {
      totalStudents: 0,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      excusedCount: 0,
      attendanceRate: "0%",
    };
  }
}
