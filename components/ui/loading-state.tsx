import * as React from "react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading sovereign records...",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 space-y-4 rounded-lg bg-surface-container-lowest/60 border border-outline-variant/30",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
        <div className="w-5 h-5 bg-primary-container rounded-md absolute flex items-center justify-center">
          <div className="w-2 h-2 bg-secondary rounded-full" />
        </div>
      </div>
      <p className="font-serif italic text-sm text-on-surface-variant animate-pulse">
        {message}
      </p>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3 p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/30">
      <div className="h-8 bg-surface-container-high rounded animate-pulse w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-10 bg-surface-container-low rounded animate-pulse flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
