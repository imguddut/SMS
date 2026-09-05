import { createClient } from "@/lib/supabase/client";
import { sharedStore, SharedInvoice, SharedHomeworkAssignment, SharedHomeworkSubmission, SharedNotice } from "@/lib/db/shared-store";

export interface ParentWardProfile {
  id: string;
  name: string;
  rollNumber: string;
  form: string;
  grade: string;
  house: string;
  housemaster: string;
  avatar: string;
  attendanceRate: string;
  termGpa: string;
  predictedIbPoints: number;
  unsettledFees: number;
  currency: string;
}

export interface ParentDigestStats {
  todaysArrivalStatus: string;
  arrivalTime: string;
  attendanceRate: string;
  academicStanding: string;
  ibPointsTotal: number;
  tuitionStatus: "SETTLED" | "PENDING" | "OVERDUE";
  unpaidBalance: number;
  pendingHomeworkCount: number;
  unreadNoticesCount: number;
}

export interface WardAttendanceRecord {
  id: string;
  date: string;
  dayOfWeek: string;
  status: "PRESENT" | "LATE" | "EXCUSED" | "ABSENT";
  turnstileGate: string;
  timestamp: string;
  sessionRemarks?: string;
}

export interface WardFeeInvoice {
  id: string;
  invoiceNumber: string;
  termName: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: "PAID" | "PENDING" | "OVERDUE";
  description: string;
  paymentMethod?: string;
  paidDate?: string;
  swissQrIban: string;
  swissQrRef: string;
}

export interface WardHomeworkItem {
  id: string;
  title: string;
  subject: string;
  teacherName: string;
  assignedDate: string;
  dueDate: string;
  status: "PENDING" | "SUBMITTED" | "GRADED";
  score?: number;
  maxScore: number;
  rubricSummary: string;
  teacherFeedback?: string;
  submissionDate?: string;
}

export interface WardSubjectGrade {
  subject: string;
  level: "HL" | "SL" | "Core" | "Elective";
  grade: number; // IB 1-7 or CBSE Score
  percentage: number;
  termAverage: string;
  classRank: string;
  teacherName: string;
  evaluativeComments: string;
}

export interface WardAcademicReport {
  termName: string;
  academicYear: string;
  overallGpa: string;
  predictedIbTotal: number;
  conductRating: "EXEMPLARY" | "COMMENDABLE" | "SATISFACTORY";
  proviseurSeal: string;
  subjects: WardSubjectGrade[];
}

export interface ParentNoticeItem {
  id: string;
  title: string;
  category: "ACADEMIC" | "BOARDING" | "EXCURSION" | "GOVERNANCE";
  date: string;
  sender: string;
  summary: string;
  body: string;
  priority: "URGENT" | "STANDARD" | "ARCHIVE";
  requiresConsent: boolean;
  isSigned: boolean;
  signedDate?: string;
}

// ============================================================================
// PARENT PORTAL SUPABASE CRUD OPERATIONS (WITH REACTIVE SHARED STORE)
// ============================================================================

