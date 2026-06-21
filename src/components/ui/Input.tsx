// ─────────────────────────────────────────────────────────────────────────────
// Input — Reusable text input with optional adornments
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
  inputSize?: "sm" | "md";
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      leftAdornment,
      rightAdornment,
      inputSize = "md",
      error,
      label,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-label mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="search-wrapper">
          {leftAdornment && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none z-10">
              {leftAdornment}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "input",
              inputSize === "sm" && "input-sm",
              !!leftAdornment  && "!pl-9",
              !!leftAdornment  && "!pl-9",
              !!error && "border-[var(--color-danger-500)] focus:!shadow-[0_0_0_3px_rgb(244_63_94/0.2)]",
              className
            )}
            {...props}
          />
          {rightAdornment && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none z-10">
              {rightAdornment}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1 text-[11px] text-[var(--color-danger-500)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
