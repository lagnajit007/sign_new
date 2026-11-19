"use client"

import Link from "next/link"
import { SignedOut, SignedIn, SignUpButton } from "@clerk/nextjs"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/arc/button/button"

export default function FinalCTA() {
  return (
    <section className="py-20 md:py-28 bg-zinc-950 relative overflow-hidden">

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Ready to Start Signing?
        </h2>

        <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
          Free to use, no credit card required. Learn the sign language alphabet and numbers with live feedback from your webcam.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <SignedOut>
            <SignUpButton mode="redirect">
              <Button variant="secondary" size="lg">
                Start Learning Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-zinc-950 rounded-full text-base font-semibold hover:bg-white/90 transition hover:scale-[1.02]"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </SignedIn>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/30 text-white rounded-full text-base font-medium hover:bg-white/10 transition"
          >
            Read Our Accessibility Commitment
          </Link>
        </div>

        <p className="text-white/60 text-sm mt-6">
          Free forever · No credit card · Works in your browser
        </p>
      </div>
    </section>
  )
}
