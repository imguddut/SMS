/**
 * AGRAGATI PLATFORM — Portal Modules & CRUD Test Suite
 * Tests operations and data services across all 7 portals
 * Wrapped with node:test describe and it blocks
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { globalReporter } from "../helpers/test-harness";
import {
  provisionSchool,
  listOrganizationSchools,
  getOrganizationMetrics,
  getOrganization,
  updateOrganizationSchoolStatus,
  deleteOrganizationSchool,
} from "@/lib/services/organization-service";
import {
  createNotice,
  updateApprovalStatus,
} from "@/lib/db/school-admin";
import { sharedStore } from "@/lib/db/shared-store";
import {
  createAdmission,
  updateAdmissionStatus as updateAdmissionStatusService,
  enrollApplicant,
  getAdmissions,
} from "@/lib/services/admissions-service";
import { dispatchMultiChannel } from "@/lib/services/notification-provider";

describe("Portal Module Functional Workflows (All Portals)", () => {
  const orgId = "e0000000-0000-0000-0000-000000000001";
  let newSchoolId = "";

  // -------------------------------------------------------------------------
  // PORTAL 1 & 2: Platform Admin & Owner / Organization
  // -------------------------------------------------------------------------
  it("MOD-ORG-001: Retrieve organization master details", async () => {
    try {
      const org = await getOrganization(orgId);
      assert.ok(org, "Organization must exist");
      assert.strictEqual(org.slug, "kings-trust", "Organization slug must match");
      globalReporter.record({
        testId: "MOD-ORG-001",
        portal: "Organization",
        module: "Fleet Management",
        role: "ORGANIZATION_OWNER",
        action: "Retrieve organization master details",
        status: "PASS",
        expectedResult: "Found King's Educational Trust",
        actualResult: org.name,
        databaseExpectation: "organizations row returned",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "MOD-ORG-001",
        portal: "Organization",
        module: "Fleet Management",
        role: "ORGANIZATION_OWNER",
        action: "Retrieve organization master details",
        status: "FAIL",
        expectedResult: "Found organization",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("MOD-ORG-002: Multi-School Provisioning (5-Step Transactional Wizard)", async () => {
    try {
      const newSchoolSlug = "qa-test-campus-" + Date.now();
      const newSchool = await provisionSchool(
        orgId,
        "usr-owner-01",
        {
          name: "QA Autonomous Test Academy",
          slug: newSchoolSlug,
          schoolCode: "QA-01",
          city: "Zurich",
          country: "Switzerland",
          currency: "CHF",
          academicYearName: "Academic Session 2025–2026",
          startDate: "2025-08-01",
          endDate: "2026-06-30",
          classes: [
            { name: "Grade 11 IB", gradeLevel: 11, sections: ["11-A", "11-B"] },
          ],
          subjects: ["Physics HL", "Mathematics HL", "Computer Science"],
          principalName: "Dr. Evelyn Vance",
          principalEmail: "principal.evelyn@testacademy.edu",
        }
      );

      newSchoolId = newSchool.id;
      assert.ok(newSchool.id, "Provisioned school must have valid UUID");
      assert.strictEqual(newSchool.status, "ACTIVE", "School status must be ACTIVE");

      globalReporter.record({
        testId: "MOD-ORG-002",
        portal: "Organization",
        module: "School Provisioning",
        role: "ORGANIZATION_OWNER",
        action: "Execute 5-step school provisioning wizard",
        status: "PASS",
        expectedResult: "School created with classes, sections, and academic year",
        actualResult: `School ID: ${newSchool.id}, Status: ${newSchool.status}`,
        databaseExpectation: "schools, academic_years, classes, sections, subjects rows inserted",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "MOD-ORG-002",
        portal: "Organization",
        module: "School Provisioning",
        role: "ORGANIZATION_OWNER",
        action: "Execute 5-step school provisioning wizard",
        status: "FAIL",
        expectedResult: "School created",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("MOD-ORG-003: Consolidated Organization KPIs across campuses", async () => {
    try {
      const kpis = await getOrganizationMetrics(orgId);
      assert.ok(kpis.totalSchools >= 2, "Must have at least 2 schools");
      assert.ok(kpis.totalStudents > 0, "Total students must be greater than 0");
      assert.ok(kpis.totalBilled >= kpis.totalCollected, "Billed must be >= Collected");

      globalReporter.record({
        testId: "MOD-ORG-003",
        portal: "Organization",
        module: "KPI Engine",
        role: "ORGANIZATION_OWNER",
        action: "Calculate consolidated organization KPIs across campuses",
        status: "PASS",
        expectedResult: "Accurate aggregate students, schools, fee yield",
        actualResult: `${kpis.totalSchools} schools, ${kpis.totalStudents} students, Collection: ${kpis.collectionRate}`,
        databaseExpectation: "Aggregates matched across member schools",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "MOD-ORG-003",
        portal: "Organization",
        module: "KPI Engine",
        role: "ORGANIZATION_OWNER",
        action: "Calculate consolidated organization KPIs",
        status: "FAIL",
        expectedResult: "KPIs computed",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("MOD-ORG-004: Deactivate school campus lifecycle", async () => {
    try {
      const targetId = newSchoolId || "22222222-2222-2222-2222-222222222222";
      const res = await updateOrganizationSchoolStatus(targetId, "INACTIVE");
      assert.strictEqual(res.school?.status, "INACTIVE", "School status must now be INACTIVE");
      globalReporter.record({
        testId: "MOD-ORG-004",
        portal: "Organization",
        module: "Fleet Management",
        role: "ORGANIZATION_OWNER",
        action: "Deactivate school campus lifecycle",
        status: "PASS",
        expectedResult: "School status changed to INACTIVE",
        actualResult: `Status: ${res.school?.status}`,
        databaseExpectation: "schools row updated with status = INACTIVE",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "MOD-ORG-004",
        portal: "Organization",
        module: "Fleet Management",
        role: "ORGANIZATION_OWNER",
        action: "Deactivate school campus lifecycle",
        status: "FAIL",
        expectedResult: "Status changed to INACTIVE",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("MOD-ORG-005: Reactivate school campus lifecycle", async () => {
    try {
      const targetId = newSchoolId || "22222222-2222-2222-2222-222222222222";
      const res = await updateOrganizationSchoolStatus(targetId, "ACTIVE");
      assert.strictEqual(res.school?.status, "ACTIVE", "School status must now be ACTIVE");
      globalReporter.record({
        testId: "MOD-ORG-005",
        portal: "Organization",
        module: "Fleet Management",
        role: "ORGANIZATION_OWNER",
        action: "Reactivate school campus lifecycle",
        status: "PASS",
        expectedResult: "School status restored to ACTIVE",
        actualResult: `Status: ${res.school?.status}`,
        databaseExpectation: "schools row updated with status = ACTIVE",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "MOD-ORG-005",
        portal: "Organization",
        module: "Fleet Management",
        role: "ORGANIZATION_OWNER",
        action: "Reactivate school campus lifecycle",
        status: "PASS",
        expectedResult: "Status restored to ACTIVE",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("MOD-ORG-006: Permanently delete school campus from organization", async () => {
    try {
      const targetId = newSchoolId || "22222222-2222-2222-2222-222222222222";
      await deleteOrganizationSchool(targetId);
      const currentSchools = await listOrganizationSchools(orgId);
      assert.ok(!currentSchools.some((s) => s.id === targetId), "Deleted school must not be in list");
      globalReporter.record({
        testId: "MOD-ORG-006",
        portal: "Organization",
        module: "Fleet Management",
        role: "ORGANIZATION_OWNER",
        action: "Permanently delete school campus from organization",
        status: "PASS",
        expectedResult: "School removed from fleet directory",
        actualResult: "School verified removed",
        databaseExpectation: "schools row deleted and audit log recorded",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "MOD-ORG-006",
        portal: "Organization",
        module: "Fleet Management",
        role: "ORGANIZATION_OWNER",
        action: "Permanently delete school campus from organization",
        status: "FAIL",
        expectedResult: "School removed from fleet",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  // -------------------------------------------------------------------------
  // PORTAL 3: Principal & School Office
  // -------------------------------------------------------------------------
  it("MOD-SCH-001: Publish official campus circular notice", async () => {
    try {
      const notice = await createNotice({
        title: "QA Test: Annual Inter-School Science Colloquium",
        content: "All Form VI scholars are scheduled for laboratory evaluations on Monday.",
        audience: "ALL_CAMPUS",
        priority: "GENERAL",
      });

      assert.ok(notice.id, "Notice must have an ID");
      assert.strictEqual(notice.title, "QA Test: Annual Inter-School Science Colloquium");

      globalReporter.record({
        testId: "MOD-SCH-001",
        portal: "School Office",
        module: "Notices",
        role: "PRINCIPAL",
        action: "Publish official campus circular notice",
        status: "PASS",
        expectedResult: "Notice published and broadcasted to school audience",
        actualResult: `Notice ID: ${notice.id}`,
        databaseExpectation: "notices row created with target_audiences",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "MOD-SCH-001",
        portal: "School Office",
        module: "Notices",
        role: "PRINCIPAL",
        action: "Publish campus notice",
        status: "FAIL",
        expectedResult: "Notice created",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("MOD-SCH-002: Digitally approve fee waiver petition with cryptographic signature", async () => {
    try {
      const approvalRes = await updateApprovalStatus("war-01", "APPROVED");
      assert.ok(approvalRes.success, "Approval decision must succeed");
      assert.ok(approvalRes.signatureHash?.startsWith("SIG-PRINCIPAL"), "Must generate cryptographic signature hash");

      globalReporter.record({
        testId: "MOD-SCH-002",
        portal: "School Office",
        module: "Approvals",
        role: "PRINCIPAL",
        action: "Digitally approve fee waiver petition with cryptographic signature",
        status: "PASS",
        expectedResult: "Approval status updated to APPROVED with audit signature",
        actualResult: `Signature: ${approvalRes.signatureHash}`,
        databaseExpectation: "approvals row updated with decision notes and signature",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "MOD-SCH-002",
        portal: "School Office",
        module: "Approvals",
        role: "PRINCIPAL",
        action: "Approve petition",
        status: "FAIL",
        expectedResult: "Approval updated",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  // -------------------------------------------------------------------------
  // PORTAL 4: Teacher & Faculty
  // -------------------------------------------------------------------------
  it("MOD-TEA-001: Mark scholar daily attendance (PRESENT)", async () => {
    try {
      const studentId = "std-01";
      const today = new Date().toISOString().split("T")[0];
      sharedStore.setAttendanceRoster("class-12a", [
        {
          id: "att-qa-01",
          studentId,
          studentName: "Aarav Sharma",
          form: "Class 12-A",
          house: "Tagore House",
          turnstileTime: "08:14 IST (Smart Gate 01)",
          status: "PRESENT",
          date: today,
        },
      ]);

      const radar = sharedStore.getStudentAttendanceRadar(studentId);
      assert.ok(radar.length > 0, "Attendance radar must have records");
      assert.strictEqual(radar[0].status, "PRESENT", "Status must be PRESENT");

      globalReporter.record({
        testId: "MOD-TEA-001",
        portal: "Teacher",
        module: "Attendance",
        role: "TEACHER",
        action: "Mark scholar daily attendance (PRESENT)",
        status: "PASS",
        expectedResult: "Attendance recorded and verified in daily roll",
        actualResult: `Student: ${studentId}, Status: ${radar[0].status}, Date: ${today}`,
        databaseExpectation: "attendance_entries row inserted",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "MOD-TEA-001",
        portal: "Teacher",
        module: "Attendance",
        role: "TEACHER",
        action: "Mark scholar attendance",
        status: "FAIL",
        expectedResult: "Attendance marked",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("MOD-TEA-002: Create homework assignment, receive submission, and award grade with feedback", async () => {
    try {
      const hw = sharedStore.createHomeworkAssignment({
        title: "QA Test: Quantum Mechanics Problem Set 4",
        className: "Class 12-A - Advanced Pure Mathematics & Physics",
        form: "Class 12-A",
        subject: "Mathematics (CBSE 041)",
        dueDate: "2025-11-20",
        maxMarks: 50,
        description: "Complete derivations for shortest distance between skew lines.",
        rubric: "Accuracy 30pts, Methodology 20pts",
      });

      assert.ok(hw.id, "Homework must have an ID");

      // Scholar submits
      const sub = sharedStore.submitHomework({
        homeworkId: hw.id,
        studentId: "std-01",
        studentName: "Aarav Sharma",
        form: "Class 12-A",
        fileName: "Quantum_Set4_Aarav.pdf",
        notes: "Completed all derivations with step-by-step vector algebra.",
      });

      assert.ok(sub.id, "Submission must have an ID");

      // Teacher grades
      const gradeRes = sharedStore.gradeHomework(sub.id, 48, "Outstanding analytical derivation in problem 6.");
      assert.strictEqual(gradeRes, true, "Grading must succeed");

      const subs = sharedStore.getHomeworkSubmissions(hw.id);
      const gradedSub = subs.find((s) => s.id === sub.id);
      assert.strictEqual(gradedSub?.marksAwarded, 48, "Marks awarded must be 48");
      assert.strictEqual(gradedSub?.status, "GRADED", "Status must be GRADED");

      globalReporter.record({
        testId: "MOD-TEA-002",
        portal: "Teacher",
        module: "Homework & Grading",
        role: "TEACHER",
        action: "Create homework assignment, receive submission, and award grade with feedback",
        status: "PASS",
        expectedResult: "Homework graded: 48/50 with teacher feedback",
        actualResult: `Marks: ${gradedSub?.marksAwarded}/${hw.maxMarks}, Status: ${gradedSub?.status}`,
        databaseExpectation: "homework_assignments & homework_submissions updated",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "MOD-TEA-002",
        portal: "Teacher",
        module: "Homework & Grading",
        role: "TEACHER",
        action: "Create homework & grade",
        status: "FAIL",
        expectedResult: "Graded successfully",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  // -------------------------------------------------------------------------
  // PORTAL 5: Accountant & Treasury
  // -------------------------------------------------------------------------
  it("MOD-FIN-001: Generate student fee invoice and settle payment receipt via UPI", async () => {
    try {
      const invId = "inv-qa-" + Date.now().toString().slice(-6);
      const inv = sharedStore.createInvoice({
        id: invId,
        invoiceNumber: "INV-QA-" + Date.now().toString().slice(-6),
        studentId: "std-01",
        studentName: "Aarav Sharma",
        admissionNumber: "ADM-2024-001",
        form: "Class 12-A",
        house: "Tagore House",
        guardianName: "Dr. Vikram Sharma",
        termName: "Term 3 (Quarter 4)",
        amount: 125000,
        currency: "INR",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: "2025-10-31",
        paymentMethod: "BHIM_UPI",
        description: "Senior Secondary Tuition & AI Laboratory Levies",
        status: "PENDING",
      });

      assert.ok(inv.id, "Invoice must have an ID");
      assert.strictEqual(inv.status, "PENDING", "Initial status must be PENDING");

      // Settle payment
      const payResult = sharedStore.payInvoice(inv.id, "BHIM_UPI (Google Pay)");
      assert.strictEqual(payResult.success, true, "Payment settlement must succeed");
      assert.ok(payResult.receiptRef.startsWith("UPI-UTR-"), "Must generate receipt reference");

      const allInvoices = sharedStore.getInvoices();
      const paidInv = allInvoices.find((i) => i.id === inv.id);
      assert.strictEqual(paidInv?.status, "PAID", "Invoice status must transition to PAID");

      globalReporter.record({
        testId: "MOD-FIN-001",
        portal: "Finance",
        module: "Treasury Invoicing",
        role: "ACCOUNTANT",
        action: "Generate student fee invoice and settle payment receipt via UPI",
        status: "PASS",
        expectedResult: "Invoice transitions from PENDING -> PAID with receipt reference",
        actualResult: `Invoice: ${paidInv?.invoiceNumber}, Status: ${paidInv?.status}, Ref: ${paidInv?.receiptRef}`,
        databaseExpectation: "invoices & payments rows created and settled",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "MOD-FIN-001",
        portal: "Finance",
        module: "Treasury Invoicing",
        role: "ACCOUNTANT",
        action: "Generate invoice and pay",
        status: "FAIL",
        expectedResult: "Settled successfully",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  // -------------------------------------------------------------------------
  // PORTAL 6 & 7: Parent & Student Consumer Portals
  // -------------------------------------------------------------------------
  it("MOD-PAR-001: Query authorized ward telemetry via student_guardians relationship", async () => {
    try {
      const parentSummary = sharedStore.getParentPortalSummary("std-01");
      assert.ok(parentSummary, "Parent summary must be returned");
      assert.ok(parentSummary.attendanceRate, "Attendance rate must be present");
      assert.ok(parentSummary.academicStanding, "Academic standing must be present");

      globalReporter.record({
        testId: "MOD-PAR-001",
        portal: "Parent",
        module: "Ward Scoping",
        role: "PARENT",
        action: "Query authorized ward telemetry via student_guardians relationship",
        status: "PASS",
        expectedResult: "Parent views attendance rate, arrival status, and tuition status",
        actualResult: `Standing: ${parentSummary.academicStanding}, Attendance: ${parentSummary.attendanceRate}, Tuition: ${parentSummary.tuitionStatus}`,
        rlsExpectation: "Strict student_guardians join constraint enforced",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "MOD-PAR-001",
        portal: "Parent",
        module: "Ward Scoping",
        role: "PARENT",
        action: "Query authorized wards",
        status: "FAIL",
        expectedResult: "Wards loaded",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("MOD-STU-001: Access personal examination report card and GPA", async () => {
    try {
      const studentId = "std-01";
      const result = sharedStore.getStudentResult(studentId);
      assert.ok(result, "Result must exist");
      assert.strictEqual(result.studentId, studentId, "Student ID must match");
      assert.ok(result.weightedTotal > 0, "Weighted total must be positive");

      globalReporter.record({
        testId: "MOD-STU-001",
        portal: "Student",
        module: "Gradebook",
        role: "STUDENT",
        action: "Access personal examination report card and GPA",
        status: "PASS",
        expectedResult: "Student views own academic marks and standing",
        actualResult: `Total: ${result.weightedTotal}%, Standing: ${result.academicStanding}, Grade: ${result.predictedGrade}`,
        rlsExpectation: "Self-scoped student_id equality",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "MOD-STU-001",
        portal: "Student",
        module: "Gradebook",
        role: "STUDENT",
        action: "Access student gradebook",
        status: "FAIL",
        expectedResult: "Grades retrieved",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  // -------------------------------------------------------------------------
  // EXTENDED DOMAIN TESTS: Admissions, Notifications, Expenses, Leave
  // -------------------------------------------------------------------------
  it("MOD-ADM-001: Process student application from intake to campus enrollment", async () => {
    try {
      const newApplicant = await createAdmission({
        schoolId: "11111111-1111-1111-1111-111111111111",
        applicantName: "Aadhya Nair",
        dateOfBirth: "2013-05-12",
        gender: "Female",
        gradeApplyingFor: "Class 7",
        parentName: "Suresh Nair",
        parentEmail: "suresh.nair@example.com",
        parentPhone: "+91 98450 99887",
        address: "Indiranagar, Bengaluru",
        notes: "State chess championship runner-up.",
        entranceScore: 94.0,
      });

      assert.ok(newApplicant.id, "Admission application must have an ID");
      assert.strictEqual(newApplicant.status, "PENDING", "Initial status must be PENDING");

      const approved = await updateAdmissionStatusService(newApplicant.id, "APPROVED");
      assert.strictEqual(approved?.status, "APPROVED", "Status must update to APPROVED");

      const enrolled = await enrollApplicant(newApplicant.id);
      assert.ok(enrolled, "Enrollment must succeed");
      assert.strictEqual(enrolled.admission.status, "ENROLLED", "Status must be ENROLLED");
      assert.ok(enrolled.studentId, "Enrolled student must have a scholar ID");

      globalReporter.record({
        testId: "MOD-ADM-001",
        portal: "School Office",
        module: "Admissions Pipeline",
        role: "SCHOOL_ADMIN",
        action: "Process student application from intake to campus enrollment",
        status: "PASS",
        expectedResult: "Applicant transitions through PENDING -> APPROVED -> ENROLLED with student roster entry",
        actualResult: `Assigned Student ID: ${enrolled.studentId}, Application No: ${newApplicant.applicationNo}`,
        databaseExpectation: "admissions table record updated; student added to attendance and gradebook",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "MOD-ADM-001",
        portal: "School Office",
        module: "Admissions Pipeline",
        role: "SCHOOL_ADMIN",
        action: "Process student application from intake to campus enrollment",
        status: "FAIL",
        expectedResult: "Applicant enrolled",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("MOD-NOTIF-001: Dispatch multi-channel event notification (In-App, Email, SMS, WhatsApp)", async () => {
    try {
      const notifReport = await dispatchMultiChannel({
        schoolId: "11111111-1111-1111-1111-111111111111",
        recipientUserId: "b0000000-0000-0000-0000-000000000007",
        recipientEmail: "parent@example.com",
        recipientPhone: "+91 98765 43210",
        channels: ["IN_APP", "EMAIL", "SMS", "WHATSAPP"],
        type: "PAYMENT_RECEIVED",
        title: "Fee Receipt Confirmed",
        message: "Term 2 fee of ₹75,000 settled successfully.",
        entityType: "payments",
        entityId: "pay-qa-01",
      });

      assert.ok(notifReport.allSuccess, "All configured delivery channels must succeed");
      assert.strictEqual(notifReport.results.length, 4, "Should have 4 channel reports");

      globalReporter.record({
        testId: "MOD-NOTIF-001",
        portal: "Platform Admin",
        module: "Notification Engine",
        role: "PLATFORM_ADMIN",
        action: "Dispatch multi-channel event notification (In-App, Email, SMS, WhatsApp)",
        status: "PASS",
        expectedResult: "Simultaneous multi-channel dispatch with delivery receipts",
        actualResult: `Dispatched to 4 channels | Event ID: ${notifReport.eventId}`,
        databaseExpectation: "notifications table record logged and mock external delivery succeeded",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "MOD-NOTIF-001",
        portal: "Platform Admin",
        module: "Notification Engine",
        role: "PLATFORM_ADMIN",
        action: "Dispatch multi-channel event notification",
        status: "FAIL",
        expectedResult: "Dispatched",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("MOD-FIN-002: Submit vendor bill, obtain Principal sanction, and record bank disbursement", async () => {
    try {
      const expense = sharedStore.createExpense({
        schoolId: "11111111-1111-1111-1111-111111111111",
        expenseNumber: "EXP-2025-QA99",
        vendorName: "Orient Book Distributors Pvt Ltd",
        category: "Library & Texts",
        description: "Class 10 CBSE Exemplar & Mathematics Reference Volumes",
        amount: 42000,
        currency: "INR",
        invoiceDate: "2025-01-15",
        status: "PENDING_APPROVAL",
      });

      assert.ok(expense.id, "Expense must have an ID");
      assert.strictEqual(expense.status, "PENDING_APPROVAL");

      const approved = sharedStore.updateExpenseStatus(expense.id, "APPROVED", "Dr. Arvind Swaminathan");
      assert.strictEqual(approved?.status, "APPROVED");
      assert.strictEqual(approved?.approvedBy, "Dr. Arvind Swaminathan");

      const paid = sharedStore.updateExpenseStatus(expense.id, "PAID", undefined, "NEFT-HDFC-991823");
      assert.strictEqual(paid?.status, "PAID");
      assert.strictEqual(paid?.paymentReference, "NEFT-HDFC-991823");

      globalReporter.record({
        testId: "MOD-FIN-002",
        portal: "Finance",
        module: "Procurement & Expenses",
        role: "ACCOUNTANT",
        action: "Submit vendor bill, obtain Principal sanction, and record bank disbursement",
        status: "PASS",
        expectedResult: "Expense transitions through PENDING_APPROVAL -> APPROVED -> PAID",
        actualResult: `Bill ${expense.expenseNumber} settled via ${paid?.paymentReference}`,
        databaseExpectation: "expenses record updated with audit trail",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "MOD-FIN-002",
        portal: "Finance",
        module: "Procurement & Expenses",
        role: "ACCOUNTANT",
        action: "Process vendor expense lifecycle",
        status: "FAIL",
        expectedResult: "Processed",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  it("MOD-PAR-002: Submit ward absence note and verify Principal digital approval", async () => {
    try {
      const leave = sharedStore.createLeaveRequest({
        schoolId: "11111111-1111-1111-1111-111111111111",
        applicantType: "STUDENT",
        applicantId: "std-01",
        applicantName: "Aarav Sharma",
        startDate: "2025-02-01",
        endDate: "2025-02-03",
        reason: "Family wedding in Jaipur",
        leaveType: "Family Function",
        status: "PENDING",
      });

      assert.ok(leave.id, "Leave request must have an ID");
      assert.strictEqual(leave.status, "PENDING");

      const reviewed = sharedStore.updateLeaveRequestStatus(leave.id, "APPROVED", "Principal", "Absence excused.");
      assert.strictEqual(reviewed?.status, "APPROVED");
      assert.strictEqual(reviewed?.reviewNotes, "Absence excused.");

      globalReporter.record({
        testId: "MOD-PAR-002",
        portal: "Parent",
        module: "Absence & Leave",
        role: "PARENT",
        action: "Submit ward absence note and verify Principal digital approval",
        status: "PASS",
        expectedResult: "Leave request stored and updated to APPROVED status",
        actualResult: `Leave ID: ${leave.id} marked as APPROVED with notes`,
        databaseExpectation: "leave_requests table record updated",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "MOD-PAR-002",
        portal: "Parent",
        module: "Absence & Leave",
        role: "PARENT",
        action: "Submit ward absence note",
        status: "FAIL",
        expectedResult: "Approved",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });
});
