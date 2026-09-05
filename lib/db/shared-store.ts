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
  approvalType: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  petitionerNotes: string;
  createdAt: string;
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

// ============================================================================
// INITIAL SEED DATA FOR CROSS-PORTAL CONSISTENCY
// ============================================================================

const initialAttendance: SharedAttendanceItem[] = [
  {
    id: "att-01",
    studentId: "std-01",
    studentName: "Aarav Sharma",
    form: "Class 12-A",
    house: "Tagore House",
    turnstileTime: "08:14 IST (Smart Gate 01)",
    status: "PRESENT",
    date: new Date().toISOString().split("T")[0],
    remarks: "Morning roll-call verified via Smart RFID Turnstile.",
  },
  {
    id: "att-02",
    studentId: "std-02",
    studentName: "Ananya Iyer",
    form: "Class 12-A",
    house: "Ashoka House",
    turnstileTime: "08:18 IST (Smart Gate 01)",
    status: "PRESENT",
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: "att-03",
    studentId: "std-03",
    studentName: "Rohan Singhania",
    form: "Class 12-A",
    house: "Ashoka House",
    turnstileTime: "08:22 IST (Smart Gate 02)",
    status: "PRESENT",
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: "att-04",
    studentId: "std-04",
    studentName: "Priya Patel",
    form: "Class 12-A",
    house: "Shivaji House",
    turnstileTime: "08:11 IST (Smart Gate 03)",
    status: "PRESENT",
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: "att-05",
    studentId: "std-05",
    studentName: "Devansh Gupta",
    form: "Class 12-A",
    house: "Raman House",
    turnstileTime: "08:32 IST (Late Entry)",
    status: "LATE",
    date: new Date().toISOString().split("T")[0],
    remarks: "School Bus Route 14 delayed in traffic",
  },
  {
    id: "att-06",
    studentId: "std-06",
    studentName: "Kabir Mehta",
    form: "Class 12-A",
    house: "Raman House",
    turnstileTime: "Medical Sick Bay Leave",
    status: "EXCUSED",
    date: new Date().toISOString().split("T")[0],
    remarks: "Parent submitted medical slip",
  },
];

const initialHomeworkAssignments: SharedHomeworkAssignment[] = [
  {
    id: "hw-01",
    title: "Three-Dimensional Geometry & Vector Algebra (CBSE PS-05)",
    className: "Class 12-A - Advanced Pure Mathematics & Physics",
    form: "Class 12-A",
    subject: "Mathematics (CBSE 041)",
    assignedDate: "2025-01-20",
    dueDate: "2025-01-27",
    maxMarks: 50,
    description: "Complete all derivations for shortest distance between skew lines and Cartesian plane equations.",
    rubric: "Step-by-step vector proofs (20 marks), correct algebraic reduction (20 marks), diagrammatic clarity (10 marks).",
    status: "REVIEW_PENDING",
  },
  {
    id: "hw-02",
    title: "CBSE Board Investigatory Project: Electromagnetic Induction",
    className: "Class 12-A - Advanced Pure Mathematics & Physics",
    form: "Class 12-A",
    subject: "Physics (CBSE 042)",
    assignedDate: "2025-01-18",
    dueDate: "2025-01-28",
    maxMarks: 30,
    description: "Self-induction and mutual induction transformer working model project report with circuit schematics.",
    rubric: "Circuit diagram (10 marks), Experimental calculations (10 marks), Inference & Viva (10 marks).",
    status: "ACTIVE",
  },
  {
    id: "hw-03",
    title: "Python Data Visualization & MySQL Connectivity Project",
    className: "Class 12-A - Advanced Pure Mathematics & Physics",
    form: "Class 12-A",
    subject: "Computer Science (CBSE 083)",
    assignedDate: "2025-01-05",
    dueDate: "2025-01-15",
    maxMarks: 50,
    description: "Pandas DataFrame analysis, Matplotlib charts, and robust SQL backend connection.",
    rubric: "SQL queries (20 marks), Data pipelines (15 marks), Code styling & Documentation (15 marks).",
    status: "GRADED",
  },
];

