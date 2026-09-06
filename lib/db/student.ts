import { createClient } from "@/lib/supabase/client";
import { sharedStore, SharedHomeworkAssignment, SharedHomeworkSubmission, SharedGradebookEntry, SharedNotice } from "@/lib/db/shared-store";
import { logAudit, AuditAction } from "@/lib/services/audit-service";

export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  form: string;
  grade: string;
  house: string;
  housemaster: string;
  avatar: string;
  honorsTitle: string;
  housePoints: number;
  attendanceRate: string;
  consecutiveStreakDays: number;
  ibPredictedPoints: number;
  termGpa: string;
}

export interface StudentSessionItem {
  id: string;
  period: string;
  time: string;
  subject: string;
  code: string;
  room: string;
  teacher: string;
  status: "COMPLETED" | "ACTIVE" | "UPCOMING";
  topic: string;
}

export interface StudentAttendanceEntry {
  id: string;
  date: string;
  dayOfWeek: string;
  status: "PRESENT" | "LATE" | "EXCUSED" | "ABSENT";
  turnstileGate: string;
  timestamp: string;
  remarks?: string;
}

export interface StudentHomeworkTask {
  id: string;
  title: string;
  subject: string;
  teacherName: string;
  assignedDate: string;
  dueDate: string;
  cutoffCountdown: string;
  status: "PENDING" | "SUBMITTED" | "GRADED";
  score?: number;
  maxScore: number;
  rubricSummary: string;
  teacherFeedback?: string;
  submittedFileName?: string;
  submissionDate?: string;
}

export interface StudentSubjectScore {
  subject: string;
  level: "HL" | "SL" | "Core" | "Elective";
  grade: number; // IB 1-7 or CBSE Score
  percentage: number;
  termAverage: string;
  classRank: string;
  teacherName: string;
  masteryRadar: number; // 0-100%
  evaluativeComments: string;
}

export interface StudentResultMatrix {
  termName: string;
  academicYear: string;
  overallGpa: string;
  predictedIbTotal: number;
  cohortRank: string;
  conductRating: string;
  proviseurSeal: string;
  subjects: StudentSubjectScore[];
}

export interface StudentBulletinItem {
  id: string;
  title: string;
  category: "ACADEMY" | "HOUSE" | "SOCIETY" | "EXCURSION";
  date: string;
  author: string;
  summary: string;
  body: string;
  priority: "URGENT" | "STANDARD";
}

// ============================================================================
// STUDENT PORTAL SUPABASE CRUD OPERATIONS (WITH REACTIVE SHARED STORE)
// ============================================================================

export async function fetchStudentProfile(studentId?: string): Promise<StudentProfile> {
  const stdId = studentId || "std-01";
  const liveAttendanceRate = sharedStore.getStudentAttendanceRate(stdId);
  const result = sharedStore.getStudentResult(stdId);

  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("students")
      .select(`
        id,
        admission_number,
        house,
        users_profiles:profile_id (
          full_name,
          avatar_url
        )
      `)
      .limit(1)
      .maybeSingle();

    if (!error && data && data.users_profiles) {
      const profile = Array.isArray(data.users_profiles) ? data.users_profiles[0] : data.users_profiles;
      return {
        id: data.id,
        name: profile?.full_name || '',
        rollNumber: data.admission_number || '',
        form: '',
        grade: '',
        house: data.house || '',
        housemaster: '',
        avatar: profile?.avatar_url || 'ST',
        honorsTitle: '',
        housePoints: 0,
        attendanceRate: liveAttendanceRate,
        consecutiveStreakDays: 0,
        ibPredictedPoints: result?.weightedTotal ? Math.round(result.weightedTotal) : 0,
        termGpa: result ? `${result.weightedTotal}%` : '0.0%',
      };
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchStudentProfile:", err);
  }

  return {
    id: "",
    name: "Student Profile",
    rollNumber: "N/A",
    form: "N/A",
    grade: "N/A",
    house: "N/A",
    housemaster: "N/A",
    avatar: "ST",
    honorsTitle: "Student",
    housePoints: 0,
    attendanceRate: liveAttendanceRate || "0.0%",
    consecutiveStreakDays: 0,
    ibPredictedPoints: 0,
    termGpa: "0.0%",
  };
}

