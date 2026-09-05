"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  Search,
  Building2,
  ArrowRight,
  ShieldAlert,
  Users,
  AlertTriangle,
  Clock,
  Shield,
  CheckCircle2,
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
          userName="Mr. Rajesh Pillai"
          userRoleTitle="Platform Lead & Super Admin"
        >
          <div className="py-20 text-center text-slate-500 font-sans">
            Loading user access directory...
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

  // Confirmation Modal state
  const [pendingUser, setPendingUser] = React.useState<ImpersonationUser | null>(null);
  const [isOpening, setIsOpening] = React.useState(false);

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

  const defaultUsers: ImpersonationUser[] = [
    {
      id: "u-1",
      full_name: "Vikramaditya Birla",
      email: "owner@dpsrkp.net",
      role: "OWNER",
      title: "Chairman & Managing Trustee",
      school_id: "s-1",
      school_name: "Delhi Public School, R.K. Puram",
      status: "ACTIVE",
      last_login: "Active today",
    },
    {
      id: "u-2",
      full_name: "Dr. Arvind Swaminathan",
      email: "principal@dpsrkp.net",
      role: "PRINCIPAL",
      title: "Principal & Provost",
      school_id: "s-1",
      school_name: "Delhi Public School, R.K. Puram",
      status: "ACTIVE",
      last_login: "Active today",
    },
    {
      id: "u-3",
      full_name: "Mrs. Sunita Deshmukh",
      email: "admin@dpsrkp.net",
      role: "SCHOOL_ADMIN",
      title: "Vice Principal & Academic Dean",
      school_id: "s-1",
      school_name: "Delhi Public School, R.K. Puram",
      status: "ACTIVE",
      last_login: "Active yesterday",
    },
    {
      id: "u-4",
      full_name: "Prof. Rajesh Verma",
      email: "teacher@dpsrkp.net",
      role: "TEACHER",
      title: "Senior PGT Mathematics & HOD",
      school_id: "s-1",
      school_name: "Delhi Public School, R.K. Puram",
      status: "ACTIVE",
      last_login: "Active today",
    },
    {
      id: "u-5",
      full_name: "Ramesh Gupta",
      email: "finance@dpsrkp.net",
      role: "ACCOUNTANT",
      title: "Chief Accounts Officer",
      school_id: "s-1",
      school_name: "Delhi Public School, R.K. Puram",
      status: "ACTIVE",
      last_login: "Active today",
    },
    {
      id: "u-6",
      full_name: "Rajesh Sharma",
      email: "parent@dpsrkp.net",
      role: "PARENT",
      title: "Parent • PTA Representative",
      school_id: "s-1",
      school_name: "Delhi Public School, R.K. Puram",
      status: "ACTIVE",
      last_login: "Active 2 days ago",
    },
    {
      id: "u-7",
      full_name: "Aarav Sharma",
      email: "student@dpsrkp.net",
      role: "STUDENT",
      title: "Head Boy Nominee • Class 12-A",
      school_id: "s-1",
      school_name: "Delhi Public School, R.K. Puram",
      status: "ACTIVE",
      last_login: "Active today",
    },
    {
      id: "u-8",
      full_name: "Dr. Rohini Nambiar",
      email: "owner.nps@npsindiranagar.com",
      role: "OWNER",
      title: "Managing Director & Trustee",
      school_id: "s-2",
      school_name: "National Public School, Indiranagar",
      status: "ACTIVE",
      last_login: "Active today",
    },
  ];

  const sourceUsers = users.length > 0 ? users : defaultUsers;

  const handleConfirmOpenAccount = () => {
    if (!pendingUser) return;
    setIsOpening(true);

    const user = pendingUser;
    const impersonationPayload = encodeURIComponent(
      JSON.stringify({
        name: user.full_name,
        role: user.role,
        school: user.school_name,
      })
    );

    document.cookie = `agragati_role=${user.role}; path=/; max-age=86400`;
    document.cookie = `agragati_impersonating=${impersonationPayload}; path=/; max-age=86400`;

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
    }, 400);
  };

  const filteredUsers = sourceUsers.filter((u) => {
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

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/60 dark:text-purple-300";
      case "PRINCIPAL":
        return "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-300";
      case "SCHOOL_ADMIN":
        return "bg-cyan-50 text-cyan-700 border-cyan-200/60 dark:bg-cyan-950/60 dark:text-cyan-300";
      case "TEACHER":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300";
      case "ACCOUNTANT":
        return "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300";
      case "PARENT":
        return "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300";
      case "STUDENT":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/60 dark:text-indigo-300";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/60";
    }
  };

  const getAvatarColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200";
      case "PRINCIPAL":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200";
      case "SCHOOL_ADMIN":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200";
      case "TEACHER":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200";
      case "ACCOUNTANT":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200";
      case "PARENT":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200";
      case "STUDENT":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <AppShell
      role="SUPER_ADMIN"
      userName="Mr. Rajesh Pillai"
      userRoleTitle="Platform Lead & Super Admin"
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                Support Elevation Engine
              </span>
              <span className="text-xs text-slate-500 font-medium">Session audit logging active</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Support &amp; User Access
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Open a user&apos;s view to help solve problems.
            </p>
          </div>
        </div>

        {/* Gold/Orange Warning Banner */}
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-4 flex items-start gap-3 text-amber-900 dark:text-amber-200 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">Important</h4>
            <p className="mt-0.5 text-amber-800 dark:text-amber-300">
              When you open another user&apos;s account, your activity is recorded for security. A persistent yellow bar will remain visible across all screens with an &ldquo;Exit Session&rdquo; button to return back to Super Admin anytime.
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-xs rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* Roles Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-sans text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

            {/* Schools Filter */}
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-sans text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Schools</option>
              <option value="Delhi Public School">DPS R.K. Puram</option>
              <option value="National Public School">NPS Indiranagar</option>
              <option value="Cathedral">Cathedral School</option>
            </select>
          </div>
        </div>

        {/* Clean Users List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              User Directory ({filteredUsers.length} Users)
            </span>
            <span className="text-[11px] text-slate-400">
              Click &ldquo;Open Account&rdquo; to test user experience
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${getAvatarColor(
                      user.role
                    )}`}
                  >
                    {user.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        {user.full_name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeStyle(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {user.title} • <span className="text-slate-400">{user.email}</span>
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{user.school_name}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Last active & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {user.last_login || "Active today"}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setPendingUser(user)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold gap-1.5 h-9 px-3.5 shadow-2xs"
                  >
                    Open Account <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmation Modal */}
        {pendingUser && (
          <Modal
            isOpen={Boolean(pendingUser)}
            onClose={() => setPendingUser(null)}
            title="Open this user's account?"
          >
            <div className="space-y-4 p-2 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                You will temporarily see the platform from this user&apos;s view. Your activity will be recorded in the security audit stream.
              </p>

              {/* User summary card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {pendingUser.full_name}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeStyle(pendingUser.role)}`}>
                    {pendingUser.role}
                  </span>
                </div>
                <p className="text-slate-500">{pendingUser.title}</p>
                <p className="text-slate-400 text-[11px]">{pendingUser.school_name}</p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPendingUser(null)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmOpenAccount}
                  disabled={isOpening}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold px-4"
                >
                  {isOpening ? "Opening Session..." : "Continue"}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
