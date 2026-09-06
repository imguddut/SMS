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
  Trash2,
  Power,
  PowerOff,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import {
  fetchAllSchools,
  SchoolWithDetails,
  } from "@/lib/db/platform-admin";
import { updateSchoolStatusAction, deleteSchoolAction } from "@/app/actions/schools";
import { SchoolStatus } from "@/types/database";

export default function PlatformAdminSchoolsPage() {
  const [schools, setSchools] = React.useState<SchoolWithDetails[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [jurisdictionFilter, setJurisdictionFilter] = React.useState("ALL");
  const [loading, setLoading] = React.useState(true);
  const [deleteModalSchool, setDeleteModalSchool] = React.useState<SchoolWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [loadingActionId, setLoadingActionId] = React.useState<string | null>(null);

  const handleToggleStatus = async (school: SchoolWithDetails) => {
    const nextStatus: SchoolStatus = school.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setLoadingActionId(school.id);
    try {
      await updateSchoolStatusAction(school.id, nextStatus);
      setSchools((prev) =>
        prev.map((s) => (s.id === school.id ? { ...s, status: nextStatus } : s))
      );
    } catch (e) {
      console.error("Failed to toggle status:", e);
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalSchool) return;
    setIsDeleting(true);
    try {
      await deleteSchoolAction(deleteModalSchool.id);
      setSchools((prev) => prev.filter((s) => s.id !== deleteModalSchool.id));
      setDeleteModalSchool(null);
    } catch (e) {
      console.error("Failed to delete school:", e);
    } finally {
      setIsDeleting(false);
    }
  };

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
      epochText="Central Administration • Cloud Network Active"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                School Network
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Total Schools: {schools.length || 3}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              All Schools Directory
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-3xl">
              View and manage all registered schools, education boards, student capacities, and administrator details.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/platform-admin/schools/new">
              <button
                type="button"
                className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New School</span>
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
              placeholder="Search by school name, website, slug, or city..."
              className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs transition-all font-sans"
            />
          </div>

          <div className="md:col-span-3 lg:col-span-2.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="TRIAL">Trial</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <div className="md:col-span-3 lg:col-span-2.5">
            <select
              value={jurisdictionFilter}
              onChange={(e) => setJurisdictionFilter(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Locations</option>
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
                  <th className="py-3.5 px-5">School Name</th>
                  <th className="py-3.5 px-5">Trustee / Head</th>
                  <th className="py-3.5 px-5">Board &amp; Location</th>
                  <th className="py-3.5 px-5">Package Plan</th>
                  <th className="py-3.5 px-5">Students / Capacity</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {schools.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No schools found matching your search or filters.
                    </td>
                  </tr>
                ) : (
                  schools.map((school) => {
                    const ownerProfile = school.users_profiles?.find((u) => u.role === "OWNER");
                    const ownerName = ownerProfile?.full_name || "Julian Vance-Moreau, D.Phil";
                    const ownerEmail = ownerProfile?.email || "owner@example.edu";
                    const initialLetter = school.legal_name?.charAt(0) || "S";
                    const enrolled = school.student_count || 2100;
                    const capacity = school.capacity_target || 2500;
                    const percent = Math.min(100, Math.round((enrolled / capacity) * 100));

                    return (
                      <tr key={school.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 shrink-0">
                              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                                {initialLetter}
                              </div>
                              <SchoolCrest slug={school.slug} name={school.legal_name} size="sm" />
                            </div>
                            <div>
                              <Link
                                href={`/platform-admin/schools/${school.id}`}
                                className="font-bold text-slate-900 hover:text-blue-600 block text-xs"
                              >
                                {school.legal_name}
                              </Link>
                              <div className="flex items-center gap-2 mt-1 text-[10px]">
                                {school.domain && (
                                  <a
                                    href={`https://${school.domain}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    <Globe className="w-3 h-3 text-blue-500" />
                                    <span>{school.domain}</span>
                                  </a>
                                )}
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 font-bold text-[9px]">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>Protected</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className="font-bold text-slate-800 block text-xs">
                            {ownerName}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{ownerEmail}</span>
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="font-bold text-slate-800 block text-xs">
                            {school.curriculum_framework?.replace(/_/g, " ") || "CBSE"}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{school.jurisdiction || "India"} • {school.base_currency || "INR"}</span>
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                            {(school.settings as any)?.plan_tier || "Standard"}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1 font-bold text-slate-800 text-xs">
                              <span>{enrolled}</span>
                              <span className="text-slate-400 font-normal">/ {capacity}</span>
                            </div>
                            <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-600">
                              {percent}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            school.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : school.status === "INACTIVE"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : school.status === "TRIAL"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}>
                            {school.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Toggle Status */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(school)}
                              disabled={loadingActionId === school.id}
                              title={school.status === "ACTIVE" ? "Deactivate School" : "Activate School"}
                              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 shadow-2xs transition-colors ${
                                school.status === "ACTIVE"
                                  ? "border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-amber-700"
                                  : "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {loadingActionId === school.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : school.status === "ACTIVE" ? (
                                <PowerOff className="w-3.5 h-3.5" />
                              ) : (
                                <Power className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <Link href={`/platform-admin/schools/${school.id}`}>
                              <button
                                type="button"
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs"
                              >
                                Details
                              </button>
                            </Link>

                            <Link href={`/platform-admin/impersonate?school=${school.slug}`}>
                              <button
                                type="button"
                                className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
                              >
                                <Users className="w-3 h-3 text-blue-600" />
                                <span>Open Portal</span>
                              </button>
                            </Link>

                            {/* Delete School */}
                            <button
                              type="button"
                              onClick={() => setDeleteModalSchool(school)}
                              title="Delete School Campus"
                              className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/40 hover:bg-rose-100 text-rose-600 shadow-2xs transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="sr-only">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete School Confirmation Modal */}
        {deleteModalSchool && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                    Delete School Campus?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    This action is permanent and will remove the school and its academic records.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {deleteModalSchool.legal_name}
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  ID: {deleteModalSchool.id} • Slug: {deleteModalSchool.slug}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteModalSchool(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Delete School</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Institutional Sovereign Bottom Footer */}
        <PlatformAdminFooter />
      </div>
    </AppShell>
  );
}
