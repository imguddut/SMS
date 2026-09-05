"use client";

import * as React from "react";
import { UserRole } from "@/types/auth";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { ImpersonationBanner } from "./impersonation-banner";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  role: UserRole;
  schoolName?: string;
  campusName?: string;
  epochText?: string;
  userName?: string;
  userRoleTitle?: string;
  children: React.ReactNode;
}

export function AppShell({
  role,
  schoolName = "The King's College & Academy",
  campusName = "GENEVA CAMPUS",
  epochText = "Daily Schedule • Michaelmas Term 2024–2025",
  userName,
  userRoleTitle,
  children,
}: AppShellProps) {
  const isMobilePortal = role === "PARENT" || role === "STUDENT";
  const effectiveUserName = userName || (role === "SUPER_ADMIN" ? "Mr. Rajesh Pillai" : "Genevieve Laurent");
  const effectiveUserTitle = userRoleTitle || (role === "SUPER_ADMIN" ? "Platform Lead & Super Admin" : "SCHOLAR • FORM VI (GRADE 12-IB) • ROSEY MANOR");

  return (
    <div className={cn(
      "min-h-screen font-sans antialiased selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900/50 dark:selection:text-blue-200 transition-colors duration-200",
      role === "SUPER_ADMIN"
        ? "bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100"
        : "bg-[#FAF8F5] dark:bg-[#0c0f17] text-stone-900 dark:text-stone-100"
    )}>
      {/* Impersonation Banner if active */}
      <ImpersonationBanner />

      {/* Desktop Persistent Sidebar */}
      <div className={cn("hidden md:block")}>
        <Sidebar
          role={role}
          schoolName={schoolName}
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
            schoolName={schoolName}
            campusName={campusName}
            epochText={epochText}
            userName={effectiveUserName}
            userTitle={effectiveUserTitle}
          />
        </div>

        {/* Mobile Header for all screens */}
        <div className="md:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-[#12161f] border-b border-stone-200/80 dark:border-stone-800 sticky top-0 z-40 shadow-xs transition-colors duration-200">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Agragati</span>
            <span className="text-[9px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100/80 dark:bg-amber-950/60 border border-transparent dark:border-amber-800/40">
              {role}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shadow-xs border border-indigo-200/50 dark:border-indigo-800/50">
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

