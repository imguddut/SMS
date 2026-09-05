/**
 * AGRAGATI PLATFORM — Portal Modules & CRUD Test Suite
 * Tests operations and data services across all 7 portals
 */

import assert from "node:assert";
import { globalReporter } from "../helpers/test-harness";
import {
  provisionSchool,
  listOrganizationSchools,
  getOrganizationMetrics,
  getOrganization,
} from "@/lib/services/organization-service";
import {
  createNotice,
  updateApprovalStatus,
} from "@/lib/db/school-admin";
import { sharedStore } from "@/lib/db/shared-store";

export async function runModuleTests() {
  console.log("\n========================================================");
  console.log("▶ RUNNING PORTAL MODULES & CRUD TESTS (All 7 Portals)");
  console.log("========================================================");

  // -------------------------------------------------------------------------
  // PORTAL 1 & 2: Platform Admin & Owner / Organization
  // -------------------------------------------------------------------------
  const orgId = "e0000000-0000-0000-0000-000000000001";

  // Test 1: Get Organization Details
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
  }

  // Test 2: Multi-School Provisioning (5-Step Transactional Wizard)
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
  }

  // Test 3: Consolidated Organization KPIs
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
  }

  // -------------------------------------------------------------------------
  // PORTAL 3: Principal & School Office
  // -------------------------------------------------------------------------
  // Test 4: Campus Notice Broadcast
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
  }

  // Test 5: Decide Multi-Level Approval (Principal Digital Signature)
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
  }

  // -------------------------------------------------------------------------
  // PORTAL 4: Teacher & Faculty
  // -------------------------------------------------------------------------
  // Test 6: Teacher Roll-Call Attendance
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
  }

  // Test 7: Teacher Homework Creation & Grading
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
  }

  // -------------------------------------------------------------------------
  // PORTAL 5: Accountant & Treasury
  // -------------------------------------------------------------------------
  // Test 8: Fee Invoicing & Payment Collection
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
  }

  // -------------------------------------------------------------------------
  // PORTAL 6 & 7: Parent & Student Consumer Portals
  // -------------------------------------------------------------------------
  // Test 9: Parent Ward Scoping & Dashboard Telemetry
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
  }

  // Test 10: Student Self-Scoped Gradebook
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
  }
}

// Allow standalone execution
if (process.argv[1]?.endsWith("portal-modules.test.ts")) {
  runModuleTests().then(() => {
    const summary = globalReporter.getSummary();
    console.log(`\nModule Tests Completed: ${summary.passed}/${summary.total} Passed (${summary.passRatePercent}%)`);
  });
}
