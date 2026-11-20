"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
type OAuthStrategy = "oauth_google" | "oauth_linkedin_oidc";

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-[18px]" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path
        fill="#0A66C2"
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"
      />
    </svg>
  );
}

const PROVIDERS: { strategy: OAuthStrategy; label: string; Mark: () => React.JSX.Element }[] = [
  { strategy: "oauth_google", label: "Google", Mark: GoogleMark },
  { strategy: "oauth_linkedin_oidc", label: "LinkedIn", Mark: LinkedInMark },
];

/**
 * Continue with Google / LinkedIn. Sign-in and sign-up both go through Clerk's
 * redirect flow; a new person signing in with a provider gets an account
 * created on the way back (transfer handled in /sso-callback).
 */
export function OAuthButtons({ mode, redirectTo = "/dashboard" }: { mode: "sign-in" | "sign-up"; redirectTo?: string }) {
  const { signIn, isLoaded: inLoaded } = useSignIn();
  const { signUp, isLoaded: upLoaded } = useSignUp();
  const [busy, setBusy] = useState<OAuthStrategy | null>(null);

  const go = async (strategy: OAuthStrategy) => {
    if (!inLoaded || !upLoaded) return;
    setBusy(strategy);
    const target = mode === "sign-in" ? signIn : signUp;
    try {
      await target.authenticateWithRedirect({ strategy, redirectUrl: "/sso-callback", redirectUrlComplete: redirectTo });
    } catch {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PROVIDERS.map(({ strategy, label, Mark }) => (
        <button
          key={strategy}
          type="button"
          onClick={() => go(strategy)}
          disabled={busy !== null}
          className="inline-flex h-11 items-center justify-center gap-2.5 rounded-lg bg-white text-[15px] font-medium text-fg shadow-[inset_0_0_0_1px_var(--sj-line-strong)] transition-colors hover:bg-zinc-50 disabled:opacity-70"
        >
          {busy === strategy ? <Loader2 className="size-4 animate-spin text-fg-subtle" aria-hidden /> : <Mark />}
          {label}
        </button>
      ))}
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="my-7 flex items-center gap-4 text-[13px] text-fg-subtle" aria-hidden>
      <span className="h-px flex-1 bg-line" />
      or continue with
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
