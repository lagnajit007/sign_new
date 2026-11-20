"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { CodeInput, Field, FormError, PasswordField, SubmitButton, readClerkError } from "./fields";
import { OAuthButtons, OrDivider } from "./OAuthButtons";

export function SignUpForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const [step, setStep] = useState<"details" | "verify">("details");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errors, setErrors] = useState<{ email?: string; password?: string; code?: string; name?: string; form?: string }>({});

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const fail = (err: unknown) => {
    const { field, message } = readClerkError(err);
    setErrors(field ? { [field]: message } : { form: message });
  };

  const onDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setErrors({});
    if (!email.trim()) return setErrors({ email: "Enter your email." });
    if (password.length < 8) return setErrors({ password: "Use at least 8 characters." });
    setBusy(true);
    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName: first.trim() || undefined,
        lastName: last.trim() || undefined,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
      setCooldown(30);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (value: string) => {
    if (!isLoaded || value.length < 6 || busy) return;
    setErrors({});
    setBusy(true);
    try {
      const res = await signUp.attemptEmailAddressVerification({ code: value });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.push(redirectTo);
        return;
      }
      const missing = res.missingFields?.join(", ");
      setErrors({ form: missing ? `Your account still needs: ${missing}. Contact us and we'll sort it out.` : "That didn't finish. Try again." });
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const onVerify = (e: React.FormEvent) => {
    e.preventDefault();
    void verify(code);
  };

  // Submit as soon as the sixth digit lands.
  const onCode = (value: string) => {
    setCode(value);
    if (value.length === 6) void verify(value);
  };

  const resend = async () => {
    if (!isLoaded || cooldown > 0) return;
    setErrors({});
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setCooldown(30);
    } catch (err) {
      fail(err);
    }
  };

  if (step === "verify") {
    return (
      <form onSubmit={onVerify} className="space-y-5" noValidate>
        <p className="text-[15px] leading-relaxed text-fg-muted">
          Enter the 6-digit code we sent to <span className="font-medium text-fg">{email}</span>.
        </p>
        <div>
          <CodeInput value={code} onChange={onCode} disabled={busy} />
          {errors.code && (
            <p className="mt-1.5 text-[13px] text-red-700" role="alert">
              {errors.code}
            </p>
          )}
        </div>
        <FormError message={errors.form} />
        <SubmitButton busy={busy} disabled={code.length < 6}>
          Verify and continue
        </SubmitButton>
        <div className="flex items-center justify-between text-[14px]">
          <button type="button" onClick={() => setStep("details")} className="rounded text-fg-muted hover:text-fg">
            Change email
          </button>
          <button type="button" onClick={resend} disabled={cooldown > 0} className="rounded text-fg-muted hover:text-fg disabled:text-fg-subtle">
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      <form onSubmit={onDetails} className="space-y-5" noValidate>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Field label="First name" autoComplete="given-name" placeholder="Priya" value={first} onChange={(e) => setFirst(e.target.value)} />
          <Field label="Last name" autoComplete="family-name" placeholder="Nair" value={last} onChange={(e) => setLast(e.target.value)} />
        </div>
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint="At least 8 characters"
          required
        />
        {/* Clerk's bot protection renders its challenge here when needed. */}
        <div id="clerk-captcha" />
        <FormError message={errors.form} />
        <SubmitButton busy={busy}>
          Create account
        </SubmitButton>
      </form>
      <OrDivider />
      <OAuthButtons mode="sign-up" redirectTo={redirectTo} />
    </>
  );
}
