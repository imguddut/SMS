import { createClient } from "@/lib/supabase/client";
import { logAudit, AuditAction } from "@/lib/services/audit-service";
import { createNotice as createNoticeService } from "@/lib/services/notice-service";
import { decideApproval } from "@/lib/services/approval-service";
import { sharedStore } from "@/lib/db/shared-store";

export interface SchoolOperationsStats {
  morningAttendanceRate: string;
  presentCount: number;
  totalStudents: number;
  pendingApprovalsCount: number;
  activeRosterUnits: number;
  dailyVaultSettlement: number;
  currency: string;
  houseAttendance: {
    house: string;
    rate: string;
    present: number;
    total: number;
  }[];
}

export interface StudentRecord {
  id: string;
  studentNumber: string;
  fullName: string;
  gender: string;
  form: string;
  gradeLevel: number;
  house: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  attendanceRate: string;
  tuitionStatus: "PAID" | "PARTIAL" | "OVERDUE" | "SCHOLARSHIP";
  academicStanding: "HIGH_HONORS" | "HONORS" | "GOOD_STANDING" | "ACADEMIC_WARNING";
  gpa: string;
  status: "ACTIVE" | "GRADUATED" | "WITHDRAWN" | "SUSPENDED";
}

export interface ClassSectionInfo {
  id: string;
  className: string;
  form: string;
  gradeLevel: number;
  curriculumTrack: string;
  roomNumber: string;
  formTutor: string;
  formTutorEmail: string;
  enrolledCount: number;
  maxCapacity: number;
  meetingSchedule: string;
}

export interface CampusNoticeItem {
  id: string;
  title: string;
  content: string;
  audience: "ALL_CAMPUS" | "FACULTY_ONLY" | "SENIOR_WING" | "PARENTS_ONLY";
  priority: "URGENT" | "ACADEMIC" | "GENERAL";
  authorName: string;
  authorTitle: string;
  publishedAt: string;
  isPinned: boolean;
}

export interface ExecutiveApprovalWarrant {
  id: string;
  type: "BURSARY_WAIVER" | "LEAVE_REQUEST" | "EXCURSION_AUTHORIZATION" | "GRADEBOOK_PUBLICATION" | "STAFF_APPOINTMENT";
  title: string;
  applicant: string;
  applicantRole: string;
  departmentOrHouse: string;
  amountOrScope: string;
  dateRequested: string;
  justification: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ESCROW";
  signatureHash?: string;
}

export interface CampusReportItem {
  id: string;
  title: string;
  category: "ATTENDANCE" | "ACADEMIC" | "FINANCIAL" | "SAFETY";
  period: string;
  generatedDate: string;
  recordCount: number;
  fileSize: string;
}

