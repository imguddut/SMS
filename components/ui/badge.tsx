import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "active" | "pending" | "critical" | "neutral" | "gold" | "navy";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "neutral",
  size = "sm",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    active: "bg-[#3D5B42]/12 text-[#3D5B42] border-[#3D5B42]/20",
    pending: "bg-[#7A521E]/12 text-[#7A521E] border-[#7A521E]/20",
    critical: "bg-[#752D20]/12 text-[#752D20] border-[#752D20]/20",
    gold: "bg-secondary-fixed text-on-secondary-fixed border-secondary/20",
    navy: "bg-primary-container text-surface-bright border-primary/20",
    neutral: "bg-surface-container-high text-on-surface-variant border-outline-variant/40",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase",
    md: "px-2.5 py-1 text-xs font-semibold tracking-wide uppercase",
  };

  const dotColors = {
    active: "bg-[#3D5B42]",
    pending: "bg-[#7A521E]",
    critical: "bg-[#752D20]",
    gold: "bg-secondary",
    navy: "bg-secondary-container",
    neutral: "bg-outline",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-sans font-semibold leading-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dotColors[variant])} />}
      {children}
    </span>
  );
}