const initialSubmissions: SharedHomeworkSubmission[] = [
  {
    id: "sub-01",
    homeworkId: "hw-01",
    homeworkTitle: "Three-Dimensional Geometry & Vector Algebra (CBSE PS-05)",
    studentId: "std-01",
    studentName: "Aarav Sharma",
    form: "Class 12-A",
    submittedAt: "2025-01-26, 21:42 IST",
    isLate: false,
    fileName: "Aarav_Sharma_Math_3DGeometry_PS5.pdf",
    fileSize: "2.8 MB",
    marksAwarded: 49,
    maxMarks: 50,
    feedback: "Exceptional mathematical clarity. Skew line distance derivation was step-by-step and cleanly formatted.",
    status: "GRADED",
  },
  {
    id: "sub-02",
    homeworkId: "hw-01",
    homeworkTitle: "Three-Dimensional Geometry & Vector Algebra (CBSE PS-05)",
    studentId: "std-02",
    studentName: "Ananya Iyer",
    form: "Class 12-A",
    submittedAt: "2025-01-27, 16:50 IST",
    isLate: false,
    fileName: "Ananya_Iyer_Vectors_PS5.pdf",
    fileSize: "2.4 MB",
    marksAwarded: 48,
    maxMarks: 50,
    feedback: "Flawless vector cross-product application. Very neat presentation.",
    status: "GRADED",
  },
  {
    id: "sub-03",
    homeworkId: "hw-01",
    homeworkTitle: "Three-Dimensional Geometry & Vector Algebra (CBSE PS-05)",
    studentId: "std-03",
    studentName: "Rohan Singhania",
    form: "Class 12-A",
    submittedAt: "2025-01-27, 17:35 IST",
    isLate: true,
    fileName: "Rohan_Singhania_ProblemSet5.pdf",
    fileSize: "3.2 MB",
    marksAwarded: 44,
    maxMarks: 50,
    feedback: "Good attempt. Watch out for direction cosine normalization in Question 4.",
    status: "GRADED",
  },
  {
    id: "sub-04",
    homeworkId: "hw-01",
    homeworkTitle: "Three-Dimensional Geometry & Vector Algebra (CBSE PS-05)",
    studentId: "std-05",
    studentName: "Devansh Gupta",
    form: "Class 12-A",
    submittedAt: "2025-01-27, 14:10 IST",
    isLate: false,
    fileName: "Devansh_Gupta_Math_PS5.pdf",
    fileSize: "2.1 MB",
    marksAwarded: 42,
    maxMarks: 50,
    feedback: "Solid foundation. Review the formula for the angle between a line and a plane.",
    status: "GRADED",
  },
];

const initialGradebook: SharedGradebookEntry[] = [
  {
    studentId: "std-01",
    studentName: "Aarav Sharma",
    studentNumber: "ADM-2024-001",
    house: "Tagore House",
    paper1: 78,
    paper2: 39,
    internalAssessment: 19,
    oralSeminar: 20,
    weightedTotal: 96.4,
    predictedGrade: "A1 (98%)",
    academicStanding: "HIGH_HONORS",
  },
  {
    studentId: "std-02",
    studentName: "Ananya Iyer",
    studentNumber: "ADM-2024-002",
    house: "Ashoka House",
    paper1: 74,
    paper2: 37,
    internalAssessment: 18,
    oralSeminar: 19,
    weightedTotal: 92.0,
    predictedGrade: "A1 (94%)",
    academicStanding: "HIGH_HONORS",
  },
  {
    studentId: "std-03",
    studentName: "Rohan Singhania",
    studentNumber: "ADM-2024-003",
    house: "Ashoka House",
    paper1: 70,
    paper2: 35,
    internalAssessment: 17,
    oralSeminar: 18,
    weightedTotal: 87.0,
    predictedGrade: "A2 (89%)",
    academicStanding: "HONORS",
  },
  {
    studentId: "std-04",
    studentName: "Priya Patel",
    studentNumber: "ADM-2024-004",
    house: "Shivaji House",
    paper1: 68,
    paper2: 34,
    internalAssessment: 16,
    oralSeminar: 17,
    weightedTotal: 84.0,
    predictedGrade: "B1 (85%)",
    academicStanding: "HONORS",
  },
  {
    studentId: "std-05",
    studentName: "Devansh Gupta",
    studentNumber: "ADM-2024-005",
    house: "Raman House",
    paper1: 62,
    paper2: 31,
    internalAssessment: 16,
    oralSeminar: 16,
    weightedTotal: 78.0,
    predictedGrade: "B2 (80%)",
    academicStanding: "GOOD_STANDING",
  },
];

