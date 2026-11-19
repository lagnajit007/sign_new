/**
 * Practice session state machine (pure: no React, no timers, no I/O).
 *
 *   ready → countdown 3 → 2 → 1 → GO → recognizing → success → (continue) → countdown …
 *                                   ↘ skip ↗           ↑ retry
 *   paused (camera lost / tab hidden) can interrupt countdown and recognizing.
 *
 * Recognition success is time-based stability: the target sign must be seen
 * with enough confidence continuously for HOLD_MS and at least MIN_MATCH_FRAMES
 * frames. Any other frame resets the hold. Success happens once per attempt;
 * the hook (use-practice-session.ts) performs the save and reports back.
 */

export const HOLD_MS = 1000;
export const MIN_MATCH_FRAMES = 3;
export const CONFIDENCE_THRESHOLD = 0.7;
export const COUNTDOWN_STEP_MS = 1000;
export const GO_MS = 500;

export type CountdownStep = 3 | 2 | 1 | "go";
export type RecognitionSub = "waiting" | "detected" | "holding" | "incorrect";
export type SaveStatus = "saving" | "saved" | "failed";
export type PauseReason = "camera-lost" | "tab-hidden";

export type Phase =
  | { kind: "ready" }
  | { kind: "countdown"; step: CountdownStep }
  | {
      kind: "recognizing";
      sub: RecognitionSub;
      /** What the model currently sees (for "looks like F" hints). */
      detected: string | null;
      holdStartedAt: number | null;
      matchFrames: number;
      holdProgress: number; // 0..1
    }
  | { kind: "success"; save: SaveStatus; xp: number; features: number[]; saveRequest: number }
  | { kind: "paused"; reason: PauseReason; resume: Phase }
  | { kind: "complete" };

export interface PracticeState {
  phase: Phase;
  index: number;
  total: number;
  cameraOn: boolean;
  /** Increments for every new attempt; save results for older attempts are ignored. */
  attempt: number;
  /** Resets used on the current sign (0 = first try so far). */
  resetsThisSign: number;
  session: { xp: number; mastered: string[]; firstTry: number };
}

export type PracticeAction =
  | { type: "CAMERA_READY" }
  | { type: "CAMERA_STOPPED" }
  | { type: "CAMERA_LOST" }
  | { type: "TICK" }
  | { type: "SKIP" }
  | {
      type: "FRAME";
      now: number;
      target: string;
      hand: boolean;
      prediction?: string;
      confidence?: number;
      features?: number[];
    }
  | { type: "SAVE_OK"; attempt: number; sign: string; xp: number; correct: boolean }
  | { type: "SAVE_FAILED"; attempt: number }
  | { type: "RETRY_SAVE" }
  | { type: "CONTINUE" }
  | { type: "RETRY" }
  | { type: "GOTO"; index: number }
  | { type: "SET_TOTAL"; total: number }
  | { type: "PAUSE"; reason: PauseReason }
  | { type: "RESUME" }
  | { type: "RESTART_SESSION" };

const RECOGNIZING_FRESH: Extract<Phase, { kind: "recognizing" }> = {
  kind: "recognizing",
  sub: "waiting",
  detected: null,
  holdStartedAt: null,
  matchFrames: 0,
  holdProgress: 0,
};

export function initialState(total: number, index = 0): PracticeState {
  return {
    phase: { kind: "ready" },
    index: Math.min(Math.max(index, 0), Math.max(total - 1, 0)),
    total,
    cameraOn: false,
    attempt: 0,
    resetsThisSign: 0,
    session: { xp: 0, mastered: [], firstTry: 0 },
  };
}

/** Start a fresh attempt on the current index: countdown if the camera is on. */
function freshAttempt(s: PracticeState, patch: Partial<PracticeState> = {}): PracticeState {
  const next = { ...s, ...patch };
  return {
    ...next,
    attempt: s.attempt + 1,
    phase: next.cameraOn ? { kind: "countdown", step: 3 } : { kind: "ready" },
  };
}

function nextStep(step: CountdownStep): CountdownStep | null {
  return step === 3 ? 2 : step === 2 ? 1 : step === 1 ? "go" : null;
}

