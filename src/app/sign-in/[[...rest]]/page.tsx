import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { safeRedirect } from "@/components/auth/safe-redirect";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata = { title: "Sign in · Sanjog" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const to = safeRedirect((await searchParams).redirect_url);
  // Already signed in: go straight to the app instead of showing a form that would refuse.
  const { userId } = await auth();
  if (userId) redirect(to);

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
      <SignInForm redirectTo={to} />
    </AuthShell>
  );
}
