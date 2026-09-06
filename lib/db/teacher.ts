import { createClient } from "@/lib/supabase/client";
import { sharedStore, SharedAttendanceItem, SharedHomeworkAssignment, SharedHomeworkSubmission, SharedGradebookEntry } from "@/lib/db/shared-store";
import { logAudit, AuditAction } from "@/lib/services/audit-service";

export interface TeacherPeriodSession {
  id: string;
  periodNumber: number;
  timeRange: string;
  className: string;
  form: string;
  roomNumber: string;
  enrolledCount: number;
  attendanceMarked: boolean;
  status: "COMPLETED" | "ACTIVE_NOW" | "UPCOMING";
  topic: string;
}

export interface TeacherClassOverview {
  id: string;
  className: string;
  form: string;
  gradeLevel: number;
  curriculumCode: string;
  roomNumber: string;
  enrolledCount: number;
  syllabusProgressPct: number;
  averageGrade: string;
  nextAssignment: string;
  nextDue: string;
}

export interface StudentAttendanceItem {
  id: string;
  studentId: string;
  studentName: string;
  form: string;
  house: string;
  turnstileTime: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  remarks?: string;
}

export interface HomeworkAssignmentItem {
  id: string;
  title: string;
  className: string;
  form: string;
  subject: string;
  assignedDate: string;
  dueDate: string;
  maxMarks: number;
  submissionsCount: number;
  totalStudents: number;
  status: "ACTIVE" | "REVIEW_PENDING" | "GRADED";
}

export interface StudentHomeworkSubmission {
  id: string;
  homeworkId: string;
  homeworkTitle: string;
  studentId: string;
  studentName: string;
  form: string;
  submittedAt: string;
  isLate: boolean;
  fileName: string;
  fileSize: string;
  marksAwarded: number | null;
  maxMarks: number;
  feedback: string;
  status: "SUBMITTED" | "GRADED" | "RESUBMIT_REQUESTED";
}

export interface GradebookRow {
  studentId: string;
  studentName: string;
  studentNumber: string;
  house: string;
  paper1: number; // Mid-Term / Theory Component (Max 80)
  paper2: number; // Pre-Board / Assessment Component
  internalAssessment: number; // Practical / Internal (Max 20)
  oralSeminar: number; // Viva / Project (Max 20)
  weightedTotal: number; // 0-100%
  predictedGrade: number | string; // CBSE Letter Grade / IB Scale
  academicStanding: "HIGH_HONORS" | "HONORS" | "GOOD_STANDING";
}

// ============================================================================
// TEACHER PORTAL SUPABASE CRUD OPERATIONS (WITH REACTIVE SHARED STORE)
// ============================================================================

export const fetchTeacherDaySchedule = fetchTeacherDailyAgenda;

// READ: Teacher Daily Agenda & Sessions
export async function fetchTeacherDailyAgenda(userId?: string): Promise<{
  sessions: TeacherPeriodSession[];
  metrics: {
    allocatedSessions: number;
    scholarsUnderCare: number;
    pendingMarking: number;
    officeHours: string;
    attendanceRateToday: string;
  };
}> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("timetables")
      .select(`
        id,
        period_number,
        start_time,
        end_time,
        room_location,
        sections:section_id (
          name
        ),
        subjects:subject_id (
          name
        )
      `)
      .order("period_number", { ascending: true });

    if (!error && data && data.length > 0) {
      const sessions: TeacherPeriodSession[] = data.map((t, idx) => {
        const sec = Array.isArray(t.sections) ? t.sections[0] : t.sections;
        const sub = Array.isArray(t.subjects) ? t.subjects[0] : t.subjects;
        return {
          id: t.id,
          periodNumber: t.period_number,
          timeRange: `${t.start_time?.slice(0, 5)} – ${t.end_time?.slice(0, 5)} IST`,
          className: sec?.name ? `${sec.name} - ${sub?.name || 'Subject'}` : 'Unknown Class',
          form: sec?.name || 'Unknown',
          roomNumber: t.room_location || `Wing Rm ${301 + idx}`,
          enrolledCount: 0,
          attendanceMarked: false,
          status: "UPCOMING",
          topic: sub?.name ? `${sub.name} - Session` : 'Scheduled Session',
        };
      });

      return {
        metrics: {
          allocatedSessions: sessions.length,
          scholarsUnderCare: 0,
          pendingMarking: 0,
          officeHours: "N/A",
          attendanceRateToday: "0.0%",
        },
        sessions,
      };
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchTeacherDailyAgenda:", err);
  }

  return {
    metrics: {
      allocatedSessions: 0,
      scholarsUnderCare: 0,
      pendingMarking: 0,
      officeHours: "N/A",
      attendanceRateToday: "0.0%",
    },
    sessions: [],
  };
}

