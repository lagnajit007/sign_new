"use client"

import { useRef, useState, useEffect } from "react"
import { useScrollReveal } from "@/lib/animations"
import { Users, BookOpen, Target, Award } from "lucide-react"

const stats = [
  { icon: Users, label: "Active Learners", value: 5000, suffix: "+" },
  { icon: BookOpen, label: "Lessons Completed", value: 50000, suffix: "+" },
  { icon: Target, label: "Recognition Accuracy", value: 94, suffix: "%" },
  { icon: Award, label: "Signs Mastered", value: 80, suffix: "+" },
]

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null!)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.3 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    let frame = 0
    const totalFrames = 60
    const step = target / totalFrames
    const animate = () => {
      frame++
      setCount(Math.min(Math.round(step * frame), target))
      if (frame < totalFrames) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [visible, target])

  return <div ref={ref} className="text-3xl sm:text-4xl font-bold text-ink">{count.toLocaleString()}{suffix}</div>
}

export default function CommunityAndImpact() {
  const sectionRef = useRef<HTMLDivElement>(null!)
  useScrollReveal(sectionRef)

  return (
    <section data-reveal ref={sectionRef} className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-brand-soft to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
            Growing Together
          </h2>
          <p className="text-lg text-ink-soft">
            Every learner, every sign mastered, every streak maintained — it all adds up.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8" data-reveal-child>
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="text-center">
                <div className="w-14 h-14 bg-brand-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-brand" />
                </div>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                <div className="text-sm text-ink-soft mt-1">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
