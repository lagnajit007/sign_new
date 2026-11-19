"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs"
import { ArrowRight, Play } from "lucide-react"
import { useHeroTimeline } from "@/lib/animations"
import { Button } from "@/components/arc/button/button"

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null!)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useHeroTimeline(sectionRef, mounted)

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center pt-20 md:pt-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-white to-white pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-brand/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-sky/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <p className="hero-title text-brand text-sm font-semibold tracking-wide mb-5">
              Fingerspelling · A–Z and 0–9
            </p>

            <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-bold text-ink leading-tight mb-6">
              Learn Sign Language With{" "}
              <span className="text-brand">Real-Time AI</span> Feedback
            </h1>

            <p className="hero-subtitle text-lg text-ink-soft max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Hold up your hand, make a letter, and Sanjog tells you right away whether it reads the sign,
              and how sure it is. Free, in your browser, no special hardware.
            </p>

            <div className="hero-cta flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <SignedOut>
                <SignUpButton mode="redirect">
                  <Button size="lg">
                    Start Learning Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand text-white rounded-full text-base font-semibold hover:bg-brand-dark transition hover:scale-[1.03] shadow-btn"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </SignedIn>
              <a href="#how-it-works" className="inline-flex items-center gap-2 px-8 py-3.5 text-ink border-2 border-brand-soft rounded-full text-base font-medium hover:border-brand hover:text-brand transition hover:scale-[1.02]">
                <Play className="w-4 h-4" />
                See how it works
              </a>
            </div>

            <div className="hero-subtitle mt-8 flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-ink-soft">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-success rounded-full" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-success rounded-full" />
                Works in your browser
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-success rounded-full" />
                Video stays on your device
              </span>
            </div>
          </div>

          <div className="hero-images relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-brand-soft bg-gradient-to-br from-brand/5 to-sky/5">
              <Image
                src="/hero-img.png"
                alt="Sanjog app interface showing sign language recognition"
                width={600}
                height={450}
                className="w-full h-auto object-cover"
                priority
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl pointer-events-none" />
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg border border-brand-soft p-4 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                  <span className="text-success text-lg">✓</span>
                </div>
                <div>
                  <div className="text-xs text-ink-soft">Recognition</div>
                  <div className="text-sm font-bold text-success">Instant feedback</div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg border border-brand-soft p-4 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
                  <span className="text-gold text-lg">✦</span>
                </div>
                <div>
                  <div className="text-xs text-ink-soft">Every correct sign</div>
                  <div className="text-sm font-bold text-gold">+10 XP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
