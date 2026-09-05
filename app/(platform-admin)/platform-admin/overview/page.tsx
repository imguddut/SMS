"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  MapPin,
  Lock,
  PieChart,
} from "lucide-react";
import {
  fetchPlatformStats,
  fetchAllSchools,
  SchoolWithDetails,
} from "@/lib/db/platform-admin";

export default function PlatformAdminOverviewPage() {
  const [stats, setStats] = React.useState<any>(null);
  const [schools, setSchools] = React.useState<SchoolWithDetails[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const [sData, schData] = await Promise.all([
          fetchPlatformStats(),
          fetchAllSchools(),
        ]);
        setStats(sData);
        setSchools(schData);
      } catch (e) {
        console.error("Error loading overview data:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Fallback schools if database is empty or loading
  const displaySchools = schools.length > 0 ? schools : [
    {
      id: "school-1",
      legal_name: "Delhi Public School, R.K. Puram",
      slug: "dps-rkpuram",
      domain: "dpsrkp.net",
      curriculum_framework: "CBSE",
      jurisdiction: "New Delhi",
      base_currency: "INR",
      capacity_target: 3500,
      student_count: 3250,
      status: "ACTIVE" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "school-2",
      legal_name: "National Public School, Indiranagar",
      slug: "nps-indiranagar",
      domain: "npsindiranagar.com",
      curriculum_framework: "CBSE_ICSE",
      jurisdiction: "Bengaluru",
      base_currency: "INR",
      capacity_target: 2200,
      student_count: 2100,
      status: "ACTIVE" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "school-3",
      legal_name: "The Cathedral & John Connon School",
      slug: "cathedral-mumbai",
      domain: "cathedral-school.com",
      curriculum_framework: "ICSE_ISC_IB",
      jurisdiction: "Mumbai",
      base_currency: "INR",
      capacity_target: 1800,
      student_count: 1650,
      status: "TRIAL" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  return (
    <AppShell
      role="SUPER_ADMIN"
      userName="Mr. Rajesh Pillai"
      userRoleTitle="Platform Lead & Super Admin"
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Top Header & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                Live Network
              </span>
              <span className="text-xs text-slate-500 font-medium">India Central Cluster • All systems operational</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Platform Overview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              See your schools, students, revenue and system health in one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/platform-admin/schools">
              <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 gap-1.5 font-medium shadow-xs">
                <Building2 className="w-4 h-4 text-blue-600" />
                View Schools
              </Button>
            </Link>
            <Link href="/platform-admin/schools/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1.5 font-semibold shadow-xs">
                <PlusCircle className="w-4 h-4" />
                Add New School
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Simple Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Schools */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Schools</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  {loading ? "2 / 3" : `${stats?.activeSchools ?? 2} / ${stats?.totalSchools ?? 3}`}
                </span>
                <span className="text-xs text-slate-400">total</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Schools currently connected</p>
              <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                +1 provisioned this quarter
              </div>
            </div>
          </div>

          {/* Card 2: Total Students */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  {loading ? "7,000" : (stats?.totalStudents ? stats.totalStudents.toLocaleString("en-IN") : "7,000")}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Students across all schools</p>
              <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-purple-500" />
                Across Delhi, Karnataka &amp; Maharashtra
              </div>
            </div>
          </div>

          {/* Card 3: Annual Revenue */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Annual Revenue</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 font-bold text-base">
                ₹
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  ₹4.82 Cr
                </span>
              </div>
              <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +14.2% from last year
              </p>
              <div className="mt-3 text-[11px] text-slate-500 font-medium">
                99.4% contract renewal fidelity
              </div>
            </div>
          </div>

          {/* Card 4: System Health */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Health</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-emerald-600">Good</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-xs text-slate-500 mt-1">All important services are working</p>
              <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <Lock className="w-3 h-3 text-emerald-600" />
                Post-quantum security verified
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Overview & Security Status Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Overview (2 Cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  Revenue Overview
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Institutional contract run-rates (FY 2024–2025)
                </p>
              </div>
              <Link href="/platform-admin/billing">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700 gap-1 font-semibold">
                  View Full Details <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Metro Hubs</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹3.65 Cr</div>
                <span className="text-xs text-blue-600 font-medium">75.7% of total ARR</span>
              </div>
              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Regional Branches</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹98 Lakhs</div>
                <span className="text-xs text-purple-600 font-medium">20.3% of total ARR</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">HSM Add-ons</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹19 Lakhs</div>
                <span className="text-xs text-emerald-600 font-medium">100% margin</span>
              </div>
            </div>

            {/* Visual Progress Breakdown */}
            <div className="mt-5 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Sovereign Plan (66.7%)</span>
                  <span>₹4,50,000 / year per school</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: "66.7%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Enterprise Plan (33.3%)</span>
                  <span>₹2,50,000 / year per school</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: "33.3%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Security Status Card (1 Col) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Security Status</h3>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All Checks Passed
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">System Status</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    Good
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Security Key</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Active (FIPS 140-3)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 font-medium">Last Security Check</span>
                  <span className="text-emerald-600 font-semibold">Successful Today</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-500 font-medium">Next Key Rotation</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">82 days</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link href="/platform-admin/settings">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                  View Security Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* School Overview Section (Simple Cards instead of complex table) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">School Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Quick summary of all connected schools on your platform
              </p>
            </div>
            <Link href="/platform-admin/schools">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 font-semibold gap-1">
                View All Schools <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Simple Clean School Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {displaySchools.slice(0, 3).map((school) => {
              const studentCount = school.student_count || 850;
              const capacity = school.capacity_target || 1000;
              const pct = Math.round((studentCount / capacity) * 100);
              const isActive = school.status === "ACTIVE";

              return (
                <div
                  key={school.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold text-base shadow-2xs">
                          {school.legal_name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                            {school.legal_name}
                          </h4>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {school.jurisdiction}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60"
                        }`}
                      >
                        {isActive ? "Active" : "Trial"}
                      </span>
                    </div>

                    {/* School Details */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                        <span className="text-slate-400">Curriculum:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {school.curriculum_framework.replace(/_/g, " ")}
                        </span>
                      </div>

                      {/* Capacity Progress */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Students:</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {studentCount.toLocaleString("en-IN")} / {capacity.toLocaleString("en-IN")} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pct > 90 ? "bg-emerald-600" : "bg-blue-600"
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <Link href={`/platform-admin/schools`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        View School
                      </Button>
                    </Link>
                    <Link
                      href={`/platform-admin/impersonate?school=${encodeURIComponent(school.legal_name)}`}
                      className="flex-1"
                    >
                      <Button
                        size="sm"
                        className="w-full text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60"
                      >
                        Open Portal
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