const initialInvoices: SharedInvoice[] = [
  {
    id: "inv-01",
    invoiceNumber: "INV-2024-042",
    studentId: "std-01",
    studentName: "Aarav Sharma",
    admissionNumber: "ADM-2024-001",
    form: "Class 12-A",
    house: "Tagore",
    guardianName: "Dr. Vikram Sharma",
    parentName: "Dr. Vikram Sharma",
    termName: "Term 1 (Quarter 1 & 2)",
    amount: 72500,
    currency: "INR",
    issueDate: "2024-07-01",
    dueDate: "2024-07-31",
    paymentMethod: "BHIM UPI (Google Pay)",
    paidDate: "2024-07-10",
    receiptRef: "UPI-UTR-41982716301",
    status: "PAID",
    description: "Class 12 Academic Tuition, Science Lab & Smart Classroom Fee",
  },
  {
    id: "inv-02",
    invoiceNumber: "INV-2025-001",
    studentId: "std-01",
    studentName: "Aarav Sharma",
    admissionNumber: "ADM-2024-001",
    form: "Class 12-A",
    house: "Tagore",
    guardianName: "Dr. Vikram Sharma",
    parentName: "Dr. Vikram Sharma",
    termName: "Term 2 (Quarter 3)",
    amount: 36250,
    currency: "INR",
    issueDate: "2024-10-01",
    dueDate: "2024-10-31",
    paymentMethod: "National Science Olympiad Merit Scholarship Waiver",
    paidDate: "2024-10-08",
    receiptRef: "SCHOLARSHIP-NSO-2024",
    status: "PAID",
    description: "Class 12 Term 2 Tuition & School Bus Transport Levy",
  },
  {
    id: "inv-03",
    invoiceNumber: "INV-2025-142",
    studentId: "std-01",
    studentName: "Aarav Sharma",
    admissionNumber: "ADM-2024-001",
    form: "Class 12-A",
    house: "Tagore",
    guardianName: "Dr. Vikram Sharma",
    parentName: "Dr. Vikram Sharma",
    termName: "Term 2 (Quarter 4)",
    amount: 36250,
    currency: "INR",
    issueDate: "2025-01-05",
    dueDate: "2025-02-05",
    paymentMethod: "BHIM UPI",
    status: "PENDING",
    description: "Class 12 Term 2 Final CBSE Board Examination & Laboratory Charges",
  },
  {
    id: "inv-04",
    invoiceNumber: "INV-2025-143",
    studentId: "std-02",
    studentName: "Ananya Iyer",
    admissionNumber: "ADM-2024-002",
    form: "Class 12-A",
    house: "Ashoka",
    guardianName: "Mrs. Meenakshi Iyer",
    parentName: "Mrs. Meenakshi Iyer",
    termName: "Term 2 (Quarter 4)",
    amount: 36250,
    currency: "INR",
    issueDate: "2025-01-05",
    dueDate: "2025-01-25",
    paymentMethod: "NEFT / RTGS",
    paidDate: "2025-01-12",
    receiptRef: "NEFT-HDFC-9918231",
    status: "PAID",
    description: "Class 12 Term 2 Tuition & Boarding Levy",
  },
  {
    id: "inv-05",
    invoiceNumber: "INV-2025-144",
    studentId: "std-03",
    studentName: "Rohan Singhania",
    admissionNumber: "ADM-2024-003",
    form: "Class 12-A",
    house: "Ashoka",
    guardianName: "Mr. Rajiv Singhania",
    parentName: "Mr. Rajiv Singhania",
    termName: "Term 2 (Quarter 4)",
    amount: 36250,
    currency: "INR",
    issueDate: "2025-01-05",
    dueDate: "2025-01-20",
    paymentMethod: "NetBanking (ICICI)",
    status: "OVERDUE",
    description: "Class 12 Term 2 Tuition Fee",
  },
];

