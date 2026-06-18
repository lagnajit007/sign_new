import Link from "next/link";
import { ChevronRight, BookOpen, Clock, Star, Zap, ArrowRight } from "lucide-react";
import { TOTAL_LESSONS } from "@/lib/dashboard-utils";

interface ContinueLearningProps {
  currentLesson: { signLabel: string; lessonType: string; completed: boolean; bestAccuracy: number } | null;
  completedLetters: string[];
  lessonsCompleted: number;
}

export default function ContinueLearning({
  currentLesson,
  completedLetters,
  lessonsCompleted,
}: ContinueLearningProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-ink">Continue Learning</h2>
        <Link href="/dashboard/lessons" className="text-brand text-sm flex items-center hover:underline gap-1">
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {lessonsCompleted >= TOTAL_LESSONS ? (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="text-lg font-bold text-ink">All Lessons Complete!</h3>
              <p className="text-sm text-ink-soft mt-1">You&apos;ve mastered every sign. Try interactive practice or challenges.</p>
              <div className="flex gap-3 mt-4">
                <Link
                  href="/dashboard/lessons/interactive"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-full text-sm font-medium hover:bg-brand-dark transition-colors"
                >
                  <Zap className="w-4 h-4" /> Interactive Practice
                </Link>
                <Link
                  href="/dashboard/challenges"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-brand text-brand rounded-full text-sm font-medium hover:bg-bg transition-colors"
                >
                  New Challenges
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : currentLesson ? (
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-brand-soft hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-soft rounded-full text-xs font-medium text-brand">
                <BookOpen className="w-3.5 h-3.5" />
                {currentLesson.lessonType === "alphabet" ? "Alphabet" : "Number"} Lesson
              </div>
              <h3 className="text-lg font-bold text-ink">
                Currently Learning: Letter{" "}
                <span className="text-brand text-2xl">{currentLesson.signLabel}</span>
              </h3>
              <div className="flex items-center gap-4 text-sm text-ink-soft">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> ~5 min remaining
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" /> Mastery: {Math.round(currentLesson.bestAccuracy * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-ink-soft">Lesson Progress</span>
              <span className="font-medium text-brand">
                {completedLetters.length} / {TOTAL_LESSONS} signs
              </span>
            </div>
            <div className="h-2.5 bg-brand-soft rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand to-[#9B7CFF] rounded-full transition-all duration-1000"
                style={{ width: `${Math.round((completedLetters.length / TOTAL_LESSONS) * 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <Link
              href={`/dashboard/lessons/${currentLesson.lessonType === "alphabet" ? "alphabets" : "numbers"}/${currentLesson.signLabel.toLowerCase()}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-full text-sm font-semibold hover:bg-brand-dark transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/lessons/interactive"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-brand-soft text-ink-soft rounded-full text-sm font-medium hover:border-brand hover:text-brand transition-colors"
            >
              Practice Mode
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-brand-soft">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="text-lg font-bold text-ink">Start Your Learning Journey</h3>
              <p className="text-sm text-ink-soft mt-1">Begin with the alphabet and work your way up to signing with confidence.</p>
              <div className="flex gap-3 mt-4">
                <Link
                  href="/dashboard/lessons"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-full text-sm font-medium hover:bg-brand-dark transition-colors"
                >
                  Start First Lesson <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard/lessons/interactive"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-brand-soft text-ink-soft rounded-full text-sm font-medium hover:border-brand hover:text-brand transition-colors"
                >
                  Try Interactive
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