// READ: Teacher Classes Directory
export async function fetchTeacherClasses(): Promise<TeacherClassOverview[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("sections")
      .select(`
        id,
        name,
        room_number,
        max_capacity,
        classes:class_id (
          name,
          grade_level,
          curriculum_code
        )
      `);

    if (!error && data && data.length > 0) {
      return data.map((s, idx) => {
        const cls = Array.isArray(s.classes) ? s.classes[0] : s.classes;
        return {
          id: s.id,
          className: cls?.name ? `${cls.name} - ${s.name || 'Class'}` : 'Unknown Class',
          form: s.name || '',
          gradeLevel: cls?.grade_level || 0,
          curriculumCode: cls?.curriculum_code || "",
          roomNumber: s.room_number || "",
          enrolledCount: s.max_capacity || 0,
          syllabusProgressPct: 0,
          averageGrade: 'N/A',
          nextAssignment: 'No upcoming assignments',
          nextDue: 'N/A',
        };
      });
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchTeacherClasses:", err);
  }

  return [];
}

// READ: Class Attendance Roster
export async function fetchClassAttendanceRoster(classId?: string): Promise<StudentAttendanceItem[]> {
  const storeItems = sharedStore.getAttendanceRoster(classId);

  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("students")
      .select(`
        id,
        house,
        users_profiles:profile_id (
          full_name
        )
      `)
      .limit(6);

    if (!error && data && data.length > 0) {
      return data.map((st, idx) => {
        const prof = Array.isArray(st.users_profiles) ? st.users_profiles[0] : st.users_profiles;
        const matched = storeItems.find((s) => s.studentId === st.id);
        return {
          id: `att-0${idx + 1}`,
          studentId: st.id,
          studentName: matched?.studentName || prof?.full_name || '',
          form: '',
          house: matched?.house || st.house || '',
          turnstileTime: matched?.turnstileTime || '',
          status: matched?.status || 'PRESENT',
          remarks: matched?.remarks,
        };
      });
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchClassAttendanceRoster:", err);
  }

  return storeItems.map((s) => ({
    id: s.id,
    studentId: s.studentId,
    studentName: s.studentName,
    form: s.form,
    house: s.house,
    turnstileTime: s.turnstileTime,
    status: s.status,
    remarks: s.remarks,
  }));
}

// CREATE / UPDATE: Submit Attendance & Roll-Call Seal
export async function submitAttendance(payload: {
  classId: string;
  attendance: StudentAttendanceItem[];
}): Promise<{ success: boolean; hash: string }> {
  const hash = "ROLLCALL-SEALED-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const today = new Date().toISOString().split("T")[0];

  const sharedItems: SharedAttendanceItem[] = payload.attendance.map((a) => ({
    id: a.id,
    studentId: a.studentId,
    studentName: a.studentName,
    form: a.form,
    house: a.house,
    turnstileTime: a.turnstileTime,
    status: a.status,
    remarks: a.remarks,
    date: today,
  }));

  // Sync to reactive cross-portal store
  sharedStore.setAttendanceRoster(payload.classId, sharedItems);

  // Direct Supabase sync
  const supabase = createClient();
  try {
    const { data: record } = await supabase
      .from("attendance_records")
      .upsert({ date: today, is_locked: true }, { onConflict: "section_id,date,period_number" })
      .select("id")
      .single();

    if (record) {
      for (const item of payload.attendance) {
        await supabase.from("attendance_entries").upsert({
          attendance_record_id: record.id,
          student_id: item.studentId,
          status: item.status,
          reason: item.remarks,
        });
      }
    }
  } catch (err) {
    console.warn("Supabase upsert for submitAttendance:", err);
  }

  await logAudit({
    schoolId: "",
    actorId: "",
    action: AuditAction.ATTENDANCE_MARKED,
    entityTable: "attendance_records",
    entityId: payload.classId,
    newValues: { classId: payload.classId, count: payload.attendance.length, date: today },
  });

  return { success: true, hash };
}

