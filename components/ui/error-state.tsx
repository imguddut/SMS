import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Operational Anomaly Detected",
  message = "An unexpected error occurred while communicating with the sovereign cluster.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-10 space-y-4 rounded-lg bg-error-container/30 border border-error/20",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-error-container text-error flex items-center justify-center shadow-sm">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="max-w-md space-y-1">
        <h4 className="font-serif text-lg font-medium text-error">{title}</h4>
        <p className="font-sans text-xs text-on-surface-variant">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Re-authenticate &amp; Retry
        </Button>
      )}
    </div>
  );
}
