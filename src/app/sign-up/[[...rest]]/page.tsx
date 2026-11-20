import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { safeRedirect } from "@/components/auth/safe-redirect";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata = { title: "Create your account · Sanjog" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const to = safeRedirect((await searchParams).redirect_url);
  // Already signed in: go straight to the app instead of showing a form that would refuse.
  const { userId } = await auth();
  if (userId) redirect(to);

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
      <SignUpForm redirectTo={to} />
    </AuthShell>
  );
}