export async function fetchEnrolledWards(): Promise<ParentWardProfile[]> {
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
      .limit(5);

    if (!error && data && data.length > 0) {
      return data.map((st, idx) => {
        const prof = Array.isArray(st.users_profiles) ? st.users_profiles[0] : st.users_profiles;
        const wardId = idx === 0 ? "ward-01" : "ward-02";
        const digest = sharedStore.getParentDigest(wardId);
        const result = sharedStore.getStudentResult(st.id);
        return {
          id: st.id,
          name: prof?.full_name || (idx === 0 ? "Aarav Sharma" : "Ananya Sharma"),
          rollNumber: st.admission_number || (idx === 0 ? "ADM-2024-001" : "ADM-2024-042"),
          form: idx === 0 ? "Class 12-A" : "Class 10-B",
          grade: idx === 0 ? "Class 12 (CBSE Science & AI)" : "Class 10 (CBSE Secondary)",
          house: st.house || (idx === 0 ? "Tagore House" : "Ashoka House"),
          housemaster: idx === 0 ? "Prof. Rajesh Verma, Senior PGT" : "Mrs. Priya Nair",
          avatar: prof?.avatar_url || "AS",
          attendanceRate: digest.attendanceRate,
          termGpa: result ? `${result.weightedTotal}% (Pre-Board)` : idx === 0 ? "98.4% (Pre-Board)" : "94.2% (Pre-Board)",
          predictedIbPoints: result?.weightedTotal ? Math.round(result.weightedTotal * 5) : idx === 0 ? 482 : 470,
          unsettledFees: digest.unpaidBalance,
          currency: "INR",
        };
      });
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchEnrolledWards:", err);
  }

  const d1 = sharedStore.getParentDigest("ward-01");
  const d2 = sharedStore.getParentDigest("ward-02");
  const r1 = sharedStore.getStudentResult("std-01");
  const r2 = sharedStore.getStudentResult("std-02");

  return [
    {
      id: "ward-01",
      name: "Aarav Sharma",
      rollNumber: "ADM-2024-001",
      form: "Class 12-A",
      grade: "Class 12 (CBSE Science & AI)",
      house: "Tagore House",
      housemaster: "Prof. Rajesh Verma, Senior PGT",
      avatar: "AS",
      attendanceRate: d1.attendanceRate,
      termGpa: r1 ? `${r1.weightedTotal}% (Pre-Board)` : "98.4% (Pre-Board)",
      predictedIbPoints: r1?.weightedTotal ? Math.round(r1.weightedTotal * 5) : 482,
      unsettledFees: d1.unpaidBalance,
      currency: "INR",
    },
    {
      id: "ward-02",
      name: "Ananya Sharma",
      rollNumber: "ADM-2024-042",
      form: "Class 10-B",
      grade: "Class 10 (CBSE Secondary)",
      house: "Ashoka House",
      housemaster: "Mrs. Priya Nair",
      avatar: "AS",
      attendanceRate: d2.attendanceRate,
      termGpa: r2 ? `${r2.weightedTotal}% (Pre-Board)` : "94.2% (Pre-Board)",
      predictedIbPoints: r2?.weightedTotal ? Math.round(r2.weightedTotal * 5) : 470,
      unsettledFees: d2.unpaidBalance,
      currency: "INR",
    },
  ];
}

export async function fetchParentDigest(wardId: string): Promise<ParentDigestStats> {
  return sharedStore.getParentDigest(wardId);
}

export async function fetchWardAttendanceHistory(wardId: string): Promise<WardAttendanceRecord[]> {
  const stdId = wardId === "ward-02" ? "std-02" : "std-01";
  const storeRecords = sharedStore.getStudentAttendanceRadar(stdId);

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
      const dbRecords = data.map((entry) => {
        const rec = Array.isArray(entry.attendance_records) ? entry.attendance_records[0] : entry.attendance_records;
        const entryDate = rec?.date || new Date().toISOString().split("T")[0];
        const dayOfWeek = new Date(entryDate).toLocaleDateString("en-US", { weekday: "long" });
        return {
          id: entry.id,
          date: entryDate,
          dayOfWeek,
          status: (entry.status as any) || "PRESENT",
          turnstileGate: entry.verification_method || "Smart Gate 01 (Main Quad)",
          timestamp: entry.time_in ? `${entry.time_in} IST` : "08:08 IST",
          sessionRemarks: entry.reason || "Full day school attendance recorded.",
        };
      });

      return [...storeRecords.slice(0, 1).map(s => ({ ...s, sessionRemarks: s.remarks })), ...dbRecords.slice(1)];
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchWardAttendanceHistory:", err);
  }

  return storeRecords.map((s) => ({
    id: s.id,
    date: s.date,
    dayOfWeek: s.dayOfWeek,
    status: s.status,
    turnstileGate: s.turnstileGate,
    timestamp: s.timestamp,
    sessionRemarks: s.remarks || "Full day school attendance recorded.",
  }));
}

