"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { CLASSES, landmarksToFeatures, recognize } from "@/lib/recognizer";
import { loadHandTracker, type HandTracker } from "./hand-tracker";
import { LandmarkSmoother, PresenceDebounce, ProbabilitySmoother } from "./smoothing";
import {
  CONFIDENCE_THRESHOLD,
  initialState,
  practiceReducer,
  stepDuration,
  type PracticeState,
} from "./practice-machine";

/**
 * Owns every side effect of a practice session: the hand-tracking model, the
 * camera stream, the single countdown timer, the single detection loop, the
 * attempt save and pause/resume. The page only renders `state`.
 */

export const ALPHABET = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
export const NUMBERS = [..."0123456789"];
export type LessonType = "alphabet" | "number";
export type CameraStatus = "off" | "requesting" | "active" | "stopped" | "denied" | "error";
export type ModelStatus = "loading" | "ready" | "failed";

const DRAW_INTERVAL_MS = 33; // track + draw at up to ~30 fps
const DISPATCH_INTERVAL_MS = 100; // update React state ~10x per second
const MISS_LOG_INTERVAL_MS = 15_000;

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12], [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20], [5, 9], [9, 13], [13, 17],
];

export interface Celebration {
  xp: number;
  achievements: string[];
  levelUp: number | null;
}

function readDeepLink(): { type: LessonType; index: number } {
  if (typeof window === "undefined") return { type: "alphabet", index: 0 };
  const params = new URLSearchParams(window.location.search);
  const type: LessonType = params.get("set") === "number" ? "number" : "alphabet";
  const list = type === "alphabet" ? ALPHABET : NUMBERS;
  const index = list.indexOf((params.get("sign") ?? "").toUpperCase());
  return { type, index: Math.max(index, 0) };
}

