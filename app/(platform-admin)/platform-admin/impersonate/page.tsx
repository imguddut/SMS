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

const DEFAULT_USERS: Array<ImpersonationUser & { initials: string; avatarBg: string; rolePillClass: string }> = [
  {
    id: "usr-001",
    full_name: "Vikramaditya Birla",
    title: "Chairman & Managing Trustee",
    email: "owner@dpsrkp.net",
    role: "OWNER",
    school_id: "dps-rkpuram",
    school_name: "Delhi Public School, R.K. Puram",
    status: "ACTIVE",
    last_login: "Today, 11:20 IST",
    initials: "VB",
    avatarBg: "bg-purple-600",
    rolePillClass: "bg-purple-50 text-purple-700 border border-purple-200",
  },
  {
    id: "usr-002",
    full_name: "Dr. Arvind Swaminathan",
    title: "Principal & Provost",
    email: "principal@dpsrkp.net",
    role: "PRINCIPAL",
    school_id: "dps-rkpuram",
    school_name: "Delhi Public School, R.K. Puram",
    status: "ACTIVE",
    last_login: "Today, 08:45 IST",
    initials: "DA",
    avatarBg: "bg-teal-600",
    rolePillClass: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  {
    id: "usr-003",
    full_name: "Mrs. Sunita Deshmukh",
    title: "Vice Principal & Academic Dean",
    email: "admin@dpsrkp.net",
    role: "SCHOOL_ADMIN",
    school_id: "dps-rkpuram",
    school_name: "Delhi Public School, R.K. Puram",
    status: "ACTIVE",
    last_login: "Yesterday, 17:10 IST",
    initials: "MS",
    avatarBg: "bg-amber-600",
    rolePillClass: "bg-sky-50 text-sky-700 border border-sky-200",
  },
  {
    id: "usr-004",
    full_name: "Prof. Rajesh Verma",
    title: "Senior PGT Mathematics & HOD",
    email: "teacher@dpsrkp.net",
    role: "TEACHER",
    school_id: "dps-rkpuram",
    school_name: "Delhi Public School, R.K. Puram",
    status: "ACTIVE",
    last_login: "Today, 13:05 IST",
    initials: "PR",
    avatarBg: "bg-emerald-600",
    rolePillClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  {
    id: "usr-005",
    full_name: "Rameshwar Gupta",
    title: "Chief Accounts Officer",
    email: "finance@dpsrkp.net",
    role: "ACCOUNTANT",
    school_id: "dps-rkpuram",
    school_name: "Delhi Public School, R.K. Puram",
    status: "ACTIVE",
    last_login: "Today, 10:15 IST",
    initials: "RG",
    avatarBg: "bg-blue-600",
    rolePillClass: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  {
    id: "usr-006",
    full_name: "Rajesh Sharma",
    title: "Parent • PTA Representative",
    email: "parent@dpsrkp.net",
    role: "PARENT",
    school_id: "dps-rkpuram",
    school_name: "Delhi Public School, R.K. Puram",
    status: "ACTIVE",
    last_login: "2 days ago",
    initials: "RS",
    avatarBg: "bg-rose-600",
    rolePillClass: "bg-rose-50 text-rose-700 border border-rose-200",
  },
  {
    id: "usr-007",
    full_name: "Aarav Sharma",
    title: "Head Boy Nominee • Class 12-A",
    email: "student@dpsrkp.net",
    role: "STUDENT",
    school_id: "dps-rkpuram",
    school_name: "Delhi Public School, R.K. Puram",
    status: "ACTIVE",
    last_login: "Today, 15:40 IST",
    initials: "AS",
    avatarBg: "bg-purple-600",
    rolePillClass: "bg-purple-50 text-purple-700 border border-purple-200",
  },
  {
    id: "usr-008",
    full_name: "Dr. Rohini Nambiar",
    title: "Managing Director & Trustee",
    email: "owner.nps@npsindiranagar.com",
    role: "OWNER",
    school_id: "nps-indiranagar",
    school_name: "National Public School, Indiranagar",
    status: "ACTIVE",
    last_login: "Today, 09:30 IST",
    initials: "DR",
    avatarBg: "bg-blue-700",
    rolePillClass: "bg-purple-50 text-purple-700 border border-purple-200",
  },
];

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

  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("ALL");
  const [schoolFilter, setSchoolFilter] = React.useState(defaultSchoolFilter);
  const [impersonatingId, setImpersonatingId] = React.useState<string | null>(null);

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

  const filteredUsers = DEFAULT_USERS.filter((u) => {
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
      epochText="Multi-Tenant Sovereign Root • Cluster 01 Online"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-6">
        {/* Header with Graphic Illustration */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold uppercase tracking-wider">
                Sovereign Elevation Engine
              </span>
              <span className="text-xs text-slate-500 font-medium">
                • Zero-Knowledge Attested Session Delegation
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Support &amp; Sovereign Impersonation Console
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Inspect the user experience directly as an Executive Owner, Principal, Faculty Member, Bursar, Parent, or Scholar. Every impersonation action is logged to the sovereign audit stream.
            </p>
          </div>

          {/* Delegation Graphic Card on Right */}
          <div className="shrink-0 hidden sm:flex items-center gap-3 p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
            <div className="w-16 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-xs">
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

        {/* Amber Protocol Banner */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-xs text-amber-950 leading-relaxed">
            <span className="font-bold text-amber-900">Cryptographic Security Protocol: </span>
            When you enter an impersonation session, a persistent gold banner will appear across all screens. You can click <span className="font-bold">Exit Session</span> at any moment to return directly to Super Admin.
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
              placeholder="Search user by name, email, or institutional node..."
              className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 shadow-2xs transition-all font-sans"
            />
          </div>

          <div className="md:col-span-3 lg:col-span-2.5">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 shadow-2xs cursor-pointer"
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
              className="w-full h-10 px-3 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 shadow-2xs cursor-pointer"
            >
              <option value="ALL">All School Nodes</option>
              <option value="dps-rkpuram">Delhi Public School, R.K. Puram</option>
              <option value="nps-indiranagar">National Public School, Indiranagar</option>
              <option value="cathedral-mumbai">The Cathedral &amp; John Connon School</option>
            </select>
          </div>
        </div>

        {/* User Registry Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 md:p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Multi-Tenant User Registry ({filteredUsers.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any registered account to initiate an authenticated delegation session.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">User &amp; Official Title</th>
                  <th className="py-3.5 px-5">Institutional Node</th>
                  <th className="py-3.5 px-5">System Role</th>
                  <th className="py-3.5 px-5">Last Activity</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* User Profile */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full ${user.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                        >
                          {user.initials}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">
                            {user.full_name}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {user.title} • {user.email}
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
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${user.rolePillClass}`}>
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
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-indigo-700 hover:text-indigo-800 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors ml-auto"
                      >
                        <span>{impersonatingId === user.id ? "Launching..." : "Launch Session"}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                      </button>
                    </td>
                  </tr>
                ))}
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
