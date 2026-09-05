/**
 * AGRAGATI PLATFORM — EXHAUSTIVE DEPENDENCY & CRUD VERIFICATION SUITE
 *
 * Covers:
 * 1. Dependency integrity (module imports, types, clients)
 * 2. Portal 1: Super Admin / Platform Admin CRUD
 * 3. Portal 2: Trust Chairman / CEO / Organization Owner CRUD
 * 4. Portal 3: Principal Desk CRUD
 * 5. Portal 4: School Admin / Operations CRUD
 * 6. Portal 5: PGT Faculty (Teacher) Suite CRUD
 * 7. Portal 6: Accounts Officer (Finance) CRUD
 * 8. Portal 7: Parent / Guardian Portal CRUD
 * 9. Portal 8: Student / Scholar Space CRUD
 * 10. Realtime Notifications CRUD
 */

import { createClient } from "../lib/supabase/client";
import { normalizeRole, getRoleHomeRoute, isOrganizationScoped, isSchoolScoped, UserRole } from "../types/roles";
import { hasPermission, getRolePermissions } from "../lib/services/permission-service";
import * as OrgService from "../lib/services/organization-service";
import * as StudentService from "../lib/services/student-service";
import * as AcademicService from "../lib/services/academic-service";
import * as TimetableService from "../lib/services/timetable-service";
import * as GradebookService from "../lib/services/gradebook-service";
import * as FinanceService from "../lib/services/finance-service";

import {
  fetchAllSchools,
  fetchSchoolById,
  createSchoolWithAdmin,
  updateSchoolStatus,
  fetchPlatformBilling,
  fetchImpersonationDirectory,
  fetchPlatformAuditLogs,
} from "../lib/db/platform-admin";

import {
  fetchClassesSections,
  fetchNoticesBulletins,
  createNotice,
  fetchApprovalsQueue,
  updateApprovalStatus,
} from "../lib/db/school-admin";

import {
  fetchTeacherDailyAgenda,
  fetchTeacherClasses,
  fetchClassAttendanceRoster,
  submitAttendance,
  fetchTeacherHomeworkList,
  createHomeworkAssignment,
  fetchHomeworkSubmissions,
  gradeSubmission,
  fetchMarksEntryGrid,
  saveGradebookMarks,
} from "../lib/db/teacher";

import {
  fetchFinanceDashboardStats,
  fetchFeeStructures,
  createFeeStructure,
  fetchFinanceInvoices,
  createFinanceInvoice,
  fetchStudentLedgers,
  fetchStudentLedgerDetail,
  postLedgerTransaction,
  fetchBankReconciliationFeed,
  reconcileTransaction,
} from "../lib/db/finance";

import {
  fetchEnrolledWards,
  fetchParentDigest,
  fetchWardAttendanceHistory,
  fetchWardInvoices,
  payInvoice,
  fetchWardHomework,
  fetchWardReportCards,
  fetchParentBulletins,
  signNoticeConsent,
  submitAbsenceExcuse,
} from "../lib/db/parent";

import {
  fetchStudentProfile,
  fetchStudentSchedule,
  fetchStudentAttendanceRadar,
  fetchStudentHomeworkList,
  submitHomeworkSolution,
  fetchStudentResults,
  fetchStudentNotices,
  submitGatePassRequest,
} from "../lib/db/student";

import { fetchNotifications } from "../lib/db/notifications";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✅ [PASS] ${testName}${detail ? ` — ${detail}` : ""}`);
  } else {
    failedCount++;
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` — ${detail}` : ""}`);
  }
}

