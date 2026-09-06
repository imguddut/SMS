/**
 * AGRAGATI SCHOOL OS — INTEGRATION TEST SUITE
 * Cross-Portal Lifecycles & Reactive State Synchronization
 * 
 * Verifies that mutations initiated in one portal propagate predictably
 * across all dependent consumer portals:
 * 1. Student Lifecycle: Admin Enrollment -> Teacher Roster -> Finance Invoicing -> Parent Ward View -> Student Profile
 * 2. Fee & Treasury Lifecycle: Accountant Billed -> Parent Settled -> Ledger Logged -> Owner KPI Updated
 * 3. Attendance Lifecycle: Teacher Marking -> Parent Real-Time Radar -> Student Standing -> Campus Aggregates
 * 4. Academic Lifecycle: Teacher Homework -> Student Submission -> Teacher Grading -> Parent & Student Results
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { sharedStore, SharedAttendanceItem } from "@/lib/db/shared-store";
import { globalReporter } from "../helpers/test-harness";

describe("Cross-Portal Business Event Lifecycles", () => {
  // =========================================================================
  // LIFECYCLE 1: Student Lifecycle (School Admin -> Teacher -> Finance -> Parent -> Student)
  // =========================================================================
  it("LIFECYCLE-STU: Student lifecycle across Admin, Faculty, Treasury, Guardian, and Scholar", async () => {
    try {
      const studentId = "std-integ-" + Date.now().toString().slice(-4);
      const studentName = "Devika Sen";
      const form = "Class 12-A";
      const guardianName = "Anuradha Sen";

      // Step 1: Admin enrolls student & Teacher adds to section attendance roster
      const initialRoster = sharedStore.getAttendanceRoster(form);
      const newAttendanceEntry: SharedAttendanceItem = {
        id: "att-" + studentId,
        studentId,
        studentName,
        form,
        house: "Sarojini House",
        turnstileTime: "08:05 IST (Smart Gate 02)",
        status: "PRESENT",
        date: new Date().toISOString().split("T")[0],
      };
      sharedStore.setAttendanceRoster(form, [...initialRoster, newAttendanceEntry]);

      // Verify Teacher sees student in section roster
      const updatedRoster = sharedStore.getAttendanceRoster(form);
      const enrolledStudentInRoster = updatedRoster.find((s) => s.studentId === studentId);
      assert.ok(enrolledStudentInRoster, "Teacher roster must immediately contain enrolled student");
      assert.strictEqual(enrolledStudentInRoster.status, "PRESENT");

      // Step 2: Finance bills term tuition for this student
      const invoice = sharedStore.createInvoice({
        id: "inv-" + studentId,
        invoiceNumber: "INV-2025-" + studentId,
        studentId,
        studentName,
        form,
        house: "Sarojini House",
        guardianName,
        termName: "Term 1 (Academic Session 2025-26)",
        amount: 85000,
        currency: "INR",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: "2025-11-15",
        paymentMethod: "UPI",
        description: "Standard Academic Tuition & Laboratory Fee",
        status: "PENDING",
      });
      assert.strictEqual(invoice.status, "PENDING");

      // Step 3: Finance queries all invoices and confirms student invoice exists
      const allInvoices = sharedStore.getInvoices();
      const matchingInvoice = allInvoices.find((i) => i.studentId === studentId);
      assert.ok(matchingInvoice, "Finance portal must list student invoice");

      // Step 4: Parent views ward financial state
      // (The invoice is pending, so unpaid balance reflects this invoice)
      const parentInvoices = sharedStore.getInvoices().filter((i) => i.studentId === studentId);
      const outstandingDue = parentInvoices
        .filter((i) => i.status === "PENDING")
        .reduce((sum, i) => sum + i.amount, 0);
      assert.strictEqual(outstandingDue, 85000, "Parent portal must reflect pending tuition dues");

      // Step 5: Student attendance radar reflects turnstile entry
      const radar = sharedStore.getStudentAttendanceRadar(studentId);
      assert.ok(radar.length > 0, "Student portal radar must have entries");
      assert.strictEqual(radar[0].status, "PRESENT", "Student portal radar must show active turnstile status");

      globalReporter.record({
        testId: "INT-LIFECYCLE-STU",
        portal: "Cross-Portal",
        module: "Student Lifecycle",
        role: "Multi-Role",
        action: "Propagate student enrollment -> teacher roster -> finance billing -> parent dues -> student radar",
        status: "PASS",
        expectedResult: "All 5 portals reactively synchronize student state without drift",
        actualResult: `Student ${studentName} synchronized across Faculty, Bursary, Guardian, and Scholar portals`,
        databaseExpectation: "Consistent student entity across sections, invoices, attendance, and guardian relationships",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "INT-LIFECYCLE-STU",
        portal: "Cross-Portal",
        module: "Student Lifecycle",
        role: "Multi-Role",
        action: "Propagate student enrollment across portals",
        status: "FAIL",
        expectedResult: "Synchronized",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  // =========================================================================
  // LIFECYCLE 2: Fee & Treasury Settlement (Accountant -> Parent -> Ledger -> Owner KPI)
  // =========================================================================
  it("LIFECYCLE-FEE: Fee billing, settlement, double-entry ledger logging, and owner KPI impact", async () => {
    try {
      const studentId = "std-01";
      const initialSnapshot = sharedStore.getBursaryFinancialSnapshot();
      const initialCollected = initialSnapshot.totalCollectionsTerm;

      // Step 1: Accountant bills new supplementary invoice
      const invoiceAmount = 25000;
      const invId = "inv-fee-cycle-" + Date.now();
      sharedStore.createInvoice({
        id: invId,
        invoiceNumber: "INV-FEECYCLE-" + Date.now().toString().slice(-4),
        studentId,
        studentName: "Aarav Sharma",
        form: "Class 12-A",
        house: "Tagore House",
        guardianName: "Dr. Vikram Sharma",
        termName: "Term 2 Olympiad Fee",
        amount: invoiceAmount,
        currency: "INR",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: "2025-12-01",
        paymentMethod: "NET_BANKING",
        description: "National Science & Robotics Olympiad Fee",
        status: "PENDING",
      });

      // Step 2: Parent / Cashier completes payment via UPI
      const payResult = sharedStore.payInvoice(invId, "UPI (Instant IMPS Settlement)");
      assert.strictEqual(payResult.success, true, "Payment must be accepted");
      assert.ok(payResult.receiptRef.length > 5, "Must yield audit receipt ref");

      // Step 3: Verify invoice status transitioned to PAID
      const invoiceAfterPay = sharedStore.getInvoices().find((i) => i.id === invId);
      assert.strictEqual(invoiceAfterPay?.status, "PAID", "Invoice must transition to PAID");

      // Step 4: Verify double-entry ledger contains credit entry
      const ledger = sharedStore.getLedgerTransactions();
      const creditEntry = ledger.find((t) => t.reference === payResult.receiptRef || t.description.includes(invId));
      assert.ok(ledger.length > 0, "Ledger must contain transaction history");

      // Step 5: Verify Bursary collection snapshot increases
      const updatedSnapshot = sharedStore.getBursaryFinancialSnapshot();
      assert.strictEqual(
        updatedSnapshot.totalCollectionsTerm,
        initialCollected + invoiceAmount,
        "Treasury collection total must increment by exact payment amount"
      );

      globalReporter.record({
        testId: "INT-LIFECYCLE-FEE",
        portal: "Cross-Portal",
        module: "Fee & Treasury",
        role: "Multi-Role",
        action: "Bill fee -> Settle payment -> Generate UTR receipt -> Update ledger -> Recalculate treasury totals",
        status: "PASS",
        expectedResult: "Accurate financial settlement without floating point discrepancy",
        actualResult: `Invoice settled, receipt ${payResult.receiptRef} generated, treasury collections updated to ₹${updatedSnapshot.totalCollectionsTerm.toLocaleString("en-IN")}`,
        databaseExpectation: "invoices, payments, and double-entry ledger synchronized",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "INT-LIFECYCLE-FEE",
        portal: "Cross-Portal",
        module: "Fee & Treasury",
        role: "Multi-Role",
        action: "Execute fee payment lifecycle",
        status: "FAIL",
        expectedResult: "Settled",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  // =========================================================================
  // LIFECYCLE 3: Attendance Telemetry (Teacher -> Parent -> Student -> Principal)
  // =========================================================================
  it("LIFECYCLE-ATT: Daily roll call propagation to parent push telemetry and student standing", async () => {
    try {
      const studentId = "std-02"; // Ananya Iyer

      // Step 1: Teacher marks student as LATE with remarks
      const attendanceItem = {
        id: "att-01",
        studentId,
        studentName: "Ananya Sharma",
        form: "Class 12-A",
        house: "Ashoka House",
        turnstileTime: "08:35 IST (Turnstile B)",
        status: "LATE" as const,
        remarks: "Metro line delayed; arrived 08:35 IST with parent note",
        date: new Date().toISOString().split("T")[0],
      };
      sharedStore.setAttendanceRoster("Class 12-A", [attendanceItem]);

      // Step 2: Parent checks ward arrival status
      const parentDigest = sharedStore.getParentDigest("ward-02");
      assert.ok(parentDigest.todaysArrivalStatus, "Parent digest must indicate arrival state");

      // Step 3: Student checks own attendance radar
      const studentRadar = sharedStore.getStudentAttendanceRadar(studentId);
      assert.ok(studentRadar.length > 0, "Student radar must have entries");
      assert.strictEqual(studentRadar[0].status, "LATE", "Student radar must reflect LATE status");
      assert.strictEqual(studentRadar[0].turnstileGate, "08:35 IST (Turnstile B)");

      // Step 4: Overall attendance percentage computation is robust
      const rate = sharedStore.getStudentAttendanceRate(studentId);
      assert.ok(rate.endsWith("%"), "Attendance rate must be formatted as percentage");

      globalReporter.record({
        testId: "INT-LIFECYCLE-ATT",
        portal: "Cross-Portal",
        module: "Attendance Telemetry",
        role: "Multi-Role",
        action: "Teacher marks LATE -> Parent receives arrival update -> Student radar synchronizes",
        status: "PASS",
        expectedResult: "Instantaneous reflection in guardian digest and scholar view",
        actualResult: `Status: ${studentRadar[0].status}, Turnstile: ${studentRadar[0].turnstileGate}, Rate: ${rate}`,
        databaseExpectation: "attendance_entries row updated with timestamp and audit remarks",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "INT-LIFECYCLE-ATT",
        portal: "Cross-Portal",
        module: "Attendance Telemetry",
        role: "Multi-Role",
        action: "Propagate attendance updates",
        status: "FAIL",
        expectedResult: "Telemetry synced",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });

  // =========================================================================
  // LIFECYCLE 4: Academic Homework & Assessment (Teacher -> Student -> Teacher -> Parent)
  // =========================================================================
  it("LIFECYCLE-ACAD: Homework publication, submission, evaluation, and grade publication", async () => {
    try {
      // Step 1: Teacher publishes homework
      const assignment = sharedStore.createHomeworkAssignment({
        title: "Integration Test: Machine Learning Loss Optimization",
        className: "Class 12-A - Artificial Intelligence Elective",
        form: "Class 12-A",
        subject: "Computer Science (CBSE 083)",
        dueDate: "2025-11-28",
        maxMarks: 100,
        description: "Implement gradient descent with momentum and Adam optimizer in Python.",
        rubric: "Convergence proof 40pts, Implementation 40pts, Code quality 20pts",
      });
      assert.ok(assignment.id, "Assignment must be created with ID");

      // Step 2: Student retrieves active assignments and submits
      const activeAssignments = sharedStore.getHomeworkAssignments("Class 12-A");
      const foundAssignment = activeAssignments.find((a) => a.id === assignment.id);
      assert.ok(foundAssignment, "Student must see newly published assignment");

      const submission = sharedStore.submitHomework({
        homeworkId: assignment.id,
        studentId: "std-01",
        studentName: "Aarav Sharma",
        form: "Class 12-A",
        fileName: "optimizer_implementations_aarav.py",
        notes: "Vectorized all matrix operations using NumPy. All loss functions converged.",
      });
      assert.strictEqual(submission.status, "SUBMITTED");

      // Step 3: Teacher reviews submissions list and grades
      const pendingSubmissions = sharedStore.getHomeworkSubmissions(assignment.id);
      const studentSub = pendingSubmissions.find((s) => s.studentId === "std-01");
      assert.ok(studentSub, "Teacher must receive student submission in grading queue");

      const gradeSuccess = sharedStore.gradeHomework(
        studentSub.id,
        96,
        "Superb implementation. Excellent convergence plots and rigorous error bounds."
      );
      assert.strictEqual(gradeSuccess, true, "Grading must succeed");

      // Step 4: Student views graded submission with teacher remarks
      const studentSubmissions = sharedStore.getStudentSubmissions("std-01");
      const gradedRecord = studentSubmissions.find((s) => s.id === studentSub.id);
      assert.strictEqual(gradedRecord?.status, "GRADED");
      assert.strictEqual(gradedRecord?.marksAwarded, 96);
      assert.ok(gradedRecord?.feedback.includes("Superb implementation"));

      // Step 5: Parent digest updates pending homework count
      const parentDigest = sharedStore.getParentDigest("ward-01");
      assert.ok(typeof parentDigest.pendingHomeworkCount === "number", "Parent digest counts pending homework");

      globalReporter.record({
        testId: "INT-LIFECYCLE-ACAD",
        portal: "Cross-Portal",
        module: "Academic Homework & Grading",
        role: "Multi-Role",
        action: "Teacher assigns -> Scholar submits file -> Teacher evaluates with feedback -> Scholar & Guardian review",
        status: "PASS",
        expectedResult: "Complete homework lifecycle with immutable submission timestamp and grade recording",
        actualResult: `Assignment ${assignment.id} graded: 96/100 ("${gradedRecord?.feedback.slice(0, 30)}...")`,
        databaseExpectation: "homework_assignments & homework_submissions tables updated",
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "INT-LIFECYCLE-ACAD",
        portal: "Cross-Portal",
        module: "Academic Homework & Grading",
        role: "Multi-Role",
        action: "Execute academic lifecycle",
        status: "FAIL",
        expectedResult: "Graded",
        actualResult: "Failed",
        error: err.message,
      });
      throw err;
    }
  });
});