export function practiceReducer(s: PracticeState, a: PracticeAction): PracticeState {
  const p = s.phase;
  switch (a.type) {
    case "CAMERA_READY":
      if (p.kind === "ready" || (p.kind === "paused" && p.reason === "camera-lost")) {
        return freshAttempt({ ...s, cameraOn: true });
      }
      return { ...s, cameraOn: true };

    case "CAMERA_STOPPED":
      // Stopping cancels any countdown/recognition; a pending save still resolves.
      if (p.kind === "success" || p.kind === "complete") return { ...s, cameraOn: false };
      return { ...s, cameraOn: false, phase: { kind: "ready" } };

    case "CAMERA_LOST":
      if (p.kind === "countdown" || p.kind === "recognizing" || p.kind === "ready") {
        return { ...s, cameraOn: false, phase: { kind: "paused", reason: "camera-lost", resume: { kind: "countdown", step: 3 } } };
      }
      return { ...s, cameraOn: false };

    case "TICK": {
      if (p.kind !== "countdown") return s;
      const step = nextStep(p.step);
      return { ...s, phase: step ? { kind: "countdown", step } : RECOGNIZING_FRESH };
    }

    case "SKIP":
      return p.kind === "countdown" ? { ...s, phase: RECOGNIZING_FRESH } : s;

    case "FRAME": {
      if (p.kind !== "recognizing") return s; // never score during countdown/pauses
      if (!a.hand) return { ...s, phase: { ...RECOGNIZING_FRESH } };
      const conf = a.confidence ?? 0;
      const confident = conf >= CONFIDENCE_THRESHOLD;
      if (a.prediction === a.target && confident) {
        const startedAt = p.holdStartedAt ?? a.now;
        const matchFrames = p.matchFrames + 1;
        const held = a.now - startedAt;
        if (held >= HOLD_MS && matchFrames >= MIN_MATCH_FRAMES && a.features) {
          return { ...s, phase: { kind: "success", save: "saving", xp: 0, features: a.features, saveRequest: 1 } };
        }
        return {
          ...s,
          phase: {
            kind: "recognizing",
            sub: "holding",
            detected: a.prediction,
            holdStartedAt: startedAt,
            matchFrames,
            holdProgress: Math.min(1, held / HOLD_MS),
          },
        };
      }
      return {
        ...s,
        phase: {
          ...RECOGNIZING_FRESH,
          sub: confident ? "incorrect" : "detected",
          detected: confident ? a.prediction ?? null : null,
        },
      };
    }

    case "SAVE_OK": {
      // The server has recorded it either way, so session totals always update;
      // only the current attempt's phase reacts.
      const current = a.attempt === s.attempt;
      const session = { ...s.session, xp: s.session.xp + a.xp };
      if (a.correct && !session.mastered.includes(a.sign)) {
        session.mastered = [...session.mastered, a.sign];
        if (current && s.resetsThisSign === 0) session.firstTry += 1;
      }
      if (!current || p.kind !== "success") return { ...s, session };
      return { ...s, session, phase: { ...p, save: "saved", xp: a.xp } };
    }

    case "SAVE_FAILED":
      if (a.attempt !== s.attempt || p.kind !== "success") return s;
      return { ...s, phase: { ...p, save: "failed" } };

    case "RETRY_SAVE":
      if (p.kind !== "success" || p.save !== "failed") return s;
      return { ...s, phase: { ...p, save: "saving", saveRequest: p.saveRequest + 1 } };

    case "CONTINUE": {
      // Never move on while the attempt is still being saved.
      if (p.kind !== "success" || p.save === "saving") return s;
      if (s.index >= s.total - 1) return { ...s, phase: { kind: "complete" } };
      return freshAttempt(s, { index: s.index + 1, resetsThisSign: 0 });
    }

    case "RETRY":
      if (p.kind === "success" && p.save === "saving") return s;
      if (p.kind === "complete") return s;
      return freshAttempt(s, { resetsThisSign: s.resetsThisSign + 1 });

    case "GOTO": {
      const index = Math.min(Math.max(a.index, 0), s.total - 1);
      if (index === s.index && p.kind !== "success") return s;
      return freshAttempt(s, { index, resetsThisSign: 0 });
    }

    case "SET_TOTAL":
      return freshAttempt(s, { total: a.total, index: 0, resetsThisSign: 0 });

    case "PAUSE":
      if (p.kind === "countdown") return { ...s, phase: { kind: "paused", reason: a.reason, resume: p } };
      if (p.kind === "recognizing") return { ...s, phase: { kind: "paused", reason: a.reason, resume: RECOGNIZING_FRESH } };
      return s;

    case "RESUME":
      if (p.kind !== "paused" || p.reason !== "tab-hidden") return s;
      return { ...s, phase: p.resume };

    case "RESTART_SESSION":
      return freshAttempt({ ...s, index: 0, resetsThisSign: 0, session: { xp: 0, mastered: [], firstTry: 0 } });

    default:
      return s;
  }
}

/** Countdown duration for the current step (the hook schedules exactly one timer). */
export function stepDuration(step: CountdownStep): number {
  return step === "go" ? GO_MS : COUNTDOWN_STEP_MS;
}
