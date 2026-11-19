"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "What is Sanjog?",
    a: "A free practice tool for the sign language alphabet (A–Z) and numbers (0–9). You make a sign in front of your webcam and it tells you, instantly, which sign it sees and how confident it is.",
  },
  {
    q: "How does recognition work?",
    a: "Your browser tracks 21 points on your hand with Google's MediaPipe hand tracker. A small trained model reads the shape those points make and names the letter or number, with a confidence score. A sign counts as correct at 70% confidence or higher.",
  },
  {
    q: "Is it free?",
    a: "Yes. Lessons, practice with live feedback, progress tracking, streaks and achievements are all free. There's no paid plan.",
  },
  {
    q: "Do I need a webcam?",
    a: "Yes, for practice: recognition needs to see your hand. You can still browse lessons and your progress without one.",
  },
  {
    q: "Is it for beginners?",
    a: "Yes. No experience needed. Start with any letter or number and go at your own pace.",
  },
  {
    q: "How accurate is it?",
    a: "It depends on lighting, camera angle and how clearly your hand is in frame. Even lighting and a plain background help the most, and every attempt shows the model's confidence so you can see what it sees.",
  },
  {
    q: "Is my video stored?",
    a: "No. Video is never recorded, stored or uploaded. When you complete a sign, 42 numbers describing your hand's shape are sent to Sanjog to check it, and only the result (sign, confidence, time) is saved to your account.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <section id="faq" className="scroll-mt-20 px-4 sm:px-6" style={{ paddingTop: "var(--mk-section-y)" }} aria-labelledby="faq-heading">
      <div className="mx-auto grid max-w-[1080px] gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <div>
          <h2 id="faq-heading" className="mk-h2 text-fg">
            Questions
          </h2>
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-fg-subtle">Anything else? Start a lesson and see for yourself. It takes a minute.</p>
        </div>
        <ul className="border-t border-line">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q} className="border-b border-line">
                <h3>
                  <button
                    className="flex w-full items-center justify-between gap-6 rounded-lg py-5 text-left text-[16px] font-medium text-fg transition-colors hover:text-fg-muted focus-visible:outline-2 focus-visible:outline-offset-2"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    {item.q}
                    <Plus
                      aria-hidden
                      className={cn("size-4 shrink-0 text-fg-subtle transition-transform duration-[160ms]", isOpen && "rotate-45 text-fg")}
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-${i}`}
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[38rem] pb-6 pr-10 text-[15px] leading-relaxed text-fg-muted">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
