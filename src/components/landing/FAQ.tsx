"use client";

import { useState } from "react";
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

/** Plus that morphs into a minus: the vertical bar turns flat and fades. */
function PlusMinus({ open }: { open: boolean }) {
  return (
    <span aria-hidden className="relative grid size-6 shrink-0 place-items-center rounded-full text-fg-subtle transition-colors duration-200 group-hover:text-fg">
      <span className="absolute h-[1.5px] w-3 rounded-full bg-current" />
      <span
        className={cn(
          "absolute h-3 w-[1.5px] rounded-full bg-current transition-[transform,opacity] duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
          open ? "rotate-90 opacity-0" : "rotate-0 opacity-100",
        )}
      />
    </span>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mk-section scroll-mt-20" aria-labelledby="faq-heading">
      <div className="grid gap-10 px-5 sm:px-10 lg:grid-cols-[1fr_1.9fr] lg:gap-16 lg:px-14">
        <div>
          <h2 id="faq-heading" className="mk-h2 text-fg">
            Questions
          </h2>
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-fg-subtle">Anything else? Start a lesson and see for yourself. It takes a minute.</p>
        </div>
        <ul className="border-t border-[var(--mk-rule)]">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q} className="border-b border-[var(--mk-rule)]">
                <h3>
                  <button
                    className="group flex w-full items-center justify-between gap-6 rounded-[var(--mk-r-1)] py-6 text-left text-[16px] font-medium text-fg focus-visible:outline-2 focus-visible:outline-offset-2"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    id={`faq-q-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    {item.q}
                    <PlusMinus open={isOpen} />
                  </button>
                </h3>
                {/* Height animates on the grid track (0fr → 1fr): smooth, no measuring. */}
                <div
                  id={`faq-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden" inert={!isOpen}>
                    <p
                      className={cn(
                        "max-w-[38rem] pb-7 pr-10 text-[15px] leading-relaxed text-fg-muted transition-[opacity,filter,transform] duration-300 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none",
                        isOpen ? "translate-y-0 opacity-100 blur-0" : "-translate-y-1 opacity-0 blur-[2px]",
                      )}
                    >
                      {item.a}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
