"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CameraOff, Maximize2, Minimize2, Sparkles } from "lucide-react";

import CameraPanel from "./components/CameraPanel";
import LessonPanel from "./components/LessonPanel";
import FeedbackCard from "./components/FeedbackCard";
import CompletionScreen from "./components/CompletionScreen";
import CountdownOverlay from "./components/CountdownOverlay";
import { ModelInitLoader, XPToast, AchievementCelebration, LevelUpCelebration } from "@/components/loaders/ProcessLoaders";
import { SCORING_UNAVAILABLE_BANNER } from "@/lib/scoring-policy";
import { getSignTip } from "./signTips";
import { usePracticeSession } from "./use-practice-session";
import { cn } from "@/lib/utils";

// Public-domain ASL hand-shape drawings (see public/signs/LICENSE.md).
const SIGN_IMAGES = new Set([..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]);

function letterTile(text: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="100%" height="100%" rx="24" fill="#F4F4F5"/><text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="140" font-weight="600" fill="#5B35F0" text-anchor="middle" dominant-baseline="central">${text}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
const signImage = (sign: string) => (SIGN_IMAGES.has(sign) ? `/signs/${sign}.svg` : letterTile(sign));

export default function InteractiveLessonPage() {
  const s = usePracticeSession();
  const { state, target, actions } = s;
  const phase = state.phase;
  const [mobileTab, setMobileTab] = useState<"learn" | "camera">("camera");
  const [startedAt] = useState(() => Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const tip = getSignTip(target);
  const hasHandImage = SIGN_IMAGES.has(target);
  const cameraOn = s.camera === "active";
  const countdown = phase.kind === "countdown" ? phase : phase.kind === "paused" && phase.resume.kind === "countdown" ? phase.resume : null;
  const pausedReason = phase.kind === "paused" ? phase.reason : null;
  const recognizingSub = phase.kind === "recognizing" ? phase.sub : null;

  const toggleFullscreen = () => {
    const el = document.getElementById("practice-root");
    if (!document.fullscreenElement && el) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <>
      {/* Fills the shell's content area (which owns the viewport height): no page scroll on desktop. */}
      <div id="practice-root" className="flex h-full min-h-0 flex-col overflow-hidden bg-canvas">
        <header className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-line bg-panel px-3 lg:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Link href="/dashboard/lessons" className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-fg-muted hover:bg-subtle hover:text-fg">
              <ArrowLeft className="size-3.5" aria-hidden /> Lessons
            </Link>
            <span className="hidden h-4 w-px bg-line sm:block" />
            <span className="hidden truncate text-xs text-fg-subtle sm:block">
              {s.lessonType === "alphabet" ? "ASL alphabet" : "ASL numbers"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div role="tablist" aria-label="Practice view" className="flex rounded-lg border border-line bg-subtle p-0.5 lg:hidden">
              {(["learn", "camera"] as const).map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={mobileTab === t}
                  onClick={() => setMobileTab(t)}
                  className={cn("h-7 rounded-md px-2.5 text-xs font-medium capitalize", mobileTab === t ? "bg-panel text-fg shadow-sm" : "text-fg-subtle")}
                >
                  {t === "learn" ? "Reference" : "Camera"}
                </button>
              ))}
            </div>
            <div role="radiogroup" aria-label="Lesson set" className="flex rounded-lg border border-line bg-subtle p-0.5">
              {(["alphabet", "number"] as const).map((t) => (
                <button
                  key={t}
                  role="radio"
                  aria-checked={s.lessonType === t}
                  onClick={() => s.lessonType !== t && actions.switchLessonType(t)}
                  className={cn("h-7 rounded-md px-2.5 text-xs font-medium", s.lessonType === t ? "bg-panel text-fg shadow-sm" : "text-fg-subtle hover:text-fg")}
                >
                  {t === "alphabet" ? "A–Z" : "0–9"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className="hidden size-8 place-items-center rounded-lg text-fg-muted hover:bg-subtle hover:text-fg sm:grid"
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
          </div>
        </header>

        {s.scoringDisabled && (
          <p role="status" className="mx-3 mt-2 shrink-0 rounded-lg border border-line bg-subtle px-3 py-1.5 text-xs text-fg-muted lg:mx-4">
            {SCORING_UNAVAILABLE_BANNER}
          </p>
        )}

        {s.modelStatus === "loading" ? (
          <div className="grid min-h-0 flex-1 place-items-center">
            <ModelInitLoader message="Loading hand tracking…" />
          </div>
        ) : s.modelStatus === "failed" ? (
          <div className="grid min-h-0 flex-1 place-items-center p-6 text-center">
            <div>
              <p className="text-sm font-medium text-fg">Hand tracking couldn&apos;t load</p>
              <p className="mt-1 text-sm text-fg-muted">Check your connection, then reload the page.</p>
              <button type="button" onClick={() => window.location.reload()} className="mt-4 h-9 rounded-lg bg-brand px-4 text-sm font-medium text-brand-fg hover:bg-brand-hover">
                Reload
              </button>
            </div>
          </div>
        ) : (
          <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-4 lg:p-4">
            {/* Reference / learning panel */}
            <section
              aria-label="Reference"
              className={cn("min-h-0 overflow-hidden rounded-xl border border-line bg-panel", mobileTab === "learn" ? "block" : "hidden lg:block")}
            >
              <LessonPanel
                target={target}
                lessonType={s.lessonType}
                index={state.index}
                lessons={s.lessons}
                mastered={s.mastered}
                imageUrl={signImage(target)}
                hasHandImage={hasHandImage}
                tip={tip}
                onPrevious={actions.previous}
                onNext={actions.next}
                onJump={actions.goto}
              />
            </section>

            {/* Camera workspace */}
            <section
              aria-label="Camera practice"
              className={cn(
                "min-h-0 flex-col gap-3 overflow-hidden rounded-xl bg-zinc-950 p-3",
                mobileTab === "camera" ? "flex" : "hidden lg:flex",
              )}
            >
              <div className="flex shrink-0 items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-300">
                  <span className={cn("size-1.5 rounded-full", cameraOn ? "bg-emerald-400" : "bg-zinc-500")} aria-hidden />
                  {!cameraOn ? "Camera off" : countdown ? "Get ready" : recognizingSub ? "Recognising" : phase.kind === "success" ? "Done" : "Ready"}
                </span>
                {state.session.xp > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-200">
                    <Sparkles className="size-3 text-amber-300" aria-hidden /> +{state.session.xp} XP this session
                  </span>
                )}
              </div>

              <CameraPanel
                cameraState={s.camera}
                cameraError={s.cameraError}
                isModelLoading={false}
                needsManualPlay={s.needsManualPlay}
                videoRef={s.videoRef}
                canvasRef={s.canvasRef}
                handDetected={recognizingSub !== null && recognizingSub !== "waiting"}
                isCorrectCandidate={recognizingSub === "holding"}
                onStart={actions.startCamera}
                onStop={actions.stopCamera}
                onRestart={actions.startCamera}
                onManualPlay={actions.manualPlay}
              >
                {countdown && (
                  <CountdownOverlay
                    step={countdown.step}
                    paused={pausedReason}
                    targetSign={target}
                    imageUrl={signImage(target)}
                    hasHandImage={hasHandImage}
                    onSkip={actions.skip}
                  />
                )}
              </CameraPanel>

              <div className="shrink-0">
                <FeedbackCard
                  phase={phase}
                  cameraOn={cameraOn}
                  target={target}
                  nextSign={s.nextSign}
                  tip={tip}
                  onContinue={actions.continue}
                  onRetry={actions.retry}
                  onRetrySave={actions.retrySave}
                />
              </div>

              <div className="flex shrink-0 items-center justify-between text-[11px] text-zinc-500">
                {cameraOn ? (
                  <button
                    type="button"
                    onClick={actions.stopCamera}
                    className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
                  >
                    <CameraOff className="size-3.5" aria-hidden /> Stop camera
                  </button>
                ) : (
                  <span />
                )}
                <span className="hidden sm:inline">
                  {countdown ? "Space to skip" : phase.kind === "success" && phase.save !== "saving" ? "Space to continue" : "← → to change sign"}
                </span>
              </div>
            </section>
          </main>
        )}
      </div>

      {s.celebration &&
        (s.celebration.levelUp !== null ? (
          <LevelUpCelebration newLevel={s.celebration.levelUp} onDone={actions.dismissCelebration} />
        ) : s.celebration.achievements.length > 0 ? (
          <AchievementCelebration name={s.celebration.achievements[0]} icon="✨" xp={s.celebration.xp} onDone={actions.dismissCelebration} />
        ) : (
          <XPToast xp={s.celebration.xp} achievements={[]} onDone={actions.dismissCelebration} />
        ))}

      {phase.kind === "complete" && (
        <CompletionScreen
          lessonLabel={s.lessonType === "alphabet" ? "Alphabet" : "Numbers"}
          masteredThisSession={state.session.mastered.length}
          firstTry={state.session.firstTry}
          xp={state.session.xp}
          seconds={Math.floor((Date.now() - startedAt) / 1000)}
          onRestart={actions.restartSession}
        />
      )}
    </>
  );
}
