import * as React from "react";
import { cn } from "@/lib/utils";

export function SchoolCrest({
  slug,
  name,
  className,
  size = "md",
}: {
  slug?: string;
  name?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const isDps = slug?.includes("dps") || name?.toLowerCase().includes("delhi public");
  const isNps = slug?.includes("nps") || name?.toLowerCase().includes("national public");
  const isCathedral = slug?.includes("cathedral") || name?.toLowerCase().includes("cathedral");

  const sizeClass =
    size === "sm" ? "w-7 h-7 text-xs" : size === "lg" ? "w-12 h-12 text-base" : "w-9 h-9 text-sm";

  if (isDps) {
    return (
      <div
        className={cn(
          "rounded-lg flex items-center justify-center font-bold shrink-0 shadow-xs border bg-emerald-50 border-emerald-200 text-emerald-700",
          sizeClass,
          className
        )}
        title="Delhi Public School, R.K. Puram"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z" />
          <path d="M12 6v6M9 9h6" />
          <circle cx="12" cy="15" r="1.5" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (isNps) {
    return (
      <div
        className={cn(
          "rounded-lg flex items-center justify-center font-bold shrink-0 shadow-xs border bg-blue-50 border-blue-200 text-blue-700",
          sizeClass,
          className
        )}
        title="National Public School, Indiranagar"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
          <path d="M8 12h8" />
        </svg>
      </div>
    );
  }

  if (isCathedral) {
    return (
      <div
        className={cn(
          "rounded-lg flex items-center justify-center font-bold shrink-0 shadow-xs border bg-rose-50 border-rose-200 text-rose-700",
          sizeClass,
          className
        )}
        title="The Cathedral & John Connon School"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4h16v16H4z" />
          <path d="M12 4v16M4 12h16" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg flex items-center justify-center font-bold shrink-0 shadow-xs border bg-slate-100 border-slate-200 text-slate-700",
        sizeClass,
        className
      )}
    >
      {name?.slice(0, 2).toUpperCase() || "SC"}
    </div>
  );
}

