"use client";

import { forwardRef, InputHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  suffix?: string;
  prefix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconPosition = "left",
      suffix,
      prefix,
      type = "text",
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-medium text-text-secondary">
            {label}
            {props.required && (
              <span className="text-danger ml-1">*</span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-xs text-text-muted select-none">
              {prefix}
            </span>
          )}

          {icon && iconPosition === "left" && (
            <span className="absolute left-3 text-text-muted flex items-center">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            className={cn(
              // Base
              "w-full h-9 rounded-lg text-sm",
              "bg-arkos-bg border border-arkos-border",
              "text-text-primary placeholder:text-text-muted",
              "transition-all duration-200",
              // Focus
              "focus:outline-none focus:border-arkos-blue focus:ring-1 focus:ring-arkos-blue/40",
              // Hover
              "hover:border-arkos-border-2",
              // Disabled
              "disabled:opacity-50 disabled:cursor-not-allowed",
              // Error
              error && "border-danger/60 focus:border-danger focus:ring-danger/40",
              // Padding
              icon && iconPosition === "left" ? "pl-9" : "pl-3",
              icon && iconPosition === "right" ? "pr-9" : isPassword ? "pr-9" : "pr-3",
              prefix && "pl-7",
              suffix && "pr-10",
              className
            )}
            {...props}
          />

          {icon && iconPosition === "right" && !isPassword && (
            <span className="absolute right-3 text-text-muted flex items-center">
              {icon}
            </span>
          )}

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-text-muted hover:text-text-primary transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}

          {suffix && (
            <span className="absolute right-3 text-xs text-text-muted select-none">
              {suffix}
            </span>
          )}
        </div>

        {error && (
          <p className="text-2xs text-danger flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-danger inline-block" />
            {error}
          </p>
        )}

        {hint && !error && (
          <p className="text-2xs text-text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// Textarea
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-medium text-text-secondary">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          className={cn(
            "w-full px-3 py-2.5 rounded-lg text-sm min-h-[80px] resize-y",
            "bg-arkos-bg border border-arkos-border",
            "text-text-primary placeholder:text-text-muted",
            "transition-all duration-200",
            "focus:outline-none focus:border-arkos-blue focus:ring-1 focus:ring-arkos-blue/40",
            "hover:border-arkos-border-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-danger/60 focus:border-danger",
            className
          )}
          {...props}
        />

        {error && (
          <p className="text-2xs text-danger">{error}</p>
        )}
        {hint && !error && (
          <p className="text-2xs text-text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
