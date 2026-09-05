"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  PlusCircle,
  Plus,
  Search,
  ArrowUpRight,
  MapPin,
  Power,
  PowerOff,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-context";
import {
  listOrganizationSchools,
  updateOrganizationSchoolStatus,
  deleteOrganizationSchool,
} from "@/lib/services/organization-service";
import { SchoolTenant } from "@/types/auth";

export default function OrganizationSchoolsPage() {
  const { currentOrganization, currentSchool, switchSchool } = useAuth();
  const [schools, setSchools] = React.useState<SchoolTenant[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [loadingActionId, setLoadingActionId] = React.useState<string | null>(null);
  const [deleteModalSchool, setDeleteModalSchool] = React.useState<SchoolTenant | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const orgId = currentOrganization?.id || "e0000000-0000-0000-0000-000000000001";

  const loadSchools = React.useCallback(async () => {
    try {
      const data = await listOrganizationSchools(orgId);
      setSchools(data);
    } catch (err) {
      console.error("Failed to load schools:", err);
    }
  }, [orgId]);

  React.useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  // Auto-dismiss feedback notification after 4 seconds
  React.useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Toggle school active/inactive status
  const handleToggleStatus = async (school: SchoolTenant) => {
    const isCurrentlyActive = school.status === "ACTIVE";
    const nextStatus = isCurrentlyActive ? "INACTIVE" : "ACTIVE";
    setLoadingActionId(school.id);

    try {
      await updateOrganizationSchoolStatus(school.id, nextStatus);
      setSchools((prev) =>
        prev.map((s) => (s.id === school.id ? { ...s, status: nextStatus } : s))
      );
      setFeedback({
        type: "success",
        message: `"${school.legal_name}" has been ${nextStatus === "ACTIVE" ? "activated" : "deactivated"} successfully.`,
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: `Failed to update status: ${err?.message || "Unknown error"}`,
      });
    } finally {
      setLoadingActionId(null);
    }
  };

  // Confirm school deletion
  const handleConfirmDelete = async () => {
    if (!deleteModalSchool) return;
    setIsDeleting(true);

    try {
      await deleteOrganizationSchool(deleteModalSchool.id);
      const remainingSchools = schools.filter((s) => s.id !== deleteModalSchool.id);
      setSchools(remainingSchools);

      // If deleted school was the active session school, switch to another school
      if (currentSchool?.id === deleteModalSchool.id && remainingSchools.length > 0) {
        await switchSchool(remainingSchools[0].id);
      }

      setFeedback({
        type: "success",
        message: `School campus "${deleteModalSchool.legal_name}" was permanently deleted.`,
      });
      setDeleteModalSchool(null);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: `Failed to delete school: ${err?.message || "Unknown error"}`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const activeCount = schools.filter((s) => s.status === "ACTIVE").length;
  const inactiveCount = schools.filter((s) => s.status === "INACTIVE" || s.status === "SUSPENDED").length;

  const filtered = schools.filter((s) => {
    const matchesSearch =
      s.legal_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.school_code && s.school_code.toLowerCase().includes(search.toLowerCase())) ||
      (s.city && s.city.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === "ACTIVE") return s.status === "ACTIVE";
    if (statusFilter === "INACTIVE") return s.status === "INACTIVE" || s.status === "SUSPENDED";
    return true;
  });

  return (
    <AppShell
      role="ORGANIZATION_OWNER"
      userName="Julian Vance-Moreau, D.Phil"
      userRoleTitle="Chancellor & Trust Chairman"
      epochText="Multi-School Fleet Directory • Sovereign Campuses"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-semibold tracking-wide border border-blue-500/20">
                School Network Governance
              </span>
              <span className="text-xs text-slate-500">
                Total Campuses: {schools.length}
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">
              Federation Schools &amp; Campuses
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Activate, deactivate, manage, or decommission school campuses operated under {currentOrganization?.name || "this Organization"}.
            </p>
          </div>
          <Link href="/organization/add-school">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shadow-sm font-medium">
              <PlusCircle className="w-4 h-4" /> Add School Campus
            </Button>
          </Link>
        </div>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
              feedback.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Search & Status Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search campuses by name, city, or school code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === "ALL"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              All Campuses ({schools.length})
            </button>
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === "ACTIVE"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter("INACTIVE")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === "INACTIVE"
                  ? "bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          </div>
        </div>

        {/* School Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((school) => {
            const isSelected = currentSchool?.id === school.id;
            const isActive = school.status === "ACTIVE";
            const isActionLoading = loadingActionId === school.id;

            return (
              <Card
                key={school.id}
                className={`border transition-all duration-200 flex flex-col justify-between ${
                  !isActive
                    ? "border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#070D1A] opacity-90"
                    : isSelected
                    ? "border-blue-500 ring-1 ring-blue-500/30 bg-blue-50/20 dark:bg-blue-950/20 shadow-md"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1528] hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
                }`}
              >
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200/60 dark:border-slate-700/60">
                        {school.school_code || "SCH"}
                      </span>

                      {/* Status Badge */}
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                          <PowerOff className="w-3 h-3 text-rose-500" />
                          Inactive
                        </span>
                      )}
                    </div>

                    <CardTitle className="font-serif text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {school.legal_name}
                    </CardTitle>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{school.city || "Main Campus"}</span>
                      {school.domain && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="truncate">{school.domain}</span>
                        </>
                      )}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 py-2 border-y border-slate-100 dark:border-slate-800">
                      <span>Currency: <strong className="text-slate-800 dark:text-slate-200">{school.currency || school.base_currency || "INR"}</strong></span>
                      <Button
                        variant={isSelected ? "primary" : "outline"}
                        size="sm"
                        disabled={!isActive}
                        onClick={() => switchSchool(school.id)}
                        className={`text-xs h-7 ${
                          isSelected
                            ? "bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                        title={!isActive ? "Activate campus first to select as active session" : undefined}
                      >
                        {isSelected ? "Active Campus" : "Set Active"}
                      </Button>
                    </div>

                    {/* Operational Actions: Activate / Deactivate & Delete */}
                    <div className="flex items-center gap-2 pt-1">
                      {/* Activate / Deactivate Toggle Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isActionLoading}
                        onClick={() => handleToggleStatus(school)}
                        className={`flex-1 text-xs h-8 font-semibold gap-1.5 transition-colors ${
                          isActive
                            ? "border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                            : "border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        }`}
                      >
                        {isActionLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isActive ? (
                          <>
                            <PowerOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Deactivate Campus</span>
                          </>
                        ) : (
                          <>
                            <Power className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Activate Campus</span>
                          </>
                        )}
                      </Button>

                      {/* Delete Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteModalSchool(school)}
                        className="text-xs h-8 px-2.5 border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300"
                        title="Delete School Campus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="sr-only">Delete School</span>
                      </Button>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 pt-0">
                  {/* Enter School Space Link */}
                  {isActive ? (
                    <Link href="/school/overview" className="block">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs h-8 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 font-semibold gap-1.5 border border-blue-500/20"
                      >
                        Enter School Space <ArrowUpRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  ) : (
                    <div className="text-center py-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 rounded-lg">
                      Campus Deactivated (Click Activate to Open)
                    </div>
                  )}
                </div>
              </Card>
            );
          })}

          {/* Add New School Card */}
          <Link href="/organization/add-school" className="block group">
            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500/80 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                + Add New School Campus
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">
                Launch the 5-step wizard to setup a new school campus under this organization
              </p>
              <div className="mt-4">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Open Wizard <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          </Link>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
              No matching campuses found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No school campuses match your filter criteria. Try adjusting your search keyword or filter options.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
              className="text-xs"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal Dialog */}
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
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {deleteModalSchool.legal_name}
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                Code: {deleteModalSchool.school_code || "SCH"} • City: {deleteModalSchool.city || "Main Campus"}
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Permanently decommissioning this campus will remove its classes, sections, academic calendars, and local settings from this organization.
            </p>

            {currentSchool?.id === deleteModalSchool.id && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>Active Campus Notice:</strong> This is your currently selected school session. Deleting it will automatically switch you to another available school campus.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeleteModalSchool(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold gap-1.5 shadow-sm"
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
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