// Data Fetchers with Real DB Query & Dynamic Data
export async function fetchSchoolOperationsStats(schoolId?: string): Promise<SchoolOperationsStats> {
  try {
    const supabase = createClient();

    // Total students count
    let queryStudents = supabase.from("students").select("id", { count: "exact", head: true });
    if (schoolId) queryStudents = queryStudents.eq("school_id", schoolId);
    const { count: studentCount } = await queryStudents;

    // Attendance present count today
    const today = new Date().toISOString().split("T")[0];
    let queryAttendance = supabase.from("attendance_entries").select("id", { count: "exact", head: true }).eq("status", "PRESENT");
    const { count: presentCount } = await queryAttendance;

    // Pending approvals count
    let queryApprovals = supabase.from("approvals").select("id", { count: "exact", head: true }).eq("status", "PENDING");
    if (schoolId) queryApprovals = queryApprovals.eq("school_id", schoolId);
    const { count: pendingCount } = await queryApprovals;

    // Sections count
    let querySections = supabase.from("sections").select("id", { count: "exact", head: true });
    const { count: sectionsCount } = await querySections;

    // Today payments settlement
    let queryPayments = supabase.from("payments").select("amount").gte("created_at", today);
    if (schoolId) queryPayments = queryPayments.eq("school_id", schoolId);
    const { data: payments } = await queryPayments;
    const dailyVaultSettlement = (payments || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    const totalStudents = studentCount || 0;
    const actualPresent = presentCount || 0;
    const morningAttendanceRate = totalStudents > 0 ? `${((actualPresent / totalStudents) * 100).toFixed(1)}%` : "0.0%";

    return {
      morningAttendanceRate,
      presentCount: actualPresent,
      totalStudents,
      pendingApprovalsCount: pendingCount || 0,
      activeRosterUnits: sectionsCount || 0,
      dailyVaultSettlement,
      currency: "INR",
      houseAttendance: [],
    };
  } catch {
    return {
      morningAttendanceRate: "0.0%",
      presentCount: 0,
      totalStudents: 0,
      pendingApprovalsCount: 0,
      activeRosterUnits: 0,
      dailyVaultSettlement: 0,
      currency: "INR",
      houseAttendance: [],
    };
  }
}

export async function fetchStudentsDirectory(filters?: {
  search?: string;
  form?: string;
  house?: string;
  standing?: string;
}): Promise<StudentRecord[]> {
  try {
    const supabase = createClient();
    const { data: students } = await supabase
      .from("students")
      .select(`
        *,
        users_profiles:profile_id (*),
        student_guardians (
          guardians (*)
        )
      `);

    if (!students || students.length === 0) return [];

    const result: StudentRecord[] = students.map((s: any) => {
      const prof = Array.isArray(s.users_profiles) ? s.users_profiles[0] : s.users_profiles;
      const gLink = s.student_guardians?.[0]?.guardians;
      return {
        id: s.id,
        studentNumber: s.admission_number || "N/A",
        fullName: prof?.full_name || "Unknown Scholar",
        gender: s.gender || "Not specified",
        form: s.house || "General Section",
        gradeLevel: 10,
        house: s.house || "General House",
        guardianName: gLink?.users_profiles?.full_name || "N/A",
        guardianEmail: prof?.email || "",
        guardianPhone: gLink?.emergency_contact || "",
        attendanceRate: "0.0%",
        tuitionStatus: "PAID",
        academicStanding: "GOOD_STANDING",
        gpa: "N/A",
        status: s.status || "ACTIVE",
      };
    });

    if (!filters) return result;

    return result.filter((student) => {
      const matchesSearch =
        !filters.search ||
        student.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.studentNumber.toLowerCase().includes(filters.search.toLowerCase());

      const matchesForm = !filters.form || filters.form === "ALL" || student.form.includes(filters.form);
      const matchesHouse = !filters.house || filters.house === "ALL" || student.house.includes(filters.house);
      const matchesStanding =
        !filters.standing || filters.standing === "ALL" || student.academicStanding === filters.standing;

      return matchesSearch && matchesForm && matchesHouse && matchesStanding;
    });
  } catch {
    return [];
  }
}

export const fetchClassesAndSections = fetchClassesSections;

export async function fetchClassesSections(): Promise<ClassSectionInfo[]> {
  try {
    const supabase = createClient();
    const { data: sections } = await supabase
      .from("sections")
      .select(`
        *,
        classes (*)
      `);

    if (!sections || sections.length === 0) return [];

    return sections.map((sec: any) => ({
      id: sec.id,
      className: `${sec.classes?.name || "Class"} - Section ${sec.name}`,
      form: sec.classes?.name || sec.name,
      gradeLevel: sec.classes?.grade_level || 10,
      curriculumTrack: sec.classes?.curriculum_code || "CBSE Standard",
      roomNumber: sec.room_number || "Unassigned",
      formTutor: "Unassigned",
      formTutorEmail: "",
      enrolledCount: 0,
      maxCapacity: sec.max_capacity || 40,
      meetingSchedule: "Mon–Fri Standard",
    }));
  } catch {
    return [];
  }
}

export async function fetchNoticesBulletins(): Promise<CampusNoticeItem[]> {
  try {
    const supabase = createClient();
    const { data: notices } = await supabase
      .from("notices")
      .select(`
        *,
        users_profiles:author_id (full_name, title)
      `)
      .order("created_at", { ascending: false });

    if (!notices || notices.length === 0) return [];

    return notices.map((n: any) => ({
      id: n.id,
      title: n.title,
      content: n.body,
      audience: n.target_audience || "ALL_CAMPUS",
      priority: n.priority || "GENERAL",
      authorName: n.users_profiles?.full_name || "Administration",
      authorTitle: n.users_profiles?.title || "Staff",
      publishedAt: n.created_at ? new Date(n.created_at).toLocaleDateString() : "Recently",
      isPinned: false,
    }));
  } catch {
    return [];
  }
}

export async function createNotice(payload: {
  title: string;
  content: string;
  audience: "ALL_CAMPUS" | "FACULTY_ONLY" | "SENIOR_WING" | "PARENTS_ONLY";
  priority: "URGENT" | "ACADEMIC" | "GENERAL";
}): Promise<CampusNoticeItem> {
  const newNotice = sharedStore.createNotice({
    title: payload.title,
    body: payload.content,
    summary: payload.content.slice(0, 120),
    category: payload.audience === "PARENTS_ONLY" ? "GOVERNANCE" : "ACADEMIC",
    author: "Dr. Arvind Swaminathan (Principal)",
    date: new Date().toISOString().split("T")[0],
    priority: payload.priority === "URGENT" ? "URGENT" : "STANDARD",
    requiresConsent: payload.priority === "URGENT",
    isSigned: false,
  });

  const schoolId = "11111111-1111-1111-1111-111111111111";
  const authorId = "b0000000-0000-0000-0000-000000000004";
  let noticeId = newNotice.id;

  try {
    const res = await createNoticeService(schoolId, {
      authorId,
      title: payload.title,
      contentMarkdown: payload.content,
      targetAudiences: [payload.audience],
    });
    if (res?.noticeId) noticeId = res.noticeId;
  } catch (err) {
    console.warn("Notice service fallback:", err);
  }

  await logAudit({
    schoolId,
    actorId: authorId,
    action: AuditAction.NOTICE_CREATED,
    entityTable: "notices",
    entityId: noticeId,
    newValues: { title: payload.title, audience: payload.audience },
  });

  return {
    id: noticeId,
    title: payload.title,
    content: payload.content,
    audience: payload.audience,
    priority: payload.priority,
    authorName: "Dr. Arvind Swaminathan",
    authorTitle: "Principal & Provost",
    publishedAt: "Just now",
    isPinned: false,
  };
}

export async function fetchApprovalsQueue(): Promise<ExecutiveApprovalWarrant[]> {
  const storeApprovals = sharedStore.getApprovals();
  return storeApprovals.map((app) => ({
    id: app.id,
    type: (app.type || "LEAVE_REQUEST") as ExecutiveApprovalWarrant["type"],
    title: app.title,
    applicant: app.applicant,
    applicantRole: app.applicantRole,
    departmentOrHouse: app.departmentOrHouse,
    amountOrScope: app.amountOrScope,
    dateRequested: app.dateRequested,
    justification: app.justification,
    status: app.status as ExecutiveApprovalWarrant["status"],
    signatureHash: app.signatureHash,
  }));
}

export async function updateApprovalStatus(
  id: string,
  status: "APPROVED" | "REJECTED"
): Promise<{ success: boolean; signatureHash?: string }> {
  const schoolId = "11111111-1111-1111-1111-111111111111";
  const deciderId = "b0000000-0000-0000-0000-000000000003"; // Principal Claire De La Tour
  const signatureHash = "SIG-PRINCIPAL-9942-APAAR-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  sharedStore.updateApprovalStatus(id, status, signatureHash);

  try {
    await decideApproval(id, deciderId, status);
  } catch (err) {
    console.warn("Approval service fallback:", err);
  }

  const supabase = createClient();
  try {
    await supabase
      .from("approvals")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id);
  } catch (err) {
    console.warn("Supabase update for updateApprovalStatus:", err);
  }

  await logAudit({
    schoolId,
    actorId: deciderId,
    action: AuditAction.APPROVAL_DECIDED,
    entityTable: "approvals",
    entityId: id,
    newValues: { status, signatureHash },
  });

  return {
    success: true,
    signatureHash,
  };
}

export async function fetchCampusReports(): Promise<CampusReportItem[]> {
  try {
    const supabase = createClient();
    const { data: logs } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!logs || logs.length === 0) return [];

    return logs.map((log: any) => ({
      id: log.id,
      title: log.action || "System Audit Log",
      category: "SAFETY",
      period: "Current Session",
      generatedDate: log.created_at ? new Date(log.created_at).toLocaleDateString() : "Recently",
      recordCount: 1,
      fileSize: "12 KB",
    }));
  } catch {
    return [];
  }
}

export async function fetchSchoolOperationalSettings() {
  return {
    rollCallCutoffTime: "08:15 IST",
    passingGradeThreshold: "33% (CBSE Grade D)",
    academicYearName: "Academic Year 2024–2025",
    currentTerm: "Term 2 (CBSE Annual Session)",
    emergencyBroadcastGateway: true,
    mfaEnforced: true,
  };
}
