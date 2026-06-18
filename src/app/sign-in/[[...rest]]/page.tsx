import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FAF7FF]">
      {/* Left Image Section */}
      <div
        className="hidden md:flex md:w-1/2 relative p-3"
      >
        <div className="w-full h-full relative rounded-lg overflow-hidden">
          <Image
            src="/sign-img.png"
            alt="People communicating with sign language"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-4 py-6 md:px-6 md:py-8">
          {/* Header with logo */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <Image 
                src="/sanjog-logo.svg" 
                alt="Sanjog Logo" 
                width={150} 
                height={40} 
                className="object-contain" 
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-sm">
              Continue your sign language learning journey
            </p>
          </div>

          {/* SignIn Form */}
          <div className="mb-4">
            <SignIn
              path="/sign-in"
              routing="path"
              signUpUrl="/sign-up"
              redirectUrl="/dashboard"
              appearance={{
                layout: {
                  logoPlacement: "none",
                  socialButtonsVariant: "iconButton",
                },
                variables: {
                  colorPrimary: "#7D54FF",
                  colorText: "#2D1B69",
                  colorTextSecondary: "#7E7A93",
                  colorInputText: "#2D1B69",
                  colorBackground: "#ffffff",
                  borderRadius: "0.5rem",
                },
                elements: {
                  card: "shadow-none border-0",
                  header: "hidden",
                  formFieldInput:
                    "border border-gray-200 rounded-lg p-2 focus:border-[#7D54FF] focus:ring-1 focus:ring-[#7D54FF] transition-all",
                  formButtonPrimary:
                    "bg-gradient-to-r from-[#7D54FF] to-[#9B7CFF] text-white rounded-lg font-medium py-2 hover:opacity-90 transition-opacity",
                  socialButtonsBlockButton:
                    "border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors",
                  footerActionLink:
                    "text-[#7D54FF] hover:text-[#9B7CFF] font-medium transition-colors",
                  formFieldLabel: "text-sm font-medium text-gray-700",
                  formFieldError: "text-red-500 text-xs mt-1",
                },
              }}
            />
          </div>

          {/* Footer Links */}
          <div className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="text-[#7D54FF] hover:underline font-medium"
              aria-label="Sign up"
            >
              Sign up
            </Link>
          </div>
          
          {/* Terms and Privacy Links */}
          <div className="text-center text-xs text-gray-400 mt-8">
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              className="text-[#7D54FF] hover:underline"
              aria-label="Terms of Service"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-[#7D54FF] hover:underline"
              aria-label="Privacy Policy"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 