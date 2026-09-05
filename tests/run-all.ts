/**
 * AGRAGATI SCHOOL OS — MASTER TEST RUNNER
 * Powered by Node 22 Native Test Runner
 * 
 * Executes all 5 test suites:
 * 1. Unit Tests (Utils, Roles, Financial Precision)
 * 2. Portal Module Tests (All 7 Portals CRUD & Workflows)
 * 3. Cross-Portal Integration Lifecycles (Student, Fee, Attendance, Homework)
 * 4. Security & Isolation Tests (RLS Multi-Tenancy, IDOR, Key Hygiene, Sanitization)
 * 5. E2E Route Protection & Zero-Trust Navigation Tests (Public, Protected, RBAC Bounces)
 */

import { run } from "node:test";
import { spec } from "node:test/reporters";
import path from "node:path";

console.log("================================================================================");
console.log("   AGRAGATI SCHOOL OS — ENTERPRISE MULTI-PORTAL MASTER TEST RUNNER              ");
console.log("================================================================================\n");

const testFiles = [
  path.join(process.cwd(), "tests/unit/utils.test.ts"),
  path.join(process.cwd(), "tests/modules/portal-modules.test.ts"),
  path.join(process.cwd(), "tests/integration/cross-portal-lifecycles.test.ts"),
  path.join(process.cwd(), "tests/security/security-and-isolation.test.ts"),
  path.join(process.cwd(), "tests/e2e/routes-and-navigation.test.ts"),
];

const testStream = run({ files: testFiles });

testStream.compose(spec).pipe(process.stdout);

testStream.on("test:fail", () => {
  process.exitCode = 1;
});