const initialLedgers: Record<string, SharedLedgerTransaction[]> = {
  "std-01": [
    {
      id: "tx-01",
      date: "2025-01-05",
      type: "DEBIT_FEE",
      description: "Class 12 Term 2 Final CBSE Board Examination & Laboratory Charges (INV-2025-142)",
      amount: 36250,
      debit: 36250,
      credit: null,
      runningBalance: 36250,
      reference: "INV-2025-142",
      referenceNo: "INV-2025-142",
    },
    {
      id: "tx-02",
      date: "2024-10-08",
      type: "BURSARY_CREDIT",
      description: "National Science Olympiad Merit Scholarship Waiver (Ref: NSO-2024-AIR1)",
      amount: 36250,
      debit: null,
      credit: 36250,
      runningBalance: 0,
      reference: "SCHOLARSHIP-NSO-2024",
      referenceNo: "SCHOLARSHIP-NSO-2024",
    },
    {
      id: "tx-03",
      date: "2024-10-01",
      type: "DEBIT_FEE",
      description: "Class 12 Term 2 Tuition & School Bus Transport Levy (INV-2025-001)",
      amount: 36250,
      debit: 36250,
      credit: null,
      runningBalance: 36250,
      reference: "INV-2025-001",
      referenceNo: "INV-2025-001",
    },
    {
      id: "tx-04",
      date: "2024-07-10",
      type: "CREDIT_PAYMENT",
      description: "BHIM UPI Instant Settlement via Google Pay (Ref: UPI-41982716301)",
      amount: 72500,
      debit: null,
      credit: 72500,
      runningBalance: 0,
      reference: "UPI-UTR-41982716301",
      referenceNo: "UPI-UTR-41982716301",
    },
    {
      id: "tx-05",
      date: "2024-07-01",
      type: "DEBIT_FEE",
      description: "Class 12 Annual Academic Tuition, Science Lab & Smart Classroom Fee (INV-2024-042)",
      amount: 72500,
      debit: 72500,
      credit: null,
      runningBalance: 72500,
      reference: "INV-2024-042",
      referenceNo: "INV-2024-042",
    },
  ],
};

