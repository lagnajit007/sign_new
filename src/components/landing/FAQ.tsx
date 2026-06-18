"use client"

import { useState } from "react"
import { useRef } from "react"
import { useScrollReveal } from "@/lib/animations"
import { ChevronDown, HelpCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const faqs = [
  {
    q: "What is Sanjog?",
    a: "Sanjog is an AI-powered sign language learning platform. It uses your webcam and computer vision technology to recognize your hand gestures in real-time, giving instant feedback on your signing accuracy.",
  },
  {
    q: "How does AI recognition work?",
    a: "Sanjog uses TensorFlow.js with a handpose model that tracks 21 key points on your hand. When you sign, the AI analyzes hand shape, position, and movement patterns, comparing them against reference data to determine accuracy.",
  },
  {
    q: "Is Sanjog free?",
    a: "Yes! Core learning features including lessons, AI recognition, progress tracking, and achievements are completely free. We believe sign language education should be accessible to everyone.",
  },
  {
    q: "Do I need a webcam?",
    a: "A webcam is required for the interactive practice mode with real-time AI feedback. However, you can browse lessons, learn signs visually, and track progress without a camera.",
  },
  {
    q: "Can beginners use Sanjog?",
    a: "Absolutely. Sanjog is designed for complete beginners. Lessons start with the alphabet and basic signs, with progressive difficulty as you improve. No prior experience needed.",
  },
  {
    q: "How accurate is the recognition?",
    a: "Our AI achieves approximately 94% accuracy on standard ASL alphabet gestures under good lighting conditions. Accuracy improves with proper hand positioning and adequate lighting.",
  },
  {
    q: "Is my camera footage stored?",
    a: "No. All camera processing happens locally in your browser using TensorFlow.js. Your video feed is never recorded, stored, or transmitted to any server.",
  },
]

function FAQItem({ item, index }: { item: typeof faqs[0]; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="border border-brand-soft rounded-2xl overflow-hidden bg-surface transition-all duration-200 hover:shadow-card"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left"
        aria-expanded={open}
        aria-controls={`faq-answer-${index}`}
      >
        <span className="text-sm font-semibold text-ink pr-4">{item.q}</span>
        <ChevronDown
          className={`w-4 h-4 text-ink-soft flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={`faq-answer-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-sm text-ink-soft leading-relaxed">{item.a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const sectionRef = useRef<HTMLDivElement>(null!)
  useScrollReveal(sectionRef)

  return (
    <section id="faq" data-reveal ref={sectionRef} className="py-20 md:py-28 bg-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-soft rounded-full text-brand text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-ink-soft">
            Everything you need to know about Sanjog.
          </p>
        </div>

        <div className="space-y-3" data-reveal-child>
          {faqs.map((item, i) => (
            <FAQItem key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