export function usePracticeSession() {
  const [lessonType, setLessonType] = useState<LessonType>("alphabet");
  const lessons = lessonType === "alphabet" ? ALPHABET : NUMBERS;
  const [state, dispatch] = useReducer(practiceReducer, undefined, () => initialState(ALPHABET.length));
  const target = lessons[state.index] ?? lessons[0];

  const [modelStatus, setModelStatus] = useState<ModelStatus>("loading");
  const [camera, setCamera] = useState<CameraStatus>("off");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [needsManualPlay, setNeedsManualPlay] = useState(false);
  const [mastered, setMastered] = useState<Set<string>>(new Set());
  const [scoringDisabled, setScoringDisabled] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modelRef = useRef<HandTracker | null>(null);
  const [videoAspect, setVideoAspect] = useState(4 / 3);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);
  const lastMissRef = useRef<Map<string, number>>(new Map());
  const stateRef = useRef<PracticeState>(state);
  stateRef.current = state;
  const targetRef = useRef(target);
  targetRef.current = target;
  const lessonTypeRef = useRef(lessonType);
  lessonTypeRef.current = lessonType;

  // ── Deep link (?set=&sign=) ────────────────────────────────────────────────
  useEffect(() => {
    const { type, index } = readDeepLink();
    setLessonType(type);
    dispatch({ type: "SET_TOTAL", total: (type === "alphabet" ? ALPHABET : NUMBERS).length });
    if (index > 0) dispatch({ type: "GOTO", index });
  }, []);

  // ── Mastered signs from the database ──────────────────────────────────────
  useEffect(() => {
    fetch("/api/progress", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (mountedRef.current && Array.isArray(d?.mastered)) setMastered(new Set(d.mastered as string[]));
      })
      .catch(() => {});
  }, []);

  // ── Hand-tracking model (MediaPipe Hand Landmarker) ───────────────────────
  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;
    loadHandTracker()
      .then((tracker) => {
        if (cancelled) return;
        modelRef.current = tracker;
        setModelStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setModelStatus("failed");
      });
    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, []);

  // ── Camera ─────────────────────────────────────────────────────────────────
  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => {
      t.onended = null;
      t.stop();
    });
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => releaseStream(), [releaseStream]);

  const startCamera = useCallback(async () => {
    if (modelStatus !== "ready") return;
    setCamera("requesting");
    setCameraError(null);
    setNeedsManualPlay(false);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("CAMERA_API_UNAVAILABLE");
      releaseStream();
      let stream: MediaStream | null = null;
      let lastErr: unknown = null;
      for (const video of [
        { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        true,
      ] as MediaTrackConstraints[] | boolean[]) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video, audio: false });
          break;
        } catch (err) {
          lastErr = err;
          if ((err as DOMException)?.name === "NotAllowedError") break;
        }
      }
      if (!stream) throw lastErr ?? new Error("CAMERA_FAILED");
      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      // Unplugged camera or revoked permission: pause instead of failing silently.
      stream.getVideoTracks().forEach((t) => {
        t.onended = () => {
          if (!mountedRef.current) return;
          releaseStream();
          setCamera("stopped");
          setCameraError("Your camera disconnected. Reconnect it and press Start camera to continue.");
          dispatch({ type: "CAMERA_LOST" });
        };
      });

      const video = videoRef.current;
      if (!video) throw new Error("NO_VIDEO_ELEMENT");
      video.srcObject = stream;
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("TIMEOUT")), 10_000);
        video.onloadedmetadata = () => {
          clearTimeout(timeout);
          resolve();
        };
      });
      // Match the overlay canvas to the real video size so landmarks line up.
      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;
      setVideoAspect(vw / vh);
      if (canvasRef.current) {
        canvasRef.current.width = vw;
        canvasRef.current.height = vh;
      }
      try {
        await video.play();
      } catch {
        setNeedsManualPlay(true);
      }
      if (!mountedRef.current) return;
      setCamera("active");
      dispatch({ type: "CAMERA_READY" });
    } catch (err) {
      if (!mountedRef.current) return;
      releaseStream();
      const name = (err as DOMException)?.name ?? "";
      const msg = (err as Error)?.message ?? "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setCamera("denied");
      } else {
        setCamera("error");
        setCameraError(
          name === "NotFoundError" || name === "OverconstrainedError" || msg === "CAMERA_API_UNAVAILABLE"
            ? "No camera found. Connect a webcam and try again."
            : msg === "TIMEOUT"
              ? "The camera took too long to start. Try again."
              : "The camera couldn't start. Close other apps using it and try again.",
        );
      }
    }
  }, [modelStatus, releaseStream]);

  const stopCamera = useCallback(() => {
    releaseStream();
    setCamera("stopped");
    setCameraError(null);
    dispatch({ type: "CAMERA_STOPPED" });
  }, [releaseStream]);

  const manualPlay = useCallback(() => {
    videoRef.current?.play().then(() => setNeedsManualPlay(false)).catch(() => {});
  }, []);

  // ── Countdown: exactly one timer, re-armed only when the step changes ─────
  const countdownStep = state.phase.kind === "countdown" ? state.phase.step : null;
  useEffect(() => {
    if (countdownStep === null) return;
    const t = setTimeout(() => dispatch({ type: "TICK" }), stepDuration(countdownStep));
    return () => clearTimeout(t);
  }, [countdownStep, state.attempt]);

  // ── Pause while the tab is hidden ─────────────────────────────────────────
  useEffect(() => {
    const onVisibility = () => dispatch(document.hidden ? { type: "PAUSE", reason: "tab-hidden" } : { type: "RESUME" });
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // ── Detection loop: only while recognizing ────────────────────────────────
  // Tracks and draws up to ~30 fps from smoothed landmarks; feeds the state
  // machine ~10x per second with a smoothed prediction so one noisy frame
  // can't reset the hold.
  const recognizing = state.phase.kind === "recognizing" && camera === "active";
  const holdingRef = useRef(false);
  holdingRef.current = state.phase.kind === "recognizing" && state.phase.sub === "holding";
  useEffect(() => {
    const clear = () => {
      const c = canvasRef.current;
      c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
    };
    if (!recognizing) {
      clear();
      return;
    }
    const smoother = new LandmarkSmoother();
    const probs = new ProbabilitySmoother();
    const presence = new PresenceDebounce(300);
    let lastMatchFeatures: number[] | undefined;
    let raf = 0;
    let lastDraw = 0;
    let lastDispatch = 0;
    let stopped = false;
    let wasPresent = false;

    const draw = (pts: [number, number][]) => {
      const c = canvasRef.current;
      const ctx = c?.getContext("2d");
      if (!c || !ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);
      const w = c.width;
      const h = c.height;
      const holding = holdingRef.current;
      ctx.lineWidth = Math.max(2, w / 260);
      ctx.lineCap = "round";
      ctx.strokeStyle = holding ? "rgba(110, 231, 183, 0.9)" : "rgba(167, 139, 250, 0.85)";
      ctx.beginPath();
      for (const [a, b] of HAND_CONNECTIONS) {
        ctx.moveTo(pts[a][0] * w, pts[a][1] * h);
        ctx.lineTo(pts[b][0] * w, pts[b][1] * h);
      }
      ctx.stroke();
      ctx.fillStyle = holding ? "#d1fae5" : "#ede9fe";
      const r = Math.max(2.5, w / 220);
      for (const [x, y] of pts) {
        ctx.beginPath();
        ctx.arc(x * w, y * h, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = (now: number) => {
      if (stopped) return;
      raf = requestAnimationFrame(tick);
      if (now - lastDraw < DRAW_INTERVAL_MS) return;
      const video = videoRef.current;
      const tracker = modelRef.current;
      if (!video || !tracker || video.readyState < 2) return;
      lastDraw = now;

      let raw: [number, number][] | null = null;
      try {
        raw = tracker.detect(video, now);
      } catch {
        return; // skip this frame
      }
      const present = presence.update(raw !== null, now);
      const sign = targetRef.current;
      const dueDispatch = now - lastDispatch >= DISPATCH_INTERVAL_MS;

      if (!present) {
        if (wasPresent) {
          smoother.reset();
          probs.reset();
          lastMatchFeatures = undefined;
          clear();
        }
        wasPresent = false;
        if (dueDispatch) {
          lastDispatch = now;
          dispatch({ type: "FRAME", now, target: sign, hand: false });
        }
        return;
      }
      wasPresent = true;
      if (!raw) return; // brief dropout inside the grace period: keep the last state

      const pts = smoother.smooth(raw, now);
      draw(pts);
      const features = landmarksToFeatures(pts, 1, 1);
      if (!features) return;
      const frame = recognize(features);
      // Only submit features that the server will classify the same way.
      if (frame.prediction === sign && frame.confidence >= CONFIDENCE_THRESHOLD) lastMatchFeatures = features;
      const smoothed = probs.push(frame.probabilities, CLASSES);

      if (dueDispatch) {
        lastDispatch = now;
        dispatch({
          type: "FRAME",
          now,
          target: sign,
          hand: true,
          prediction: smoothed.prediction,
          confidence: smoothed.confidence,
          features: smoothed.prediction === sign ? lastMatchFeatures : undefined,
        });
      }

      // A confident wrong sign is a real attempt worth remembering ("Needs practice").
      if (smoothed.prediction !== sign && smoothed.confidence >= CONFIDENCE_THRESHOLD) {
        const lastMiss = lastMissRef.current.get(sign) ?? 0;
        if (Date.now() - lastMiss > MISS_LOG_INTERVAL_MS) {
          lastMissRef.current.set(sign, Date.now());
          void fetch("/api/attempts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ signLabel: sign, lessonType: lessonTypeRef.current, features }),
          }).catch(() => {});
        }
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      clear();
    };
  }, [recognizing, state.attempt]);

  // ── Save each success exactly once (and again only on explicit retry) ────
  const saveKey =
    state.phase.kind === "success" && state.phase.save === "saving" ? `${state.attempt}:${state.phase.saveRequest}` : null;
  const sentRef = useRef<string | null>(null);
  useEffect(() => {
    if (!saveKey || sentRef.current === saveKey) return;
    sentRef.current = saveKey;
    const s = stateRef.current;
    if (s.phase.kind !== "success") return;
    const attempt = s.attempt;
    const sign = targetRef.current;
    const features = s.phase.features;
    fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signLabel: sign, lessonType: lessonTypeRef.current, features }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) throw new Error(data?.error ?? "save failed");
        if (data.scoringEnabled === false) setScoringDisabled(true);
        const xp = Number(data.xpGained) || 0;
        dispatch({ type: "SAVE_OK", attempt, sign, xp, correct: Boolean(data.correct) });
        if (data.correct) setMastered((m) => new Set(m).add(sign));
        const achievements = ((data.unlockedAchievements ?? []) as { name: string }[]).map((a) => a.name);
        if (xp > 0 || achievements.length || data.leveledUp) {
          setCelebration({ xp, achievements, levelUp: data.leveledUp ? Number(data.level) : null });
        }
      })
      .catch(() => dispatch({ type: "SAVE_FAILED", attempt }));
  }, [saveKey]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const switchLessonType = useCallback((type: LessonType) => {
    setLessonType(type);
    dispatch({ type: "SET_TOTAL", total: (type === "alphabet" ? ALPHABET : NUMBERS).length });
  }, []);

  const actions = {
    startCamera,
    stopCamera,
    manualPlay,
    skip: () => dispatch({ type: "SKIP" }),
    retry: () => dispatch({ type: "RETRY" }),
    retrySave: () => dispatch({ type: "RETRY_SAVE" }),
    continue: () => dispatch({ type: "CONTINUE" }),
    goto: (index: number) => dispatch({ type: "GOTO", index }),
    next: () => dispatch({ type: "GOTO", index: stateRef.current.index + 1 }),
    previous: () => dispatch({ type: "GOTO", index: stateRef.current.index - 1 }),
    restartSession: () => dispatch({ type: "RESTART_SESSION" }),
    switchLessonType,
    dismissCelebration: () => setCelebration(null),
  };

  // ── Keyboard: one handler for the page ────────────────────────────────────
  const actionsRef = useRef(actions);
  actionsRef.current = actions;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Keys can arrive with the document (not an element) as target, e.g. from extensions or tests.
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest("input, textarea, select, button, a, [role='button'], [contenteditable='true']")) return;
      const s = stateRef.current;
      if (e.code === "Space") {
        if (s.phase.kind === "countdown") {
          e.preventDefault();
          actionsRef.current.skip();
        } else if (s.phase.kind === "success" && s.phase.save !== "saving") {
          e.preventDefault();
          actionsRef.current.continue();
        }
      } else if (e.code === "ArrowRight" && s.index < s.total - 1) {
        actionsRef.current.next();
      } else if (e.code === "ArrowLeft" && s.index > 0) {
        actionsRef.current.previous();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return {
    state,
    lessonType,
    lessons,
    target,
    nextSign: state.index < lessons.length - 1 ? lessons[state.index + 1] : null,
    modelStatus,
    videoAspect,
    camera,
    cameraError,
    needsManualPlay,
    mastered,
    scoringDisabled,
    celebration,
    videoRef,
    canvasRef,
    actions,
  };
}
