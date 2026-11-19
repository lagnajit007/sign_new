import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { HandMesh } from "@/components/art/hand-mesh";

/**
 * Split layout for sign-in and sign-up: a dark stage with the tracked hand on
 * the left (the same picture the product shows), the form on calm space on
 * the right. The stage hides on small screens.
 */
export function AuthShell({ title, aside, children }: { title: string; aside: ReactNode; children: ReactNode }) {
  return (
    <div data-surface="marketing" className="min-h-screen bg-canvas p-3 sm:p-4">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1280px] gap-4 sm:min-h-[calc(100vh-2rem)] lg:grid-cols-[1fr_1fr]">
        <aside className="relative hidden overflow-hidden rounded-[24px] bg-[#0b0b0e] lg:flex lg:flex-col lg:justify-between lg:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_42%,rgb(124_92_255/0.2),transparent_70%)]"
          />
          <Link href="/" className="relative flex w-fit items-center gap-2 rounded-lg" aria-label="Sanjog home">
            <Image src="/S-logo.svg" alt="" width={22} height={22} className="invert" />
            <span className="text-[15px] font-medium text-white">Sanjog</span>
          </Link>

          <div className="relative flex flex-1 items-center justify-center py-10">
            <HandMesh sign="L" className="h-[min(56vh,420px)] w-auto text-[#a78bfa] drop-shadow-[0_0_28px_rgb(167_139_250/0.45)]" />
          </div>

          <div className="relative">
            <p className="max-w-sm text-[26px] font-medium leading-[1.2] tracking-[-0.02em] text-white">
              Make a letter. See what Sanjog reads.
            </p>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-zinc-400">
              Practise A–Z and 0–9 with live feedback. Your video never leaves your device.
            </p>
          </div>
        </aside>

        <main className="flex items-center justify-center px-3 py-10 sm:px-8">
          <div className="w-full max-w-[420px]">
            <Link href="/" className="mb-10 flex w-fit items-center gap-2 rounded-lg lg:hidden" aria-label="Sanjog home">
              <Image src="/S-logo.svg" alt="" width={22} height={22} />
              <span className="text-[15px] font-medium text-fg">Sanjog</span>
            </Link>
            <h1 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-fg sm:text-[36px]">{title}</h1>
            <p className="mt-3 text-[15px] text-fg-muted">{aside}</p>
            <div className="mt-9">{children}</div>
            <p className="mt-8 text-[13px] leading-relaxed text-fg-subtle">
              By continuing you agree to our{" "}
              <Link href="/terms" className="rounded text-fg-muted underline underline-offset-2 hover:text-fg">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="rounded text-fg-muted underline underline-offset-2 hover:text-fg">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
