"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/auth";
import {
  LayoutDashboard,
  CalendarDays,
  Receipt,
  BookOpen,
  Award,
  Bell,
} from "lucide-react";

export interface MobileNavProps {
  role: UserRole;
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();

  const getMobileItems = () => {
    if (role === "PARENT") {
      return [
        { label: "Home", href: "/parent/home", icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: "Attendance", href: "/parent/attendance", icon: <CalendarDays className="w-5 h-5" /> },
        { label: "Fees", href: "/parent/fees", icon: <Receipt className="w-5 h-5" /> },
        { label: "Homework", href: "/parent/homework", icon: <BookOpen className="w-5 h-5" /> },
        { label: "Notices", href: "/parent/notices", icon: <Bell className="w-5 h-5" /> },
      ];
    }
    if (role === "STUDENT") {
      return [
        { label: "Overview", href: "/student/home", icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: "Attendance", href: "/student/attendance", icon: <CalendarDays className="w-5 h-5" /> },
        { label: "Homework", href: "/student/homework", icon: <BookOpen className="w-5 h-5" /> },
        { label: "Results", href: "/student/results", icon: <Award className="w-5 h-5" /> },
        { label: "Notices", href: "/student/notices", icon: <Bell className="w-5 h-5" /> },
      ];
    }
    return [];
  };

  const items = getMobileItems();
  if (items.length === 0) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#12161f]/95 backdrop-blur-xl border-t border-stone-200/80 dark:border-stone-800 shadow-[0_-1px_8px_rgba(0,0,0,0.05)] md:hidden transition-colors duration-200">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-colors font-sans text-[11px]",
                isActive
                  ? "text-amber-800 dark:text-amber-400 font-bold"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium"
              )}
            >
              {item.icon}
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
