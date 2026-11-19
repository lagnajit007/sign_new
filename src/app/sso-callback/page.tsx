import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export const metadata = { title: "Signing you in · Sanjog" };

/** Finishes Google / LinkedIn sign-in. A new person is signed up on the way through. */
export default function SSOCallbackPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas text-[15px] text-fg-muted">
      <p role="status">Signing you in…</p>
      <AuthenticateWithRedirectCallback signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard" />
    </div>
  );
}