// CREATE: Submit Absence Excuses
export async function submitAbsenceExcuse(payload: {
  wardId: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  reason: string;
  medicalNotes?: string;
  doctorCertificateAttached?: boolean;
}): Promise<{ success: boolean; id: string }> {
  const dateStr = payload.date || (payload.startDate ? `${payload.startDate} to ${payload.endDate || payload.startDate}` : new Date().toISOString().split("T")[0]);
  // Sync to sharedStore approvals
  const approval = sharedStore.addApproval({
    approvalType: "LEAVE_REQUEST",
    status: "PENDING",
    petitionerNotes: `Ward: ${payload.wardId} | Absence Date: ${dateStr} | Reason: ${payload.reason} | Medical Cert: ${payload.doctorCertificateAttached ? "Attached" : "N/A"} | Notes: ${payload.medicalNotes || ""}`,
  });

  const supabase = createClient();
  try {
    await supabase.from("approvals").insert({
      approval_type: "LEAVE_REQUEST",
      status: "PENDING",
      petitioner_notes: `Absence Date: ${dateStr} | Reason: ${payload.reason} | Medical Cert: ${payload.doctorCertificateAttached ? "Attached" : "N/A"} | Notes: ${payload.medicalNotes || ""}`,
    });
  } catch (err) {
    console.warn("Supabase insert for submitAbsenceExcuse:", err);
  }

  return { success: true, id: approval.id };
}

// READ: Invoices for Ward
export async function fetchWardInvoices(wardId: string): Promise<WardFeeInvoice[]> {
  const stdId = wardId === "ward-02" ? "std-02" : "std-01";
  const storeInvoices = sharedStore.getInvoices().filter((i) => !i.studentId || i.studentId === stdId || i.studentId === "std-01");

  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("id, invoice_number, issue_date, due_date, total_amount, status, notes")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const dbInvs = data.map((inv) => {
        const storeMatch = storeInvoices.find((si) => si.id === inv.id);
        const isPaid = storeMatch?.status === "PAID" || inv.status === "PAID";
        return {
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          termName: "Term 2 (Quarter 3 & 4)",
          amount: Number(inv.total_amount) || 36250,
          currency: "INR",
          issueDate: inv.issue_date || "2025-01-10",
          dueDate: inv.due_date || "2025-02-28",
          status: (isPaid ? "PAID" : inv.status || "PENDING") as "PAID" | "PENDING" | "OVERDUE",
          description: inv.notes || "Class 12 Term 2 Final CBSE Board Examination & Tuition Levy",
          paymentMethod: isPaid ? "Direct Debit / UPI" : "Pending Selection",
          paidDate: isPaid ? new Date().toISOString().split("T")[0] : undefined,
          swissQrIban: "dps.fees@hdfcbank",
          swissQrRef: `UPI-${inv.invoice_number}`,
        };
      });

      return [...storeInvoices.map(si => ({
        id: si.id,
        invoiceNumber: si.invoiceNumber,
        termName: si.termName,
        amount: si.amount,
        currency: si.currency,
        issueDate: si.issueDate,
        dueDate: si.dueDate,
        status: si.status === "CANCELLED" ? "PENDING" as const : si.status,
        description: si.description,
        paymentMethod: si.paymentMethod,
        paidDate: si.paidDate,
        swissQrIban: "dps.fees@hdfcbank",
        swissQrRef: si.receiptRef || `UPI-${si.invoiceNumber}`,
      })), ...dbInvs.filter(d => !storeInvoices.some(si => si.id === d.id))];
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchWardInvoices:", err);
  }

  return storeInvoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    termName: inv.termName,
    amount: inv.amount,
    currency: inv.currency,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    status: inv.status === "CANCELLED" ? "PENDING" as const : inv.status,
    description: inv.description,
    paymentMethod: inv.paymentMethod,
    paidDate: inv.paidDate,
    swissQrIban: "dps.fees@hdfcbank",
    swissQrRef: inv.receiptRef || `UPI-${inv.invoiceNumber}`,
  }));
}

