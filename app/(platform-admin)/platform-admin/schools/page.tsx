"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Search,
  PlusCircle,
  Filter,
  Globe,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Shield,
  Users,
  CreditCard,
  SlidersHorizontal,
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

  const handleStatusToggle = async (id: string, current: SchoolStatus) => {
    const nextStatus: SchoolStatus = current === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await updateSchoolStatus(id, nextStatus);
    loadData();
  };

  return (
    <AppShell
      role="SUPER_ADMIN"
      userName="Eleanor Vance"
      userRoleTitle="Platform Lead & Super Admin"
      epochText="Multi-Tenant Sovereign Root • Cluster 01 Online"
    >
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="gold" dot>
                Institutional Partitions
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                Total Multi-Tenant Fleets: {schools.length}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Sovereign School Fleet Directory
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Inspect sovereign tenant boundaries, curriculum schemas, HSM encryption enclaves, and executive chancellor authorizations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/platform-admin/schools/new">
              <Button variant="primary" size="sm" className="font-sans gap-2">
                <PlusCircle className="w-4 h-4 text-secondary-container" />
                Provision New School Node
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Toolbar */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by school name, domain, slug, or canton..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-border bg-surface text-on-surface font-sans text-xs font-medium focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Nodes</option>
                <option value="TRIAL">Trial / Staging</option>
                <option value="SUSPENDED">Suspended Nodes</option>
              </select>

              <select
                value={jurisdictionFilter}
                onChange={(e) => setJurisdictionFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-border bg-surface text-on-surface font-sans text-xs font-medium focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="ALL">All Jurisdictions</option>
                <option value="Switzerland">Switzerland (CH)</option>
                <option value="United Kingdom">United Kingdom (UK)</option>
                <option value="France">France (FR)</option>
                <option value="Singapore">Singapore (SG)</option>
                <option value="UAE">UAE (Dubai/Abu Dhabi)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* School Fleet Directory Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-surface-variant/40 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-border/60">
                <tr>
                  <th className="py-3.5 px-6">Institutional Node</th>
                  <th className="py-3.5 px-6">Executive Chancellor</th>
                  <th className="py-3.5 px-6">Curriculum & Jurisdiction</th>
                  <th className="py-3.5 px-6">Sovereign Tier</th>
                  <th className="py-3.5 px-6">Capacity Utilization</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                      Scanning sovereign nodes across multi-tenant cluster...
                    </td>
                  </tr>
                ) : schools.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                      No school nodes match the specified filter criteria.
                    </td>
                  </tr>
                ) : (
                  schools.map((school) => {
                    const owner = school.users_profiles?.find((u) => u.role === "OWNER");
                    const capacityPct = Math.round(
                      ((school.student_count || 850) / school.capacity_target) * 100
                    );

                    return (
                      <tr
                        key={school.id}
                        className="hover:bg-surface-variant/20 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary text-secondary-container flex items-center justify-center font-serif font-bold text-base shadow-sm">
                              {school.legal_name.charAt(0)}
                            </div>
                            <div>
                              <Link
                                href={`/platform-admin/schools/${school.id}`}
                                className="font-medium text-primary hover:text-secondary transition-colors font-serif text-base leading-tight"
                              >
                                {school.legal_name}
                              </Link>
                              <div className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                                <Globe className="w-3 h-3 text-secondary" />
                                {school.domain || `${school.slug}.agragati.edu`}
                                {school.hsm_enclave_enabled && (
                                  <span className="text-[10px] font-mono bg-[#3D5B42]/10 text-[#3D5B42] px-1.5 py-0.2 rounded font-semibold">
                                    HSM
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-xs">
                          <div className="font-medium text-primary">
                            {owner?.full_name || "Julian Vance-Moreau, D.Phil"}
                          </div>
                          <div className="text-on-surface-variant">
                            {owner?.email || "owner@kingscollege.edu"}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-xs">
                          <div className="font-medium text-primary">
                            {school.curriculum_framework.replace(/_/g, " ")}
                          </div>
                          <div className="text-on-surface-variant">
                            {school.jurisdiction} • {school.base_currency}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <Badge variant="gold">
                            {(school.settings as any)?.plan_tier || "Sovereign Elite"}
                          </Badge>
                        </td>

                        <td className="py-4 px-6">
                          <div className="w-28">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold text-primary">
                                {school.student_count || 850}
                              </span>
                              <span className="text-on-surface-variant">
                                / {school.capacity_target}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  capacityPct > 85 ? "bg-[#3D5B42]" : "bg-secondary"
                                }`}
                                style={{ width: `${Math.min(capacityPct, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <Badge
                            variant={
                              school.status === "ACTIVE"
                                ? "active"
                                : school.status === "TRIAL"
                                ? "pending"
                                : "neutral"
                            }
                            dot
                          >
                            {school.status}
                          </Badge>
                        </td>

                        <td className="py-4 px-6 text-right space-x-2">
                          <Link href={`/platform-admin/schools/${school.id}`}>
                            <Button variant="ghost" size="sm" className="text-xs">
                              Dossier
                            </Button>
                          </Link>

                          <Link
                            href={`/platform-admin/impersonate?school=${encodeURIComponent(
                              school.legal_name
                            )}`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-secondary hover:text-secondary-fixed hover:border-secondary"
                            >
                              Impersonate
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
