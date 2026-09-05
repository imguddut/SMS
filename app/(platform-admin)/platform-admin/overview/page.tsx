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

  return (
    <AppShell
      role="SUPER_ADMIN"
      userName="Mr. Rajesh Pillai"
      userRoleTitle="Platform Lead & Super Admin"
      epochText="Multi-Tenant Sovereign Root • India Central Cluster Online"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Platform Overview
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Real-time monitoring of school fleet, SaaS contracts and HSM enclave health across MeitY-empanelled clusters.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/platform-admin/impersonate">
              <button
                type="button"
                className="h-9 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 font-semibold text-xs flex items-center gap-2 shadow-2xs transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Impersonate Session</span>
              </button>
            </Link>
            <Link href="/platform-admin/schools/new">
              <button
                type="button"
                className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-2xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Provision School</span>
              </button>
            </Link>
          </div>
        </div>

        {/* 4 Hero KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active School Nodes */}
          <div className="bg-[#F4F8FF] border border-[#D9E6FF] rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Active School Nodes
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
                +1 provisioned this quarter
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
                Total Enrolled Students
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

          {/* Card 3: Platform ARR */}
          <div className="bg-[#FAF5FF] border border-[#F3E8FF] rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-700">
                    Platform ARR (Run-rate)
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
                99.4% contract renewal fidelity
              </p>
            </div>
          </div>

          {/* Card 4: HSM Enclave State */}
          <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                HSM Enclave State
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-slate-900">
                Nominal
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Dilithium-5 post-quantum verified
              </p>
            </div>
          </div>
        </div>

        {/* Row 2: SaaS Revenue Trajectory + HSM Root Enclave */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: SaaS Revenue Trajectory (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    SaaS Revenue Trajectory
                  </h2>
                  <p className="text-xs text-slate-500">
                    Institutional contract run-rates (FY 2024–2025)
                  </p>
                </div>
                <Link
                  href="/platform-admin/billing"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>View Full Ledger</span>
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
                        Metro Hubs (NCR &amp; BLR)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">₹3.65 Cr</span>
                      <span className="text-[10px] text-slate-400">75.7% of total ARR</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs font-medium text-slate-700">
                        Regional Branches
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">₹98 Lakhs</span>
                      <span className="text-[10px] text-slate-400">20.3% of total ARR</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="text-xs font-medium text-slate-700">
                        HSM Enclave Addons
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
                      Sovereign Fleet Tier (66.7%)
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
                      Enterprise Campus Tier (33.3%)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ₹2,50,000 / yr / school
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: HSM Root Enclave (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-3">
                HSM Root Enclave
              </h2>

              {/* Green active banner */}
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold">FIPS 140-3 Level 4</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Active
                </span>
              </div>

              {/* Cryptographic properties */}
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Master Root Key ID</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    HSM-ZUR-9942-X
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    <span>Signature Algorithm</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    CRYSTALS-Dilithium5
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>ZK-Rollup Proofs</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    48,290 / 24h
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 text-slate-600">
                    <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Key Rotation Cycle</span>
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
                  <span>Configure Cryptography</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section: Sovereign School Fleet */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-bold text-slate-900">
                  Sovereign School Fleet
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  3 Connected Nodes
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Active tenant isolation partitions, curriculum architectures, and chancellor assignments.
              </p>
            </div>
            <Link
              href="/platform-admin/schools"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto shrink-0"
            >
              <span>View Full Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Institutional Node</th>
                  <th className="py-3 px-6">Curriculum &amp; Domain</th>
                  <th className="py-3 px-6">Jurisdiction</th>
                  <th className="py-3 px-6">Capacity</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {/* Row 1: DPS R.K. Puram */}
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <SchoolCrest slug="dps-rkpuram" name="Delhi Public School, R.K. Puram" />
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">
                          Delhi Public School, R.K. Puram
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <span>slug: dps-rkpuram</span>
                          <span>•</span>
                          <a
                            href="https://dpsrkp.net"
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <span>dpsrkp.net</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-800 block text-xs">CBSE</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      AFFILIATED
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="text-xs">New Delhi, India</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Base: INR
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-800">
                    3250 <span className="text-slate-400 font-normal">/ 3500</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href="/platform-admin/schools/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-2xs"
                        >
                          Dossier
                        </button>
                      </Link>
                      <Link href="/platform-admin/impersonate?school=dps-rkpuram">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-700 font-medium text-xs flex items-center gap-1.5 shadow-2xs"
                        >
                          <Users className="w-3 h-3" />
                          <span>Impersonate</span>
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>

                {/* Row 2: NPS Indiranagar */}
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <SchoolCrest slug="nps-indiranagar" name="National Public School, Indiranagar" />
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">
                          National Public School, Indiranagar
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <span>slug: nps-indiranagar</span>
                          <span>•</span>
                          <a
                            href="https://npsindiranagar.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <span>npsindiranagar.com</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-800 block text-xs">CBSE ICSE</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      DUAL
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="text-xs">Bengaluru, Karnataka</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Base: INR
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-800">
                    2100 <span className="text-slate-400 font-normal">/ 2200</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href="/platform-admin/schools/b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-2xs"
                        >
                          Dossier
                        </button>
                      </Link>
                      <Link href="/platform-admin/impersonate?school=nps-indiranagar">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-700 font-medium text-xs flex items-center gap-1.5 shadow-2xs"
                        >
                          <Users className="w-3 h-3" />
                          <span>Impersonate</span>
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>

                {/* Row 3: The Cathedral & John Connon School */}
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <SchoolCrest slug="cathedral-mumbai" name="The Cathedral & John Connon School" />
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">
                          The Cathedral &amp; John Connon School
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <span>slug: cathedral-mumbai</span>
                          <span>•</span>
                          <a
                            href="https://cathedral-school.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <span>cathedral-school.com</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-800 block text-xs">ICSE ISC IB</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="text-xs">Mumbai, Maharashtra</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Base: INR
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-800">
                    1650 <span className="text-slate-400 font-normal">/ 1800</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                      Trial
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href="/platform-admin/schools/c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-2xs"
                        >
                          Dossier
                        </button>
                      </Link>
                      <Link href="/platform-admin/impersonate?school=cathedral-mumbai">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-700 font-medium text-xs flex items-center gap-1.5 shadow-2xs"
                        >
                          <Users className="w-3 h-3" />
                          <span>Impersonate</span>
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
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
