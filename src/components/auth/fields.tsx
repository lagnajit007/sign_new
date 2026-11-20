"use client";

import { useRef, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { cn } from "@/lib/utils";

/** Shared form parts for the auth pages: one field style, one button style, one error voice. */

export function Field({
  label,
  error,
  hint,
  trailing,
  className,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: React.ReactNode; trailing?: React.ReactNode }) {
  // Stable across server and client (useId differs here because Clerk's provider loads dynamically).
  const id = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[14px] font-medium text-fg">
          {label}
        </label>
        {trailing}
      </div>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-11 w-full rounded-[10px] border bg-white px-3.5 text-[15px] text-fg placeholder:text-zinc-400 transition-[border-color,box-shadow] outline-none",
          "focus:border-brand focus:ring-4 focus:ring-brand/15",
          error ? "border-red-500" : "border-line-strong hover:border-zinc-400",
        )}
        {...input}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] text-red-700" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function PasswordField(props: Omit<React.ComponentProps<typeof Field>, "type">) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Field {...props} type={show ? "text" : "password"} className={props.className} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-1.5 top-[34px] grid size-8 place-items-center rounded-md text-fg-subtle hover:text-fg"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function SubmitButton({ busy, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button
      type="submit"
      disabled={busy || rest.disabled}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand text-[15px] font-medium text-brand-fg transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70"
      {...rest}
    >
      {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-[10px] bg-red-50 px-3.5 py-2.5 text-[14px] text-red-800" role="alert">
      {message}
    </p>
  );
}

/** Six boxes for an email code: auto-advance, backspace back, paste fills all. */
export function CodeInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
  const set = (i: number, d: string) => {
    const next = digits.slice();
    next[i] = d;
    onChange(next.join("").slice(0, 6));
  };
  return (
    <div className="flex gap-2" role="group" aria-label="6-digit code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          autoFocus={i === 0}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(-1);
            set(i, v);
            if (v && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          onPaste={(e) => {
            const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (p) {
              e.preventDefault();
              onChange(p);
              refs.current[Math.min(p.length, 5)]?.focus();
            }
          }}
          className="h-14 w-full min-w-0 rounded-[10px] border border-line-strong bg-white text-center text-[22px] font-medium text-fg tabular-nums outline-none transition-[border-color,box-shadow] focus:border-brand focus:ring-4 focus:ring-brand/15"
        />
      ))}
    </div>
  );
}

/** Clerk error codes → plain sentences, and which field they belong to. */
export function readClerkError(err: unknown): { field?: "email" | "password" | "code" | "name"; message: string } {
  if (!isClerkAPIResponseError(err)) return { message: "Something went wrong. Check your connection and try again." };
  const e = err.errors[0];
  switch (e?.code) {
    case "form_identifier_not_found":
      return { field: "email", message: "No account uses that email. Create one instead." };
    case "form_password_incorrect":
      return { field: "password", message: "That password doesn't match this email." };
    case "form_identifier_exists":
      return { field: "email", message: "That email already has an account. Sign in instead." };
    case "form_password_pwned":
      return { field: "password", message: "This password has appeared in a data breach. Choose a different one." };
    case "form_password_length_too_short":
      return { field: "password", message: "Use at least 8 characters." };
    case "form_password_not_strong_enough":
      return { field: "password", message: "Choose a stronger password: longer, or mix in numbers and symbols." };
    case "form_param_format_invalid":
      return e.meta?.paramName === "email_address" || e.meta?.paramName === "identifier"
        ? { field: "email", message: "Enter a valid email address." }
        : { message: e.longMessage ?? e.message };
    case "form_code_incorrect":
      return { field: "code", message: "That code isn't right. Check the email and try again." };
    case "verification_expired":
      return { field: "code", message: "That code has expired. Send a new one." };
    case "strategy_for_user_invalid":
      return { message: "This account signs in with Google or LinkedIn. Use the button below." };
    case "too_many_requests":
      return { message: "Too many attempts. Wait a minute and try again." };
    case "session_exists":
      return { message: "You're already signed in." };
    default:
      return { message: e?.longMessage ?? e?.message ?? "Something went wrong. Try again." };
  }
}
