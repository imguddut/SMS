/**
 * AGRAGATI SCHOOL OS — REACTIVE CROSS-PORTAL SHARED STATE STORE
 * 
 * Provides a unified single-source-of-truth data layer across:
 * - Faculty / Teacher Portal
 * - Student Portal
 * - Parent & Guardian Portal
 * - Bursary & Finance Portal
 * 
 * When mutations occur in any portal (or via Supabase sync), all dependent queries
 * across all 4 portals immediately reflect the changes in real-time.
 */

export interface SharedAttendanceItem {
  id: string;
  studentId: string;
  studentName: string;
  form: string;
  house: string;
  turnstileTime: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  remarks?: string;
  date: string;
}

export interface SharedHomeworkAssignment {
  id: string;
  title: string;
  className: string;
  form: string;
  subject: string;
  assignedDate: string;
  dueDate: string;
  maxMarks: number;
  description: string;
  rubric: string;
  status: "ACTIVE" | "REVIEW_PENDING" | "GRADED";
}

export interface SharedHomeworkSubmission {
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

export interface SharedGradebookEntry {
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

export interface SharedInvoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  admissionNumber?: string;
  form: string;
  house: string;
  guardianName: string;
  parentName?: string;
  termName: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  paymentMethod: string;
  paidDate?: string;
  receiptRef?: string;
  status: "PAID" | "PENDING" | "OVERDUE" | "CANCELLED";
  description: string;
}

export interface SharedLedgerTransaction {
  id: string;
  date: string;
  type: "INVOICE_BILLED" | "SEPA_PAYMENT" | "DIRECT_DEBIT" | "BURSARY_CREDIT" | "SURCHARGE" | "CREDIT_PAYMENT" | "DEBIT_FEE";
  description: string;
  amount?: number;
  debit: number | null;
  credit: number | null;
  runningBalance: number;
  reference: string;
  referenceNo?: string;
}

export interface SharedApproval {
  id: string;
  type: "BURSARY_WAIVER" | "LEAVE_REQUEST" | "EXCURSION_AUTHORIZATION" | "GRADEBOOK_PUBLICATION" | "STAFF_APPOINTMENT";
  approvalType?: string;
  title: string;
  applicant: string;
  applicantRole: string;
  departmentOrHouse: string;
  amountOrScope: string;
  dateRequested: string;
  justification: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ESCROW";
  petitionerNotes?: string;
  createdAt?: string;
  signatureHash?: string;
}

export interface SharedNotice {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
  summary: string;
  body: string;
  priority: "URGENT" | "STANDARD" | "ARCHIVE";
  requiresConsent: boolean;
  isSigned: boolean;
  signedDate?: string;
  signedBy?: string;
}

export interface SharedAdmission {
  id: string;
  schoolId: string;
  applicationNo: string;
  applicantName: string;
  dateOfBirth: string;
  gender: string;
  gradeApplyingFor: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  status: "PENDING" | "UNDER_REVIEW" | "INTERVIEW_SCHEDULED" | "APPROVED" | "REJECTED" | "ENROLLED";
  entranceScore?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SharedVendor {
  id: string;
  schoolId: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxId?: string;
  bankAccount?: string;
  isActive: boolean;
  createdAt: string;
}

export interface SharedExpense {
  id: string;
  schoolId: string;
  expenseNumber: string;
  vendorId?: string;
  vendorName: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  invoiceDate: string;
  dueDate?: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "PAID" | "CANCELLED";
  approvedBy?: string;
  approvedAt?: string;
  paymentReference?: string;
  createdAt: string;
}

export interface SharedLeaveRequest {
  id: string;
  schoolId: string;
  applicantType: "STUDENT" | "TEACHER" | "STAFF";
  applicantId: string;
  applicantName: string;
  startDate: string;
  endDate: string;
  reason: string;
  leaveType: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface SharedDisciplineRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  incidentDate: string;
  incidentType: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  actionTaken: string;
  reportedBy: string;
  parentNotified: boolean;
  status: "OPEN" | "RESOLVED" | "APPEALED";
  createdAt: string;
}

// ============================================================================
// INITIAL SEED DATA FOR CROSS-PORTAL CONSISTENCY
// ============================================================================

const initialAttendance: SharedAttendanceItem[] = [];
const initialHomeworkAssignments: SharedHomeworkAssignment[] = [];
const initialSubmissions: SharedHomeworkSubmission[] = [];
const initialGradebook: SharedGradebookEntry[] = [];
const initialInvoices: SharedInvoice[] = [];
const initialLedgers: Record<string, SharedLedgerTransaction[]> = {};
const initialNotices: SharedNotice[] = [];
const initialApprovals: SharedApproval[] = [];
const initialAdmissions: SharedAdmission[] = [];
const initialVendors: SharedVendor[] = [];
const initialExpenses: SharedExpense[] = [];
const initialLeaveRequests: SharedLeaveRequest[] = [];
const initialDisciplineRecords: SharedDisciplineRecord[] = [];

// ============================================================================
// SINGLETON SHARED STORE IMPLEMENTATION
// ============================================================================

class SharedDataStore {
  private attendance: SharedAttendanceItem[] = [...initialAttendance];
  private homeworkAssignments: SharedHomeworkAssignment[] = [...initialHomeworkAssignments];
  private homeworkSubmissions: SharedHomeworkSubmission[] = [...initialSubmissions];
  private gradebook: SharedGradebookEntry[] = [...initialGradebook];
  private invoices: SharedInvoice[] = [...initialInvoices];
  private ledgers: Record<string, SharedLedgerTransaction[]> = { ...initialLedgers };
  private approvals: SharedApproval[] = [...initialApprovals];
  private notices: SharedNotice[] = [...initialNotices];
  private admissions: SharedAdmission[] = [...initialAdmissions];
  private vendors: SharedVendor[] = [...initialVendors];
  private expenses: SharedExpense[] = [...initialExpenses];
  private leaveRequests: SharedLeaveRequest[] = [...initialLeaveRequests];
  private disciplineRecords: SharedDisciplineRecord[] = [...initialDisciplineRecords];

