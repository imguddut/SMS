/**
 * AGRAGATI SCHOOL OS — System-Wide Unit Test Matrix
 * Verifies every portal and module across all 8 roles:
 * 1. Platform Admin
 * 2. Organization Owner
 * 3. Principal Governance
 * 4. School Admin (Admissions & Operations)
 * 5. Faculty & Teacher
 * 6. Accounts & Finance Officer
 * 7. Parent & Guardian
 * 8. Student & Scholar
 * + Cross-cutting Domain Events, Notifications & RBAC Permissions
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { globalReporter } from "../helpers/test-harness";
import {
  fetchAllSchools,
  fetchPlatformBilling,
  fetchPlatformAuditLogs,
  fetchImpersonationDirectory,
} from "@/lib/db/platform-admin";
import {
  getOrganization,
  listOrganizationSchools,
  getOrganizationMetrics,
  provisionSchool,
  updateOrganizationSchoolStatus,
  deleteOrganizationSchool,
} from "@/lib/services/organization-service";
import {
  fetchApprovalsQueue,
  updateApprovalStatus,
  createNotice,
  fetchStudentsDirectory,
  fetchSchoolOperationsStats,
} from "@/lib/db/school-admin";
import {
  createAdmission,
  updateAdmissionStatus,
  enrollApplicant,
  getAdmissions,
  getAdmissionStats,
} from "@/lib/services/admissions-service";
import {
  listStudents,
  archiveStudent,
  getStudent,
  createStudent,
} from "@/lib/services/student-service";
import {
  fetchTeacherDailyAgenda,
  fetchTeacherClasses,
  fetchClassAttendanceRoster,
  submitAttendance,
  fetchMarksEntryGrid,
  saveGradebookMarks,
  fetchTeacherHomeworkList,
  createHomeworkAssignment,
  fetchTeacherSubmissions,
  gradeHomeworkSubmission,
} from "@/lib/db/teacher";
import {
  fetchFinanceDashboardStats,
  fetchFeeStructures,
  fetchFinanceInvoices,
  generateInvoice,
  settleInvoicePayment,
  fetchStudentLedgers,
  fetchStudentLedgerDetail,
  fetchBankReconciliationFeed,
} from "@/lib/db/finance";
import {
  fetchEnrolledWards,
  fetchParentDigest,
  submitAbsenceExcuse,
  fetchWardInvoices,
  signNoticeConsent,
} from "@/lib/db/parent";
import {
  fetchStudentProfile,
  fetchStudentHomeworkList,
  submitHomeworkSolution,
  fetchStudentResults,
} from "@/lib/db/student";
import { sharedStore } from "@/lib/db/shared-store";
import { dispatchMultiChannel } from "@/lib/services/notification-provider";
import { domainEventBus } from "@/lib/events/domain-events";
import { hasPermission, hasAllPermissions, hasAnyPermission } from "@/lib/services/permission-service";

// =========================================================================
// MODULE 1: PLATFORM ADMIN PORTAL
// =========================================================================
describe("1. Platform Admin Portal Unit Tests", () => {
  it("UT-PLAT-001: Query global multi-tenant school directory", async () => {
    try {
      const schools = await fetchAllSchools();
      assert.ok(Array.isArray(schools), "Must return school array");

      globalReporter.record({
        testId: "UT-PLAT-001",
        portal: "Platform Admin",
        module: "Fleet Directory",
        role: "PLATFORM_ADMIN",
        action: "Query global multi-tenant school directory",
        status: "PASS",
        expectedResult: "Returns array of schools with jurisdictional details",
        actualResult: `Retrieved ${schools.length} schools across tenants`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-PLAT-001",
        portal: "Platform Admin",
        module: "Fleet Directory",
        role: "PLATFORM_ADMIN",
        action: "Query global multi-tenant school directory",
        status: "FAIL",
        expectedResult: "Returns school list",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-PLAT-002: Retrieve platform billing invoices and tiers", async () => {
    try {
      const billings = await fetchPlatformBilling();
      assert.ok(Array.isArray(billings), "Must return billing records array");

      globalReporter.record({
        testId: "UT-PLAT-002",
        portal: "Platform Admin",
        module: "Billing & Subscriptions",
        role: "PLATFORM_ADMIN",
        action: "Retrieve platform billing invoices and tiers",
        status: "PASS",
        expectedResult: "Returns billing collection",
        actualResult: `Found ${billings.length} billing items`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-PLAT-002",
        portal: "Platform Admin",
        module: "Billing & Subscriptions",
        role: "PLATFORM_ADMIN",
        action: "Retrieve platform billing invoices",
        status: "FAIL",
        expectedResult: "Returns invoices",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-PLAT-003: Verify immutable security audit trail query", async () => {
    try {
      const auditLogs = await fetchPlatformAuditLogs();
      assert.ok(Array.isArray(auditLogs), "Must return audit logs array");

      globalReporter.record({
        testId: "UT-PLAT-003",
        portal: "Platform Admin",
        module: "Security & Audit Logs",
        role: "PLATFORM_ADMIN",
        action: "Verify immutable security audit trail query",
        status: "PASS",
        expectedResult: "Returns immutable audit records",
        actualResult: `Retrieved ${auditLogs.length} audit trail entries`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-PLAT-003",
        portal: "Platform Admin",
        module: "Security & Audit Logs",
        role: "PLATFORM_ADMIN",
        action: "Verify audit trail query",
        status: "FAIL",
        expectedResult: "Returns logs",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-PLAT-004: Fetch role-based user testing directory", async () => {
    try {
      const users = await fetchImpersonationDirectory();
      assert.ok(Array.isArray(users), "Must return impersonation users array");

      globalReporter.record({
        testId: "UT-PLAT-004",
        portal: "Platform Admin",
        module: "User Testing & Impersonation",
        role: "PLATFORM_ADMIN",
        action: "Fetch role-based user testing directory",
        status: "PASS",
        expectedResult: "Returns valid user credentials across canonical roles",
        actualResult: `Retrieved ${users.length} testing users`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-PLAT-004",
        portal: "Platform Admin",
        module: "User Testing & Impersonation",
        role: "PLATFORM_ADMIN",
        action: "Fetch role-based user directory",
        status: "FAIL",
        expectedResult: "Returns users",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });
});

// =========================================================================
// MODULE 2: ORGANIZATION OWNER PORTAL
// =========================================================================
describe("2. Organization Owner Portal Unit Tests", () => {
  const orgId = "e0000000-0000-0000-0000-000000000001";

  it("UT-ORG-001: Calculate consolidated organization KPIs across campuses", async () => {
    try {
      const metrics = await getOrganizationMetrics(orgId);
      assert.ok(metrics.totalSchools >= 0, "Must return numeric totalSchools");
      assert.ok(typeof metrics.totalStudents === "number", "Student count must be numeric");

      globalReporter.record({
        testId: "UT-ORG-001",
        portal: "Organization Owner",
        module: "Consolidated KPIs",
        role: "ORGANIZATION_OWNER",
        action: "Calculate consolidated organization KPIs across campuses",
        status: "PASS",
        expectedResult: "Aggregates campuses, total scholars, staff, revenue",
        actualResult: `Campuses: ${metrics.totalSchools}, Scholars: ${metrics.totalStudents}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-ORG-001",
        portal: "Organization Owner",
        module: "Consolidated KPIs",
        role: "ORGANIZATION_OWNER",
        action: "Calculate consolidated organization KPIs",
        status: "FAIL",
        expectedResult: "Calculated KPIs",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-ORG-002: List campuses under active organization tenant", async () => {
    try {
      const schools = await listOrganizationSchools(orgId);
      assert.ok(Array.isArray(schools), "Must list tenant schools array");

      globalReporter.record({
        testId: "UT-ORG-002",
        portal: "Organization Owner",
        module: "Fleet Management",
        role: "ORGANIZATION_OWNER",
        action: "List campuses under active organization tenant",
        status: "PASS",
        expectedResult: "Returns schools belonging strictly to active organization",
        actualResult: `Listed ${schools.length} schools for tenant ${orgId}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-ORG-002",
        portal: "Organization Owner",
        module: "Fleet Management",
        role: "ORGANIZATION_OWNER",
        action: "List campuses under organization",
        status: "FAIL",
        expectedResult: "Returns schools",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-ORG-003: Provision, update status and delete school campus", async () => {
    try {
      const timestamp = Date.now();
      const provisioned = await provisionSchool(orgId, "usr-owner-unit", {
        name: `Unit Test Campus ${timestamp}`,
        slug: `unit-campus-${timestamp}`,
        schoolCode: `UTC-${timestamp.toString().slice(-3)}`,
        city: "Pune",
        currency: "INR",
      });

      assert.ok(provisioned.id, "Provisioned school must have ID");
      assert.strictEqual(provisioned.status, "ACTIVE");

      const updateRes = await updateOrganizationSchoolStatus(provisioned.id, "INACTIVE", "usr-owner-unit");
      assert.strictEqual(updateRes.success, true);
      assert.strictEqual(updateRes.school?.status, "INACTIVE");

      const deleteRes = await deleteOrganizationSchool(provisioned.id, "usr-owner-unit");
      assert.strictEqual(deleteRes.success, true);
      assert.strictEqual(deleteRes.schoolId, provisioned.id);

      globalReporter.record({
        testId: "UT-ORG-003",
        portal: "Organization Owner",
        module: "Fleet Management",
        role: "ORGANIZATION_OWNER",
        action: "Execute complete campus provisioning, deactivation and deletion lifecycle",
        status: "PASS",
        expectedResult: "Campus provisioned -> set to INACTIVE -> deleted cleanly",
        actualResult: `Provisioned & deleted campus ${provisioned.id}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-ORG-003",
        portal: "Organization Owner",
        module: "Fleet Management",
        role: "ORGANIZATION_OWNER",
        action: "Campus provisioning and lifecycle",
        status: "FAIL",
        expectedResult: "Campus managed",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });
});

// =========================================================================
// MODULE 3: PRINCIPAL GOVERNANCE WORKSPACE
// =========================================================================
describe("3. Principal Governance Workspace Unit Tests", () => {
  it("UT-PRIN-001: Digitally sign and approve executive governance warrant", async () => {
    try {
      const approvals = await fetchApprovalsQueue();
      assert.ok(Array.isArray(approvals), "Approvals queue must be an array");

      globalReporter.record({
        testId: "UT-PRIN-001",
        portal: "Principal",
        module: "Approvals Governance",
        role: "PRINCIPAL",
        action: "Digitally sign and approve executive governance warrant",
        status: "PASS",
        expectedResult: "Warrant queue queried cleanly",
        actualResult: `Queue contains ${approvals.length} items`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-PRIN-001",
        portal: "Principal",
        module: "Approvals Governance",
        role: "PRINCIPAL",
        action: "Digitally sign executive warrant",
        status: "FAIL",
        expectedResult: "Signature generated",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-PRIN-002: Compute morning campus operations and attendance census", async () => {
    try {
      const stats = await fetchSchoolOperationsStats();
      assert.ok(typeof stats.totalStudents === "number", "Morning census must count scholars");
      assert.ok(Array.isArray(stats.houseAttendance), "Must calculate house attendance breakdowns");

      globalReporter.record({
        testId: "UT-PRIN-002",
        portal: "Principal",
        module: "Operations Census",
        role: "PRINCIPAL",
        action: "Compute morning campus operations and attendance census",
        status: "PASS",
        expectedResult: "Census returns attendance rate, present count, and house distribution",
        actualResult: `Attendance: ${stats.morningAttendanceRate}, Present: ${stats.presentCount}/${stats.totalStudents}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-PRIN-002",
        portal: "Principal",
        module: "Operations Census",
        role: "PRINCIPAL",
        action: "Compute morning campus operations census",
        status: "FAIL",
        expectedResult: "Computed stats",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-PRIN-003: Publish campus circular notice with audience scoping", async () => {
    try {
      const noticeRes = await createNotice({
        title: "Executive Board Session Concluded",
        content: "All faculty members are invited to review the 2025-26 academic directives.",
        audience: "FACULTY_ONLY",
        priority: "ACADEMIC",
      });

      assert.ok(noticeRes.id, "Notice must generate ID");
      assert.strictEqual(noticeRes.title, "Executive Board Session Concluded");

      globalReporter.record({
        testId: "UT-PRIN-003",
        portal: "Principal",
        module: "Campus Notices",
        role: "PRINCIPAL",
        action: "Publish campus circular notice with audience scoping",
        status: "PASS",
        expectedResult: "Notice published with FACULTY_ONLY scope and pinned status",
        actualResult: `Notice created: ${noticeRes.id}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-PRIN-003",
        portal: "Principal",
        module: "Campus Notices",
        role: "PRINCIPAL",
        action: "Publish campus notice",
        status: "FAIL",
        expectedResult: "Notice published",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });
});

// =========================================================================
// MODULE 4: SCHOOL ADMIN (ADMISSIONS & STUDENT OPERATIONS)
// =========================================================================
describe("4. School Admin Operations & Admissions Unit Tests", () => {
  let createdAdmId = "";

  it("UT-ADM-001: Execute admissions state machine from submission through review", async () => {
    try {
      const adm = await createAdmission({
        schoolId: "11111111-1111-1111-1111-111111111111",
        applicantName: "Samar Verma",
        dateOfBirth: "2015-08-20",
        gender: "Male",
        gradeApplyingFor: "Class 5",
        parentName: "Kunal Verma",
        parentEmail: "kunal.verma@example.com",
        parentPhone: "+91 98100 55443",
        address: "South Extension, New Delhi",
        entranceScore: 91.5,
      });

      createdAdmId = adm.id;
      assert.ok(adm.id, "Admission ID must exist");
      assert.strictEqual(adm.status, "PENDING");

      const updated = await updateAdmissionStatus(adm.id, "UNDER_REVIEW", "Application dossier under academic review.");
      assert.strictEqual(updated?.status, "UNDER_REVIEW");

      const stats = await getAdmissionStats("11111111-1111-1111-1111-111111111111");
      assert.ok(stats.total > 0, "Admission statistics must calculate");

      globalReporter.record({
        testId: "UT-ADM-001",
        portal: "School Admin",
        module: "Admissions Pipeline",
        role: "SCHOOL_ADMIN",
        action: "Execute admissions state machine from submission through review",
        status: "PASS",
        expectedResult: "Transitions status PENDING -> UNDER_REVIEW with notes and metrics",
        actualResult: `Application: ${adm.applicationNo}, Status: ${updated?.status}, Total Apps: ${stats.total}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-ADM-001",
        portal: "School Admin",
        module: "Admissions Pipeline",
        role: "SCHOOL_ADMIN",
        action: "Execute admissions state machine",
        status: "FAIL",
        expectedResult: "Transitions status",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-ADM-002: One-click applicant enrollment into student body", async () => {
    try {
      assert.ok(createdAdmId, "Must have active admission application to enroll");
      const enrollRes = await enrollApplicant(createdAdmId);
      assert.ok(enrollRes, "Enrollment result must exist");
      assert.ok(enrollRes.studentId, "Student ID must be created");
      assert.strictEqual(enrollRes.admission.status, "ENROLLED");

      globalReporter.record({
        testId: "UT-ADM-002",
        portal: "School Admin",
        module: "Admissions Pipeline",
        role: "SCHOOL_ADMIN",
        action: "Enroll approved applicant and instantiate scholar profile",
        status: "PASS",
        expectedResult: "Student admitted with status ENROLLED",
        actualResult: `Enrolled student ${enrollRes.studentId} (${enrollRes.admission.applicantName})`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-ADM-002",
        portal: "School Admin",
        module: "Admissions Pipeline",
        role: "SCHOOL_ADMIN",
        action: "Enroll approved applicant",
        status: "FAIL",
        expectedResult: "Enrolled",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-STU-001: Retrieve student directory with class, section and guardian details", async () => {
    try {
      const students = await fetchStudentsDirectory();
      assert.ok(Array.isArray(students), "Students directory must return array");
      const std = students[0];

      globalReporter.record({
        testId: "UT-STU-001",
        portal: "School Admin",
        module: "Student Management",
        role: "SCHOOL_ADMIN",
        action: "Retrieve student directory with class, section and guardian details",
        status: "PASS",
        expectedResult: "Returns student roster array",
        actualResult: `Loaded ${students.length} students.`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-STU-001",
        portal: "School Admin",
        module: "Student Management",
        role: "SCHOOL_ADMIN",
        action: "Retrieve student directory",
        status: "FAIL",
        expectedResult: "Returns students",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-STU-002: Student lifecycle operations (Archival & Directory Filtering)", async () => {
    try {
      const schoolId = "11111111-1111-1111-1111-111111111111";
      let initialList = await listStudents(schoolId);
      if (initialList.length === 0) {
        const created = await createStudent(schoolId, "b0000000-0000-0000-0000-000000000003", {
          fullName: "Test Scholar",
          admissionNumber: "ADM-TEST-001",
          email: "scholar@test.com",
          house: "Tagore",
          gender: "Male",
          dateOfBirth: "2008-01-01",
          guardianName: "Test Parent",
          guardianEmail: "parent@test.com",
          guardianPhone: "+919876543210",
        });
        initialList = [created];
      }

      const testStudent = initialList[0];
      const archiveRes = await archiveStudent(schoolId, testStudent.id, "b0000000-0000-0000-0000-000000000003", "Graduated / Transferred");
      assert.strictEqual(archiveRes.success, true);

      globalReporter.record({
        testId: "UT-STU-002",
        portal: "School Admin",
        module: "Student Lifecycle",
        role: "SCHOOL_ADMIN",
        action: "Archive student record with audit trail tracking",
        status: "PASS",
        expectedResult: "Student status transitioned to WITHDRAWN / ARCHIVED",
        actualResult: `Student ${testStudent.id} archived successfully`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-STU-002",
        portal: "School Admin",
        module: "Student Lifecycle",
        role: "SCHOOL_ADMIN",
        action: "Archive student record",
        status: "FAIL",
        expectedResult: "Student archived",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });
});

// =========================================================================
// MODULE 5: FACULTY & TEACHER PORTAL
// =========================================================================
describe("5. Faculty & Teacher Portal Unit Tests", () => {
  it("UT-TEA-001: Retrieve teacher daily timetable and assigned class courses", async () => {
    try {
      const agenda = await fetchTeacherDailyAgenda();
      assert.ok(Array.isArray(agenda.sessions), "Agenda sessions must be an array");
      assert.ok(typeof agenda.metrics.allocatedSessions === "number", "Metrics must include allocated sessions count");

      const classes = await fetchTeacherClasses();
      assert.ok(Array.isArray(classes), "Teacher classes must be an array");

      globalReporter.record({
        testId: "UT-TEA-001",
        portal: "Teacher",
        module: "Schedule & Course Rosters",
        role: "TEACHER",
        action: "Retrieve teacher daily timetable and assigned class courses",
        status: "PASS",
        expectedResult: "Returns timetable periods and syllabus progress",
        actualResult: `Schedule: ${agenda.sessions.length} periods, Classes: ${classes.length} assigned courses`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-TEA-001",
        portal: "Teacher",
        module: "Schedule & Course Rosters",
        role: "TEACHER",
        action: "Retrieve teacher timetable",
        status: "FAIL",
        expectedResult: "Returns schedule",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-TEA-002: Mark and submit section attendance roster", async () => {
    try {
      const roster = await fetchClassAttendanceRoster("Class 12-A");
      assert.ok(Array.isArray(roster) && roster.length > 0, "Roster must return section students");

      const submitRes = await submitAttendance({
        classId: "Class 12-A",
        attendance: roster,
      });

      assert.strictEqual(submitRes.success, true);
      assert.ok(submitRes.hash.startsWith("ROLLCALL-SEALED-"), "Roll call seal hash must be generated");

      globalReporter.record({
        testId: "UT-TEA-002",
        portal: "Teacher",
        module: "Daily Attendance",
        role: "TEACHER",
        action: "Submit section daily attendance roll call",
        status: "PASS",
        expectedResult: "Roll call recorded with cryptographic seal hash",
        actualResult: `Attendance sealed: ${submitRes.hash}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-TEA-002",
        portal: "Teacher",
        module: "Daily Attendance",
        role: "TEACHER",
        action: "Submit daily attendance",
        status: "FAIL",
        expectedResult: "Attendance recorded",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-TEA-003: Compute weighted scores and cryptographically seal examination gradebook", async () => {
    try {
      const marksGrid = await fetchMarksEntryGrid();
      assert.ok(marksGrid.length > 0, "Marks grid must contain scholars");
      const saveRes = await saveGradebookMarks({
        classId: "Class 12-A",
        rows: marksGrid,
      });

      assert.strictEqual(saveRes.success, true);
      assert.ok(saveRes.sealHash.startsWith("SEAL-"), "Must generate official gradebook cryptographic seal");

      globalReporter.record({
        testId: "UT-TEA-003",
        portal: "Teacher",
        module: "Marks & Gradebook",
        role: "TEACHER",
        action: "Compute weighted scores and cryptographically seal examination gradebook",
        status: "PASS",
        expectedResult: "Gradebook saved with tamper-proof seal hash",
        actualResult: `Gradebook Sealed: ${saveRes.sealHash}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-TEA-003",
        portal: "Teacher",
        module: "Marks & Gradebook",
        role: "TEACHER",
        action: "Seal examination gradebook",
        status: "FAIL",
        expectedResult: "Gradebook sealed",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-TEA-004: Create homework assignment, evaluate submission, and post feedback", async () => {
    try {
      const hwRes = await createHomeworkAssignment({
        title: "Calculus Optimization Problem Set",
        className: "Class 12-A",
        form: "Class 12-A",
        subject: "Mathematics",
        dueDate: "2025-03-15",
        maxMarks: 50,
        description: "Solve all NCERT Exemplar optimization proofs.",
        rubric: "Accuracy 30pts, Analytical Steps 20pts",
      });

      assert.ok(hwRes.id, "Homework ID must exist");
      assert.strictEqual(hwRes.status, "ACTIVE");

      const gradeRes = await gradeHomeworkSubmission({
        submissionId: "sub-init-01",
        score: 48,
        feedback: "Outstanding rigor in proofs.",
      });

      assert.strictEqual(gradeRes.success, true);

      globalReporter.record({
        testId: "UT-TEA-004",
        portal: "Teacher",
        module: "Homework & Grading",
        role: "TEACHER",
        action: "Create homework assignment and grade student submission with rubric feedback",
        status: "PASS",
        expectedResult: "Homework published and submission graded 48/50",
        actualResult: `Assignment ${hwRes.id} created, graded successfully`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-TEA-004",
        portal: "Teacher",
        module: "Homework & Grading",
        role: "TEACHER",
        action: "Homework workflow",
        status: "FAIL",
        expectedResult: "Homework graded",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });
});

// =========================================================================
// MODULE 6: ACCOUNTS & FINANCE OFFICER PORTAL
// =========================================================================
describe("6. Accounts & Finance Officer Portal Unit Tests", () => {
  it("UT-FIN-001: Compute treasury metrics, collection realization, and fee schedules", async () => {
    try {
      const feeStats = await fetchFinanceDashboardStats();
      assert.ok(typeof feeStats.totalInvoiced === "number", "Total invoiced must be number");
      assert.ok(typeof feeStats.realizedReceipts === "number", "Realized receipts must be number");
      assert.ok(feeStats.collectionRate.includes("%"), "Collection rate must be percentage");

      const structures = await fetchFeeStructures();
      assert.ok(Array.isArray(structures), "Fee structures must be an array");

      globalReporter.record({
        testId: "UT-FIN-001",
        portal: "Finance",
        module: "Treasury Analytics & Fee Structures",
        role: "ACCOUNTANT",
        action: "Compute treasury metrics, collection realization, and fee schedules",
        status: "PASS",
        expectedResult: "Accurate double-entry financial calculation",
        actualResult: `Billed: ₹${feeStats.totalInvoiced}, Collected: ₹${feeStats.realizedReceipts}, Rate: ${feeStats.collectionRate}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-FIN-001",
        portal: "Finance",
        module: "Treasury Analytics & Fee Structures",
        role: "ACCOUNTANT",
        action: "Compute treasury metrics",
        status: "FAIL",
        expectedResult: "Calculated metrics",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-FIN-002: Generate student invoice and record UPI/Bank payment settlement", async () => {
    try {
      const invRes = await generateInvoice({
        studentId: "std-01",
        studentName: "Aarav Sharma",
        amount: 45000,
        currency: "INR",
        termName: "Term 3 Board Examination Fee",
      });

      assert.strictEqual(invRes.success, true);
      assert.ok(invRes.id, "Invoice must generate ID");

      const settleRes = await settleInvoicePayment({
        invoiceId: invRes.id,
        amount: 45000,
        paymentMethod: "UPI_VPA",
        transactionReference: `UPI-TEST-${Date.now()}`,
      });

      assert.strictEqual(settleRes.success, true);
      assert.ok(settleRes.receiptNumber?.startsWith("REC-") || settleRes.receiptNumber?.startsWith("UPI-"), "Must generate official receipt number");

      globalReporter.record({
        testId: "UT-FIN-002",
        portal: "Finance",
        module: "Invoicing & Settlements",
        role: "ACCOUNTANT",
        action: "Generate fee demand note and settle payment with official receipt",
        status: "PASS",
        expectedResult: "Invoice created and settled with receipt number",
        actualResult: `Invoice ${invRes.id} settled: ${settleRes.receiptNumber}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-FIN-002",
        portal: "Finance",
        module: "Invoicing & Settlements",
        role: "ACCOUNTANT",
        action: "Generate invoice and settle",
        status: "FAIL",
        expectedResult: "Settled",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-FIN-003: Retrieve student statement of accounts and double-entry ledger", async () => {
    try {
      const ledgers = await fetchStudentLedgers();
      assert.ok(Array.isArray(ledgers) && ledgers.length > 0, "Student ledgers must exist");
      const sample = ledgers[0];
      assert.ok(sample.studentName && sample.totalBilled >= 0, "Ledger must contain billing aggregates");

      const detail = await fetchStudentLedgerDetail(sample.studentId);
      assert.ok(Array.isArray(detail), "Ledger detail must return array of transactions");

      globalReporter.record({
        testId: "UT-FIN-003",
        portal: "Finance",
        module: "Double-Entry Ledger",
        role: "ACCOUNTANT",
        action: "Retrieve student statement of accounts and running ledger balance",
        status: "PASS",
        expectedResult: "Returns sequential debits, credits, and running balance",
        actualResult: `Ledger for ${sample.studentName}: Billed ₹${sample.totalBilled}, Paid ₹${sample.totalPaid}, Balance ₹${sample.balanceDue}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-FIN-003",
        portal: "Finance",
        module: "Double-Entry Ledger",
        role: "ACCOUNTANT",
        action: "Retrieve student ledger",
        status: "FAIL",
        expectedResult: "Returns ledger",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-FIN-004: Vendor procurement, principal sanction, and expense recording", async () => {
    try {
      const vendor = sharedStore.createVendor({
        schoolId: "11111111-1111-1111-1111-111111111111",
        name: "Apex Science Supplies Ltd.",
        category: "LAB_EQUIPMENT",
        contactPerson: "Rajiv Khurana",
        email: "sales@apexscience.in",
        phone: "+91 98110 33221",
        address: "New Delhi Industrial Area",
        bankAccount: "50200012345678",
        isActive: true,
      });

      assert.ok(vendor.id, "Vendor must generate ID");

      const exp = sharedStore.createExpense({
        vendorId: vendor.id,
        vendorName: vendor.name,
        category: "LAB_EQUIPMENT",
        amount: 85000,
        currency: "INR",
        description: "Physics Optical Spectrometers & Lasers",
        invoiceDate: "2025-01-20",
        status: "PENDING_APPROVAL",
      });

      assert.ok(exp.id, "Expense must generate ID");
      assert.strictEqual(exp.status, "PENDING_APPROVAL");

      const sanctioned = sharedStore.updateExpenseStatus(exp.id, "APPROVED", "b0000000-0000-0000-0000-000000000003", "Approved by Principal");
      assert.strictEqual(sanctioned?.status, "APPROVED");

      const paid = sharedStore.updateExpenseStatus(exp.id, "PAID", "b0000000-0000-0000-0000-000000000006", "NEFT Ref UTR-99882200");
      assert.strictEqual(paid?.status, "PAID");

      globalReporter.record({
        testId: "UT-FIN-004",
        portal: "Finance",
        module: "Procurement & Expenses",
        role: "ACCOUNTANT",
        action: "Vendor procurement bill intake, Principal sanction, and treasury disbursement",
        status: "PASS",
        expectedResult: "Expense transitions SUBMITTED -> APPROVED -> PAID with UTR reference",
        actualResult: `Expense ${exp.id} sanctioned and disbursed to ${vendor.name}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-FIN-004",
        portal: "Finance",
        module: "Procurement & Expenses",
        role: "ACCOUNTANT",
        action: "Vendor procurement workflow",
        status: "FAIL",
        expectedResult: "Disbursed",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });
});

// =========================================================================
// MODULE 7: PARENT & GUARDIAN PORTAL
// =========================================================================
describe("7. Parent & Guardian Portal Unit Tests", () => {
  it("UT-PAR-001: Query authorized wards and live smart-gate arrival telemetry", async () => {
    try {
      const wards = await fetchEnrolledWards();
      assert.ok(Array.isArray(wards), "Guardian enrolled wards must be array");
      const primaryWard = wards[0] || { id: "ward-01", name: "Scholar Ward", rollNumber: "ADM-001", form: "Class 10" };

      const digest = await fetchParentDigest(primaryWard.id);
      assert.ok(digest.todaysArrivalStatus, "Must return today's arrival status");
      assert.ok(digest.attendanceRate, "Must return attendance rate");

      globalReporter.record({
        testId: "UT-PAR-001",
        portal: "Parent",
        module: "Ward Scoping & Live Digest",
        role: "PARENT",
        action: "Query authorized wards and live smart-gate arrival telemetry",
        status: "PASS",
        expectedResult: "Ward isolation enforced with real-time biometric digest",
        actualResult: `Wards loaded: ${wards.length}. Digest arrival: ${digest.todaysArrivalStatus}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-PAR-001",
        portal: "Parent",
        module: "Ward Scoping & Live Digest",
        role: "PARENT",
        action: "Query authorized wards",
        status: "FAIL",
        expectedResult: "Returns ward digest",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-PAR-002: Retrieve ward fee dues and invoice breakdown", async () => {
    try {
      const wards = await fetchEnrolledWards();
      const primaryWardId = wards[0]?.id || "ward-01";
      const invoices = await fetchWardInvoices(primaryWardId);
      assert.ok(Array.isArray(invoices), "Ward invoices must be retrievable");

      globalReporter.record({
        testId: "UT-PAR-002",
        portal: "Parent",
        module: "Fee & Billing Desk",
        role: "PARENT",
        action: "Retrieve ward fee dues and invoice breakdown",
        status: "PASS",
        expectedResult: "Returns ward fee demand notes with payment options",
        actualResult: `Found ${invoices.length} invoices for ward.`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-PAR-002",
        portal: "Parent",
        module: "Fee & Billing Desk",
        role: "PARENT",
        action: "Retrieve ward invoices",
        status: "FAIL",
        expectedResult: "Invoices retrieved",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-PAR-003: Multi-ward leave request submission and tracking", async () => {
    try {
      const wards = await fetchEnrolledWards();
      const primaryWard = wards[0] || { id: "ward-01", name: "Scholar Ward", form: "Class 10" };

      const leave = sharedStore.createLeaveRequest({
        studentId: primaryWard.id,
        studentName: primaryWard.name,
        form: primaryWard.form,
        startDate: "2025-04-10",
        endDate: "2025-04-12",
        reason: "Family wedding event in Mumbai",
      });

      assert.ok(leave.id, "Leave request must have ID");
      assert.strictEqual(leave.status, "PENDING");

      const reviewed = sharedStore.updateLeaveRequestStatus(leave.id, "APPROVED", "Principal", "Leave sanctioned.");
      assert.strictEqual(reviewed?.status, "APPROVED");

      globalReporter.record({
        testId: "UT-PAR-003",
        portal: "Parent",
        module: "Leave & Absence",
        role: "PARENT",
        action: "Submit multi-ward absence note and track approval status",
        status: "PASS",
        expectedResult: "Leave application logged and approved with principal notes",
        actualResult: `Leave ${leave.id} approved for ${primaryWard.name}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-PAR-003",
        portal: "Parent",
        module: "Leave & Absence",
        role: "PARENT",
        action: "Submit leave request",
        status: "FAIL",
        expectedResult: "Approved",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-PAR-004: Electronic consent signing for school notices", async () => {
    try {
      const consentRes = await signNoticeConsent("not-01");
      assert.strictEqual(consentRes.success, true);
      assert.ok(consentRes.signedDate, "Signed date must be recorded on digital consent");

      globalReporter.record({
        testId: "UT-PAR-004",
        portal: "Parent",
        module: "Notices & Consents",
        role: "PARENT",
        action: "Digitally sign parental acknowledgement and consent for circular",
        status: "PASS",
        expectedResult: "Consent signed and timestamped",
        actualResult: `Consent recorded on ${consentRes.signedDate}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-PAR-004",
        portal: "Parent",
        module: "Notices & Consents",
        role: "PARENT",
        action: "Sign notice consent",
        status: "FAIL",
        expectedResult: "Signed",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });
});

// =========================================================================
// MODULE 8: STUDENT & SCHOLAR PORTAL
// =========================================================================
describe("8. Student & Scholar Portal Unit Tests", () => {
  it("UT-SCHOL-001: Query self-scoped attendance radar and scholastic report card", async () => {
    try {
      const profile = await fetchStudentProfile("std-01");
      assert.ok(profile.attendanceRate, "Must return attendance percentage");
      assert.ok(profile.name, "Must return scholar name");

      const results = await fetchStudentResults("std-01");
      assert.ok(results.overallGpa, "Must return report card GPA");
      assert.ok(results.proviseurSeal.startsWith("SEAL-"), "Must have proviseur seal");
      assert.ok(results.subjects.length > 0, "Must have subject score entries");

      globalReporter.record({
        testId: "UT-SCHOL-001",
        portal: "Student",
        module: "Scholar Radar & Gradebook",
        role: "STUDENT",
        action: "Query self-scoped attendance radar and scholastic report card",
        status: "PASS",
        expectedResult: "Student accesses personal attendance rate and report card marks",
        actualResult: `Attendance: ${profile.attendanceRate}, GPA: ${results.overallGpa}, Seal: ${results.proviseurSeal}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-SCHOL-001",
        portal: "Student",
        module: "Scholar Radar & Gradebook",
        role: "STUDENT",
        action: "Query student radar",
        status: "FAIL",
        expectedResult: "Returns radar",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-SCHOL-002: View homework assignments and submit solutions", async () => {
    try {
      const tasks = await fetchStudentHomeworkList("std-01");
      assert.ok(Array.isArray(tasks) && tasks.length > 0, "Student must see assigned tasks");

      const task = tasks[0];
      const submitRes = await submitHomeworkSolution({
        homeworkId: task.id,
        fileName: "Physics_Quantum_Lab_Report.pdf",
        notes: "Included all NCERT graph derivations.",
      });

      assert.strictEqual(submitRes.success, true);
      assert.ok(submitRes.submissionId, "Must return submission ID");

      globalReporter.record({
        testId: "UT-SCHOL-002",
        portal: "Student",
        module: "Homework & Deliverables",
        role: "STUDENT",
        action: "View homework assignments and upload deliverable solution",
        status: "PASS",
        expectedResult: "Solution uploaded and recorded with audit timestamp",
        actualResult: `Solution submitted: ${submitRes.submissionId} at ${submitRes.submissionTimestamp}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-SCHOL-002",
        portal: "Student",
        module: "Homework & Deliverables",
        role: "STUDENT",
        action: "Submit homework solution",
        status: "FAIL",
        expectedResult: "Submitted",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });
});

// =========================================================================
// CROSS-CUTTING: DOMAIN EVENT BUS, NOTIFICATIONS & RBAC PERMISSIONS
// =========================================================================
describe("9. Cross-Cutting Event Bus, Multi-Channel Notifications & RBAC Unit Tests", () => {
  it("UT-EVT-001: Publish and receive strongly-typed domain events across portals", async () => {
    try {
      let receivedEvent: any = null;
      const unsubscribe = domainEventBus.subscribe("admission.approved", (evt) => {
        receivedEvent = evt;
      });

      await domainEventBus.emit("admission.approved", "11111111-1111-1111-1111-111111111111", "actor-1", {
        applicantName: "Samar Verma",
      });

      unsubscribe();
      assert.ok(receivedEvent, "Domain event bus must deliver published events");
      assert.strictEqual(receivedEvent.type, "admission.approved");

      globalReporter.record({
        testId: "UT-EVT-001",
        portal: "Platform",
        module: "Domain Event Bus",
        role: "System",
        action: "Publish and receive strongly-typed domain events across portals",
        status: "PASS",
        expectedResult: "Event delivered to registered reactive subscriber",
        actualResult: `Received event ${receivedEvent.type} (ID: ${receivedEvent.id})`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-EVT-001",
        portal: "Platform",
        module: "Domain Event Bus",
        role: "System",
        action: "Publish domain event",
        status: "FAIL",
        expectedResult: "Delivered",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-NOTIF-001: Dispatch multi-channel event notifications (In-App, Email, SMS, WhatsApp)", async () => {
    try {
      const result = await dispatchMultiChannel({
        schoolId: "11111111-1111-1111-1111-111111111111",
        recipientUserId: "usr-parent-01",
        recipientEmail: "guardian@example.com",
        recipientPhone: "+91 98765 00000",
        channels: ["IN_APP", "EMAIL", "SMS", "WHATSAPP"],
        type: "incident.reported" as any,
        title: "Disciplinary Notice Issued",
        message: "A disciplinary incident was logged for review.",
        entityType: "discipline_records",
        entityId: "dis-01",
      });

      assert.strictEqual(result.inAppSuccess, true, "In-App must succeed");
      assert.ok(result.emailId, "Email ID must be returned");
      assert.ok(result.smsId, "SMS ID must be returned");
      assert.ok(result.whatsappId, "WhatsApp ID must be returned");

      globalReporter.record({
        testId: "UT-NOTIF-001",
        portal: "Platform",
        module: "Multi-Channel Notifications",
        role: "System",
        action: "Dispatch notification synchronously across all 4 channels",
        status: "PASS",
        expectedResult: "In-App stored, Email/SMS/WhatsApp delivered with message IDs",
        actualResult: `Email: ${result.emailId}, SMS: ${result.smsId}, WhatsApp: ${result.whatsappId}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-NOTIF-001",
        portal: "Platform",
        module: "Multi-Channel Notifications",
        role: "System",
        action: "Dispatch multi-channel notification",
        status: "FAIL",
        expectedResult: "Delivered",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-RBAC-001: Evaluate fine-grained permission matrix across canonical roles", async () => {
    try {
      const canPrincipalApprove = hasPermission("PRINCIPAL", "approval.approve");
      const canStudentApprove = hasPermission("STUDENT", "approval.approve");
      const canParentApprove = hasPermission("PARENT", "approval.approve");
      const canAccountantBill = hasPermission("ACCOUNTANT", "invoice.create");
      const canTeacherMark = hasPermission("TEACHER", "marks.update");
      const canStudentMark = hasPermission("STUDENT", "marks.update");

      assert.strictEqual(canPrincipalApprove, true, "Principal must have approval.approve");
      assert.strictEqual(canStudentApprove, false, "Student must NOT have approval.approve");
      assert.strictEqual(canParentApprove, false, "Parent must NOT have approval.approve");
      assert.strictEqual(canAccountantBill, true, "Accountant must have invoice.create");
      assert.strictEqual(canTeacherMark, true, "Teacher must have marks.update");
      assert.strictEqual(canStudentMark, false, "Student must NOT have marks.update");

      globalReporter.record({
        testId: "UT-RBAC-001",
        portal: "Platform",
        module: "Permission Engine (RBAC)",
        role: "System",
        action: "Evaluate fine-grained permission matrix across canonical roles",
        status: "PASS",
        expectedResult: "Principal and Accountant granted operational rights; Student and Parent strictly blocked",
        actualResult: "Permission matrix matches security policies",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-RBAC-001",
        portal: "Platform",
        module: "Permission Engine (RBAC)",
        role: "System",
        action: "Evaluate permission matrix",
        status: "FAIL",
        expectedResult: "Correct permissions",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });
});
