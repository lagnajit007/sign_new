import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata = { title: "Create your account · Sanjog" };

export default function SignUpPage() {
  return (
    <AuthShell
      title="Start practising today"
      aside={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="rounded font-medium text-brand underline-offset-2 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
