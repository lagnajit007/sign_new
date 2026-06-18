"use client"

import { useRef } from "react"
import Image from "next/image"
import { useScrollReveal } from "@/lib/animations"
import { Heart, Globe } from "lucide-react"

export default function WhySanjogExists() {
  const sectionRef = useRef<HTMLDivElement>(null!)
  useScrollReveal(sectionRef)

  return (
    <section data-reveal ref={sectionRef} className="py-20 md:py-28 bg-bg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-soft rounded-full text-brand text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              Why Sanjog Exists
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-6">
              Communication Shouldn&apos;t Have Barriers
            </h2>

            <div className="space-y-6 text-ink-soft leading-relaxed" data-reveal-child>
              <p>
                Over 70 million deaf people worldwide use sign language as their primary means of communication.
                Yet access to quality learning resources remains limited, expensive, and often outdated.
              </p>
              <p>
                We built Sanjog because everyone deserves the opportunity to learn sign language —
                regardless of location, income, or prior experience.
              </p>
              <p>
                By combining accessible technology with AI-powered recognition, we remove the
                traditional barriers to learning: expensive courses, lack of feedback, and limited practice opportunities.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4" data-reveal-child>
              {[
                { icon: Globe, label: "Free for everyone", desc: "No paywalls for core features" },
                { icon: Heart, label: "Built with care", desc: "Created alongside accessibility advocates" },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="bg-surface rounded-xl p-4 border border-brand-soft">
                    <Icon className="w-5 h-5 text-brand mb-2" />
                    <div className="text-sm font-semibold text-ink">{item.label}</div>
                    <div className="text-xs text-ink-soft">{item.desc}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div data-reveal-child className="relative">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-brand-soft">
              <Image
                src="/mudra.jpg"
                alt="Sign language hand gesture"
                width={500}
                height={600}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-surface rounded-2xl shadow-lg border border-brand-soft p-5 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <div className="text-sm font-bold text-ink">70M+</div>
                  <div className="text-xs text-ink-soft">Deaf sign language users worldwide</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
