/**
 * AGRAGATI PLATFORM — Automated Test Harness & Assertion Engine
 * Powered by Node 22 native test runner and assertion library
 */

import assert from "node:assert";

export interface TestCaseResult {
  testId: string;
  portal: string;
  module: string;
  role: string;
  action: string;
  status: "PASS" | "FAIL" | "BLOCKED";
  expectedResult: string;
  actualResult: string;
  databaseExpectation?: string;
  rlsExpectation?: string;
  securityExpectation?: string;
  error?: string;
}

export class TestReportCollector {
  private results: TestCaseResult[] = [];
  private startTime = Date.now();

  record(res: TestCaseResult) {
    this.results.push(res);
    const icon = res.status === "PASS" ? "✅ PASS" : res.status === "FAIL" ? "❌ FAIL" : "⚠️ BLOCKED";
    console.log(`[${icon}] ${res.testId} (${res.portal} / ${res.module} / ${res.role}) — ${res.action}`);
    if (res.status === "FAIL" && res.error) {
      console.error(`       Error: ${res.error}`);
    }
  }

  getResults() {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.status === "PASS").length;
    const failed = this.results.filter((r) => r.status === "FAIL").length;
    const blocked = this.results.filter((r) => r.status === "BLOCKED").length;
    const durationMs = Date.now() - this.startTime;

    return {
      total,
      passed,
      failed,
      blocked,
      durationMs,
      passRatePercent: total > 0 ? ((passed / total) * 100).toFixed(1) : "0.0",
    };
  }
}

// Global reporter instance for test suites
export const globalReporter = new TestReportCollector();

// Mock Test Tenant Factory
export function createMockTestTenants() {
  return {
    orgA: {
      id: "e0000000-0000-0000-0000-000000000001",
      name: "King's Educational Trust",
      schools: [
        { id: "11111111-1111-1111-1111-111111111111", name: "The King's College & Academy (Geneva)" },
        { id: "11111111-1111-1111-1111-111111111112", name: "The King's Academy (New Delhi)" },
      ],
    },
    orgB: {
      id: "e0000000-0000-0000-0000-000000000002",
      name: "ABC Education Society",
      schools: [
        { id: "22222222-2222-2222-2222-222222222222", name: "ABC Senior Public School" },
      ],
    },
  };
}

export const mockTenants = createMockTestTenants();
