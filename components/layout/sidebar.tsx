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
          section: "Platform Control",
          items: [
            {
              title: "Platform Overview",
              href: "/platform-admin/overview",
              icon: <LayoutDashboard className="w-4 h-4" />,
            },
            {
              title: "Schools",
              href: "/platform-admin/schools",
              icon: <Building2 className="w-4 h-4" />,
            },
            {
              title: "Billing & Subscriptions",
              href: "/platform-admin/billing",
              icon: <Receipt className="w-4 h-4" />,
            },
            {
              title: "Platform Settings",
              href: "/platform-admin/settings",
              icon: <Settings className="w-4 h-4" />,
            },
            {
              title: "Support & Impersonation",
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
section: "Owner Menu",
items: [
  {
    title: "Organization Fleet",
    href: "/organization",
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    title: "Managed Campuses",
    href: "/organization/schools",
    icon: <Layers className="w-4 h-4" />,
  },
  {
    title: "+ Add School",
    href: "/organization/add-school",
    icon: <Plus className="w-4 h-4" />,
  },
  {
    title: "Consolidated KPIs",
    href: "/organization/kpis",
  },
  {
    title: "School Overview",
    href: "/owner/overview",
    icon: <PieChart className="w-4 h-4" />,
  },
]
              href: "/owner/overview",
              icon: <PieChart className="w-4 h-4" />,
            },
            {
              title: "Fee Details",
              href: "/owner/fee-analytics",
              icon: <CreditCard className="w-4 h-4" />,
            },
            {
              title: "Staff Details",
              href: "/owner/staff",
              icon: <GraduationCap className="w-4 h-4" />,
            },
            {
              title: "Admissions Progress",
              href: "/owner/growth",
              icon: <TrendingUp className="w-4 h-4" />,
            },
            {
              title: "AI Planning & Advice",
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
          section: "Institutional Desk",
          items: [
            {
              title: "Operations Overview",
              href: "/school/overview",
              icon: <LayoutDashboard className="w-4 h-4" />,
            },
            {
              title: "Students Directory",
              href: "/school/students",
              icon: <GraduationCap className="w-4 h-4" />,
            },
            {
              title: "Class & Sections",
              href: "/school/classes",
              icon: <BookOpen className="w-4 h-4" />,
            },
            {
              title: "Notices & Bulletins",
              href: "/school/notices",
              icon: <Bell className="w-4 h-4" />,
            },
            {
              title: "Approvals Queue",
              href: "/school/approvals",
              icon: <CheckSquare className="w-4 h-4" />,
              badge: "5 Pending",
            },
            {
              title: "Reports & Audits",
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
          section: "FACULTY SUITE",
          items: [
            {
              title: "My Day",
              href: "/teacher/my-day",
              icon: <Home className="w-4 h-4" />,
            },
            {
              title: "My Classes",
              href: "/teacher/classes",
              icon: <BookOpen className="w-4 h-4" />,
            },
            {
              title: "Attendance Marking",
              href: "/teacher/attendance",
              icon: <Calendar className="w-4 h-4" />,
            },
            {
              title: "Homework Creation",
              href: "/teacher/homework/new",
              icon: <FileSpreadsheet className="w-4 h-4" />,
            },
            {
              title: "Homework Review",
              href: "/teacher/homework/review",
              icon: <FileCheck2 className="w-4 h-4" />,
              badge: "14",
            },
            {
              title: "Marks Entry",
              href: "/teacher/marks",
              icon: <BarChart3 className="w-4 h-4" />,
            },
          ],
        };

      case "ACCOUNTANT":
        return {
          section: "Finance Bureau",
          items: [
            {
              title: "Dashboard",
              href: "/finance/dashboard",
              icon: <LayoutDashboard className="w-4 h-4" />,
            },
            {
              title: "Fee Structures",
              href: "/finance/fee-structures",
              icon: <Layers className="w-4 h-4" />,
            },
            {
              title: "Invoices",
              href: "/finance/invoices",
              icon: <Receipt className="w-4 h-4" />,
            },
            {
              title: "Student Ledgers",
              href: "/finance/student-ledgers",
              icon: <Calculator className="w-4 h-4" />,
            },
            {
              title: "Reconciliation",
              href: "/finance/reconciliation",
              icon: <CreditCard className="w-4 h-4" />,
            },
            {
              title: "Financial Reports",
              href: "/finance/reports",
              icon: <BarChart3 className="w-4 h-4" />,
            },
          ],
        };

      case "PARENT":
        return {
          section: "PARENT ACCESS",
          items: [
            {
              title: "Dashboard",
              href: "/parent/home",
              icon: <Home className="w-4 h-4" />,
            },
            {
              title: "Attendance",
              href: "/parent/attendance",
              icon: <Calendar className="w-4 h-4" />,
            },
            {
              title: "Fees & Payments",
              href: "/parent/fees",
              icon: <Receipt className="w-4 h-4" />,
            },
            {
              title: "Homework",
              href: "/parent/homework",
              icon: <BookOpen className="w-4 h-4" />,
            },
            {
              title: "Report Card & Marks",
              href: "/parent/results",
              icon: <BarChart3 className="w-4 h-4" />,
            },
            {
              title: "Notices & Circulars",
              href: "/parent/notices",
              icon: <Megaphone className="w-4 h-4" />,
            },
          ],
        };

      case "STUDENT":
        return {
          section: "SCHOLAR SPACE",
          items: [
            {
              title: "Overview",
              href: "/student/home",
              icon: <Home className="w-4 h-4" />,
            },
            {
              title: "Attendance",
              href: "/student/attendance",
              icon: <Calendar className="w-4 h-4" />,
            },
            {
              title: "My Homework",
              href: "/student/homework",
              icon: <BookOpen className="w-4 h-4" />,
            },
            {
              title: "Results & Radar",
              href: "/student/results",
              icon: <BarChart3 className="w-4 h-4" />,
            },
            {
              title: "Notices",
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
      ? "Guardian • Aarav Sharma"
      : role === "STUDENT"
      ? "SCHOLAR • FORM VI (GRADE 12-IB)"
      : role.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()));

  const isFinance = role === "ACCOUNTANT";
  const isPlatformAdmin = role === "SUPER_ADMIN";
  const isOwner = role === "OWNER";
  const isTeacher = role === "TEACHER";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full w-sidebar-w border-r z-50 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] select-none transition-colors duration-200",
        isPlatformAdmin || isOwner
          ? "bg-[#080E1E] border-[#131F37] text-slate-100"
          : isFinance
          ? "bg-[#0B1528] border-[#182742] text-slate-100"
          : "bg-white dark:bg-[#12161f] border-stone-200/80 dark:border-stone-800"
      )}
    >
      <div className="flex flex-col">
        {/* Brand Header */}
        <div
          className={cn(
            "h-20 px-6 flex flex-col justify-center border-b",
            isPlatformAdmin || isOwner || isFinance
              ? "border-[#131F37]"
              : isFinance
              ? "border-[#182742]"
              : "border-stone-100 dark:border-stone-800/80"
          )}
        >
          {isPlatformAdmin || isOwner ? (
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
                <span className="font-sans text-base font-bold text-white tracking-wide leading-none">
                  AGRAGATI
                </span>
                <span className="font-sans text-[8px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                  ACADEMIC INTELLIGENCE OS
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-serif text-2xl font-bold tracking-tight leading-none",
                    isFinance ? "text-white" : "text-stone-900 dark:text-stone-100"
                  )}
                >
                  Agragati
                </span>
              </div>
              <span
                className={cn(
                  "font-sans text-[9px] font-bold uppercase tracking-widest mt-1.5",
                  isFinance ? "text-[#94A3B8]" : "text-stone-400 dark:text-stone-500"
                )}
              >
                ACADEMIC INTELLIGENCE OS
              </span>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-4">
          <div
            className={cn(
              "px-3 pb-2.5 font-sans text-[10px] font-bold uppercase tracking-widest",
              (isPlatformAdmin || isOwner)
                ? "text-slate-400"
                : isFinance
                ? "text-[#94A3B8]"
                : "text-stone-500 dark:text-stone-400"
            )}
          >
            {isPlatformAdmin ? "PLATFORM CONTROL" : isOwner ? "COMMAND CONSOLE" : navData.section}
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
                    (isPlatformAdmin || isOwner)
                      ? isActive
                        ? "bg-[#2563EB] text-white font-medium shadow-sm"
                        : "text-slate-300 hover:bg-white/5 hover:text-white font-medium"
                      : isFinance
                      ? isActive
                        ? "bg-[#965A20] text-white font-semibold shadow-sm"
                        : "text-[#94A3B8] hover:bg-white/5 hover:text-white font-medium"
                      : isTeacher
                      ? isActive
                        ? "bg-[#0A369D] text-white font-semibold shadow-sm"
                        : "text-slate-700 dark:text-stone-300 hover:bg-slate-100 dark:hover:bg-stone-800/60 hover:text-slate-900 dark:hover:text-stone-100 font-medium"
                      : isActive
                      ? "bg-[#FEF3C7] dark:bg-amber-950/50 text-[#92400E] dark:text-amber-300 font-semibold shadow-[0_1px_2px_rgba(146,64,14,0.06)] border border-transparent dark:border-amber-800/40"
                      : "text-stone-600 dark:text-stone-400 hover:bg-stone-100/70 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100 font-medium"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "transition-colors",
                        (isPlatformAdmin || isOwner)
                          ? isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-white"
                          : isFinance
                          ? isActive
                            ? "text-white"
                            : "text-[#94A3B8] group-hover:text-white"
                          : isTeacher
                          ? isActive
                            ? "text-white"
                            : "text-slate-500 group-hover:text-slate-900 dark:group-hover:text-stone-100"
                          : isActive
                          ? "text-[#92400E] dark:text-amber-400"
                          : "text-stone-400 dark:text-stone-500 group-hover:text-stone-700 dark:group-hover:text-stone-300"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                        isTeacher
                          ? "bg-[#E11D48] text-white"
                          : "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-transparent dark:border-amber-800/40"
                      )}
                    >
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
        {!(isPlatformAdmin || isOwner) && (
          <div className="absolute bottom-24 left-2 right-2 pointer-events-none opacity-[0.22] dark:opacity-[0.14] overflow-hidden flex justify-center">
            <svg
              className={cn(
                "w-48 h-48",
                isFinance ? "text-[#E6C687]" : "text-[#8B5E3C] dark:text-amber-500"
              )}
              viewBox="0 0 200 200"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
            >
              <path d="M100 20 L100 50 M95 30 L105 30" strokeWidth="1" />
              <polygon points="100,25 90,60 110,60" fill="currentColor" fillOpacity="0.05" />
              <rect x="85" y="60" width="30" height="40" />
              <path d="M92 75 Q100 68 108 75 L108 95 L92 95 Z" />
              <circle cx="100" cy="85" r="4" />
              <rect x="50" y="90" width="35" height="70" />
              <polygon points="50,90 67.5,70 85,90" />
              <path d="M58 105 Q67.5 98 77 105 L77 130 L58 130 Z" />
              <line x1="50" y1="120" x2="85" y2="120" />
              <line x1="50" y1="140" x2="85" y2="140" />
              <rect x="115" y="90" width="35" height="70" />
              <polygon points="115,90 132.5,70 150,90" />
              <path d="M123 105 Q132.5 98 142 105 L142 130 L123 130 Z" />
              <line x1="115" y1="120" x2="150" y2="120" />
              <line x1="115" y1="140" x2="150" y2="140" />
              <rect x="85" y="100" width="30" height="60" />
              <path d="M92 120 Q100 112 108 120 L108 160 L92 160 Z" />
              <rect x="30" y="110" width="20" height="50" />
              <polygon points="30,110 40,98 50,110" />
              <rect x="150" y="110" width="20" height="50" />
              <polygon points="150,110 160,98 170,110" />
              <line x1="20" y1="160" x2="180" y2="160" strokeWidth="1.2" />
              <line x1="10" y1="163" x2="190" y2="163" strokeWidth="0.6" />
            </svg>
          </div>
        )}

        {/* Motto for Finance Bureau */}
        {isFinance && (
          <div className="text-center px-4 pb-3 relative z-10">
            <span className="font-serif italic text-xs font-bold text-slate-800 dark:text-stone-200 block leading-tight">
              Good Finances
            </span>
            <span className="font-serif italic text-xs font-bold text-slate-800 dark:text-stone-200 block leading-tight">
              Stronger Education
            </span>
            <div className="w-6 h-0.5 bg-[#D97706] rounded-full mx-auto mt-1" />
          </div>
        )}

        {/* User Profile Pill */}
        <div
          className={cn(
            "mx-3 mb-2 p-2.5 rounded-xl shadow-xs flex items-center justify-between border",
            (isPlatformAdmin || isOwner)
              ? "bg-[#0F1A34] border-[#1E2E4A] text-white"
              : isFinance
              ? "bg-[#111F36] border-[#1E2E4A] text-white"
              : "bg-stone-50 dark:bg-stone-800/60 border-stone-200/70 dark:border-stone-700/60"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs",
                (isPlatformAdmin || isOwner)
                  ? "bg-[#7C3AED] text-white"
                  : isFinance
                  ? "bg-slate-200 text-[#0B1528] border border-slate-300"
                  : "bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50"
              )}
            >
              {effectiveUserName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className={cn(
                  "font-sans text-xs font-semibold truncate",
                  (isPlatformAdmin || isOwner) || isFinance ? "text-white" : "text-stone-900 dark:text-stone-100"
                )}
              >
                {effectiveUserName}
              </span>
              <span
                className={cn(
                  "font-sans text-[9px] font-medium tracking-tight truncate",
                  (isPlatformAdmin || isOwner) || isFinance ? "text-slate-400" : "text-stone-500 dark:text-stone-400"
                )}
              >
                {defaultRoleTitle}
              </span>
            </div>
          </div>
          <ChevronRight
            className={cn(
              "w-3.5 h-3.5 shrink-0",
              (isPlatformAdmin || isOwner) || isFinance ? "text-slate-400" : "text-stone-400 dark:text-stone-500"
            )}
          />
        </div>

        {/* Logout Action */}
        <button
          onClick={handleSignOut}
          className={cn(
            "mx-3 mb-3 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2",
            (isPlatformAdmin || isOwner) || isFinance
              ? "text-slate-400 hover:text-white hover:bg-white/5"
              : "text-stone-600 dark:text-stone-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/30"
          )}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>

        {/* Copyright Footer */}
        {isPlatformAdmin || isOwner ? (
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
                GENEVA CAMPUS
              </span>
              <span className="text-[8px] text-slate-500 mt-0.5">
                © All rights reserved.
              </span>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "px-4 pb-4 text-[10px] leading-tight",
              isFinance ? "text-slate-500" : "text-stone-400 dark:text-stone-500"
            )}
          >
            <p className={isFinance ? "font-medium text-slate-400" : "font-medium text-stone-500 dark:text-stone-400"}>
              © The King&apos;s College &amp; Academy
            </p>
            <p
              className={cn(
                "text-[9px] uppercase tracking-wider mt-0.5",
                isFinance ? "text-slate-500" : "text-stone-400 dark:text-stone-500"
              )}
            >
              GENEVA CAMPUS
            </p>
            <p
              className={cn(
                "text-[9px] mt-0.5",
                isFinance ? "text-slate-500" : "text-stone-400 dark:text-stone-500"
              )}
            >
              Scholar Portal • Agragati
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