export async function fetchStudentSchedule(): Promise<StudentSessionItem[]> {
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
        subjects:subject_id (
          name,
          code
        ),
        teachers:teacher_id (
          users_profiles:profile_id (
            full_name
          )
        )
      `)
      .order("period_number", { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((t, idx) => {
        const sub = Array.isArray(t.subjects) ? t.subjects[0] : t.subjects;
        const teach = Array.isArray(t.teachers) ? t.teachers[0] : t.teachers;
        const prof = Array.isArray(teach?.users_profiles) ? teach?.users_profiles[0] : teach?.users_profiles;
        return {
          id: t.id,
          period: `Period ${t.period_number}`,
          time: `${t.start_time?.slice(0, 5)} – ${t.end_time?.slice(0, 5)}`,
          subject: sub?.name || "Academic Subject",
          code: sub?.code || `SUB-${t.period_number}`,
          room: t.room_location || '',
          teacher: prof?.full_name || '',
          status: idx === 0 ? "COMPLETED" : idx === 1 ? "ACTIVE" : "UPCOMING",
          topic: sub?.name ? `${sub.name} - Session` : 'Scheduled Period',
        };
      });
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchStudentSchedule:", err);
  }

  return [];
}

export async function fetchStudentAttendanceRadar(studentId: string = "std-01"): Promise<StudentAttendanceEntry[]> {
  const storeEntries = sharedStore.getStudentAttendanceRadar(studentId);

  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("attendance_entries")
      .select(`
        id,
        status,
        reason,
        time_in,
        verification_method,
        attendance_records:attendance_record_id (
          date
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data && data.length > 0) {
      const dbEntries = data.map((entry) => {
        const rec = Array.isArray(entry.attendance_records) ? entry.attendance_records[0] : entry.attendance_records;
        const entryDate = rec?.date || new Date().toISOString().split("T")[0];
        const dayOfWeek = new Date(entryDate).toLocaleDateString("en-US", { weekday: "long" });
        return {
          id: entry.id,
          date: entryDate,
          dayOfWeek,
          status: (entry.status as any) || "PRESENT",
          turnstileGate: entry.verification_method || '',
          timestamp: entry.time_in ? `${entry.time_in} IST` : '',
          remarks: entry.reason || '',
        };
      });

      return [...storeEntries.slice(0, 1), ...dbEntries.slice(1)];
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchStudentAttendanceRadar:", err);
  }

  return storeEntries;
}

// CREATE: Gate Pass / Leave Request
export async function submitGatePassRequest(payload: {
  passType: "WEEKEND_EXEAT" | "TOWN_LEAVE" | "ACADEMIC_VISIT";
  destination: string;
  departureTime: string;
  returnTime: string;
  emergencyContact: string;
}): Promise<{ success: boolean; passId: string }> {
  // Sync to shared store approvals
  const approval = sharedStore.addApproval({
    approvalType: "EXCURSION_AUTHORIZATION",
    status: "PENDING",
    petitionerNotes: `Type: ${payload.passType} | Destination: ${payload.destination} | Departure: ${payload.departureTime} | Return: ${payload.returnTime} | Emergency: ${payload.emergencyContact}`,
  });

  const supabase = createClient();
  try {
    await supabase.from("approvals").insert({
      approval_type: "EXCURSION_AUTHORIZATION",
      status: "PENDING",
      petitioner_notes: `Destination: ${payload.destination} | Departure: ${payload.departureTime} | Return: ${payload.returnTime} | Emergency: ${payload.emergencyContact}`,
    });
  } catch (err) {
    console.warn("Supabase insert for submitGatePassRequest:", err);
  }
  return { success: true, passId: approval.id };
}

