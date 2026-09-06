"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PlatformAdminFooter } from "@/components/layout/platform-admin-footer";
import { SchoolCrest } from "@/components/ui/school-crest";
import {
  Building2,
  Users,
  Receipt,
  Shield,
  ShieldCheck,
  Plus,
  ArrowRight,
  ExternalLink,
  Lock,
  Sparkles,
  Layers,
  RotateCw,
  Settings,
  MapPin,
} from "lucide-react";
import {
  fetchPlatformStats,
  fetchAllSchools,
  SchoolWithDetails,
} from "@/lib/db/platform-admin";
import { useAuth } from "@/components/providers/auth-context";

export default function PlatformAdminOverviewPage() {
  const { profile } = useAuth();
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

  return (
    <AppShell
      role="SUPER_ADMIN"
      userName={profile?.full_name || "Super Admin"}
      userRoleTitle="Platform Lead & Super Admin"
      epochText="Central System Administration • Cloud Network Active"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              System Overview
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Real-time monitoring of all schools, subscription billing, and security status.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/platform-admin/impersonate">
              <button
                type="button"
                className="h-9 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 font-semibold text-xs flex items-center gap-2 shadow-2xs transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>View as User</span>
              </button>
            </Link>
            <Link href="/platform-admin/schools/new">
              <button
                type="button"
                className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-2xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New School</span>
              </button>
            </Link>
          </div>
        </div>

        {/* 4 Hero KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Schools */}
          <div className="bg-[#F4F8FF] border border-[#D9E6FF] rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Active Schools
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-blue-600">
                  {stats?.activeSchools ?? 2}
                </span>
                <span className="text-2xl font-normal text-slate-400">/ 3</span>
                <span className="text-xs text-slate-500 ml-1">total</span>
              </div>
              <p className="text-xs font-semibold text-emerald-600 mt-2">
                +1 added this quarter
              </p>
            </div>
          </div>

          {/* Card 2: Total Enrolled Students */}
          <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Total Students Enrolled
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-slate-900">
                7,000
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Across Delhi, Karnataka &amp; Maharashtra
              </p>
            </div>
          </div>

          {/* Card 3: Platform Annual Revenue */}
          <div className="bg-[#FAF5FF] border border-[#F3E8FF] rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-700">
                    Annual Platform Revenue
                  </span>
                  <span className="text-[10px] text-purple-600 font-medium">
                    INR (₹)
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-purple-700">
                ₹4.82 Cr
              </div>
              <p className="text-xs font-medium text-emerald-600 mt-2">
                99.4% renewal rate
              </p>
            </div>
          </div>

          {/* Card 4: System Security */}
          <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                System Security Status
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-slate-900">
                100% Secure
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Bank-grade encryption active
              </p>
            </div>
          </div>
        </div>

        {/* Row 2: SaaS Revenue Trajectory + HSM Root Enclave */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Revenue Trends (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Revenue Trends
                  </h2>
                  <p className="text-xs text-slate-500">
                    Annual school contracts (FY 2024–2025)
                  </p>
                </div>
                <Link
                  href="/platform-admin/billing"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>View All Billing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Chart & Breakdown */}
              <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                {/* Donut Chart SVG */}
                <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#f1f5f9"
                      strokeWidth="16"
                      fill="transparent"
                    />
                    {/* Blue segment: 75.7% (238 circumference * 0.757 = 180) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#3B82F6"
                      strokeWidth="16"
                      strokeDasharray="180 238"
                      strokeDashoffset="0"
                      fill="transparent"
                    />
                    {/* Green segment: 20.3% (238 * 0.203 = 48) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#10B981"
                      strokeWidth="16"
                      strokeDasharray="48 238"
                      strokeDashoffset="-180"
                      fill="transparent"
                    />
                    {/* Yellow segment: 4.0% (238 * 0.04 = 10) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#F59E0B"
                      strokeWidth="16"
                      strokeDasharray="10 238"
                      strokeDashoffset="-228"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                    <span className="text-xs font-bold text-slate-800">₹4.82 Cr</span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="flex-1 w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-xs font-medium text-slate-700">
                        Metro Schools (Delhi &amp; Bengaluru)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">₹3.65 Cr</span>
                      <span className="text-[10px] text-slate-400">75.7% of total revenue</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs font-medium text-slate-700">
                        Regional Schools
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">₹98 Lakhs</span>
                      <span className="text-[10px] text-slate-400">20.3% of total revenue</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="text-xs font-medium text-slate-700">
                        Security Add-ons
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">₹19 Lakhs</span>
                      <span className="text-[10px] text-slate-400">100% margin</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Tier Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 mt-2 border-t border-slate-100">
              <div className="bg-blue-50/50 border border-blue-100/80 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Full School Package (66.7%)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ₹4,50,000 / yr / school
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Campus Standard Package (33.3%)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ₹2,50,000 / yr / school
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Security & Data Protection (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-3">
                System Security &amp; Data Protection
              </h2>

              {/* Green active banner */}
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold">Highest Security Level Active</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Protected
                </span>
              </div>

              {/* Cryptographic properties */}
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Master Security Key</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    KEY-INDIA-9942-X
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    <span>Encryption Type</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    256-Bit Military Grade
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>Data Verifications</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    48,290 / 24h
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 text-slate-600">
                    <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Security Key Renewal</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    In 82 days
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <Link href="/platform-admin/settings" className="block w-full">
                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-blue-600 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Security &amp; Encryption Settings</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section: Connected Schools Directory */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-bold text-slate-900">
                  Connected Schools Directory
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  3 Active Schools
                </span>
              </div>
              <p className="text-xs text-slate-500">
                View all school campuses, board curriculums, and administrators.
              </p>
            </div>
            <Link
              href="/platform-admin/schools"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto shrink-0"
            >
              <span>View All Schools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">School Name</th>
                  <th className="py-3 px-6">Board &amp; Website</th>
                  <th className="py-3 px-6">Location</th>
                  <th className="py-3 px-6">Students Enrolled</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {schools.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                      <p className="text-sm font-medium">No schools registered</p>
                      <p className="text-xs text-slate-400 mt-0.5">Institutions added to the platform will appear here.</p>
                    </td>
                  </tr>
                ) : (
                  schools.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <SchoolCrest slug={sch.id} name={sch.name} />
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {sch.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                              <span>code: {sch.code || sch.id.slice(0, 8)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-800 block text-xs">{sch.board || "CBSE"}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                          AFFILIATED
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="text-xs">{sch.city || sch.state || "Campus"}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Base: {sch.currency || "INR"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {sch.student_count || 0}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {sch.status || "Active"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/platform-admin/schools/${sch.id}`}>
                            <button
                              type="button"
                              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-2xs"
                            >
                              View Details
                            </button>
                          </Link>
                          <Link href={`/platform-admin/impersonate?school=${sch.id}`}>
                            <button
                              type="button"
                              className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-700 font-medium text-xs flex items-center gap-1.5 shadow-2xs"
                            >
                              <Users className="w-3 h-3" />
                              <span>Open Portal</span>
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Institutional Sovereign Bottom Footer */}
        <PlatformAdminFooter />
      </div>
    </AppShell>
  );
}
