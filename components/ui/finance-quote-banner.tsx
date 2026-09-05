"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface FinanceQuoteBannerProps {
  icon: React.ReactNode;
  iconBgClass?: string;
  title: string;
  subtitle: string;
  quote: string;
  className?: string;
}

export function FinanceQuoteBanner({
  icon,
  iconBgClass = "text-[#A36829]",
  title,
  subtitle,
  quote,
  className,
}: FinanceQuoteBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-[#F0E6D8] dark:border-stone-800 bg-[#FCFAF6] dark:bg-[#12161f] p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 select-none mt-6",
        className
      )}
    >
      {/* Background Mountain Art Silhouette */}
      <div className="absolute right-0 bottom-0 top-0 w-80 md:w-96 pointer-events-none opacity-40 dark:opacity-20 flex items-end justify-end">
        <svg
          viewBox="0 0 400 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#DEBA8C] dark:text-amber-600"
        >
          {/* Mountain Ridge 1 */}
          <polygon
            points="120,120 220,35 310,120"
            fill="currentColor"
            fillOpacity="0.35"
          />
          {/* Flag on Peak */}
          <line x1="220" y1="35" x2="220" y2="18" stroke="currentColor" strokeWidth="2" />
          <polygon points="220,18 238,24 220,30" fill="currentColor" />
          {/* Mountain Ridge 2 */}
          <polygon
            points="240,120 330,20 400,120"
            fill="currentColor"
            fillOpacity="0.5"
          />
          {/* Low Hills */}
          <polygon
            points="40,120 140,65 240,120"
            fill="currentColor"
            fillOpacity="0.2"
          />
        </svg>
      </div>

      {/* Left Icon + Text */}
      <div className="flex items-center gap-4 relative z-10">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
            iconBgClass
          )}
        >
          {icon}
        </div>
        <div>
          <h4 className="font-serif text-base md:text-lg font-bold text-[#0F172A] dark:text-stone-100 leading-tight">
            {title}
          </h4>
          <p className="font-sans text-xs text-[#64748B] dark:text-stone-400 mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Quote */}
      <div className="relative z-10 text-right md:pr-4">
        <p className="font-serif italic text-xs md:text-sm font-medium text-[#1E293B] dark:text-stone-200">
          &ldquo;{quote}&rdquo;
        </p>
        <div className="w-12 h-1 bg-[#D97706] rounded-full ml-auto mt-1.5" />
      </div>
    </div>
  );
}
