/**
 * AGRAGATI SCHOOL OS — E2E ROUTE PROTECTION & NAVIGATION TEST SUITE
 * 
 * Verifies:
 * 1. Public Entry Points: /, /login, /forgot-password, /reset-password respond with HTTP 200.
 * 2. Route Protection: Unauthenticated requests to protected portal routes return HTTP 307 Redirect to /login.
 * 3. RBAC Route Scoping: Authenticated users can access routes corresponding to their authorized role.
 * 4. Cross-Portal Privilege Escalation Prevention: Access to unauthorized portal paths is intercepted and redirected.
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { globalReporter } from "../helpers/test-harness";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

describe("E2E Route Protection & Navigation", () => {
  // =========================================================================
  // 1. PUBLIC GATEWAY & AUTHENTICATION ROUTES
  // =========================================================================
  it("NAV-PUB-001: Public routes are accessible without authentication credentials", async () => {
    const publicRoutes = ["/", "/login", "/forgot-password", "/reset-password"];

    for (const route of publicRoutes) {
      try {
        const response = await fetch(`${BASE_URL}${route}`, { redirect: "manual" });
        assert.strictEqual(
          response.status,
          200,
          `Public route ${route} must respond with HTTP 200 (Got ${response.status})`
        );

        globalReporter.record({
          testId: `NAV-PUB-${route.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "ROOT"}`,
          portal: "Public Gateway",
          module: "Authentication",
          role: "ANONYMOUS",
          action: `Access public route: ${route}`,
          status: "PASS",
          expectedResult: "HTTP 200 OK",
          actualResult: `HTTP ${response.status}`,
          rlsExpectation: "Public route bypassed by auth middleware",
        });
      } catch (err: any) {
        globalReporter.record({
          testId: `NAV-PUB-${route.replace(/[^a-zA-Z0-9]/g, "") || "ROOT"}`,
          portal: "Public Gateway",
          module: "Authentication",
          role: "ANONYMOUS",
          action: `Access public route: ${route}`,
          status: "FAIL",
          expectedResult: "HTTP 200 OK",
          actualResult: "Failed",
          error: err.message,
        });
        throw err;
      }
    }
  });

  // =========================================================================
  // 2. UNAUTHENTICATED REDIRECTS ON PROTECTED PORTALS (Zero Trust)
  // =========================================================================
  it("NAV-PROT-001: Unauthenticated requests to protected portal routes return HTTP 307 to /login", async () => {
    const protectedPortalSamples = [
      { portal: "Platform Admin", path: "/platform-admin/overview" },
      { portal: "Organization Owner", path: "/organization/kpis" },
      { portal: "Principal", path: "/school/overview" },
      { portal: "Teacher", path: "/teacher/attendance" },
      { portal: "Finance", path: "/finance/dashboard" },
      { portal: "Parent", path: "/parent/home" },
      { portal: "Student", path: "/student/home" },
    ];

    for (const sample of protectedPortalSamples) {
      try {
        const res = await fetch(`${BASE_URL}${sample.path}`, { redirect: "manual" });
        assert.strictEqual(
          res.status,
          307,
          `Protected path ${sample.path} must return HTTP 307 Temporary Redirect`
        );

        const location = res.headers.get("location") || "";
        assert.ok(
          location.includes("/login"),
          `Redirect target must be /login, received: ${location}`
        );

        globalReporter.record({
          testId: `NAV-PROT-${sample.portal.toUpperCase().replace(/\s+/g, "_")}`,
          portal: sample.portal,
          module: "Route Guard",
          role: "ANONYMOUS",
          action: `Attempt unauthorized access to ${sample.path}`,
          status: "PASS",
          expectedResult: "HTTP 307 Redirect to /login",
          actualResult: `HTTP ${res.status} -> ${location}`,
          rlsExpectation: "Next.js middleware rejects missing session cookie",
        });
      } catch (err: any) {
        globalReporter.record({
          testId: `NAV-PROT-${sample.portal.toUpperCase().replace(/\s+/g, "_")}`,
          portal: sample.portal,
          module: "Route Guard",
          role: "ANONYMOUS",
          action: `Access ${sample.path}`,
          status: "FAIL",
          expectedResult: "HTTP 307",
          actualResult: "Failed",
          error: err.message,
        });
        throw err;
      }
    }
  });

  // =========================================================================
  // 3. AUTHENTICATED ACCESS FOR AUTHORIZED ROLES
  // =========================================================================
  it("NAV-AUTH-001: Authenticated session cookies grant access to permitted portal routes", async () => {
    const roleAccessMatrix = [
      { role: "ORGANIZATION_OWNER", path: "/organization/kpis", portal: "Organization Owner" },
      { role: "PRINCIPAL", path: "/school/overview", portal: "Principal" },
      { role: "TEACHER", path: "/teacher/attendance", portal: "Teacher" },
      { role: "ACCOUNTANT", path: "/finance/dashboard", portal: "Finance" },
      { role: "PARENT", path: "/parent/home", portal: "Parent" },
      { role: "STUDENT", path: "/student/home", portal: "Student" },
    ];

    for (const item of roleAccessMatrix) {
      try {
        const cookieHeader = `agragati_session=mock-valid-session; agragati_role=${item.role}`;
        const res = await fetch(`${BASE_URL}${item.path}`, {
          headers: { Cookie: cookieHeader },
          redirect: "manual",
        });

        assert.strictEqual(
          res.status,
          200,
          `Authorized role ${item.role} accessing ${item.path} must return HTTP 200 (Got ${res.status})`
        );

        globalReporter.record({
          testId: `NAV-AUTH-${item.role}`,
          portal: item.portal,
          module: "RBAC Session Guard",
          role: item.role,
          action: `Authenticate and request ${item.path}`,
          status: "PASS",
          expectedResult: "HTTP 200 OK",
          actualResult: `HTTP ${res.status} OK`,
          rlsExpectation: "Role matches allowed prefix mapping",
        });
      } catch (err: any) {
        globalReporter.record({
          testId: `NAV-AUTH-${item.role}`,
          portal: item.portal,
          module: "RBAC Session Guard",
          role: item.role,
          action: `Access ${item.path}`,
          status: "FAIL",
          expectedResult: "HTTP 200",
          actualResult: "Failed",
          error: err.message,
        });
        throw err;
      }
    }
  });

  // =========================================================================
  // 4. CROSS-ROLE PRIVILEGE ESCALATION PREVENTION
  // =========================================================================
  it("NAV-ESCALATE-001: Cross-portal access attempts are intercepted and bounced to role home", async () => {
    const unauthorizedCrossAccessCases = [
      // Student attempting to access Principal approvals
      { role: "STUDENT", attemptedPath: "/school/approvals", expectedBounce: "/student/home" },
      // Parent attempting to access Teacher grading
      { role: "PARENT", attemptedPath: "/teacher/marks", expectedBounce: "/parent/home" },
      // Teacher attempting to access Organization billing/kpis
      { role: "TEACHER", attemptedPath: "/organization/kpis", expectedBounce: "/teacher/my-day" },
    ];

    for (const testCase of unauthorizedCrossAccessCases) {
      try {
        const cookieHeader = `agragati_session=mock-valid-session; agragati_role=${testCase.role}`;
        const res = await fetch(`${BASE_URL}${testCase.attemptedPath}`, {
          headers: { Cookie: cookieHeader },
          redirect: "manual",
        });

        assert.strictEqual(
          res.status,
          307,
          `Unauthorized path ${testCase.attemptedPath} for ${testCase.role} must return HTTP 307 Redirect`
        );

        const targetLocation = res.headers.get("location") || "";
        assert.ok(
          targetLocation.includes(testCase.expectedBounce),
          `Escalation attempt must redirect to role home ${testCase.expectedBounce}, got: ${targetLocation}`
        );

        globalReporter.record({
          testId: `NAV-ESCALATE-${testCase.role}`,
          portal: "Cross-Portal",
          module: "Privilege Escalation Guard",
          role: testCase.role,
          action: `Attempt access to ${testCase.attemptedPath}`,
          status: "PASS",
          expectedResult: `Intercepted -> Redirected to ${testCase.expectedBounce}`,
          actualResult: `HTTP 307 -> ${targetLocation}`,
          rlsExpectation: "Zero trust: Cross-portal privilege escalation blocked",
        });
      } catch (err: any) {
        globalReporter.record({
          testId: `NAV-ESCALATE-${testCase.role}`,
          portal: "Cross-Portal",
          module: "Privilege Escalation Guard",
          role: testCase.role,
          action: `Attempt ${testCase.attemptedPath}`,
          status: "FAIL",
          expectedResult: "Bounced",
          actualResult: "Failed",
          error: err.message,
        });
        throw err;
      }
    }
  });
});