// READ: Teacher Homework List
export async function fetchTeacherHomeworkList(): Promise<HomeworkAssignmentItem[]> {
  const sharedHw = sharedStore.getHomeworkAssignments();

  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("homework_assignments")
      .select(`
        id,
        title,
        created_at,
        due_datetime,
        max_points,
        subjects:subject_id (
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const dbItems = data.map((hw) => {
        const sub = Array.isArray(hw.subjects) ? hw.subjects[0] : hw.subjects;
        return {
          id: hw.id,
          title: hw.title,
          className: sub?.name ? `Subject: ${sub.name}` : 'Homework Assignment',
          form: '',
          subject: sub?.name || "Mathematics",
          assignedDate: hw.created_at?.split("T")[0] || "2025-01-20",
          dueDate: hw.due_datetime?.split("T")[0] || "2025-01-27",
          maxMarks: Number(hw.max_points) || 50,
          submissionsCount: 0,
          totalStudents: 0,
          status: "REVIEW_PENDING" as const,
        };
      });

      return [...sharedHw.map(h => ({
        id: h.id,
        title: h.title,
        className: h.className,
        form: h.form,
        subject: h.subject,
        assignedDate: h.assignedDate,
        dueDate: h.dueDate,
        maxMarks: h.maxMarks,
        submissionsCount: 0,
        totalStudents: 0,
        status: h.status,
      })), ...dbItems.filter(d => !sharedHw.some(s => s.id === d.id))];
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchTeacherHomeworkList:", err);
  }

  return sharedHw.map((h) => ({
    id: h.id,
    title: h.title,
    className: h.className,
    form: h.form,
    subject: h.subject,
    assignedDate: h.assignedDate,
    dueDate: h.dueDate,
    maxMarks: h.maxMarks,
    submissionsCount: 0,
    totalStudents: 0,
    status: h.status,
  }));
}

// CREATE: Create New Homework Assignment
export async function createHomeworkAssignment(payload: {
  title: string;
  className: string;
  form: string;
  subject: string;
  dueDate: string;
  maxMarks: number;
  description: string;
  rubric: string;
}): Promise<HomeworkAssignmentItem> {
  // Sync to shared reactive store (instantly visible in Student and Parent portals)
  const created = sharedStore.createHomeworkAssignment({
    title: payload.title,
    className: payload.className,
    form: payload.form,
    subject: payload.subject,
    dueDate: payload.dueDate,
    maxMarks: payload.maxMarks,
    description: payload.description,
    rubric: payload.rubric,
  });

  const newHw: HomeworkAssignmentItem = {
    id: created.id,
    title: created.title,
    className: created.className,
    form: created.form,
    subject: created.subject,
    assignedDate: created.assignedDate,
    dueDate: created.dueDate,
    maxMarks: created.maxMarks,
    submissionsCount: 0,
    totalStudents: 0,
    status: "ACTIVE",
  };

  const supabase = createClient();
  try {
    await supabase.from("homework_assignments").insert({
      title: payload.title,
      brief_markdown: `${payload.description}\n\nRubric:\n${payload.rubric}`,
      due_datetime: new Date(payload.dueDate).toISOString() || new Date().toISOString(),
      max_points: payload.maxMarks,
    });
  } catch (err) {
    console.warn("Supabase insert for createHomeworkAssignment:", err);
  }

  await logAudit({
    schoolId: "",
    actorId: "",
    action: AuditAction.HOMEWORK_CREATED,
    entityTable: "homework_assignments",
    entityId: newHw.id,
    newValues: { title: payload.title, maxMarks: payload.maxMarks, dueDate: payload.dueDate },
  });

  return newHw;
}

// READ: Student Homework Submissions
export async function fetchHomeworkSubmissions(homeworkId?: string): Promise<StudentHomeworkSubmission[]> {
  const submissions = sharedStore.getHomeworkSubmissions(homeworkId);

  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("homework_submissions")
      .select(`
        id,
        homework_id,
        student_id,
        score,
        teacher_feedback,
        status,
        submitted_at,
        file_urls,
        students:student_id (
          users_profiles:profile_id (
            full_name
          )
        ),
        homework_assignments:homework_id (
          title,
          max_points
        )
      `);

    if (!error && data && data.length > 0) {
      const dbSubs: StudentHomeworkSubmission[] = data.map((sub) => {
        const std = Array.isArray(sub.students) ? sub.students[0] : sub.students;
        const prof = Array.isArray(std?.users_profiles) ? std?.users_profiles[0] : std?.users_profiles;
        const hw = Array.isArray(sub.homework_assignments) ? sub.homework_assignments[0] : sub.homework_assignments;
        return {
          id: sub.id,
          homeworkId: sub.homework_id || "hw-01",
          homeworkTitle: hw?.title || "Homework Assignment",
          studentId: sub.student_id,
          studentName: prof?.full_name || '',
          form: '',
          submittedAt: sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : "2025-01-27",
          isLate: false,
          fileName: sub.file_urls?.[0] || "solution.pdf",
          fileSize: "2.4 MB",
          marksAwarded: sub.score,
          maxMarks: Number(hw?.max_points) || 50,
          feedback: sub.teacher_feedback || "",
          status: (sub.status as any) || "SUBMITTED",
        };
      });

      return [...submissions, ...dbSubs.filter((d) => !submissions.some((s) => s.id === d.id))];
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchHomeworkSubmissions:", err);
  }

  return submissions;
}

// UPDATE: Grade Submission
export async function gradeSubmission(
  submissionIdOrPayload: string | { submissionId: string; marks?: number; score?: number; feedback: string },
  marks?: number,
  feedback?: string
): Promise<{ success: boolean }> {
  const subId = typeof submissionIdOrPayload === "string" ? submissionIdOrPayload : submissionIdOrPayload.submissionId;
  const finalMarks = typeof submissionIdOrPayload === "string" ? marks ?? 0 : (submissionIdOrPayload.marks ?? submissionIdOrPayload.score ?? 0);
  const finalFeedback = typeof submissionIdOrPayload === "string" ? feedback ?? "" : submissionIdOrPayload.feedback;

  // Sync to shared reactive store (instantly updates Student and Parent portals)
  sharedStore.gradeHomework(subId, finalMarks, finalFeedback);

  const supabase = createClient();
  try {
    await supabase.from("homework_submissions").update({
      score: finalMarks,
      teacher_feedback: finalFeedback,
      status: "GRADED",
      graded_at: new Date().toISOString(),
    }).eq("id", subId);
  } catch (err) {
    console.warn("Supabase update for gradeSubmission:", err);
  }

  await logAudit({
    schoolId: "",
    actorId: "",
    action: AuditAction.HOMEWORK_GRADED,
    entityTable: "homework_submissions",
    entityId: subId,
    newValues: { marks: finalMarks, feedback: finalFeedback },
  });

  return { success: true };
}

// READ: Marks Entry Grid & Gradebook
export async function fetchMarksEntryGrid(classId?: string): Promise<GradebookRow[]> {
  const storeRows = sharedStore.getGradebook();
  return storeRows.map((r) => ({
    studentId: r.studentId,
    studentName: r.studentName,
    studentNumber: r.studentNumber,
    house: r.house,
    paper1: r.paper1,
    paper2: r.paper2,
    internalAssessment: r.internalAssessment,
    oralSeminar: r.oralSeminar,
    weightedTotal: r.weightedTotal,
    predictedGrade: r.predictedGrade,
    academicStanding: r.academicStanding,
  }));
}

// UPDATE: Save Gradebook Marks & Seal
export async function saveGradebookMarks(payload: {
  classId: string;
  rows?: GradebookRow[];
  subject?: string;
  assessmentName?: string;
  marks?: Array<{ studentId: string; score: number; maxScore?: number; remarks?: string }>;
}): Promise<{ success: boolean; sealHash: string }> {
  const sealHash = "SEAL-GRADEBOOK-CBSE-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  let targetRows: GradebookRow[] = payload.rows || [];
  if (!targetRows.length && payload.marks) {
    const existing = sharedStore.getGradebook();
    targetRows = existing.map((r) => {
      const match = payload.marks?.find((m) => m.studentId === r.studentId);
      if (match) {
        return {
          ...r,
          paper1: match.score,
          weightedTotal: match.score,
        };
      }
      return r;
    });
  }

  const sharedEntries: SharedGradebookEntry[] = targetRows.map((r) => ({
    studentId: r.studentId,
    studentName: r.studentName,
    studentNumber: r.studentNumber,
    house: r.house,
    paper1: r.paper1,
    paper2: r.paper2,
    internalAssessment: r.internalAssessment,
    oralSeminar: r.oralSeminar,
    weightedTotal: r.weightedTotal,
    predictedGrade: r.predictedGrade,
    academicStanding: r.academicStanding,
  }));

  // Sync to shared reactive store (instantly updates Student and Parent result cards)
  sharedStore.saveGradebook(payload.classId, sharedEntries);

  const supabase = createClient();
  try {
    for (const row of targetRows) {
      await supabase.from("marks_entries").upsert({
        student_id: row.studentId,
        raw_score: row.paper1,
        grade_letter: String(row.predictedGrade),
        faculty_comment: `Academic Standing: ${row.academicStanding} | Weighted Total: ${row.weightedTotal}%`,
      });
    }
  } catch (err) {
    console.warn("Supabase upsert for saveGradebookMarks:", err);
  }

  await logAudit({
    schoolId: "",
    actorId: "",
    action: AuditAction.MARKS_ENTERED,
    entityTable: "marks_entries",
    entityId: payload.classId,
    newValues: { classId: payload.classId, rowCount: targetRows.length, sealHash },
  });

  return {
    success: true,
    sealHash,
  };
}

export const gradeHomeworkSubmission = gradeSubmission;
export const fetchTeacherSubmissions = fetchHomeworkSubmissions;


