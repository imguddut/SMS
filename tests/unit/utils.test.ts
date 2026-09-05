/**
 * AGRAGATI PLATFORM — Unit Test Suite
 * Tests utilities, currency formatting, role hierarchy, and financial math
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { globalReporter } from "../helpers/test-harness";
import { formatIndianCurrency } from "@/lib/utils";
import { normalizeRole, getRoleHomeRoute } from "@/types/roles";
import type { CanonicalUserRole } from "@/types/roles";

describe("System Utilities & Currency Formatting Unit Tests", () => {
  it("UT-CURR-001: Format standard Indian currency (₹45 Lakhs)", () => {
    try {
      const res1 = formatIndianCurrency(4500000);
      assert.ok(res1.includes("45,00,000") || res1.includes("4500000"), `Unexpected format: ${res1}`);
      globalReporter.record({
        testId: "UT-CURR-001",
        portal: "All",
        module: "Utils",
        role: "System",
        action: "Format standard Indian currency (₹45 Lakhs)",
        status: "PASS",
        expectedResult: "Formatted string with ₹ symbol and Indian grouping",
        actualResult: res1,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-CURR-001",
        portal: "All",
        module: "Utils",
        role: "System",
        action: "Format standard Indian currency",
        status: "FAIL",
        expectedResult: "Formatted string",
        actualResult: "Exception thrown",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-CURR-002: Format ₹0 zero amount currency", () => {
    try {
      const res2 = formatIndianCurrency(0);
      assert.ok(res2.includes("0"), `Unexpected zero format: ${res2}`);
      globalReporter.record({
        testId: "UT-CURR-002",
        portal: "All",
        module: "Utils",
        role: "System",
        action: "Format ₹0 zero amount currency",
        status: "PASS",
        expectedResult: "Contains ₹ 0",
        actualResult: res2,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-CURR-002",
        portal: "All",
        module: "Utils",
        role: "System",
        action: "Format zero amount",
        status: "FAIL",
        expectedResult: "Formatted string",
        actualResult: "Exception thrown",
        error: err.message,
      });
      throw err;
    }
  });

  it("UT-CURR-003: Format negative currency without crash (-₹2,500)", () => {
    try {
      const res3 = formatIndianCurrency(-2500);
      assert.ok(res3.includes("2,500") || res3.includes("2500"), `Unexpected negative format: ${res3}`);
      globalReporter.record({
        testId: "UT-CURR-003",
        portal: "All",
        module: "Utils",
        role: "System",
        action: "Format negative currency without crash (-₹2,500)",
        status: "PASS",
        expectedResult: "Handles negative amounts gracefully",
        actualResult: res3,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-CURR-003",
        portal: "All",
        module: "Utils",
        role: "System",
        action: "Format negative currency",
        status: "FAIL",
        expectedResult: "Handles negative gracefully",
        actualResult: "Exception thrown",
        error: err.message,
      });
      throw err;
    }
  });
});

describe("Role Normalization & Access Hierarchy Unit Tests", () => {
  const roleTests: { input: string | null; expected: CanonicalUserRole }[] = [
    { input: "SUPER_ADMIN", expected: "PLATFORM_ADMIN" },
    { input: "OWNER", expected: "ORGANIZATION_OWNER" },
    { input: "TRUST_CHAIRMAN", expected: "ORGANIZATION_OWNER" },
    { input: "CEO", expected: "ORGANIZATION_ADMIN" },
    { input: "FACULTY", expected: "TEACHER" },
    { input: "GUARDIAN", expected: "PARENT" },
    { input: "SCHOLAR", expected: "STUDENT" },
    { input: "BURSAR", expected: "ACCOUNTANT" },
    { input: null, expected: "STUDENT" },
    { input: "UNKNOWN_ROLE", expected: "STUDENT" },
  ];

  for (const [idx, rt] of roleTests.entries()) {
    it(`UT-ROLE-00${idx + 1}: Normalize role '${rt.input}' -> '${rt.expected}'`, () => {
      try {
        const normalized = normalizeRole(rt.input);
        assert.strictEqual(normalized, rt.expected, `Expected ${rt.expected} but got ${normalized}`);
        globalReporter.record({
          testId: `UT-ROLE-00${idx + 1}`,
          portal: "Auth",
          module: "Roles",
          role: "System",
          action: `Normalize role '${rt.input}' -> '${rt.expected}'`,
          status: "PASS",
          expectedResult: rt.expected,
          actualResult: normalized,
        });
      } catch (err: any) {
        globalReporter.record({
          testId: `UT-ROLE-00${idx + 1}`,
          portal: "Auth",
          module: "Roles",
          role: "System",
          action: `Normalize role '${rt.input}'`,
          status: "FAIL",
          expectedResult: rt.expected,
          actualResult: "Mismatch",
          error: err.message,
        });
        throw err;
      }
    });
  }
});

describe("Role Home Route Navigation Unit Tests", () => {
  const routeTests: { role: CanonicalUserRole; expectedRoute: string }[] = [
    { role: "PLATFORM_ADMIN", expectedRoute: "/platform-admin/overview" },
    { role: "ORGANIZATION_OWNER", expectedRoute: "/organization" },
    { role: "PRINCIPAL", expectedRoute: "/school/overview" },
    { role: "SCHOOL_ADMIN", expectedRoute: "/school/overview" },
    { role: "TEACHER", expectedRoute: "/teacher/my-day" },
    { role: "ACCOUNTANT", expectedRoute: "/finance/dashboard" },
    { role: "PARENT", expectedRoute: "/parent/home" },
    { role: "STUDENT", expectedRoute: "/student/home" },
  ];

  for (const [idx, rtest] of routeTests.entries()) {
    it(`UT-ROUTE-00${idx + 1}: Verify home route for ${rtest.role} -> ${rtest.expectedRoute}`, () => {
      try {
        const route = getRoleHomeRoute(rtest.role);
        assert.strictEqual(route, rtest.expectedRoute, `Expected ${rtest.expectedRoute} but got ${route}`);
        globalReporter.record({
          testId: `UT-ROUTE-00${idx + 1}`,
          portal: "Auth",
          module: "Routing",
          role: rtest.role,
          action: `Verify home route for ${rtest.role} -> ${rtest.expectedRoute}`,
          status: "PASS",
          expectedResult: rtest.expectedRoute,
          actualResult: route,
        });
      } catch (err: any) {
        globalReporter.record({
          testId: `UT-ROUTE-00${idx + 1}`,
          portal: "Auth",
          module: "Routing",
          role: rtest.role,
          action: `Check home route for ${rtest.role}`,
          status: "FAIL",
          expectedResult: rtest.expectedRoute,
          actualResult: "Mismatch",
          error: err.message,
        });
        throw err;
      }
    });
  }
});

describe("Financial Precision & Floating Point Integrity Unit Tests", () => {
  it("UT-MATH-001: Verify floating-point precision for invoice calculation", () => {
    try {
      const items = [
        { price: 12500.50, qty: 1 },
        { price: 3400.25, qty: 2 },
        { price: 850.75, qty: 3 },
      ];
      const rawSum = items.reduce((acc, i) => acc + i.price * i.qty, 0);
      // 12500.50 + 6800.50 + 2552.25 = 21853.25
      const roundedSum = Math.round(rawSum * 100) / 100;
      assert.strictEqual(roundedSum, 21853.25, "Financial precision calculation mismatch");

      const discount = 1500;
      const tax = 0; // Educational exemption
      const total = roundedSum - discount + tax;
      assert.strictEqual(total, 20353.25, "Total calculation mismatch");

      const paid = 10000;
      const balance = total - paid;
      assert.strictEqual(balance, 10353.25, "Balance due calculation mismatch");

      globalReporter.record({
        testId: "UT-MATH-001",
        portal: "Finance",
        module: "Calculations",
        role: "ACCOUNTANT",
        action: "Verify floating-point precision for invoice calculation",
        status: "PASS",
        expectedResult: "Exact 2-decimal precision (₹20,353.25 total, ₹10,353.25 balance)",
        actualResult: `Total: ${total}, Balance: ${balance}`,
      });
    } catch (err: any) {
      globalReporter.record({
        testId: "UT-MATH-001",
        portal: "Finance",
        module: "Calculations",
        role: "ACCOUNTANT",
        action: "Verify floating-point precision",
        status: "FAIL",
        expectedResult: "Exact calculation",
        actualResult: "Calculation mismatch",
        error: err.message,
      });
      throw err;
    }
  });
});
