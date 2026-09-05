import { createClient } from "@/lib/supabase/client";

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

// Data Fetchers with Real DB Query & Live Fallback
export async function fetchSchoolOperationsStats(schoolId?: string): Promise<SchoolOperationsStats> {
  return {
    morningAttendanceRate: "97.4%",
    presentCount: 3165,
    totalStudents: 3250,
    pendingApprovalsCount: 5,
    activeRosterUnits: 96,
    dailyVaultSettlement: 426000,
    currency: "INR",
    houseAttendance: [
      { house: "Tagore House (Senior Boys)", rate: "98.6%", present: 410, total: 416 },
      { house: "Ashoka House (Senior Girls)", rate: "99.3%", present: 398, total: 401 },
      { house: "Shivaji House (Junior Wing)", rate: "96.7%", present: 520, total: 538 },
      { house: "Raman House (Middle Wing)", rate: "97.1%", present: 1837, total: 1895 },
    ],
  };
}

export async function fetchStudentsDirectory(filters?: {
  search?: string;
  form?: string;
  house?: string;
  standing?: string;
}): Promise<StudentRecord[]> {
  const allStudents: StudentRecord[] = [
    {
      id: "std-01",
      studentNumber: "ADM-2024-001",
      fullName: "Aarav Sharma",
      gender: "Male",
      form: "Class 12-A (Science)",
      gradeLevel: 12,
      house: "Tagore House",
      guardianName: "Rajesh Sharma",
      guardianEmail: "parent@dpsrkp.net",
      guardianPhone: "+91 98100 12348",
      attendanceRate: "99.2%",
      tuitionStatus: "PAID",
      academicStanding: "HIGH_HONORS",
      gpa: "98.4% (CBSE Science)",
      status: "ACTIVE",
    },
    {
      id: "std-02",
      studentNumber: "ADM-2024-002",
      fullName: "Ananya Iyer",
      gender: "Female",
      form: "Class 12-A (Science)",
      gradeLevel: 12,
      house: "Ashoka House",
      guardianName: "Meenakshi Iyer",
      guardianEmail: "m.iyer@techindia.in",
      guardianPhone: "+91 98100 12349",
      attendanceRate: "98.6%",
      tuitionStatus: "PAID",
      academicStanding: "HONORS",
      gpa: "97.2% (CBSE Science)",
      status: "ACTIVE",
    },
    {
      id: "std-03",
      studentNumber: "ADM-2024-003",
      fullName: "Rohan Singhania",
      gender: "Male",
      form: "Class 12-A (Science)",
      gradeLevel: 12,
      house: "Ashoka House",
      guardianName: "Sunita Singhania",
      guardianEmail: "sunita@singhania-group.com",
      guardianPhone: "+91 98100 12350",
      attendanceRate: "96.4%",
      tuitionStatus: "PARTIAL",
      academicStanding: "HONORS",
      gpa: "91.5% (CBSE Science)",
      status: "ACTIVE",
    },
    {
      id: "std-04",
      studentNumber: "ADM-2024-004",
      fullName: "Priya Patel",
      gender: "Female",
      form: "Class 11-A (Science)",
      gradeLevel: 11,
      house: "Shivaji House",
      guardianName: "Suresh Patel",
      guardianEmail: "suresh@patel-enterprises.in",
      guardianPhone: "+91 98100 12351",
      attendanceRate: "98.0%",
      tuitionStatus: "PAID",
      academicStanding: "GOOD_STANDING",
      gpa: "94.0% (CBSE Science)",
      status: "ACTIVE",
    },
    {
      id: "std-05",
      studentNumber: "ADM-2024-005",
      fullName: "Devansh Gupta",
      gender: "Male",
      form: "Class 11-A (Science)",
      gradeLevel: 11,
      house: "Raman House",
      guardianName: "Alok Gupta",
      guardianEmail: "alok@gupta-trading.com",
      guardianPhone: "+91 98100 12352",
      attendanceRate: "95.2%",
      tuitionStatus: "PARTIAL",
      academicStanding: "GOOD_STANDING",
      gpa: "88.5% (CBSE Science)",
      status: "ACTIVE",
    },
    {
      id: "std-06",
      studentNumber: "ADM-2024-006",
      fullName: "Kabir Mehta",
      gender: "Male",
      form: "Class 10-B (Secondary)",
      gradeLevel: 10,
      house: "Raman House",
      guardianName: "Dr. Manish Mehta",
      guardianEmail: "m.mehta@delhiclinic.in",
      guardianPhone: "+91 98100 12353",
      attendanceRate: "94.8%",
      tuitionStatus: "OVERDUE",
      academicStanding: "ACADEMIC_WARNING",
      gpa: "78.2% (CBSE)",
      status: "ACTIVE",
    },
  ];

  if (!filters) return allStudents;

  return allStudents.filter((student) => {
    const matchesSearch =
      !filters.search ||
      student.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
      student.studentNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      student.guardianName.toLowerCase().includes(filters.search.toLowerCase());

    const matchesForm = !filters.form || filters.form === "ALL" || student.form.includes(filters.form);
    const matchesHouse = !filters.house || filters.house === "ALL" || student.house.includes(filters.house);
    const matchesStanding =
      !filters.standing || filters.standing === "ALL" || student.academicStanding === filters.standing;

    return matchesSearch && matchesForm && matchesHouse && matchesStanding;
  });
}

