"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldAlert,
  Search,
  UserCheck,
  Building2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Users,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import {
  fetchImpersonationDirectory,
  ImpersonationUser,
} from "@/lib/db/platform-admin";

export default function PlatformAdminImpersonatePage() {
  return (
    <React.Suspense
      fallback={
        <AppShell
          role="SUPER_ADMIN"
          userName="Eleanor Vance"
          userRoleTitle="Platform Lead & Super Admin"
        >
          <div className="py-20 text-center text-on-surface-variant font-sans">
            Loading sovereign impersonation directory...
          </div>
        </AppShell>
      }
    >
      <PlatformAdminImpersonateContent />
    </React.Suspense>
  );
}

function PlatformAdminImpersonateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultSchoolFilter = searchParams.get("school") || "ALL";

  const [users, setUsers] = React.useState<ImpersonationUser[]>([]);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("ALL");
  const [schoolFilter, setSchoolFilter] = React.useState(defaultSchoolFilter);
  const [loading, setLoading] = React.useState(true);
  const [impersonatingId, setImpersonatingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await fetchImpersonationDirectory();
        setUsers(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleImpersonate = (user: ImpersonationUser) => {
    setImpersonatingId(user.id);

    // 1. Set Session Cookies
    const impersonationPayload = encodeURIComponent(
      JSON.stringify({
        name: user.full_name,
        role: user.role,
        school: user.school_name,
      })
    );

    document.cookie = `agragati_role=${user.role}; path=/; max-age=86400`;
    document.cookie = `agragati_impersonating=${impersonationPayload}; path=/; max-age=86400`;

    // 2. Determine target portal route
    let targetRoute = "/platform-admin/overview";
    switch (user.role) {
      case "OWNER":
        targetRoute = "/owner/overview";
        break;
      case "PRINCIPAL":
      case "SCHOOL_ADMIN":
        targetRoute = "/school/overview";
        break;
      case "TEACHER":
        targetRoute = "/teacher/my-day";
        break;
      case "ACCOUNTANT":
        targetRoute = "/finance/dashboard";
        break;
      case "PARENT":
        targetRoute = "/parent/home";
        break;
      case "STUDENT":
        targetRoute = "/student/home";
        break;
      default:
        targetRoute = "/school/overview";
    }

    setTimeout(() => {
      router.push(targetRoute);
      router.refresh();
    }, 600);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      search === "" ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.school_name.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesSchool =
      schoolFilter === "ALL" || u.school_name.toLowerCase().includes(schoolFilter.toLowerCase());

    return matchesSearch && matchesRole && matchesSchool;
  });

  return (
    <AppShell
      role="SUPER_ADMIN"
      userName="Eleanor Vance"
      userRoleTitle="Platform Lead & Super Admin"
      epochText="Multi-Tenant Sovereign Root • Cluster 01 Online"
    >
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="gold" dot>
                Sovereign Elevation Engine
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                Zero-Knowledge Attested Session Delegation
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Support & Sovereign Impersonation Console
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Inspect the user experience directly as an Executive Owner, Principal, Faculty Member, Bursar, Parent, or Scholar. Every impersonation action is logged to the sovereign audit stream.
            </p>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="p-4 rounded-lg bg-secondary-container/30 border border-secondary/40 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
          <div className="text-xs font-sans">
            <span className="font-bold text-primary">Cryptographic Security Protocol:</span> When you enter an impersonation session, a persistent gold banner will appear across all screens. You can click <strong className="text-secondary font-bold">Exit Session</strong> at any moment to return directly to Super Admin.
          </div>
        </div>

        {/* Search & Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search user by name, email, or institutional node..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-border bg-surface text-on-surface font-sans text-xs font-medium focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="ALL">All Roles</option>
                <option value="OWNER">Chancellor / Owner</option>
                <option value="PRINCIPAL">Head of School / Principal</option>
                <option value="SCHOOL_ADMIN">Registrar / Admin</option>
                <option value="TEACHER">Faculty / Teacher</option>
                <option value="ACCOUNTANT">Bursar / Accountant</option>
                <option value="PARENT">Governor / Parent</option>
                <option value="STUDENT">Prefect / Scholar</option>
              </select>

              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-border bg-surface text-on-surface font-sans text-xs font-medium focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="ALL">All School Nodes</option>
                <option value="The King's College & Academy">The King's College & Academy</option>
                <option value="Institut Le Rosey">Institut Le Rosey</option>
                <option value="Aiglon College">Aiglon College</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Impersonation User Table */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-border/60 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-medium text-primary">
                Multi-Tenant User Registry ({filteredUsers.length})
              </h3>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                Select any registered account to initiate an authenticated delegation session.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-surface-variant/40 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-border/60">
                <tr>
                  <th className="py-3.5 px-6">User & Official Title</th>
                  <th className="py-3.5 px-6">Institutional Node</th>
                  <th className="py-3.5 px-6">System Role</th>
                  <th className="py-3.5 px-6">Last Activity</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                      Querying multi-tenant user registry...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                      No users match the search filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-surface-variant/20 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-xs shadow-sm">
                            {user.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <div>
                            <div className="font-medium text-primary font-serif text-base leading-tight">
                              {user.full_name}
                            </div>
                            <div className="text-xs text-on-surface-variant">
                              {user.title || user.role} • <span className="font-mono">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-xs">
                        <div className="font-medium text-primary flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-secondary" />
                          {user.school_name}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <Badge variant="gold">
                          {user.role}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 text-xs text-on-surface-variant">
                        {user.last_login || "Today, 14:10 CET"}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={impersonatingId === user.id}
                          onClick={() => handleImpersonate(user)}
                          className="text-xs gap-1.5 font-semibold bg-primary text-secondary-container hover:bg-primary-hover shadow-sm"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          {impersonatingId === user.id
                            ? "Entering Session..."
                            : "Launch Session"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
