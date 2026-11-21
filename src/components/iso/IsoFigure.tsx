"use client";

import { useCallback, useEffect, useRef } from "react";

const FIGURES = {
  "dashboard-practice": ["dashboard-practice.html", "Practice stand: choose a letter and press start"],
  "dashboard-course-complete": ["dashboard-course-complete.html", "Course board: choose a sign to review"],
  "dashboard-leaderboard": ["dashboard-leaderboard.html", "Overview leaderboard podium: press your place"],
  "dashboard-challenges": ["dashboard-challenges.html", "Challenge slate: press a card to preview it"],
  "dashboard-community": ["dashboard-community.html", "Community log: press share to create a sample"],
  "dashboard-achievements": ["dashboard-achievements.html", "Achievement shelf: press a badge"],
  "progress-activity": ["progress-activity.html", "Practice calendar: press a day to mark it"],
  "progress-needs-practice": ["progress-needs-practice.html", "Sign guide: press a sign to preview it"],
  "progress-recent-attempts": ["progress-recent-attempts.html", "Attempt ledger: press a row for a sample"],
  "progress-mastery": ["progress-mastery.html", "Sign tray: press a tile to light it"],
  "lessons-alpha-mastered-empty": ["lessons-alpha-mastered-empty.html", "Letter shelf: press a letter to preview it"],
  "lessons-number-mastered-empty": ["lessons-number-mastered-empty.html", "Number shelf: press a number to preview it"],
  "lessons-alpha-complete-empty": ["lessons-alpha-complete-empty.html", "Letter review board: press a letter to revisit it"],
  "lessons-number-complete-empty": ["lessons-number-complete-empty.html", "Number review board: press a number to revisit it"],
  "achievements-empty": ["achievements-empty.html", "Achievement cabinet: press a seal to preview it"],
  "challenges-empty": ["challenges-empty.html", "Challenge board: press a slot to preview it"],
  "community-empty": ["community-empty.html", "Shared activity: press share to preview it"],
  "leaderboard-empty": ["leaderboard-empty.html", "Leaderboard podium: press your block"],
} as const;

export type IsoFigureName = keyof typeof FIGURES;

/** A standalone, interactive HTML figure embedded into an app empty state. */
export function IsoFigure({ name, className }: { name: IsoFigureName; className?: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [file, title] = FIGURES[name];

  const syncTheme = useCallback(() => {
    const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    frame.current?.contentWindow?.postMessage({ type: "sanjog-theme", theme }, window.location.origin);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    syncTheme();
    return () => observer.disconnect();
  }, [syncTheme]);

  return (
    <div className={`iso-embed${className ? ` ${className}` : ""}`}>
      <iframe
        ref={frame}
        className="iso-embed-frame"
        src={`/empty-states/${file}`}
        title={title}
        aria-label={title}
        loading="lazy"
        width="380"
        height="320"
        onLoad={syncTheme}
      />
    </div>
  );
}
