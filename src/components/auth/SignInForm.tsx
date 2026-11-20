"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { CodeInput, Field, FormError, PasswordField, SubmitButton, readClerkError } from "./fields";
import { OAuthButtons, OrDivider } from "./OAuthButtons";

type Step = "credentials" | "reset-code";

export function SignInForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; code?: string; form?: string }>({});

  const fail = (err: unknown) => {
    const { field, message } = readClerkError(err);
    setErrors(field ? { [field]: message } : { form: message });
  };

  const finish = async (sessionId: string | null) => {
    await setActive?.({ session: sessionId });
    router.push(redirectTo);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (!email.trim()) return setErrors({ email: "Enter your email." });
    if (!password) return setErrors({ password: "Enter your password." });
    setErrors({});
    setBusy(true);
    try {
      const res = await signIn.create({ identifier: email.trim(), password });
      if (res.status === "complete") return await finish(res.createdSessionId);
      setErrors({ form: "Your account needs an extra step we don't support yet. Use Google or LinkedIn, or contact us." });
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const startReset = async () => {
    if (!isLoaded) return;
    if (!email.trim()) {
      setErrors({ email: "Enter your email first, then choose Forgot password." });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: email.trim() });
      setStep("reset-code");
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setErrors({});
    setBusy(true);
    try {
      const res = await signIn.attemptFirstFactor({ strategy: "reset_password_email_code", code, password: newPassword });
      if (res.status === "complete") return await finish(res.createdSessionId);
      setErrors({ form: "That didn't finish. Try again." });
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  if (step === "reset-code") {
    return (
      <form onSubmit={onReset} className="space-y-5" noValidate>
        <p className="text-[15px] text-fg-muted">
          We sent a 6-digit code to <span className="font-medium text-fg">{email}</span>. Enter it and choose a new password.
        </p>
        <div>
          <CodeInput value={code} onChange={setCode} disabled={busy} />
          {errors.code && <p className="mt-1.5 text-[13px] text-red-700" role="alert">{errors.code}</p>}
        </div>
        <PasswordField
          label="New password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={errors.password}
          hint="At least 8 characters"
          required
        />
        <FormError message={errors.form} />
        <SubmitButton busy={busy} disabled={code.length < 6 || newPassword.length < 8}>
          Reset password and sign in
        </SubmitButton>
        <button type="button" onClick={() => setStep("credentials")} className="w-full rounded text-[14px] text-fg-muted hover:text-fg">
          Back to sign in
        </button>
      </form>
    );
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          trailing={
            <button type="button" onClick={startReset} className="rounded text-[13px] text-fg-muted underline-offset-2 hover:text-fg hover:underline">
              Forgot password?
            </button>
          }
          required
        />
        <FormError message={errors.form} />
        <SubmitButton busy={busy}>
          Sign in
        </SubmitButton>
      </form>
      <OrDivider />
      <OAuthButtons mode="sign-in" redirectTo={redirectTo} />
    </>
  );
}