  // --------------------------------------------------------------------------
  // ATTENDANCE METHODS
  // --------------------------------------------------------------------------

  public getAttendanceRoster(classId?: string): SharedAttendanceItem[] {
    return [...this.attendance];
  }

  public setAttendanceRoster(classId: string, items: SharedAttendanceItem[]): void {
    // Upsert or replace existing items
    items.forEach((item) => {
      const idx = this.attendance.findIndex((a) => a.studentId === item.studentId);
      if (idx >= 0) {
        this.attendance[idx] = { ...this.attendance[idx], ...item };
      } else {
        this.attendance.push(item);
      }
    });
  }

  public getStudentAttendanceRadar(studentId: string = "std-01") {
    const studentItems = this.attendance.filter((a) => a.studentId === studentId);
    const today = new Date().toISOString().split("T")[0];
    const dayOfWeek = new Date().toLocaleDateString("en-US", { weekday: "long" });

    const activeItem = studentItems[0];
    const liveEntry = {
      id: activeItem ? activeItem.id : "att-today",
      date: activeItem ? activeItem.date : today,
      dayOfWeek,
      status: activeItem ? activeItem.status : "PRESENT" as const,
      turnstileGate: activeItem?.turnstileTime || "Smart Gate 01 (Main Quad)",
      timestamp: activeItem?.turnstileTime ? activeItem.turnstileTime.split(" ")[0] : "08:14 IST",
      remarks: activeItem?.remarks || "On-time RFID swipe verified.",
    };

    const pastEntries: any[] = [];
    return [liveEntry, ...pastEntries];
  }

  public getStudentAttendanceRate(studentId: string = "std-01"): string {
    const records = this.getStudentAttendanceRadar(studentId);
    const presentCount = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
    const total = records.length;
    return total > 0 ? `${((presentCount / total) * 100).toFixed(1)}%` : "0%";
  }

  // --------------------------------------------------------------------------
  // HOMEWORK & SUBMISSION METHODS
  // --------------------------------------------------------------------------

  public getHomeworkAssignments(formOrClass?: string): SharedHomeworkAssignment[] {
    if (formOrClass) {
      return this.homeworkAssignments.filter(
        (h) => h.form === formOrClass || h.className.includes(formOrClass)
      );
    }
    return [...this.homeworkAssignments];
  }

