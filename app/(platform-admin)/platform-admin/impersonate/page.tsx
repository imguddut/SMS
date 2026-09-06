"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PlatformAdminFooter } from "@/components/layout/platform-admin-footer";
import { SchoolCrest } from "@/components/ui/school-crest";
import {
  Shield,
  Search,
  ArrowRight,
  Clock,
  ShieldCheck,
  Building2,
} from "lucide-react";
import {
  fetchImpersonationDirectory,
  ImpersonationUser,
} from "@/lib/db/platform-admin";

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "U";
}

function getRolePillClass(role: string) {
  switch (role) {
    case "OWNER":
      return "bg-purple-50 text-purple-700 border border-purple-200";
    case "PRINCIPAL":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "SCHOOL_ADMIN":
      return "bg-sky-50 text-sky-700 border border-sky-200";
    case "TEACHER":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "ACCOUNTANT":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "PARENT":
      return "bg-rose-50 text-rose-700 border border-rose-200";
    case "STUDENT":
      return "bg-purple-50 text-purple-700 border border-purple-200";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200";
  }
}

export default function PlatformAdminImpersonatePage() {
  return (
    <React.Suspense
      fallback={
        <AppShell
          role="SUPER_ADMIN"
          userName="Eleanor Vance"
          userRoleTitle="Platform Lead & Super Admin"
        >
          <div className="py-20 text-center text-slate-500 font-sans">
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
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("ALL");
  const [schoolFilter, setSchoolFilter] = React.useState(defaultSchoolFilter);
  const [impersonatingId, setImpersonatingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchImpersonationDirectory();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load impersonation directory", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
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
        targetRoute = "/platform-admin/overview";
    }

    // 3. Navigate
    setTimeout(() => {
      router.push(targetRoute);
      router.refresh();
    }, 400);
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (schoolFilter !== "ALL") {
      const matchSchool =
        u.school_id?.toLowerCase().includes(schoolFilter.toLowerCase()) ||
        u.school_name.toLowerCase().includes(schoolFilter.toLowerCase());
      if (!matchSchool) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.school_name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AppShell
      role="SUPER_ADMIN"
      userName="Eleanor Vance"
      userRoleTitle="Platform Lead & Super Admin"
      epochText="Central Administration • Cloud Network Active"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-6">
        {/* Header with Graphic Illustration */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                Portal Access Preview
              </span>
              <span className="text-xs text-slate-500 font-medium">
                • View School As Any Role
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              View Portal As User
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Experience and test any portal view as a School Owner, Principal, Teacher, Accountant, Parent, or Student.
            </p>
          </div>

          {/* Delegation Graphic Card on Right */}
          <div className="shrink-0 hidden sm:flex items-center gap-3 p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
            <div className="w-16 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                1
              </div>
              <div className="w-5 h-0.5 bg-slate-200" />
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                2
              </div>
              <div className="w-5 h-0.5 bg-slate-200" />
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                3
              </div>
            </div>
          </div>
        </div>

        {/* Informative Blue Banner */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-xs text-blue-950 leading-relaxed">
            <span className="font-bold text-blue-900">Safe Preview Mode: </span>
            When you view a portal as a user, a top banner will appear. Click <span className="font-bold">Back to Admin</span> at any moment to return directly to Platform Admin.
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 lg:col-span-7 relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name, email, or school name..."
              className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs transition-all font-sans"
            />
          </div>

          <div className="md:col-span-3 lg:col-span-2.5">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="OWNER">Owner</option>
              <option value="PRINCIPAL">Principal</option>
              <option value="SCHOOL_ADMIN">School Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="PARENT">Parent</option>
              <option value="STUDENT">Student</option>
            </select>
          </div>

          <div className="md:col-span-3 lg:col-span-2.5">
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Schools</option>
              {Array.from(new Set(users.map((u) => u.school_name).filter(Boolean))).map((sName) => (
                <option key={sName} value={sName}>{sName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* User Registry Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 md:p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Available User Accounts ({filteredUsers.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any registered user to preview their portal view and features.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">User Name &amp; Title</th>
                  <th className="py-3.5 px-5">School Campus</th>
                  <th className="py-3.5 px-5">System Role</th>
                  <th className="py-3.5 px-5">Last Activity</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      {isLoading ? "Loading user accounts..." : "No user accounts found matching your filters."}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* User Profile */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs"
                          >
                            {getInitials(user.full_name)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {user.full_name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {user.title ? `${user.title} • ` : ""}{user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Institutional Node */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <SchoolCrest slug={user.school_id || ""} name={user.school_name} size="sm" />
                          <span className="font-semibold text-slate-800 text-xs">
                            {user.school_name}
                          </span>
                        </div>
                      </td>

                      {/* System Role */}
                      <td className="py-4 px-5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getRolePillClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>

                    {/* Last Activity */}
                    <td className="py-4 px-5 text-slate-500 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{user.last_login}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleImpersonate(user)}
                        disabled={impersonatingId === user.id}
                        className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors ml-auto"
                      >
                        <span>{impersonatingId === user.id ? "Opening..." : "View Portal"}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                      </button>
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
