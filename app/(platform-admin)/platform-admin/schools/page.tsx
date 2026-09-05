"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PlatformAdminFooter } from "@/components/layout/platform-admin-footer";
import { SchoolCrest } from "@/components/ui/school-crest";
import {
  Search,
  Plus,
  Users,
  Globe,
  Lock,
  Mail,
  MoreVertical,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import {
  fetchAllSchools,
  SchoolWithDetails,
  updateSchoolStatus,
} from "@/lib/db/platform-admin";
import { SchoolStatus } from "@/types/database";

export default function PlatformAdminSchoolsPage() {
  const [schools, setSchools] = React.useState<SchoolWithDetails[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [jurisdictionFilter, setJurisdictionFilter] = React.useState("ALL");
  const [loading, setLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllSchools({
        search: search || undefined,
        status: statusFilter,
        jurisdiction: jurisdictionFilter,
      });
      setSchools(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, jurisdictionFilter]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <AppShell
      role="SUPER_ADMIN"
      userName="Eleanor Vance"
      userRoleTitle="Platform Lead & Super Admin"
      epochText="Multi-Tenant Sovereign Root • Cluster 01 Online"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                Institutional Partitions
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Total Multi-Tenant Fleets: {schools.length || 3}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Sovereign School Fleet Directory
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-3xl">
              Inspect sovereign tenant boundaries, curriculum schemas, HSM encryption enclaves, and executive chancellor authorizations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/platform-admin/schools/new">
              <button
                type="button"
                className="h-10 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Provision New School Node</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 lg:col-span-7 relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by school name, domain, slug, or canton..."
              className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 shadow-2xs transition-all font-sans"
            />
          </div>

          <div className="md:col-span-3 lg:col-span-2.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <div className="md:col-span-3 lg:col-span-2.5">
            <select
              value={jurisdictionFilter}
              onChange={(e) => setJurisdictionFilter(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Jurisdictions</option>
              <option value="New Delhi, India">New Delhi, India</option>
              <option value="Bengaluru, Karnataka">Bengaluru, Karnataka</option>
              <option value="Mumbai, Maharashtra">Mumbai, Maharashtra</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Institutional Node</th>
                  <th className="py-3.5 px-5">Executive Chancellor</th>
                  <th className="py-3.5 px-5">Curriculum &amp; Jurisdiction</th>
                  <th className="py-3.5 px-5">Sovereign Tier</th>
                  <th className="py-3.5 px-5">Capacity Utilization</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {/* School 1: Delhi Public School, R.K. Puram */}
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      {/* Letter badge + School Crest */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                          D
                        </div>
                        <SchoolCrest slug="dps-rkpuram" name="Delhi Public School, R.K. Puram" size="sm" />
                      </div>
                      <div>
                        <Link
                          href="/platform-admin/schools/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
                          className="font-bold text-slate-900 hover:text-blue-600 block text-xs"
                        >
                          Delhi Public School, R.K. Puram
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-[10px]">
                          <a
                            href="https://dpsrkp.net"
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Globe className="w-3 h-3 text-blue-500" />
                            <span>dpsrkp.net</span>
                          </a>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 font-bold text-[9px]">
                            <Lock className="w-2.5 h-2.5" />
                            <span>HSM</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-bold text-slate-800 block text-xs">
                      Julian Vance-Moreau, D.Phil
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>owner@kingscollege.edu</span>
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-bold text-slate-800 block text-xs">
                      CBSE AFFILIATED
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>New Delhi, India • INR</span>
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold uppercase tracking-wider">
                        Institutional
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                        Enterprise
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1 font-bold text-slate-800 text-xs">
                        <span>3250</span>
                        <span className="text-slate-400 font-normal">/ 3500</span>
                      </div>
                      <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[92.9%]" />
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600">
                        92.9%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href="/platform-admin/impersonate?school=dps-rkpuram">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
                        >
                          <Users className="w-3 h-3 text-blue-600" />
                          <span>Impersonate</span>
                        </button>
                      </Link>
                      <button
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* School 2: National Public School, Indiranagar */}
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                          N
                        </div>
                        <SchoolCrest slug="nps-indiranagar" name="National Public School, Indiranagar" size="sm" />
                      </div>
                      <div>
                        <Link
                          href="/platform-admin/schools/b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"
                          className="font-bold text-slate-900 hover:text-blue-600 block text-xs"
                        >
                          National Public School, Indiranagar
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-[10px]">
                          <a
                            href="https://npsindiranagar.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Globe className="w-3 h-3 text-blue-500" />
                            <span>npsindiranagar.com</span>
                          </a>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 font-bold text-[9px]">
                            <Lock className="w-2.5 h-2.5" />
                            <span>HSM</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-bold text-slate-800 block text-xs">
                      Julian Vance-Moreau, D.Phil
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>owner@kingscollege.edu</span>
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-bold text-slate-800 block text-xs">
                      CBSE ICSE DUAL
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>Bengaluru, Karnataka • INR</span>
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold uppercase tracking-wider">
                        Institutional
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                        Enterprise
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1 font-bold text-slate-800 text-xs">
                        <span>2100</span>
                        <span className="text-slate-400 font-normal">/ 2200</span>
                      </div>
                      <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[95.5%]" />
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600">
                        95.5%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href="/platform-admin/impersonate?school=nps-indiranagar">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
                        >
                          <Users className="w-3 h-3 text-blue-600" />
                          <span>Impersonate</span>
                        </button>
                      </Link>
                      <button
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* School 3: The Cathedral & John Connon School */}
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center">
                          T
                        </div>
                        <SchoolCrest slug="cathedral-mumbai" name="The Cathedral & John Connon School" size="sm" />
                      </div>
                      <div>
                        <Link
                          href="/platform-admin/schools/c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33"
                          className="font-bold text-slate-900 hover:text-blue-600 block text-xs"
                        >
                          The Cathedral &amp; John Connon School
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-[10px]">
                          <a
                            href="https://cathedral-school.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Globe className="w-3 h-3 text-blue-500" />
                            <span>cathedral-school.com</span>
                          </a>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 font-bold text-[9px]">
                            <Lock className="w-2.5 h-2.5" />
                            <span>HSM</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-bold text-slate-800 block text-xs">
                      Julian Vance-Moreau, D.Phil
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>owner@kingscollege.edu</span>
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-bold text-slate-800 block text-xs">
                      ICSE ISC IB
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>Mumbai, Maharashtra • INR</span>
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                      Pro Campus
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1 font-bold text-slate-800 text-xs">
                        <span>1650</span>
                        <span className="text-slate-400 font-normal">/ 1800</span>
                      </div>
                      <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full w-[91.7%]" />
                      </div>
                      <span className="text-[10px] font-semibold text-amber-600">
                        91.7%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                      Trial
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href="/platform-admin/impersonate?school=cathedral-mumbai">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
                        >
                          <Users className="w-3 h-3 text-blue-600" />
                          <span>Impersonate</span>
                        </button>
                      </Link>
                      <button
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
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
