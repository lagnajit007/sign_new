import { SignUp } from "@clerk/nextjs";
import { AuthLayout, clerkAppearance } from "@/components/auth/auth-layout";

export const metadata = { title: "Create your account · Sanjog" };

export default function SignUpPage() {
  return (
    <AuthLayout title="Create your account" subtitle="Free to use. Start practising in under a minute.">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" fallbackRedirectUrl="/dashboard" appearance={clerkAppearance} />
    </AuthLayout>
  );
}
