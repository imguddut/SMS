import * as React from "react";

export function PlatformAdminFooter() {
  return (
    <div className="mt-8 pt-4 pb-6 border-t border-slate-200/80 dark:border-[#131F37] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
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
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
            The King&apos;s College &amp; Academy
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wider uppercase">
            GENEVA CAMPUS
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
        <span>System Status: Secure &amp; Active</span>
        <span>•</span>
        <span>India Cluster</span>
        <span>•</span>
        <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          Online
        </span>
      </div>
    </div>
  );
}

