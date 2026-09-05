"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/auth";
import { createClient } from "@/lib/supabase/client";
import {
  Home,
  LayoutDashboard,
  Building2,
  Receipt,
  Settings,
  ShieldAlert,
  PieChart,
  CreditCard,
  GraduationCap,
  TrendingUp,
  BrainCircuit,
  BookOpen,
  Bell,
  CheckSquare,
  BarChart3,
  Calendar,
  CalendarDays,
  FileSpreadsheet,
  Layers,
  FileCheck2,
  Calculator,
  UserCheck,
  Award,
  LogOut,
  ChevronRight,
  Megaphone,
  Plus,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export interface SidebarProps {
  role: UserRole;
  schoolName?: string;
  userName?: string;
  userRoleTitle?: string;
  userAvatar?: string;
}

export function Sidebar({
  role,
  schoolName = "The King's College & Academy",
  userName = "Genevieve Laurent",
  userRoleTitle,
  userAvatar,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    document.cookie = "agragati_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "agragati_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    router.push("/login");
    router.refresh();
  };

  const getNavItems = (): { section: string; items: NavItem[] } => {
    switch (role) {
      case "PLATFORM_ADMIN":
      case "SUPER_ADMIN":
        return {
          section: "System Admin",
          items: [
            {
              title: "System Overview",
              href: "/platform-admin/overview",
              icon: <LayoutDashboard className="w-4 h-4" />,
            },
            {
              title: "All Schools",
              href: "/platform-admin/schools",
              icon: <Building2 className="w-4 h-4" />,
            },
            {
              title: "Plans & Billing",
              href: "/platform-admin/billing",
              icon: <Receipt className="w-4 h-4" />,
            },
            {
              title: "System Settings",
              href: "/platform-admin/settings",
              icon: <Settings className="w-4 h-4" />,
            },
            {
              title: "User Support & Test Login",
              href: "/platform-admin/impersonate",
              icon: <ShieldAlert className="w-4 h-4" />,
            },
          ],
        };

      case "ORGANIZATION_OWNER":
      case "ORGANIZATION_ADMIN":
      case "ORGANIZATION_FINANCE":
      case "ORGANIZATION_VIEWER":
      case "OWNER":
      case "TRUST_CHAIRMAN":
      case "CEO":
        return {
          section: "Management Office",
          items: [
            {
              title: "All Schools Overview",
              href: "/organization",
              icon: <Building2 className="w-4 h-4" />,
            },
            {
              title: "Schools & Branches",
              href: "/organization/schools",
              icon: <Layers className="w-4 h-4" />,
            },
            {
              title: "+ Add New School",
              href: "/organization/add-school",
              icon: <Plus className="w-4 h-4" />,
            },
            {
              title: "Summary & Numbers",
              href: "/organization/kpis",
              icon: <BarChart3 className="w-4 h-4" />,
            },
            {
              title: "Campus Details",
              href: "/owner/overview",
              icon: <PieChart className="w-4 h-4" />,
            },
            {
              title: "Fee Collection",
              href: "/owner/fee-analytics",
              icon: <CreditCard className="w-4 h-4" />,
            },
            {
              title: "Teachers & Staff",
              href: "/owner/staff",
              icon: <GraduationCap className="w-4 h-4" />,
            },
            {
              title: "New Admissions",
              href: "/owner/growth",
              icon: <TrendingUp className="w-4 h-4" />,
            },
            {
              title: "Helpful Insights",
              href: "/owner/insights",
              icon: <BrainCircuit className="w-4 h-4" />,
            },
            {
              title: "Organization Settings",
              href: "/owner/settings",
              icon: <Settings className="w-4 h-4" />,
            },
          ],
        };

      case "PRINCIPAL":
      case "SCHOOL_ADMIN":
        return {
          section: "School Office",
          items: [
            {
              title: "School Overview",
              href: "/school/overview",
              icon: <LayoutDashboard className="w-4 h-4" />,
            },
            {
              title: "Students List",
              href: "/school/students",
              icon: <GraduationCap className="w-4 h-4" />,
            },
            {
              title: "Classes & Sections",
              href: "/school/classes",
              icon: <BookOpen className="w-4 h-4" />,
            },
            {
              title: "School Notices",
              href: "/school/notices",
              icon: <Bell className="w-4 h-4" />,
            },
            {
              title: "Requests to Approve",
              href: "/school/approvals",
              icon: <CheckSquare className="w-4 h-4" />,
              badge: "5 Pending",
            },
            {
              title: "School Reports",
              href: "/school/reports",
              icon: <BarChart3 className="w-4 h-4" />,
            },
            {
              title: "School Settings",
              href: "/school/settings",
              icon: <Settings className="w-4 h-4" />,
            },
          ],
        };

      case "TEACHER":
        return {
          section: "Teacher Area",
          items: [
            {
              title: "Today's Schedule",
              href: "/teacher/my-day",
              icon: <Home className="w-4 h-4" />,
            },
            {
              title: "My Classes",
              href: "/teacher/classes",
              icon: <BookOpen className="w-4 h-4" />,
            },
            {
              title: "Take Attendance",
              href: "/teacher/attendance",
              icon: <Calendar className="w-4 h-4" />,
            },
            {
              title: "Give Homework",
              href: "/teacher/homework/new",
              icon: <FileSpreadsheet className="w-4 h-4" />,
            },
            {
              title: "Check Homework",
              href: "/teacher/homework/review",
              icon: <FileCheck2 className="w-4 h-4" />,
              badge: "14",
            },
            {
              title: "Enter Exam Marks",
              href: "/teacher/marks",
              icon: <BarChart3 className="w-4 h-4" />,
            },
          ],
        };

      case "ACCOUNTANT":
        return {
          section: "Fees & Accounts",
          items: [
            {
              title: "Fee Overview",
              href: "/finance/dashboard",
              icon: <LayoutDashboard className="w-4 h-4" />,
            },
            {
              title: "Fee Plans & Categories",
              href: "/finance/fee-structures",
              icon: <Layers className="w-4 h-4" />,
            },
            {
              title: "Fee Bills & Invoices",
              href: "/finance/invoices",
              icon: <Receipt className="w-4 h-4" />,
            },
            {
              title: "Student Payment History",
              href: "/finance/student-ledgers",
              icon: <Calculator className="w-4 h-4" />,
            },
            {
              title: "Match Bank Payments",
              href: "/finance/reconciliation",
              icon: <CreditCard className="w-4 h-4" />,
            },
            {
              title: "Accounts & Reports",
              href: "/finance/reports",
              icon: <BarChart3 className="w-4 h-4" />,
            },
          ],
        };

      case "PARENT":
        return {
          section: "Parent Portal",
          items: [
            {
              title: "Child Overview",
              href: "/parent/home",
              icon: <Home className="w-4 h-4" />,
            },
            {
              title: "Attendance Record",
              href: "/parent/attendance",
              icon: <Calendar className="w-4 h-4" />,
            },
            {
              title: "School Fees & Pay",
              href: "/parent/fees",
              icon: <Receipt className="w-4 h-4" />,
            },
            {
              title: "Homework Due",
              href: "/parent/homework",
              icon: <BookOpen className="w-4 h-4" />,
            },
            {
              title: "Report Card & Marks",
              href: "/parent/results",
              icon: <BarChart3 className="w-4 h-4" />,
            },
            {
              title: "School Messages",
              href: "/parent/notices",
              icon: <Megaphone className="w-4 h-4" />,
            },
          ],
        };

      case "STUDENT":
        return {
          section: "Student Desk",
          items: [
            {
              title: "My Studies",
              href: "/student/home",
              icon: <Home className="w-4 h-4" />,
            },
            {
              title: "My Attendance",
              href: "/student/attendance",
              icon: <Calendar className="w-4 h-4" />,
            },
            {
              title: "My Homework",
              href: "/student/homework",
              icon: <BookOpen className="w-4 h-4" />,
            },
            {
              title: "Exam Scores & Progress",
              href: "/student/results",
              icon: <BarChart3 className="w-4 h-4" />,
            },
            {
              title: "School Notices",
              href: "/student/notices",
              icon: <Bell className="w-4 h-4" />,
            },
          ],
        };

      default:
        return { section: "Navigation", items: [] };
    }
  };

  const navData = getNavItems();
  const effectiveUserName =
    userName || (role === "PARENT" ? "Mr. Rajesh Sharma" : "Genevieve Laurent");
  const defaultRoleTitle =
    userRoleTitle ||
    (role === "PARENT"
      ? "Parent • Aarav Sharma"
      : role === "STUDENT"
      ? "Student • Class 12-A"
      : role.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()));

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case "PLATFORM_ADMIN":
      case "SUPER_ADMIN":
        return "ADMIN";
      case "ORGANIZATION_OWNER":
      case "ORGANIZATION_ADMIN":
      case "ORGANIZATION_FINANCE":
      case "ORGANIZATION_VIEWER":
      case "OWNER":
      case "TRUST_CHAIRMAN":
      case "CEO":
        return "OWNER";
      case "PRINCIPAL":
      case "SCHOOL_ADMIN":
        return "PRINCIPAL";
      case "TEACHER":
        return "TEACHER";
      case "ACCOUNTANT":
        return "ACCOUNTS";
      case "PARENT":
        return "PARENT";
      case "STUDENT":
        return "STUDENT";
      default:
        return "PORTAL";
    }
  };

  const getSectionTitle = () => {
    switch (role) {
      case "PLATFORM_ADMIN":
      case "SUPER_ADMIN":
        return "SYSTEM ADMIN";
      case "ORGANIZATION_OWNER":
      case "ORGANIZATION_ADMIN":
      case "ORGANIZATION_FINANCE":
      case "ORGANIZATION_VIEWER":
      case "OWNER":
      case "TRUST_CHAIRMAN":
      case "CEO":
        return "MANAGEMENT OFFICE";
      default:
        return navData.section;
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-sidebar-w border-r z-50 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.2)] select-none transition-colors duration-200 bg-[#080E1E] border-[#131F37] text-slate-100">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-20 px-6 flex flex-col justify-center border-b border-[#131F37]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-sans text-base font-bold text-white tracking-wide leading-none">
                  AGRAGATI
                </span>
                <span className="text-[9px] font-bold text-blue-300 uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-800/40">
                  {getRoleBadge(role)}
                </span>
              </div>
              <span className="font-sans text-[8px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                ACADEMIC INTELLIGENCE OS
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-4">
          <div className="px-3 pb-2.5 font-sans text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {getSectionTitle()}
          </div>
          <nav className="flex flex-col gap-1">
            {navData.items.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-sans text-xs transition-all duration-150",
                    isActive
                      ? "bg-[#2563EB] text-white font-medium shadow-sm"
                      : "text-slate-300 hover:bg-white/5 hover:text-white font-medium"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "transition-colors",
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-white"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800/50">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Area: User Profile Pill, Logout & Footer */}
      <div className="relative flex flex-col justify-end pt-8">
        {/* User Profile Pill */}
        <div className="mx-3 mb-2 p-2.5 rounded-xl shadow-xs flex items-center justify-between border bg-[#0F1A34] border-[#1E2E4A] text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs bg-blue-600 text-white">
              {effectiveUserName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-sans text-xs font-semibold truncate text-white">
                {effectiveUserName}
              </span>
              <span className="font-sans text-[9px] font-medium tracking-tight truncate text-slate-400">
                {defaultRoleTitle}
              </span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        </div>

        {/* Logout Action */}
        <button
          onClick={handleSignOut}
          className="mx-3 mb-3 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>

        {/* Institutional Copyright Footer */}
        <div className="px-4 pb-4 border-t border-[#131F37] pt-3 flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" />
              <path d="M12 7v10M8 11h8" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0 text-[9px] leading-tight text-slate-400">
            <span className="font-bold text-white tracking-wider uppercase truncate">
              The King&apos;s College &amp; Academy
            </span>
            <span className="text-[8px] text-slate-400 uppercase tracking-wider">
              {schoolName || "GENEVA CAMPUS"}
            </span>
            <span className="text-[8px] text-slate-500 mt-0.5">
              © All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