// READ: Student Homework List
export async function fetchStudentHomeworkList(studentId: string = "std-01"): Promise<StudentHomeworkTask[]> {
  const sharedHws = sharedStore.getHomeworkAssignments();
  const sharedSubs = sharedStore.getHomeworkSubmissions();

  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("homework_assignments")
      .select(`
        id,
        title,
        brief_markdown,
        due_datetime,
        max_points,
        created_at,
        subjects:subject_id (
          name
        ),
        teachers:teacher_id (
          users_profiles:profile_id (
            full_name
          )
        ),
        homework_submissions (
          id,
          status,
          score,
          teacher_feedback,
          submitted_at
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const dbTasks: StudentHomeworkTask[] = data.map((hw) => {
        const sub = Array.isArray(hw.subjects) ? hw.subjects[0] : hw.subjects;
        const teach = Array.isArray(hw.teachers) ? hw.teachers[0] : hw.teachers;
        const prof = Array.isArray(teach?.users_profiles) ? teach?.users_profiles[0] : teach?.users_profiles;
        const submission = Array.isArray(hw.homework_submissions) ? hw.homework_submissions[0] : hw.homework_submissions;
        const localSubmission = sharedSubs.find(s => s.homeworkId === hw.id && s.studentId === studentId);

        const isGraded = localSubmission?.status === "GRADED" || submission?.status === "GRADED";
        const isSubmitted = !!localSubmission || !!submission;

        return {
          id: hw.id,
          title: hw.title,
          subject: sub?.name || "Mathematics",
          teacherName: prof?.full_name || "Senior Faculty",
          assignedDate: hw.created_at?.split("T")[0] || "2025-01-20",
          dueDate: hw.due_datetime?.split("T")[0] || "2025-01-27",
          cutoffCountdown: isGraded ? "Completed & Evaluated" : isSubmitted ? "Submitted for Review" : "3 days remaining",
          status: isGraded ? "GRADED" : isSubmitted ? "SUBMITTED" : "PENDING",
          maxScore: Number(hw.max_points) || 50,
          score: localSubmission?.marksAwarded ?? submission?.score ?? (isGraded ? 49 : undefined),
          rubricSummary: hw.brief_markdown?.slice(0, 120) || "Complete all NCERT Exemplar proofs.",
          teacherFeedback: localSubmission?.feedback || submission?.teacher_feedback || undefined,
          submittedFileName: localSubmission?.fileName || undefined,
          submissionDate: localSubmission?.submittedAt || submission?.submitted_at?.split("T")[0],
        };
      });

      return dbTasks;
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchStudentHomeworkList:", err);
  }

  // Derive tasks from sharedStore
  return sharedHws.map((hw) => {
    const sub = sharedSubs.find((s) => s.homeworkId === hw.id && s.studentId === studentId);
    const isGraded = sub?.status === "GRADED";
    const isSubmitted = !!sub;

    return {
      id: hw.id,
      title: hw.title,
      subject: hw.subject,
      teacherName: '',
      assignedDate: hw.assignedDate,
      dueDate: hw.dueDate,
      cutoffCountdown: isGraded ? "Completed & Evaluated" : isSubmitted ? "Submitted for Review" : "3 days remaining",
      status: isGraded ? "GRADED" : isSubmitted ? "SUBMITTED" : "PENDING",
      maxScore: hw.maxMarks,
      score: sub?.marksAwarded ?? (isGraded ? 49 : undefined),
      rubricSummary: hw.rubric,
      teacherFeedback: sub?.feedback,
      submittedFileName: sub?.fileName,
      submissionDate: sub?.submittedAt,
    };
  });
}

// CREATE / UPDATE: Homework Solution
export async function submitHomeworkSolution(payload: {
  homeworkId: string;
  fileName: string;
  notes: string;
}): Promise<{ success: boolean; submissionTimestamp: string; submissionId: string }> {
  const timestamp = new Date().toISOString();

  // Sync to reactive sharedStore (instantly appears in Teacher homework review desk and Parent portal)
  const sub = sharedStore.submitHomework({
    homeworkId: payload.homeworkId,
    studentId: "std-01",
    studentName: 'Student',
    form: '',
    fileName: payload.fileName,
    notes: payload.notes,
  });

  const supabase = createClient();
  try {
    await supabase.from("homework_submissions").upsert(
      {
        homework_id: payload.homeworkId,
        student_notes: payload.notes,
        status: "SUBMITTED",
        file_urls: [payload.fileName],
        submitted_at: timestamp,
      },
      { onConflict: "homework_id,student_id" }
    );
  } catch (err) {
    console.warn("Supabase upsert for submitHomeworkSolution:", err);
  }

  await logAudit({
    schoolId: '',
    actorId: '',
    action: AuditAction.HOMEWORK_SUBMITTED,
    entityTable: "homework_submissions",
    entityId: sub.id,
    newValues: { homeworkId: payload.homeworkId, fileName: payload.fileName },
  });

  return { success: true, submissionTimestamp: timestamp, submissionId: sub.id };
}

// READ: Student Results & Term Gradebook
export async function fetchStudentResults(studentId: string = "std-01"): Promise<StudentResultMatrix> {
  const result = sharedStore.getStudentResult(studentId);

  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("marks_entries")
      .select(`
        raw_score,
        grade_letter,
        faculty_comment,
        assessments:assessment_id (
          title,
          max_score,
          subjects:subject_id (
            name,
            code
          )
        )
      `);

    if (!error && data && data.length > 0) {
      const subjects: StudentSubjectScore[] = data.map((entry) => {
        const assess = Array.isArray(entry.assessments) ? entry.assessments[0] : entry.assessments;
        const sub = Array.isArray(assess?.subjects) ? assess?.subjects[0] : assess?.subjects;
        const score = Number(entry.raw_score) || 95;
        const max = Number(assess?.max_score) || 100;
        const pct = Math.round((score / max) * 100);

        return {
          subject: sub?.name || "Subject",
          level: "Core",
          grade: score,
          percentage: pct,
          termAverage: `${pct}%`,
          classRank: "",
          teacherName: "",
          masteryRadar: pct,
          evaluativeComments: entry.faculty_comment || "",
        };
      });

      return {
        termName: "Term Results",
        academicYear: new Date().getFullYear().toString(),
        overallGpa: result ? `${result.weightedTotal}%` : "0.0%",
        predictedIbTotal: result ? Math.round(result.weightedTotal) : 0,
        cohortRank: "",
        conductRating: "EXEMPLARY",
        proviseurSeal: "",
        subjects,
      };
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchStudentResults:", err);
  }

  return {
    termName: "Term Results",
    academicYear: new Date().getFullYear().toString(),
    overallGpa: "0.0%",
    predictedIbTotal: 0,
    cohortRank: "",
    conductRating: "EXEMPLARY",
    proviseurSeal: "",
    subjects: [],
  };
}

// READ: Student Notices & Bulletins
export async function fetchStudentNotices(): Promise<StudentBulletinItem[]> {
  const storeNotices = sharedStore.getNotices();

  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("notices")
      .select("id, title, content_markdown, publish_date, is_pinned")
      .order("publish_date", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((n) => ({
        id: n.id,
        title: n.title,
        category: "ACADEMY",
        date: n.publish_date?.split("T")[0] || "2025-01-14",
        author: "Principal & Academic Advisory Council",
        summary: n.content_markdown?.slice(0, 100) || "",
        body: n.content_markdown || "",
        priority: n.is_pinned ? "URGENT" : "STANDARD",
      }));
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchStudentNotices:", err);
  }

  return storeNotices.map((n) => ({
    id: n.id,
    title: n.title,
    category: (n.category as any) || "ACADEMY",
    date: n.date,
    author: n.author,
    summary: n.summary,
    body: n.body,
    priority: n.priority === "ARCHIVE" ? "STANDARD" : n.priority,
  }));
}