const initialNotices: SharedNotice[] = [
  {
    id: "not-01",
    title: "ISRO Space Applications Centre Study Tour Briefing & Kit Allocation",
    category: "EXCURSION",
    date: "2025-01-14",
    author: "Principal & Science Faculty",
    summary: "Mandatory student briefing session in the Main Auditorium this Thursday at 15:30 IST.",
    body: "All Class 11 & 12 students participating in the ISRO Space Applications Centre study tour must attend the orientation briefing. Identity badges and travel itineraries will be distributed.",
    priority: "URGENT",
    requiresConsent: true,
    isSigned: false,
  },
  {
    id: "not-02",
    title: "Tagore House Inter-House Debate: 'AI Governance & Ethical Frameworks in India'",
    category: "HOUSE",
    date: "2025-01-12",
    author: "Tagore House Captain Committee",
    summary: "Inter-house debating match against Ashoka House on Friday afternoon.",
    body: "The debate will commence at 14:30 IST in the House Common Room. Aarav Sharma will lead the proposition bench for Tagore House.",
    priority: "STANDARD",
    requiresConsent: false,
    isSigned: true,
    signedDate: "2025-01-13",
    signedBy: "Dr. Vikram Sharma",
  },
  {
    id: "not-03",
    title: "Atal Tinkering Lab (ATL) Science & Robotics Innovation Showcase",
    category: "SOCIETY",
    date: "2025-01-10",
    author: "ATL Innovation & Robotics Club",
    summary: "Exhibition of student IoT prototypes and autonomous robotics projects.",
    body: "Held in ATL Lab Room 204. All Senior Secondary students are warmly invited to witness live project demonstrations.",
    priority: "STANDARD",
    requiresConsent: false,
    isSigned: false,
  },
];

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
  private approvals: SharedApproval[] = [];
  private notices: SharedNotice[] = [...initialNotices];

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

    const pastEntries = [
      {
        id: "satt-02",
        date: "2025-01-13",
        dayOfWeek: "Monday",
        status: "PRESENT" as const,
        turnstileGate: "Smart Gate 01 (Main Quad)",
        timestamp: "08:12 IST",
        remarks: "Full day school attendance recorded.",
      },
      {
        id: "satt-03",
        date: "2025-01-10",
        dayOfWeek: "Friday",
        status: "PRESENT" as const,
        turnstileGate: "Smart Gate 01 (Main Quad)",
        timestamp: "08:10 IST",
        remarks: "Physics practical and sports session completed.",
      },
      {
        id: "satt-04",
        date: "2025-01-09",
        dayOfWeek: "Thursday",
        status: "LATE" as const,
        turnstileGate: "Smart Gate 03 (Library Annex)",
        timestamp: "08:24 IST",
        remarks: "School Bus Route 14 traffic delay recorded.",
      },
      {
        id: "satt-05",
        date: "2025-01-08",
        dayOfWeek: "Wednesday",
        status: "PRESENT" as const,
        turnstileGate: "Smart Gate 01 (Main Quad)",
        timestamp: "08:06 IST",
        remarks: "Chemistry laboratory practical session attendance sealed.",
      },
      {
        id: "satt-06",
        date: "2025-01-07",
        dayOfWeek: "Tuesday",
        status: "EXCUSED" as const,
        turnstileGate: "Medical Sick Bay",
        timestamp: "—",
        remarks: "Medical leave for dental consultation (Doctor slip on record).",
      },
    ];

    return [liveEntry, ...pastEntries];
  }

  public getStudentAttendanceRate(studentId: string = "std-01"): string {
    const records = this.getStudentAttendanceRadar(studentId);
    const presentCount = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
    const total = records.length;
    return total > 0 ? `${((presentCount / total) * 100).toFixed(1)}%` : "99.2%";
  }

  // --------------------------------------------------------------------------
  // HOMEWORK & SUBMISSION METHODS
  // --------------------------------------------------------------------------

  public getHomeworkAssignments(): SharedHomeworkAssignment[] {
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
    return this.ledgers[studentId] || [
      {
        id: "tx-fallback",
        date: new Date().toISOString().split("T")[0],
        type: "INVOICE_BILLED",
        description: "Class 12 Senior Secondary Academic Tuition Fee",
        amount: 36250,
        debit: 36250,
        credit: null,
        runningBalance: 0,
        reference: "INV-2025-001",
        referenceNo: "INV-2025-001",
      },
    ];
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
    const collectionRate = totalInvoiced > 0 ? `${((realizedReceipts / totalInvoiced) * 100).toFixed(1)}%` : "95.4%";

    return {
      totalInvoiced,
      realizedReceipts,
      collectionRate,
      pendingWithinTerms,
      overdueArrears,
      currency: "INR",
      billableScholars: 1842,
      dailyReconciledAmount: 426000,
      autoMatchRate: "99.8%",
    };
  }

  public getParentDigest(wardId: string = "ward-01") {
    const stdId = wardId === "ward-02" ? "std-02" : "std-01";
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
    const arrivalTime = studentAtt ? studentAtt.turnstileTime : "08:08 IST • Smart Gate 01";
    const arrivalStatus = studentAtt?.status === "ABSENT" ? "Absent" : studentAtt?.status === "EXCUSED" ? "Excused Medical Leave" : "Present on Campus";

    const pendingHw = this.homeworkAssignments.filter((hw) => {
      const sub = this.homeworkSubmissions.find((s) => s.homeworkId === hw.id && s.studentId === stdId);
      return !sub || sub.status !== "GRADED";
    }).length;

    const unreadNotices = this.notices.filter((n) => !n.isSigned).length;

    return {
      todaysArrivalStatus: arrivalStatus,
      arrivalTime,
      attendanceRate: this.getStudentAttendanceRate(stdId),
      academicStanding: stdId === "std-01" ? "98.4% (All-India Rank 1 Nominee)" : "94.2% (CBSE Honors)",
      ibPointsTotal: stdId === "std-01" ? 482 : 470,
      tuitionStatus,
      unpaidBalance,
      pendingHomeworkCount: pendingHw,
      unreadNoticesCount: unreadNotices,
    };
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

  public addApproval(approval: Omit<SharedApproval, "id" | "createdAt">): SharedApproval {
    const id = `appr-${Date.now()}`;
    const newApproval: SharedApproval = {
      id,
      createdAt: new Date().toISOString(),
      ...approval,
    };
    this.approvals.unshift(newApproval);
    return newApproval;
  }
}

// Global Singleton Instance
export const sharedStore = new SharedDataStore();