// UPDATE: Pay Invoice & Generate Payment Receipt
export async function payInvoice(
  invoiceIdOrPayload: string | { invoiceId: string; paymentMethod?: string; transactionReference?: string },
  paymentMethod?: string
): Promise<{ success: boolean; receiptRef: string; receiptNumber?: string }> {
  const invId = typeof invoiceIdOrPayload === "string" ? invoiceIdOrPayload : invoiceIdOrPayload.invoiceId;
  const pMethod = typeof invoiceIdOrPayload === "string" ? paymentMethod || "UPI_AUTOPAY" : (invoiceIdOrPayload.paymentMethod || "UPI_AUTOPAY");

  // Sync to shared reactive store (instantly updates Finance portal invoices, treasury metrics and student ledgers)
  const result = sharedStore.payInvoice(invId, pMethod);

  const supabase = createClient();
  try {
    await supabase.from("invoices").update({ status: "PAID", balance_due: 0 }).eq("id", invId);
    await supabase.from("payments").insert({
      invoice_id: invId,
      receipt_number: result.receiptRef,
      amount: 36250,
      payment_method: "BANK_TRANSFER",
      transaction_reference: result.receiptRef,
      status: "SETTLED",
    });
  } catch (err) {
    console.warn("Supabase update for payInvoice:", err);
  }

  return { ...result, receiptNumber: result.receiptRef };
}

// READ: Ward Homework
export async function fetchWardHomework(wardId: string): Promise<WardHomeworkItem[]> {
  const stdId = wardId === "ward-02" ? "std-02" : "std-01";
  const sharedHws = sharedStore.getHomeworkAssignments();
  const sharedSubs = sharedStore.getHomeworkSubmissions();

  return sharedHws.map((hw) => {
    const sub = sharedSubs.find((s) => s.homeworkId === hw.id && s.studentId === stdId);
    const isGraded = sub?.status === "GRADED";
    const isSubmitted = !!sub;

    return {
      id: hw.id,
      title: hw.title,
      subject: hw.subject,
      teacherName: "Prof. Rajesh Verma",
      assignedDate: hw.assignedDate,
      dueDate: hw.dueDate,
      status: isGraded ? "GRADED" : isSubmitted ? "SUBMITTED" : "PENDING",
      score: sub?.marksAwarded ?? (isGraded ? 49 : undefined),
      maxScore: hw.maxMarks,
      rubricSummary: hw.rubric,
      teacherFeedback: sub?.feedback,
      submissionDate: sub?.submittedAt,
    };
  });
}

