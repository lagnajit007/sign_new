import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "About · Sanjog",
  description: "Why Sanjog exists, how it started and how it works.",
};

const STORY = [
  {
    year: "2023",
    title: "Final-year project",
    body: "Sanjog began as a Bachelor of Computer Science thesis by a team of five students, exploring whether a webcam could give useful feedback on fingerspelling.",
  },
  {
    year: "2024",
    title: "Beyond the prototype",
    body: "After graduating, the team kept going: a better-trained model for A–Z and 0–9 and a sturdier architecture.",
  },
  {
    year: "2025",
    title: "A real product",
    body: "A full rewrite with lessons, progress tracking, streaks, achievements and a community leaderboard.",
  },
  {
    year: "Next",
    title: "What's coming",
    body: "More signs beyond the alphabet and numbers, words and phrases, and better recognition in difficult lighting.",
  },
];

export default function AboutPage() {
  return (
    <div data-surface="marketing" className="min-h-screen bg-canvas text-fg">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-14 sm:px-6 md:pt-20">
        <p className="text-sm font-medium text-brand">About</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Making sign language practice free</h1>
        <p className="mt-5 text-[17px] leading-relaxed text-fg-muted">
          Around 70 million deaf people use a sign language as their first language, according to the World Federation of the
          Deaf. Learning even the alphabet is a real step toward talking with them, but practice with feedback has usually meant
          a class or a tutor. Sanjog gives you that feedback in your browser, for free.
        </p>

        <section className="mt-16" aria-labelledby="story-heading">
          <h2 id="story-heading" className="font-display text-2xl font-semibold tracking-tight">Our story</h2>
          <ol className="mt-6 border-l border-line">
            {STORY.map((s) => (
              <li key={s.year} className="relative pb-8 pl-6 last:pb-0">
                <span aria-hidden className="absolute -left-[5px] top-1.5 size-2.5 rounded-full border-2 border-canvas bg-brand" />
                <p className="font-mono text-xs text-brand">{s.year}</p>
                <h3 className="mt-1 text-[16px] font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-fg-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16" aria-labelledby="how-heading">
          <h2 id="how-heading" className="font-display text-2xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-fg-muted">
            <p>
              Your browser finds 21 points on your hand using TensorFlow.js. A small neural network, trained on examples of each
              hand shape, reads those points and names the letter or number with a confidence score. A sign counts as correct at
              70% confidence or more.
            </p>
            <p>
              Your video never leaves your device. When you finish a sign, the 42 numbers that describe your hand&apos;s shape are
              sent to Sanjog, which runs the same model again to confirm the result before saving it and awarding XP.
            </p>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="access-heading">
          <h2 id="access-heading" className="font-display text-2xl font-semibold tracking-tight">Accessibility</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
            The app works with a keyboard and screen readers, supports light and dark themes, and lets you increase text size and
            turn off animation in Settings. If something gets in your way, we want to know.
          </p>
        </section>

        <div className="mt-16 flex flex-wrap gap-3">
          <Link href="/sign-up" className="inline-flex h-11 items-center rounded-lg bg-brand px-5 text-[15px] font-medium text-brand-fg hover:bg-brand-hover">
            Start practising free
          </Link>
          <Link href="/" className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-[15px] font-medium text-fg hover:bg-subtle">
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
