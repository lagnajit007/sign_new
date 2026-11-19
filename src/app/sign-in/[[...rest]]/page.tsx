import { SignIn } from "@clerk/nextjs";
import { AuthLayout, clerkAppearance } from "@/components/auth/auth-layout";

export const metadata = { title: "Sign in · Sanjog" };

export default function SignInPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to pick up where you left off.">
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" appearance={clerkAppearance} />
    </AuthLayout>
  );
}