async function runAllChecks() {
  console.log("================================================================================");
  console.log("🚀 AGRAGATI PLATFORM — DEPENDENCY & ALL-PORTAL CRUD AUDIT");
  console.log("================================================================================\n");

  // ===========================================================================
  // 1. DEPENDENCIES & CORE RUNTIME
  // ===========================================================================
  console.log("📦 1. CHECKING DEPENDENCY & RUNTIME INTEGRITY");
  const supabaseClient = createClient();
  assert(Boolean(supabaseClient), "Supabase Client initialized successfully");

  const rolesToCheck: UserRole[] = [
    "PLATFORM_ADMIN", "SUPER_ADMIN", "ORGANIZATION_OWNER", "ORGANIZATION_ADMIN",
    "PRINCIPAL", "SCHOOL_ADMIN", "TEACHER", "ACCOUNTANT", "PARENT", "STUDENT"
  ];
  const allRolesHaveHome = rolesToCheck.every((r) => Boolean(getRoleHomeRoute(r)));
  assert(allRolesHaveHome, "All 10 canonical roles map to authorized route prefixes");

  const allRolesHavePerms = rolesToCheck.every((r) => getRolePermissions(r).length > 0);
  assert(allRolesHavePerms, "All canonical roles have non-empty permission matrices");

  // ===========================================================================
  // 2. PORTAL 1: SUPER ADMIN / PLATFORM ADMIN CRUD
  // ===========================================================================
  console.log("\n🏛️  2. PORTAL 1: SUPER ADMIN / PLATFORM ADMIN CRUD");
  
  // READ schools
  const allSchools = await fetchAllSchools();
  assert(allSchools.length > 0, "READ: fetchAllSchools returns multi-school fleet", `Count: ${allSchools.length}`);

  // READ school by id
  const sampleSchoolId = allSchools[0].id;
  const schoolDetail = await fetchSchoolById(sampleSchoolId);
  assert(Boolean(schoolDetail && schoolDetail.id === sampleSchoolId), "READ: fetchSchoolById returns valid school record");

  // CREATE school with admin
  const newSchoolRes = await createSchoolWithAdmin({
    legal_name: "Agragati International Academy (Test)",
    slug: `aia-test-${Date.now()}`,
    domain: `aia-${Date.now()}.agragati.edu`,
    institution_type: "DAY_AND_BOARDING",
    curriculum_framework: "CBSE_AFFILIATED",
    jurisdiction: "New Delhi, India",
    base_currency: "INR",
    capacity_target: 2000,
    owner_name: "Dr. Vikram Seth",
    owner_email: `admin-${Date.now()}@agragati.edu`,
    owner_title: "Campus Director",
    plan_tier: "ENTERPRISE_FLEET",
  });
  assert(Boolean(newSchoolRes.school && newSchoolRes.school.id), "CREATE: createSchoolWithAdmin creates school & admin", `ID: ${newSchoolRes.school?.id}`);

  // UPDATE school status
  const updateStatusRes = await updateSchoolStatus(newSchoolRes.school.id, "PROVISIONING");
  assert(updateStatusRes.success, "UPDATE: updateSchoolStatus modifies school lifecycle state");

  // READ billing
  const billingList = await fetchPlatformBilling();
  assert(billingList.length > 0, "READ: fetchPlatformBilling returns platform billing entries", `Count: ${billingList.length}`);

  // READ impersonation users & audit logs
  const impUsers = await fetchImpersonationDirectory();
  assert(impUsers.length > 0, "READ: fetchImpersonationDirectory returns directory for super-admin fleet", `Users: ${impUsers.length}`);

  const auditLogs = await fetchPlatformAuditLogs();
  assert(auditLogs.length > 0, "READ: fetchPlatformAuditLogs returns append-only security logs", `Logs: ${auditLogs.length}`);

  // ===========================================================================
  // 3. PORTAL 2: ORGANIZATION / OWNER FLEET CRUD
  // ===========================================================================
  console.log("\n🏢 3. PORTAL 2: ORGANIZATION / OWNER FLEET CRUD");

  // READ organizations
  const orgs = await OrgService.listOrganizations();
  assert(orgs.length > 0, "READ: listOrganizations returns primary tenants", `Count: ${orgs.length}`);

  const testOrgId = orgs[0].id;
  const orgDetail = await OrgService.getOrganization(testOrgId);
  assert(Boolean(orgDetail && orgDetail.id === testOrgId), "READ: getOrganization retrieves primary tenant details");

  // CREATE organization
  const createdOrg = await OrgService.createOrganization("a0000000-0000-0000-0000-000000000001", {
    name: `Apex Education Society ${Date.now().toString().slice(-4)}`,
    slug: `apex-${Date.now().toString().slice(-4)}`,
    organization_type: "SOCIETY",
    subscription_plan: "ENTERPRISE_FLEET",
    city: "Mumbai",
  });
  assert(Boolean(createdOrg && createdOrg.id), "CREATE: createOrganization provisions new primary tenant", `ID: ${createdOrg.id}`);

  // 5-STEP TRANSACTIONAL PROVISION SCHOOL
  const provisionedSchool = await OrgService.provisionSchool(createdOrg.id, "a0000000-0000-0000-0000-000000000001", {
    name: "Apex Model School Bandra",
    slug: `apex-bandra-${Date.now().toString().slice(-4)}`,
    schoolCode: `APX-${Date.now().toString().slice(-3)}`,
    city: "Mumbai",
    currency: "INR",
  });
  assert(Boolean(provisionedSchool && provisionedSchool.id), "CREATE: provisionSchool 5-step transactional provisioning", `School: ${provisionedSchool.name}`);

  // READ organization schools
  const orgSchools = await OrgService.listOrganizationSchools(createdOrg.id);
  assert(orgSchools.some((s) => s.id === provisionedSchool.id), "READ: listOrganizationSchools discovers newly provisioned campus");

  // READ aggregate fleet metrics
  const fleetSummary = await OrgService.getOrganizationMetrics(testOrgId);
  assert(fleetSummary.totalSchools > 0 && fleetSummary.totalStudents > 0, "READ: getOrganizationMetrics computes multi-school roll", `Schools: ${fleetSummary.totalSchools}, Scholars: ${fleetSummary.totalStudents}`);

  // ===========================================================================
  // 4. PORTAL 3: PRINCIPAL DESK CRUD
  // ===========================================================================
  console.log("\n🎓 4. PORTAL 3: PRINCIPAL DESK CRUD");

  // READ approvals queue
  const approvalsQueue = await fetchApprovalsQueue();
  assert(approvalsQueue.length > 0, "READ: fetchApprovalsQueue retrieves warrants pending executive sign-off", `Pending: ${approvalsQueue.length}`);

  // UPDATE approval warrant (APPROVE with cryptographic seal)
  const targetApproval = approvalsQueue[0];
  const approveRes = await updateApprovalStatus(targetApproval.id, "APPROVED");
  assert(approveRes.success && Boolean(approveRes.signatureHash), "UPDATE: updateApprovalStatus signs warrant with cryptographic hash", `Seal: ${approveRes.signatureHash}`);

  // CREATE campus notice
  const newNotice = await createNotice({
    title: `Pre-Board Academic Guidelines ${Date.now().toString().slice(-4)}`,
    content: "All subject heads must seal internal marks by Friday 17:00 IST.",
    audience: "ALL_CAMPUS",
    priority: "ACADEMIC",
  });
  assert(Boolean(newNotice && newNotice.id), "CREATE: createNotice broadcasts executive bulletin", `Notice ID: ${newNotice.id}`);

  // READ notices
  const bulletins = await fetchNoticesBulletins();
  assert(bulletins.length > 0, "READ: fetchNoticesBulletins lists campus circulars", `Count: ${bulletins.length}`);

  // ===========================================================================
  // 5. PORTAL 4: SCHOOL ADMIN / OPERATIONS CRUD
  // ===========================================================================
  console.log("\n📋 5. PORTAL 4: SCHOOL ADMIN / OPERATIONS CRUD");

  const actorId = "b0000000-0000-0000-0000-000000000004";
  const studentPayload = {
    admissionNumber: `ADM-${Date.now().toString().slice(-5)}`,
    fullName: "Devanshi Singhania",
    email: `devanshi-${Date.now()}@agragati.edu`,
    gender: "FEMALE",
    dateOfBirth: "2008-04-12",
  };
  const createdStudent = await StudentService.createStudent(sampleSchoolId, actorId, studentPayload);
  assert(Boolean(createdStudent && createdStudent.id), "CREATE: StudentService.createStudent enrolls new student", `Admission#: ${createdStudent.admission_number}`);

  // READ students
  const studentList = await StudentService.listStudents(sampleSchoolId);
  assert(studentList.length > 0, "READ: StudentService.listStudents returns student master directory", `Total: ${studentList.length}`);

  // UPDATE student
  const updateStudentRes = await StudentService.updateStudent(sampleSchoolId, createdStudent.id, actorId, {
    house: "Ashoka House",
  });
  assert(updateStudentRes.success, "UPDATE: StudentService.updateStudent modifies demographic/contact details");

  // SOFT-DELETE (Archive) student
  const archiveRes = await StudentService.archiveStudent(sampleSchoolId, createdStudent.id, actorId, "Graduated and Transferred");
  assert(archiveRes.success, "DELETE/ARCHIVE: StudentService.archiveStudent performs non-destructive soft-delete");

  // READ classes
  const classes = await fetchClassesSections();
  assert(classes.length > 0, "READ: fetchClassesSections returns academic forms", `Count: ${classes.length}`);

  // ===========================================================================
  // 6. PORTAL 5: PGT FACULTY (TEACHER) SUITE CRUD
  // ===========================================================================
  console.log("\n👩‍🏫 6. PORTAL 5: PGT FACULTY (TEACHER) SUITE CRUD");

  // READ daily agenda & classes
  const teacherAgenda = await fetchTeacherDailyAgenda();
  assert(teacherAgenda.sessions.length > 0, "READ: fetchTeacherDailyAgenda loads current period roster", `Periods: ${teacherAgenda.sessions.length}`);

  const teacherClasses = await fetchTeacherClasses();
  assert(teacherClasses.length > 0, "READ: fetchTeacherClasses returns assigned forms", `Classes: ${teacherClasses.length}`);

  // READ attendance roster & MARK attendance (CREATE/UPDATE)
  const classRoster = await fetchClassAttendanceRoster("class-12a");
  assert(classRoster.length > 0, "READ: fetchClassAttendanceRoster retrieves class roll-call", `Students: ${classRoster.length}`);

  const attSubmission = await submitAttendance({
    classId: "class-12a",
    attendance: classRoster.map((r, idx) => ({
      ...r,
      status: idx === 0 ? "PRESENT" : "PRESENT",
      remarks: "Verified turnstile biometrics",
    })),
  });
  assert(attSubmission.success && attSubmission.hash.startsWith("ROLLCALL-SEALED"), "CREATE/UPDATE: submitAttendance seals biometric roll-call", `Seal: ${attSubmission.hash}`);

  // CREATE homework
  const newHomework = await createHomeworkAssignment({
    title: `Electromagnetism Problem Set #${Date.now().toString().slice(-4)}`,
    className: "Class 12-A",
    form: "Class 12-A",
    subject: "Physics",
    dueDate: "2026-10-15",
    maxMarks: 100,
    description: "Maxwell equations and Lorentz force derivations.",
    rubric: "Calculations 50%, Theory 50%",
  });
  assert(Boolean(newHomework && newHomework.id), "CREATE: createHomeworkAssignment provisions coursework", `ID: ${newHomework.id}`);

  // READ homework list
  const teacherHw = await fetchTeacherHomeworkList();
  assert(teacherHw.length > 0, "READ: fetchTeacherHomeworkList returns coursework items", `Count: ${teacherHw.length}`);

  // READ homework submissions & GRADE submission (UPDATE)
  const submissions = await fetchHomeworkSubmissions(newHomework.id);
  const targetSubId = submissions.length > 0 ? submissions[0].id : "sub-demo-01";
  const gradeRes = await gradeSubmission({
    submissionId: targetSubId,
    score: 95,
    feedback: "Exemplary solution and clear diagrams.",
  });
  assert(gradeRes.success, "UPDATE: gradeSubmission evaluates student work with marks & feedback");

  // READ marks grid & SAVE marks (UPDATE)
  const marksGrid = await fetchMarksEntryGrid("class-12a");
  assert(marksGrid.length > 0, "READ: fetchMarksEntryGrid retrieves student marks matrix", `Students: ${marksGrid.length}`);

  const saveMarksRes = await saveGradebookMarks({
    classId: "class-12a",
    subject: "Physics",
    assessmentName: "Mid-Term Examination",
    marks: [{ studentId: "std-01", score: 96 }],
  });
  assert(saveMarksRes.success && Boolean(saveMarksRes.sealHash), "UPDATE: saveGradebookMarks publishes marks with audit seal", `Seal: ${saveMarksRes.sealHash}`);

  // ===========================================================================
  // 7. PORTAL 6: ACCOUNTS OFFICER (FINANCE) CRUD
  // ===========================================================================
  console.log("\n💰 7. PORTAL 6: ACCOUNTS OFFICER (FINANCE) CRUD");

  // READ dashboard stats
  const finStats = await fetchFinanceDashboardStats();
  assert(finStats.totalInvoiced > 0 || finStats.realizedReceipts > 0, "READ: fetchFinanceDashboardStats computes billing metrics", `Total Invoiced: ${finStats.totalInvoiced}`);

  // CREATE fee structure
  const newFeeStructure = await createFeeStructure({
    name: "Senior Wing Boarding Tuition 2026",
    tierCategory: "SENIOR_BOARDING",
    formTarget: "Class 11 & 12",
    annualFee: 180000,
    termFee: 60000,
  });
  assert(Boolean(newFeeStructure && newFeeStructure.id), "CREATE: createFeeStructure defines new billing tier", `Structure ID: ${newFeeStructure.id}`);

  // READ fee structures
  const feeStructures = await fetchFeeStructures();
  assert(feeStructures.length > 0, "READ: fetchFeeStructures returns fee schedules", `Count: ${feeStructures.length}`);

  // CREATE finance invoice
  const newInvoice = await createFinanceInvoice({
    studentId: "c0000000-0000-0000-0000-000000000008",
    studentName: "Genevieve Laurent",
    amount: 60000,
    termName: "Term 1 Academic Tuition & Boarding",
    status: "PENDING",
  });
  assert(Boolean(newInvoice && newInvoice.id), "CREATE: createFinanceInvoice issues student fee invoice", `Inv#: ${newInvoice.invoiceNumber}`);

  // READ finance invoices
  const finInvoices = await fetchFinanceInvoices();
  assert(finInvoices.length > 0, "READ: fetchFinanceInvoices retrieves billing register", `Count: ${finInvoices.length}`);

  // READ student ledgers
  const ledgers = await fetchStudentLedgers();
  assert(ledgers.length > 0, "READ: fetchStudentLedgers returns scholar ledger balances", `Count: ${ledgers.length}`);

  const sampleLedgerId = ledgers[0].studentId;
  const ledgerDetail = await fetchStudentLedgerDetail(sampleLedgerId);
  assert(ledgerDetail.length > 0, "READ: fetchStudentLedgerDetail returns double-entry ledger transactions", `Entries: ${ledgerDetail.length}`);

  // CREATE/POST ledger transaction
  const postTxRes = await postLedgerTransaction({
    studentId: sampleLedgerId,
    type: "CREDIT",
    amount: 15000,
    category: "SCHOLARSHIP",
    description: "Academic Excellence Merit Scholarship Credit",
  });
  assert(postTxRes.success, "CREATE: postLedgerTransaction posts double-entry transaction to ledger");

  // READ bank reconciliation & RECONCILE (UPDATE)
  const reconFeed = await fetchBankReconciliationFeed();
  assert(reconFeed.length > 0, "READ: fetchBankReconciliationFeed retrieves bank statement feed", `Count: ${reconFeed.length}`);

  const reconRes = await reconcileTransaction({
    transactionId: reconFeed[0].id,
    ledgerEntryId: "tx-demo-01",
    matchStatus: "MATCHED",
  });
  assert(reconRes.success, "UPDATE: reconcileTransaction matches bank stream with internal ledger");

  // ===========================================================================
  // 8. PORTAL 7: PARENT / GUARDIAN PORTAL CRUD
  // ===========================================================================
  console.log("\n👨‍👩‍👧 8. PORTAL 7: PARENT / GUARDIAN PORTAL CRUD");

  // READ enrolled wards
  const wards = await fetchEnrolledWards();
  assert(wards.length > 0, "READ: fetchEnrolledWards returns linked children", `Count: ${wards.length}`);

  const testWardId = wards[0].id;
  const parentDigest = await fetchParentDigest(testWardId);
  assert(Boolean(parentDigest && parentDigest.todaysArrivalStatus), "READ: fetchParentDigest retrieves child daily status", `Status: ${parentDigest.todaysArrivalStatus}`);

  // CREATE/SUBMIT absence excuse
  const excuseRes = await submitAbsenceExcuse({
    wardId: testWardId,
    startDate: "2026-10-20",
    endDate: "2026-10-21",
    reason: "Severe fever and medical bed-rest under doctor advice",
  });
  assert(excuseRes.success, "CREATE: submitAbsenceExcuse files digital excuse note with school");

  // READ ward invoices & PAY invoice (CREATE payment / UPDATE invoice)
  const wardInvoices = await fetchWardInvoices(testWardId);
  assert(wardInvoices.length > 0, "READ: fetchWardInvoices returns child fee invoices", `Count: ${wardInvoices.length}`);

  const payRes = await payInvoice({
    invoiceId: wardInvoices[0].id,
    paymentMethod: "UPI_AUTOPAY",
    transactionReference: `UPI-TEST-${Date.now()}`,
  });
  assert(payRes.success && Boolean(payRes.receiptNumber), "CREATE/UPDATE: payInvoice processes payment & generates digital receipt", `Receipt#: ${payRes.receiptNumber}`);

  // READ ward homework & report cards
  const wardHw = await fetchWardHomework(testWardId);
  assert(wardHw.length > 0, "READ: fetchWardHomework returns child assignments", `Count: ${wardHw.length}`);

  const wardReportCards = await fetchWardReportCards(testWardId);
  assert(wardReportCards.subjects.length > 0, "READ: fetchWardReportCards returns sealed academic grades", `Subjects: ${wardReportCards.subjects.length}`);

  // READ notices & SIGN digital consent (CREATE consent)
  const parentBulletins = await fetchParentBulletins();
  assert(parentBulletins.length > 0, "READ: fetchParentBulletins returns official parent notices", `Count: ${parentBulletins.length}`);

  const signConsentRes = await signNoticeConsent({
    noticeId: parentBulletins[0].id,
    wardId: testWardId,
    digitalSignature: "Aadhaar eSign Verified — Rajesh Sharma",
  });
  assert(signConsentRes.success, "CREATE: signNoticeConsent records verified digital consent signature");

  // ===========================================================================
  // 9. PORTAL 8: STUDENT / SCHOLAR SPACE CRUD
  // ===========================================================================
  console.log("\n🎓 9. PORTAL 8: STUDENT / SCHOLAR SPACE CRUD");

  // READ student profile & schedule
  const studentProf = await fetchStudentProfile();
  assert(Boolean(studentProf && studentProf.name), "READ: fetchStudentProfile retrieves scholar profile", `Scholar: ${studentProf.name}`);

  const schedule = await fetchStudentSchedule();
  assert(schedule.length > 0, "READ: fetchStudentSchedule loads daily timetable periods", `Periods: ${schedule.length}`);

  // READ attendance radar
  const radar = await fetchStudentAttendanceRadar();
  assert(radar.length > 0, "READ: fetchStudentAttendanceRadar returns monthly attendance % and turnstile records");

  // READ homework list & SUBMIT homework solution (CREATE submission)
  const stdHwList = await fetchStudentHomeworkList();
  assert(stdHwList.length > 0, "READ: fetchStudentHomeworkList returns assigned coursework", `Tasks: ${stdHwList.length}`);

  const stdSubRes = await submitHomeworkSolution({
    homeworkId: stdHwList[0].id,
    fileName: "Physics_Quantum_Report_Aarav.pdf",
    notes: "Completed numerical calculations for questions 1 through 10.",
  });
  assert(stdSubRes.success && Boolean(stdSubRes.submissionId), "CREATE: submitHomeworkSolution attaches coursework solution", `SubID: ${stdSubRes.submissionId}`);

  // READ exam results
  const stdResults = await fetchStudentResults();
  assert(stdResults.subjects.length > 0, "READ: fetchStudentResults displays official marks matrix & cumulative GPA", `GPA: ${stdResults.overallGpa}`);

  // CREATE gate pass request
  const gatePassRes = await submitGatePassRequest({
    passType: "ACADEMIC_VISIT",
    destination: "Inter-school Science Olympiad Competition",
    departureTime: "13:30 IST",
    returnTime: "17:00 IST",
    emergencyContact: "+91 98100 12345",
  });
  assert(gatePassRes.success && Boolean(gatePassRes.passId), "CREATE: submitGatePassRequest files secure campus departure request", `PassID: ${gatePassRes.passId}`);

  // ===========================================================================
  // 10. REALTIME NOTIFICATIONS CRUD
  // ===========================================================================
  console.log("\n🔔 10. REALTIME NOTIFICATIONS CRUD");
  const notifications = await fetchNotifications("b0000000-0000-0000-0000-000000000001", "SUPER_ADMIN");
  assert(notifications.length > 0, "READ: fetchNotifications returns system alerts across portals", `Count: ${notifications.length}`);

  // ===========================================================================
  // SUMMARY
  // ===========================================================================
  console.log("\n================================================================================");
  console.log(`📊 AUDIT SUMMARY: ${passedCount}/${passedCount + failedCount} Operations PASSED (${Math.round((passedCount / (passedCount + failedCount)) * 100)}%)`);
  console.log("================================================================================\n");

  if (failedCount > 0) {
    console.error(`💥 ${failedCount} operations failed. Please review errors above.`);
    process.exit(1);
  } else {
    console.log("🎉 ALL DEPENDENCIES AND CRUD OPERATIONS VERIFIED ACROSS ALL 8 PORTALS!");
  }
}

runAllChecks().catch((err) => {
  console.error("FATAL ERROR in runAllChecks:", err);
  process.exit(1);
});