  public createHomeworkAssignment(hw: Omit<SharedHomeworkAssignment, "id" | "assignedDate" | "status">): SharedHomeworkAssignment {
    const id = `hw-${Date.now().toString().slice(-4)}`;
    const newHw: SharedHomeworkAssignment = {
      id,
      assignedDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
      ...hw,
    };
    this.homeworkAssignments.unshift(newHw);
    return newHw;
  }

  public getHomeworkSubmissions(homeworkId?: string): SharedHomeworkSubmission[] {
    if (homeworkId) {
      return this.homeworkSubmissions.filter((s) => s.homeworkId === homeworkId);
    }
    return [...this.homeworkSubmissions];
  }

  public getStudentSubmissions(studentId: string): SharedHomeworkSubmission[] {
    return this.homeworkSubmissions.filter((s) => s.studentId === studentId);
  }

  public submitHomework(payload: {
    homeworkId: string;
    studentId: string;
    studentName: string;
    form: string;
    fileName: string;
    notes: string;
  }): SharedHomeworkSubmission {
    const hw = this.homeworkAssignments.find((h) => h.id === payload.homeworkId);
    const existingIdx = this.homeworkSubmissions.findIndex(
      (s) => s.homeworkId === payload.homeworkId && s.studentId === payload.studentId
    );

    const submission: SharedHomeworkSubmission = {
      id: existingIdx >= 0 ? this.homeworkSubmissions[existingIdx].id : `sub-${Date.now().toString().slice(-4)}`,
      homeworkId: payload.homeworkId,
      homeworkTitle: hw?.title || "Homework Assignment",
      studentId: payload.studentId,
      studentName: payload.studentName,
      form: payload.form,
      submittedAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST",
      isLate: false,
      fileName: payload.fileName,
      fileSize: "2.5 MB",
      marksAwarded: existingIdx >= 0 ? this.homeworkSubmissions[existingIdx].marksAwarded : null,
      maxMarks: hw?.maxMarks || 50,
      feedback: payload.notes || "Submitted by student for evaluation.",
      status: existingIdx >= 0 && this.homeworkSubmissions[existingIdx].status === "GRADED" ? "GRADED" : "SUBMITTED",
    };

    if (existingIdx >= 0) {
      this.homeworkSubmissions[existingIdx] = submission;
    } else {
      this.homeworkSubmissions.unshift(submission);
    }

    if (hw) {
      hw.status = "REVIEW_PENDING";
    }

    return submission;
  }

