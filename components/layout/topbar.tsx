"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/auth";
import { Bell, Search, Sun, Moon, ChevronDown, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NotificationDrawer } from "@/components/layout/notification-drawer";
import { fetchUserNotifications } from "@/lib/db/notifications";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

export interface TopbarProps {
  role: UserRole;
  schoolName?: string;
  campusName?: string;
  epochText?: string;
  userName?: string;
  userTitle?: string;
  onSearch?: (query: string) => void;
}

export function Topbar({
  role,
  schoolName = "The King's College & Academy",
  campusName = "GENEVA CAMPUS",
  epochText = "Daily Schedule • Michaelmas Term 2024–2025",
  userName = "Genevieve Laurent",
  userTitle = "SCHOLAR • FORM VI (GRADE 12-IB) • ROSEY MANOR",
}: TopbarProps) {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(3);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    async function getUnread() {
      try {
        const data = await fetchUserNotifications(role);
        setUnreadCount(data.unreadCount || 3);
      } catch (err) {
        console.error(err);
      }
    }
    getUnread();
  }, [role]);

  // Click outside to close user menu
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  return (
    <>
      <header className="fixed top-0 left-0 md:left-sidebar-w right-0 h-16 bg-white border-b border-slate-200/80 z-40 flex items-center justify-between px-4 md:px-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors duration-200">
        {/* Left: Cluster Status or Institution Context */}
        <div className="min-w-0 flex items-center gap-3 md:gap-4">
          {role === "SUPER_ADMIN" ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                aria-label="Menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div className="flex items-center gap-1.5 text-xs text-slate-800">
                  <span className="font-semibold">India Central Cluster</span>
                  <span className="text-slate-400 font-normal">•</span>
                  <span className="text-emerald-600 font-medium">Online</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-serif text-sm lg:text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight truncate">
                  {schoolName}
                </span>
                <span className="shrink-0 px-2 py-0.5 rounded bg-amber-100/90 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-transparent dark:border-amber-800/40 text-[9px] font-bold uppercase tracking-wider">
                  {campusName}
                </span>
              </div>
              <span className="font-sans text-xs text-stone-500 dark:text-stone-400 font-medium truncate hidden sm:block">
                {epochText}
              </span>
            </div>
          )}
        </div>

        {/* Center: Search Bar for SUPER_ADMIN */}
        {role === "SUPER_ADMIN" ? (
          <div className="relative hidden md:flex items-center flex-1 max-w-md mx-6">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search students, ledgers, records... (⌘K)"
              className="w-full h-9 pl-9 pr-4 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all font-sans"
            />
          </div>
        ) : null}

        {/* Right: Search, Actions, Notifications, Profile & Sign Out */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Quick Search for non SUPER_ADMIN */}
          {role !== "SUPER_ADMIN" && (
            <div className="relative hidden lg:flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search students, ledgers, records (⌘K)..."
                className="w-48 xl:w-72 h-9 pl-9 pr-4 bg-stone-100/80 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/80 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:bg-white dark:focus:bg-stone-800 focus:ring-1 focus:ring-amber-500/30 transition-all font-sans"
              />
            </div>
          )}

          {/* Action Icons: Theme Sun/Moon & Notification Bell */}
          <div className="flex items-center gap-1">
            {role !== "SUPER_ADMIN" && (
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-amber-300 transition-colors"
                aria-label="Toggle dark mode"
                title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {resolvedTheme === "dark" ? (
                  <Moon className="w-4 h-4 text-amber-400" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs">
                3
              </span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-0.5 sm:mx-1" />

          {/* User Identity Pill with Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 sm:gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors text-left focus:outline-none"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs",
                  role === "SUPER_ADMIN"
                    ? "bg-[#7C3AED] text-white"
                    : "bg-indigo-100 text-indigo-800 border border-indigo-200/50"
                )}
              >
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="hidden sm:flex flex-col text-left max-w-[140px] lg:max-w-[220px] min-w-0">
                <span className="font-sans text-xs font-semibold text-slate-900 leading-tight truncate">
                  {userName}
                </span>
                <span className="font-sans text-[9px] text-slate-500 font-medium tracking-tight truncate">
                  {userTitle}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="font-sans text-xs font-bold text-slate-900 truncate">{userName}</p>
                  <p className="font-sans text-[10px] text-slate-500 font-medium truncate mt-0.5 uppercase tracking-wider">
                    {role} • {campusName}
                  </p>
                </div>
                <div className="px-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Flyout Notification Drawer */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        role={role}
        onUnreadCountChange={setUnreadCount}
      />
    </>
  );
}
