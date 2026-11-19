import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata = { title: "Sign in · Sanjog" };

export default function SignInPage() {
  return (
    <AuthShell
      title="Sign in to Sanjog"
      aside={
        <>
          New here?{" "}
          <Link href="/sign-up" className="rounded font-medium text-brand underline-offset-2 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthShell>
  );
}