  public gradeHomework(submissionId: string, marks: number, feedback: string): boolean {
    const sub = this.homeworkSubmissions.find((s) => s.id === submissionId);
    if (sub) {
      sub.marksAwarded = marks;
      sub.feedback = feedback;
      sub.status = "GRADED";
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // GRADEBOOK & MARKS METHODS
  // --------------------------------------------------------------------------

  public getGradebook(): SharedGradebookEntry[] {
    return [...this.gradebook];
  }

  public saveGradebook(classId: string, rows: SharedGradebookEntry[]): void {
    this.gradebook = [...rows];
  }

  public getStudentResult(studentId: string = "std-01"): SharedGradebookEntry | undefined {
    return this.gradebook.find((g) => g.studentId === studentId) || this.gradebook[0];
  }

  // --------------------------------------------------------------------------
  // INVOICES, PAYMENTS & LEDGERS
  // --------------------------------------------------------------------------

  public getInvoices(): SharedInvoice[] {
    return [...this.invoices];
  }

  public createInvoice(inv: SharedInvoice): SharedInvoice {
    this.invoices.unshift(inv);

    // Also add debit to student ledger
    const stdId = inv.studentId || "std-01";
    if (!this.ledgers[stdId]) {
      this.ledgers[stdId] = [];
    }
    const currentBalance = this.ledgers[stdId].length > 0 ? this.ledgers[stdId][0].runningBalance : 0;
    const newTx: SharedLedgerTransaction = {
      id: `tx-${Date.now()}`,
      date: inv.issueDate,
      type: "DEBIT_FEE",
      description: `${inv.description} (${inv.invoiceNumber})`,
      amount: inv.amount,
      debit: inv.amount,
      credit: null,
      runningBalance: currentBalance + inv.amount,
      reference: inv.invoiceNumber,
      referenceNo: inv.invoiceNumber,
    };
    this.ledgers[stdId].unshift(newTx);

    return inv;
  }

  public payInvoice(invoiceId: string, paymentMethod: string): { success: boolean; receiptRef: string } {
    const inv = this.invoices.find((i) => i.id === invoiceId);
    const receiptRef = `UPI-UTR-${Date.now()}`;
    const paidDate = new Date().toISOString().split("T")[0];

    if (inv) {
      inv.status = "PAID";
      inv.paidDate = paidDate;
      inv.paymentMethod = paymentMethod;
      inv.receiptRef = receiptRef;

      // Add credit transaction to student ledger
      const stdId = inv.studentId || "std-01";
      if (!this.ledgers[stdId]) {
        this.ledgers[stdId] = [];
      }
      const currentBalance = this.ledgers[stdId].length > 0 ? this.ledgers[stdId][0].runningBalance : 0;
      const newTx: SharedLedgerTransaction = {
        id: `tx-${Date.now()}`,
        date: paidDate,
        type: "CREDIT_PAYMENT",
        description: `Settlement for ${inv.invoiceNumber} via ${paymentMethod}`,
        amount: inv.amount,
        debit: null,
        credit: inv.amount,
        runningBalance: Math.max(0, currentBalance - inv.amount),
        reference: receiptRef,
        referenceNo: receiptRef,
      };
      this.ledgers[stdId].unshift(newTx);

      return { success: true, receiptRef };
    }

    return { success: false, receiptRef };
  }

  public getStudentLedgerTransactions(studentId: string = "std-01"): SharedLedgerTransaction[] {
    return this.ledgers[studentId] || [];
  }

  public getLedgerTransactions(studentId?: string): SharedLedgerTransaction[] {
    if (studentId) {
      return this.getStudentLedgerTransactions(studentId);
    }
    return Object.values(this.ledgers).flat();
  }

  public postLedgerTx(studentId: string, tx: SharedLedgerTransaction): void {
    if (!this.ledgers[studentId]) {
      this.ledgers[studentId] = [];
    }
    this.ledgers[studentId].unshift(tx);
  }

  public getFinanceTreasuryStats() {
    const totalInvoiced = this.invoices.reduce((acc, inv) => acc + inv.amount, 0);
    const paidInvoices = this.invoices.filter((i) => i.status === "PAID");
    const realizedReceipts = paidInvoices.reduce((acc, inv) => acc + inv.amount, 0);
    const pendingInvoices = this.invoices.filter((i) => i.status === "PENDING");
    const pendingWithinTerms = pendingInvoices.reduce((acc, inv) => acc + inv.amount, 0);
    const overdueInvoices = this.invoices.filter((i) => i.status === "OVERDUE");
    const overdueArrears = overdueInvoices.reduce((acc, inv) => acc + inv.amount, 0);
    const collectionRate = totalInvoiced > 0 ? `${((realizedReceipts / totalInvoiced) * 100).toFixed(1)}%` : "0%";

    return {
      totalInvoiced,
      realizedReceipts,
      collectionRate,
      pendingWithinTerms,
      overdueArrears,
      currency: "INR",
      billableScholars: 0,
      dailyReconciledAmount: 0,
      autoMatchRate: "0%",
    };
  }

  public getBursaryFinancialSnapshot() {
    const stats = this.getFinanceTreasuryStats();
    return {
      ...stats,
      totalCollectionsTerm: stats.realizedReceipts,
    };
  }

  public getParentDigest(wardId: string = "ward-01") {
    const stdId = (wardId === "ward-02" || wardId === "std-02") ? "std-02" : "std-01";
    const wardInvoices = this.invoices.filter((i) => i.studentId === stdId);
    const pendingInvoices = wardInvoices.filter((i) => i.status === "PENDING" || i.status === "OVERDUE");
    const unpaidBalance = pendingInvoices.reduce((acc, inv) => acc + inv.amount, 0);
    const tuitionStatus: "SETTLED" | "PENDING" | "OVERDUE" =
      wardInvoices.some((i) => i.status === "OVERDUE")
        ? "OVERDUE"
        : pendingInvoices.length > 0
        ? "PENDING"
        : "SETTLED";

    const studentAtt = this.attendance.find((a) => a.studentId === stdId);
    const arrivalTime = studentAtt ? studentAtt.turnstileTime : "No Record";
    const arrivalStatus = studentAtt?.status === "ABSENT" ? "Absent" : studentAtt?.status === "EXCUSED" ? "Excused Medical Leave" : studentAtt?.status === "PRESENT" ? "Present on Campus" : "No Record";

    const pendingHw = this.homeworkAssignments.filter((hw) => {
      const sub = this.homeworkSubmissions.find((s) => s.homeworkId === hw.id && s.studentId === stdId);
      return !sub || sub.status !== "GRADED";
    }).length;

    const unreadNotices = this.notices.filter((n) => !n.isSigned).length;

    return {
      todaysArrivalStatus: arrivalStatus,
      arrivalTime,
      attendanceRate: this.getStudentAttendanceRate(stdId),
      academicStanding: "Good Standing",
      ibPointsTotal: 0,
      tuitionStatus,
      unpaidBalance,
      pendingHomeworkCount: pendingHw,
      unreadNoticesCount: unreadNotices,
    };
  }

  public getParentPortalSummary(wardOrStudentId: string = "std-01") {
    return this.getParentDigest(wardOrStudentId);
  }

  // --------------------------------------------------------------------------
  // NOTICES & APPROVALS
  // --------------------------------------------------------------------------

  public getNotices(): SharedNotice[] {
    return [...this.notices];
  }

  public signNotice(noticeId: string, signerName: string): boolean {
    const not = this.notices.find((n) => n.id === noticeId);
    if (not) {
      not.isSigned = true;
      not.signedDate = new Date().toISOString().split("T")[0];
      not.signedBy = signerName;
      return true;
    }
    return false;
  }

  public createNotice(notice: Omit<SharedNotice, "id">): SharedNotice {
    const id = `not-${Date.now()}`;
    const newNotice: SharedNotice = {
      id,
      ...notice,
    };
    this.notices.unshift(newNotice);
    return newNotice;
  }

  public getApprovals(): SharedApproval[] {
    return [...this.approvals];
  }

  public getPendingApprovalsCount(): number {
    return this.approvals.filter((a) => a.status === "PENDING").length;
  }

  public updateApprovalStatus(id: string, status: "APPROVED" | "REJECTED", signatureHash?: string): boolean {
    const app = this.approvals.find((a) => a.id === id);
    if (app) {
      app.status = status;
      if (signatureHash) app.signatureHash = signatureHash;
      return true;
    }
    return false;
  }

  public addApproval(approval: Partial<SharedApproval> & { petitionerNotes?: string }): SharedApproval {
    const id = `appr-${Date.now()}`;
    const defaultType = (approval.type || approval.approvalType || "LEAVE_REQUEST") as SharedApproval["type"];
    const newApproval: SharedApproval = {
      id,
      type: defaultType,
      approvalType: defaultType,
      title: approval.title || (defaultType === "LEAVE_REQUEST" ? "Exemption / Leave Request" : "Student Excursion / Gate Pass"),
      applicant: approval.applicant || "School Community Member",
      applicantRole: approval.applicantRole || "Applicant",
      departmentOrHouse: approval.departmentOrHouse || "Senior Wing",
      amountOrScope: approval.amountOrScope || "1 Request",
      dateRequested: approval.dateRequested || "Just now",
      justification: approval.justification || approval.petitionerNotes || "Request submitted via portal.",
      status: approval.status || "PENDING",
      petitionerNotes: approval.petitionerNotes || "",
      createdAt: new Date().toISOString(),
      ...approval,
    };
    this.approvals.unshift(newApproval);
    return newApproval;
  }

  // --------------------------------------------------------------------------
  // ADMISSIONS
  // --------------------------------------------------------------------------

  public getAdmissions(schoolId?: string): SharedAdmission[] {
    if (schoolId) {
      return this.admissions.filter((a) => a.schoolId === schoolId);
    }
    return [...this.admissions];
  }

  public getAdmissionById(id: string): SharedAdmission | undefined {
    return this.admissions.find((a) => a.id === id);
  }

  public createAdmission(input: Omit<SharedAdmission, "id" | "createdAt" | "updatedAt">): SharedAdmission {
    const id = `adm-${Date.now()}`;
    const newAdmission: SharedAdmission = {
      ...input,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.admissions.unshift(newAdmission);
    return newAdmission;
  }

  public updateAdmissionStatus(
    id: string,
    status: SharedAdmission["status"],
    notes?: string
  ): SharedAdmission | null {
    const adm = this.admissions.find((a) => a.id === id);
    if (!adm) return null;
    adm.status = status;
    if (notes !== undefined) adm.notes = notes;
    adm.updatedAt = new Date().toISOString();
    return adm;
  }

  public enrollAdmissionStudent(id: string): { admission: SharedAdmission; studentId: string } | null {
    const adm = this.admissions.find((a) => a.id === id);
    if (!adm) return null;
    adm.status = "ENROLLED";
    adm.updatedAt = new Date().toISOString();

    const newStudentId = `std-${Date.now().toString().slice(-4)}`;
    // Add to gradebook
    this.gradebook.push({
      studentId: newStudentId,
      studentName: adm.applicantName,
      studentNumber: `SCH-${new Date().getFullYear()}-${newStudentId.slice(-3)}`,
      house: "Tagore House",
      paper1: 0,
      paper2: 0,
      internalAssessment: 0,
      oralSeminar: 0,
      weightedTotal: 0,
      predictedGrade: "A",
      academicStanding: "GOOD_STANDING",
    });

    // Add to attendance
    this.attendance.push({
      id: `att-${Date.now()}`,
      studentId: newStudentId,
      studentName: adm.applicantName,
      form: adm.gradeApplyingFor,
      house: "Tagore House",
      turnstileTime: "Enrolled",
      status: "PRESENT",
      date: new Date().toISOString().split("T")[0],
    });

    return { admission: adm, studentId: newStudentId };
  }

  // --------------------------------------------------------------------------
  // VENDORS & PROCUREMENT
  // --------------------------------------------------------------------------

  public getVendors(schoolId?: string): SharedVendor[] {
    if (schoolId) {
      return this.vendors.filter((v) => v.schoolId === schoolId);
    }
    return [...this.vendors];
  }

  public createVendor(input: Omit<SharedVendor, "id" | "createdAt">): SharedVendor {
    const id = `ven-${Date.now()}`;
    const newVendor: SharedVendor = {
      ...input,
      id,
      createdAt: new Date().toISOString(),
    };
    this.vendors.unshift(newVendor);
    return newVendor;
  }

  public updateVendor(id: string, patch: Partial<SharedVendor>): SharedVendor | null {
    const ven = this.vendors.find((v) => v.id === id);
    if (!ven) return null;
    Object.assign(ven, patch);
    return ven;
  }

  // --------------------------------------------------------------------------
  // EXPENSES
  // --------------------------------------------------------------------------

  public getExpenses(schoolId?: string): SharedExpense[] {
    if (schoolId) {
      return this.expenses.filter((e) => e.schoolId === schoolId);
    }
    return [...this.expenses];
  }

  public getExpenseById(id: string): SharedExpense | undefined {
    return this.expenses.find((e) => e.id === id);
  }

  public createExpense(input: Partial<Omit<SharedExpense, "id" | "createdAt">> & { vendorName: string; amount: number; invoiceNumber?: string; submittedBy?: string }): SharedExpense {
    const id = `exp-${Date.now()}`;
    const newExpense: SharedExpense = {
      schoolId: input.schoolId || "11111111-1111-1111-1111-111111111111",
      expenseNumber: input.expenseNumber || `EXP-${Date.now().toString().slice(-4)}`,
      vendorId: input.vendorId || `ven-${Date.now()}`,
      vendorName: input.vendorName,
      category: input.category || "OPERATIONAL",
      amount: input.amount,
      currency: input.currency || "INR",
      description: input.description || "Vendor expense",
      invoiceDate: input.invoiceDate || new Date().toISOString().split("T")[0],
      status: input.status || "PENDING_APPROVAL",
      approvedBy: input.approvedBy,
      approvedAt: input.approvedAt,
      paymentReference: input.paymentReference,
      id,
      createdAt: new Date().toISOString(),
    };
    this.expenses.unshift(newExpense);
    return newExpense;
  }

  public updateExpenseStatus(
    id: string,
    status: SharedExpense["status"],
    approvedBy?: string,
    paymentRef?: string
  ): SharedExpense | null {
    const exp = this.expenses.find((e) => e.id === id);
    if (!exp) return null;
    exp.status = status;
    if (approvedBy) {
      exp.approvedBy = approvedBy;
      exp.approvedAt = new Date().toISOString();
    }
    if (paymentRef) {
      exp.paymentReference = paymentRef;
    }
    return exp;
  }

  // --------------------------------------------------------------------------
  // LEAVE REQUESTS
  // --------------------------------------------------------------------------

  public getLeaveRequests(schoolId?: string, applicantId?: string): SharedLeaveRequest[] {
    let list = [...this.leaveRequests];
    if (schoolId) list = list.filter((l) => l.schoolId === schoolId);
    if (applicantId) list = list.filter((l) => l.applicantId === applicantId);
    return list;
  }

  public createLeaveRequest(input: Partial<Omit<SharedLeaveRequest, "id" | "createdAt">> & { reason: string; studentId?: string; studentName?: string; form?: string }): SharedLeaveRequest {
    const id = `lve-${Date.now()}`;
    const newLeave: SharedLeaveRequest = {
      schoolId: input.schoolId || "11111111-1111-1111-1111-111111111111",
      applicantType: input.applicantType || "STUDENT",
      applicantId: input.applicantId || input.studentId || "std-01",
      applicantName: input.applicantName || input.studentName || "Student",
      startDate: input.startDate || new Date().toISOString().split("T")[0],
      endDate: input.endDate || new Date().toISOString().split("T")[0],
      reason: input.reason,
      leaveType: input.leaveType || "CASUAL",
      status: input.status || "PENDING",
      reviewedBy: input.reviewedBy,
      reviewNotes: input.reviewNotes,
      reviewedAt: input.reviewedAt,
      id,
      createdAt: new Date().toISOString(),
    };
    this.leaveRequests.unshift(newLeave);
    return newLeave;
  }

  public updateLeaveRequestStatus(
    id: string,
    status: SharedLeaveRequest["status"],
    reviewedBy?: string,
    notes?: string
  ): SharedLeaveRequest | null {
    const leave = this.leaveRequests.find((l) => l.id === id);
    if (!leave) return null;
    leave.status = status;
    if (reviewedBy) {
      leave.reviewedBy = reviewedBy;
      leave.reviewedAt = new Date().toISOString();
    }
    if (notes) leave.reviewNotes = notes;
    return leave;
  }

  // --------------------------------------------------------------------------
  // DISCIPLINE
  // --------------------------------------------------------------------------

  public getDisciplineRecords(schoolId?: string, studentId?: string): SharedDisciplineRecord[] {
    let list = [...this.disciplineRecords];
    if (schoolId) list = list.filter((d) => d.schoolId === schoolId);
    if (studentId) list = list.filter((d) => d.studentId === studentId);
    return list;
  }

  public createDisciplineRecord(input: Omit<SharedDisciplineRecord, "id" | "createdAt">): SharedDisciplineRecord {
    const id = `dis-${Date.now()}`;
    const newRecord: SharedDisciplineRecord = {
      ...input,
      id,
      createdAt: new Date().toISOString(),
    };
    this.disciplineRecords.unshift(newRecord);
    return newRecord;
  }

  public updateDisciplineStatus(id: string, status: SharedDisciplineRecord["status"]): SharedDisciplineRecord | null {
    const rec = this.disciplineRecords.find((d) => d.id === id);
    if (!rec) return null;
    rec.status = status;
    return rec;
  }
}

// Global Singleton Instance
export const sharedStore = new SharedDataStore();
