"use client"

import Link from "next/link"
import { SignedOut, SignedIn, SignUpButton } from "@clerk/nextjs"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/arc/button/button"

export default function FinalCTA() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-brand via-purple-600 to-brand-dark relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Start Your Journey Today
        </div>

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
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-brand rounded-full text-base font-bold hover:bg-white/90 transition-all hover:scale-[1.03] shadow-lg"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </SignedIn>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/30 text-white rounded-full text-base font-medium hover:bg-white/10 transition-all"
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