// READ: Ward Academic Report Cards
export async function fetchWardReportCards(wardId: string): Promise<WardAcademicReport> {
  const stdId = wardId === "ward-02" ? "std-02" : "std-01";
  const result = sharedStore.getStudentResult(stdId);

  return {
    termName: "CBSE Class 12 Pre-Board Examination",
    academicYear: "2024–2025",
    overallGpa: result ? `${result.weightedTotal}% (Aggregate Score)` : "96.4% (Aggregate Score)",
    predictedIbTotal: result ? Math.round(result.weightedTotal * 5) : 482,
    conductRating: "EXEMPLARY",
    proviseurSeal: "SEAL-PRINCIPAL-APAAR-998418-CBSE",
    subjects: [
      {
        subject: "Mathematics (041)",
        level: "Core",
        grade: result ? result.paper1 : 98,
        percentage: result ? result.weightedTotal : 98.0,
        termAverage: "88.2%",
        classRank: "1st in Section",
        teacherName: "Prof. Rajesh Verma",
        evaluativeComments: "Exceptional mathematical rigour, speed, and accuracy in calculus and 3D geometry.",
      },
      {
        subject: "Physics (042)",
        level: "Core",
        grade: 96,
        percentage: 96.0,
        termAverage: "84.1%",
        classRank: "1st in Section",
        teacherName: "Mrs. Sunita Deshmukh",
        evaluativeComments: "Demonstrates deep conceptual mastery of electromagnetic waves and wave optics.",
      },
      {
        subject: "Chemistry (043)",
        level: "Core",
        grade: 94,
        percentage: 94.0,
        termAverage: "85.0%",
        classRank: "2nd in Section",
        teacherName: "Dr. Arvind Swaminathan",
        evaluativeComments: "Strong grasp of organic synthesis mechanisms and electrochemistry principles.",
      },
      {
        subject: "Computer Science with Python (083)",
        level: "Elective",
        grade: 99,
        percentage: 99.0,
        termAverage: "89.5%",
        classRank: "1st in Section",
        teacherName: "Mr. Anand Sen",
        evaluativeComments: "Outstanding programming logic, data structures application, and SQL optimization.",
      },
      {
        subject: "English Core (301)",
        level: "Core",
        grade: 95,
        percentage: 95.0,
        termAverage: "86.0%",
        classRank: "1st in Section",
        teacherName: "Mrs. Priya Nair",
        evaluativeComments: "Sophisticated critical analysis in literary appreciation and creative writing.",
      },
    ],
  };
}

// READ: Parent Notices & Circulars
export async function fetchParentBulletins(): Promise<ParentNoticeItem[]> {
  const storeNotices = sharedStore.getNotices();

  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("notices")
      .select("id, title, content_markdown, publish_date, is_pinned")
      .order("publish_date", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((n) => {
        const storeMatch = storeNotices.find((sn) => sn.id === n.id);
        return {
          id: n.id,
          title: n.title,
          category: "ACADEMIC",
          date: n.publish_date?.split("T")[0] || "2025-01-12",
          sender: "Office of the Principal & Academic Council",
          summary: n.content_markdown?.slice(0, 100) || "",
          body: n.content_markdown || "",
          priority: n.is_pinned ? "URGENT" : "STANDARD",
          requiresConsent: true,
          isSigned: storeMatch?.isSigned ?? false,
          signedDate: storeMatch?.signedDate,
        };
      });
    }
  } catch (err) {
    console.warn("Supabase query fallback for fetchParentBulletins:", err);
  }

  return storeNotices.map((n) => ({
    id: n.id,
    title: n.title,
    category: (n.category as any) || "ACADEMIC",
    date: n.date,
    sender: n.author || "Office of the Principal & Science Department",
    summary: n.summary,
    body: n.body,
    priority: n.priority,
    requiresConsent: n.requiresConsent,
    isSigned: n.isSigned,
    signedDate: n.signedDate,
  }));
}

// UPDATE: Sign Notice Consent
export async function signNoticeConsent(
  noticeIdOrPayload: string | { noticeId: string; digitalSignature?: string; wardId?: string }
): Promise<{ success: boolean; signedDate: string }> {
  const notId = typeof noticeIdOrPayload === "string" ? noticeIdOrPayload : noticeIdOrPayload.noticeId;
  const signerName = typeof noticeIdOrPayload === "string" ? "Dr. Vikram Sharma" : (noticeIdOrPayload.digitalSignature || "Dr. Vikram Sharma");
  const signedDate = new Date().toISOString().split("T")[0];

  // Sync to shared reactive store
  sharedStore.signNotice(notId, signerName);

  const supabase = createClient();
  try {
    await supabase.from("audit_logs").insert({
      action: "SIGN_CONSENT",
      entity_table: "notices",
      entity_id: notId,
      new_values: { signedDate, signer: signerName, status: "SIGNED" },
    });
  } catch (err) {
    console.warn("Supabase insert for signNoticeConsent:", err);
  }

  return { success: true, signedDate };
}