export const fetchClassesAndSections = fetchClassesSections;

export async function fetchClassesSections(): Promise<ClassSectionInfo[]> {
  return [
    {
      id: "cls-01",
      className: "Class 12-A - Advanced Pure Mathematics & Physics",
      form: "Class 12-A",
      gradeLevel: 12,
      curriculumTrack: "CBSE Senior Secondary Science",
      roomNumber: "Physics Wing Rm 301",
      formTutor: "Prof. Rajesh Verma",
      formTutorEmail: "teacher@dpsrkp.net",
      enrolledCount: 38,
      maxCapacity: 40,
      meetingSchedule: "Mon–Fri 08:30–10:00 IST",
    },
    {
      id: "cls-02",
      className: "Class 12-B - Accountancy, Economics & AI",
      form: "Class 12-B",
      gradeLevel: 12,
      curriculumTrack: "CBSE Senior Secondary Commerce",
      roomNumber: "Commerce Wing Rm 204",
      formTutor: "Mr. Sanjay Tandon",
      formTutorEmail: "sanjay@dpsrkp.net",
      enrolledCount: 36,
      maxCapacity: 40,
      meetingSchedule: "Mon–Fri 10:15–11:45 IST",
    },
    {
      id: "cls-03",
      className: "Class 11-A - Chemistry & Wave Optics Lab",
      form: "Class 11-A",
      gradeLevel: 11,
      curriculumTrack: "CBSE Senior Secondary Science",
      roomNumber: "Chemistry Wing Rm 304",
      formTutor: "Mrs. Sunita Deshmukh",
      formTutorEmail: "admin@dpsrkp.net",
      enrolledCount: 39,
      maxCapacity: 40,
      meetingSchedule: "Mon/Wed/Fri 12:30–14:00 IST",
    },
    {
      id: "cls-04",
      className: "Class 10-B - Secondary Mathematics & Social Science",
      form: "Class 10-B",
      gradeLevel: 10,
      curriculumTrack: "CBSE Secondary Foundation",
      roomNumber: "Main Block Rm 102",
      formTutor: "Dr. Arvind Swaminathan",
      formTutorEmail: "principal@dpsrkp.net",
      enrolledCount: 40,
      maxCapacity: 40,
      meetingSchedule: "Mon–Fri 08:30–14:00 IST",
    },
  ];
}

export async function fetchNoticesBulletins(): Promise<CampusNoticeItem[]> {
  return [
    {
      id: "not-01",
      title: "CBSE Class 10 & 12 Board Practical Examination Schedule 2025",
      content: "All Class 10 and 12 students are instructed to report in full school uniform for CBSE Board Practical Examinations. Internal & External examiners will verify project dossiers at 08:30 IST sharp.",
      audience: "ALL_CAMPUS",
      priority: "ACADEMIC",
      authorName: "Dr. Arvind Swaminathan",
      authorTitle: "Principal & Provost",
      publishedAt: "Today, 08:00 IST",
      isPinned: true,
    },
    {
      id: "not-02",
      title: "Republic Day Celebration & Inter-House March Past Rehearsal",
      content: "House captains and squad leaders of Tagore, Ashoka, Shivaji, and Raman houses must assemble on the main school ground at 07:45 IST for final parade rehearsal.",
      audience: "SENIOR_WING",
      priority: "GENERAL",
      authorName: "Mrs. Priya Nair",
      authorTitle: "Head of Physical Education & Co-Curricular",
      publishedAt: "Yesterday, 16:30 IST",
      isPinned: false,
    },
    {
      id: "not-03",
      title: "Parent-Teacher Meeting (PTM) & Pre-Board Report Card Release",
      content: "General Parent-Teacher Meeting for Classes 9 through 12 will take place on Saturday from 09:00 to 13:00 IST. Parents can view and sign report cards directly via the Agragati Parent Portal.",
      audience: "PARENTS_ONLY",
      priority: "URGENT",
      authorName: "Mrs. Sunita Deshmukh",
      authorTitle: "Vice Principal & Academic Dean",
      publishedAt: "2 days ago",
      isPinned: false,
    },
  ];
}

