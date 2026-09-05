import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-sans text-xs font-semibold uppercase tracking-wider text-on-surface"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-outline">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            ref={ref}
            className={cn(
              "h-10 w-full rounded-md bg-surface-container-low px-3.5 text-sm text-on-surface placeholder:text-outline transition-all duration-150",
              "border border-outline-variant/60 focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/10",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error && "border-error focus:border-error focus:ring-error/10",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-outline">
              {rightIcon}
            </div>
          )}
        </div>
        {hint && !error && (
          <p className="font-sans text-xs text-on-surface-variant">{hint}</p>
        )}
        {error && (
          <p className="font-sans text-xs font-medium text-error">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
