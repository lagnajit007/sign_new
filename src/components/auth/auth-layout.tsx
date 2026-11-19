import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { HandMesh } from "@/components/art/hand-mesh";

/** Clerk appearance shared by sign-in and sign-up, matched to the app tokens. */
export const clerkAppearance = {
  layout: { logoPlacement: "none" as const, socialButtonsVariant: "iconButton" as const },
  variables: {
    colorPrimary: "#5b35f0",
    colorText: "#18181b",
    colorTextSecondary: "#52525b",
    colorInputText: "#18181b",
    colorBackground: "#ffffff",
    borderRadius: "0.5rem",
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "shadow-none border-0 p-0 bg-transparent",
    header: "hidden",
    footer: "bg-transparent",
  },
};

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div data-surface="marketing" className="grid min-h-screen bg-canvas md:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-zinc-950 p-10 text-white md:flex md:flex-col md:justify-between">
        <Link href="/" className="flex items-center gap-2 rounded-lg" aria-label="Sanjog home">
          <Image src="/S-logo.svg" alt="" width={22} height={22} className="invert" />
          <span className="text-[15px] font-semibold">Sanjog</span>
        </Link>
        <div className="relative">
          <HandMesh sign="B" className="mb-8 size-56 text-violet-300" />
          <p className="max-w-sm font-display text-2xl font-semibold leading-snug tracking-tight">
            Make a letter. See what it reads. Get it right.
          </p>
          <p className="mt-3 max-w-sm text-sm text-white/60">
            Live feedback on fingerspelling A–Z and 0–9, in your browser. Your video never leaves your device.
          </p>
        </div>
        <p className="text-xs text-white/40">© {new Date().getFullYear()} Sanjog</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 rounded-lg md:hidden" aria-label="Sanjog home">
            <Image src="/S-logo.svg" alt="" width={22} height={22} className="dark:invert" />
            <span className="text-[15px] font-semibold text-fg">Sanjog</span>
          </Link>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">{title}</h1>
          <p className="mt-1.5 text-sm text-fg-muted">{subtitle}</p>
          <div className="mt-6 rounded-xl border border-line bg-white p-5 dark:bg-white">{children}</div>
          <p className="mt-6 text-center text-xs text-fg-subtle">
            By continuing you agree to our{" "}
            <Link href="/terms" className="rounded underline-offset-2 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="rounded underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
