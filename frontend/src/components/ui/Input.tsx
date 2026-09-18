"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

// ─── Floating Label Input ─────────────────────────────────────────────────────
interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, hint, type, className, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const isPassword = type === "password";
    const hasValue = !!props.value || !!props.defaultValue;
    const floated = focused || hasValue || !!props.placeholder;

    return (
      <div className="flex flex-col gap-1">
        <div className="relative">
          <input
            ref={ref}
            type={isPassword && showPwd ? "text" : type}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={clsx(
              "w-full bg-[#333] rounded text-white text-[15px] outline-none transition-all duration-200",
              "placeholder-transparent",
              isPassword ? "pr-11" : "pr-4",
              error ? "border-2 border-primary" : focused ? "border-2 border-white" : "border-2 border-transparent",
              className
            )}
            style={{ padding: "22px 16px 8px" }}
            {...props}
          />
          <label
            className="absolute left-4 pointer-events-none transition-all duration-200 text-text-secondary"
            style={{
              top: floated ? "6px" : "50%",
              transform: floated ? "none" : "translateY(-50%)",
              fontSize: floated ? "11px" : "14px",
              letterSpacing: floated ? "0.05em" : "normal",
              textTransform: floated ? "uppercase" : "none",
            }}
          >
            {label}
          </label>
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPwd((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-primary font-medium">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-text-secondary">{hint}</p>
        )}
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

// ─── Standard Input ───────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-text-secondary tracking-widest uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            "w-full h-11 bg-surface border rounded px-4 text-white text-sm outline-none",
            "placeholder:text-text-secondary transition-colors duration-200",
            icon && "pl-10",
            error
              ? "border-primary focus:border-primary"
              : "border-border focus:border-white/60",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-primary">{error}</p>}
      {hint && !error && <p className="text-xs text-text-secondary">{hint}</p>}
    </div>
  )
);
Input.displayName = "Input";

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-text-secondary tracking-widest uppercase">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={clsx(
          "w-full h-11 bg-surface border rounded px-4 text-white text-sm outline-none",
          "transition-colors duration-200 cursor-pointer",
          error ? "border-primary" : "border-border focus:border-white/60",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-primary">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-text-secondary tracking-widest uppercase">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={4}
        className={clsx(
          "w-full bg-surface border rounded px-4 py-3 text-white text-sm outline-none resize-none",
          "placeholder:text-text-secondary transition-colors duration-200",
          error ? "border-primary" : "border-border focus:border-white/60",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-primary">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";

// ─── Checkbox ─────────────────────────────────────────────────────────────────
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          {...props}
        />
        <div
          className={clsx(
            "w-5 h-5 rounded-sm border-2 transition-all",
            props.checked
              ? "bg-white border-white"
              : "bg-transparent border-text-secondary group-hover:border-white/60"
          )}
        >
          {props.checked && (
            <svg
              viewBox="0 0 12 10"
              className="absolute inset-0 m-auto w-3 h-2.5"
            >
              <path
                d="M1 5l3 3.5L11 1"
                stroke="#141414"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm text-text-secondary group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  );
}