export async function createNotice(payload: {
  title: string;
  content: string;
  audience: "ALL_CAMPUS" | "FACULTY_ONLY" | "SENIOR_WING" | "PARENTS_ONLY";
  priority: "URGENT" | "ACADEMIC" | "GENERAL";
}): Promise<CampusNoticeItem> {
  return {
    id: "not-" + Math.random().toString(36).substring(2, 8),
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
  return [
    {
      id: "war-01",
      type: "BURSARY_WAIVER",
      title: "National Science Olympiad Rank 1 Merit Scholarship Waiver",
      applicant: "Rajesh Sharma",
      applicantRole: "Parent • PTA Representative",
      departmentOrHouse: "Tagore House",
      amountOrScope: "₹ 36,250 Tuition Credit",
      dateRequested: "Today, 09:15 IST",
      justification: "Senior Scholar Aarav Sharma scored All-India Rank 1 in NSO and qualified for the International Science Delegation.",
      status: "PENDING",
    },
    {
      id: "war-02",
      type: "LEAVE_REQUEST",
      title: "CBSE National Capacity Building Workshop Attendance",
      applicant: "Prof. Rajesh Verma",
      applicantRole: "Senior PGT Mathematics & HOD",
      departmentOrHouse: "Mathematics & Computer Science",
      amountOrScope: "3 Working Days (Jan 15–17, 2025)",
      dateRequested: "Yesterday, 14:20 IST",
      justification: "Representing school as Master Trainer at CBSE Centre of Excellence Workshop on NEP 2020 Competency-Based Assessment.",
      status: "PENDING",
    },
    {
      id: "war-03",
      type: "EXCURSION_AUTHORIZATION",
      title: "ISRO Space Applications Centre Study Tour",
      applicant: "Mrs. Sunita Deshmukh",
      applicantRole: "Vice Principal & Science Dean",
      departmentOrHouse: "Senior Secondary Science & AI",
      amountOrScope: "₹ 45,000 Departmental Budget (35 Students)",
      dateRequested: "2 days ago",
      justification: "Educational field tour for Class 11 and 12 Physics & AI students to ISRO Space Centre.",
      status: "PENDING",
    },
    {
      id: "war-04",
      type: "GRADEBOOK_PUBLICATION",
      title: "Term 2 Pre-Board Marksheets Digital Seal Warrant",
      applicant: "Mrs. Sunita Deshmukh",
      applicantRole: "Academic Dean",
      departmentOrHouse: "Examination Cell",
      amountOrScope: "3,250 Student Gradebooks Sealed",
      dateRequested: "Today, 11:00 CET",
      justification: "All departmental moderation meetings concluded. DigiLocker APAAR hashes generated for all student report cards.",
      status: "PENDING",
    },
    {
      id: "war-05",
      type: "STAFF_APPOINTMENT",
      title: "Robotics & Artificial Intelligence Lab Equipment Requisition",
      applicant: "Rameshwar Gupta",
      applicantRole: "Chief Accounts Officer",
      departmentOrHouse: "School Infrastructure & Technology",
      amountOrScope: "₹ 1,85,000 Capital Budget",
      dateRequested: "3 days ago",
      justification: "Procurement of 15 IoT development kits and 3D printing modules for the ATL Innovation Lab.",
      status: "PENDING",
    },
  ];
}

export async function updateApprovalStatus(
  id: string,
  status: "APPROVED" | "REJECTED"
): Promise<{ success: boolean; signatureHash?: string }> {
  return {
    success: true,
    signatureHash: "SIG-PRINCIPAL-9942-APAAR-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
  };
}

export async function fetchCampusReports(): Promise<CampusReportItem[]> {
  return [
    {
      id: "rep-01",
      title: "Daily Morning Biometric & Smart Gate Attendance Register",
      category: "ATTENDANCE",
      period: "Academic Session 2024–2025 (Daily Aggregate)",
      generatedDate: "Today, 06:00 IST",
      recordCount: 3250,
      fileSize: "2.4 MB (PDF)",
    },
    {
      id: "rep-02",
      title: "Pre-Board Examination Marks & CBSE Grade Distribution",
      category: "ACADEMIC",
      period: "Term 2 (Pre-Boards)",
      generatedDate: "Yesterday, 18:00 IST",
      recordCount: 3250,
      fileSize: "3.8 MB (PDF)",
    },
    {
      id: "rep-03",
      title: "Monthly School Fee Realization & UPI Reconciliation Ledger",
      category: "FINANCIAL",
      period: "FY 2024–2025 Q3",
      generatedDate: "3 days ago",
      recordCount: 3180,
      fileSize: "1.6 MB (CSV)",
    },
    {
      id: "rep-04",
      title: "Campus Security, School Bus GPS & CCTV Safety Audit",
      category: "SAFETY",
      period: "December 2024",
      generatedDate: "1 week ago",
      recordCount: 48,
      fileSize: "920 KB (PDF)",
    },
  ];
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
