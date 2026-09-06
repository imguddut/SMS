"use client";

import * as React from "react";
import { UserRole } from "@/types/auth";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { ImpersonationBanner } from "./impersonation-banner";
import { useAuth } from "@/components/providers/auth-context";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  role: UserRole;
  schoolName?: string;
  campusName?: string;
  epochText?: string;
  userName?: string;
  userRoleTitle?: string;
  onSearch?: (query: string) => void;
  children: React.ReactNode;
}

export function AppShell({
  role,
  schoolName,
  campusName,
  epochText = "Academic Session",
  userName,
  userRoleTitle,
  onSearch,
  children,
}: AppShellProps) {
  const { profile, currentSchool } = useAuth();
  const isMobilePortal = role === "PARENT" || role === "STUDENT";

  const effectiveUserName = userName || profile?.full_name || (role === "SUPER_ADMIN" ? "Super Admin" : "User");
  const effectiveSchoolName = schoolName || currentSchool?.name || currentSchool?.legal_name || "School Administration";
  const effectiveCampusName = campusName || currentSchool?.school_code || "Main Campus";
  const effectiveUserTitle = userRoleTitle || `${role} • ${effectiveSchoolName}`;

  return (
    <div
      className="min-h-screen font-sans antialiased transition-colors duration-200 bg-[#F8FAFC] dark:bg-[#070D1B] text-slate-900 dark:text-slate-100 selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900/50 dark:selection:text-blue-200"
    >
      {/* Impersonation Banner if active */}
      <ImpersonationBanner />

      {/* Desktop Persistent Sidebar */}
      <div className={cn("hidden md:block")}>
        <Sidebar
          role={role}
          schoolName={effectiveSchoolName}
          userName={effectiveUserName}
          userRoleTitle={effectiveUserTitle}
        />
      </div>

      {/* Main Content Area */}
      <div className="md:pl-sidebar-w flex flex-col min-h-screen">
        {/* Desktop Sticky Topbar */}
        <div className="hidden md:block">
          <Topbar
            role={role}
            schoolName={effectiveSchoolName}
            campusName={effectiveCampusName}
            epochText={epochText}
            userName={effectiveUserName}
            userTitle={effectiveUserTitle}
            onSearch={onSearch}
          />
        </div>

        {/* Mobile Header for all screens */}
        <div className="md:hidden flex items-center justify-between h-16 px-4 bg-[#080E1E] border-b border-[#131F37] sticky top-0 z-40 shadow-xs transition-colors duration-200 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <svg
                className="w-4 h-4"
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
            <span className="font-sans text-base font-bold text-white tracking-wide">Agragati</span>
            <span className="text-[9px] font-bold text-blue-300 uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/40">
              {role}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {effectiveUserName.slice(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Workspace Canvas */}
        <main
          className={cn(
            "flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:pt-24 min-h-[calc(100vh-4rem)]",
            isMobilePortal && "pb-24 md:pb-8"
          )}
        >
          {children}
        </main>

        {/* Mobile Bottom Navigation for Parent/Student */}
        <MobileNav role={role} />
      </div>
    </div>
  );
}

