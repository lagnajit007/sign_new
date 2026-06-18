"use client"

import { useRef } from "react"
import Image from "next/image"
import { useScrollReveal } from "@/lib/animations"
import { CheckCircle, Zap, Target, BarChart3, Award } from "lucide-react"

export default function AIShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null!)
  useScrollReveal(sectionRef)

  return (
    <section data-reveal ref={sectionRef} className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bg/50 to-white pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-soft rounded-full text-brand text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            AI Recognition
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
            See AI Recognition In Action
          </h2>
          <p className="text-lg text-ink-soft">
            Real-time gesture detection powered by TensorFlow computer vision. Every movement analyzed in milliseconds.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start" data-reveal-child>
          <div className="lg:col-span-3 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-brand-soft bg-gray-900 aspect-video">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-gray-800">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-brand/20 border-2 border-brand/30 flex items-center justify-center animate-pulse">
                        <Image
                          src="/S-logo.svg"
                          alt="Camera feed placeholder"
                          width={40}
                          height={40}
                          className="opacity-60"
                        />
                      </div>
                      <p className="text-white/40 text-sm">Camera feed placeholder</p>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white/70 text-xs font-medium">Recognition Confidence</span>
                          <span className="text-success text-xs font-bold">92%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-success rounded-full" style={{ width: "92%" }} />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-xs font-medium">Sign: A</div>
                        <div className="text-success text-xs">Correct ✓</div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <span className="text-white/70 text-xs">LIVE</span>
                    <span className="w-2 h-2 bg-red-500 rounded-full inline-block ml-2 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-bg rounded-2xl p-5 border border-brand-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink">Instant Feedback</div>
                  <div className="text-xs text-ink-soft">Know immediately if your sign is correct</div>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="px-2.5 py-1 bg-success/10 text-success text-xs rounded-full font-medium">Correct</span>
                <span className="px-2.5 py-1 bg-coral/10 text-coral text-xs rounded-full font-medium">Try Again</span>
              </div>
            </div>

            <div className="bg-bg rounded-2xl p-5 border border-brand-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink">Track Everything</div>
                  <div className="text-xs text-ink-soft">XP, streaks, and achievements</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-soft">Level 4 Progress</span>
                  <span className="text-ink font-medium">320 / 500 XP</span>
                </div>
                <div className="h-1.5 bg-brand-soft rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full" style={{ width: "64%" }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-ink-soft">Current Streak</span>
                  <span className="text-gold font-medium">7 days 🔥</span>
                </div>
              </div>
            </div>

            <div className="bg-bg rounded-2xl p-5 border border-brand-soft">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky/10 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-sky" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink">Accuracy Over Time</div>
                  <div className="text-xs text-ink-soft">Watch your improvement with every session</div>
                </div>
              </div>
              <div className="mt-3 flex items-end gap-1 h-10">
                {[40, 55, 48, 62, 70, 68, 78, 85, 82, 92].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-brand rounded-t transition-all duration-500"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-ink-soft mt-1">
                <span>Day 1</span>
                <span>Day 10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
