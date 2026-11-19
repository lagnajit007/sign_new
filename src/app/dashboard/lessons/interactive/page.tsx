"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Maximize2, Minimize2, CameraOff, RefreshCw, Sparkles } from "lucide-react";
import Button from "@/components/Button";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs-backend-webgl";

import CameraPanel, { CameraState } from "./components/CameraPanel";
import LessonPanel from "./components/LessonPanel";
import FeedbackCard, { RecognitionState } from "./components/FeedbackCard";
import CompletionScreen from "./components/CompletionScreen";
import CountdownOverlay from "./components/CountdownOverlay";
import {
  ModelInitLoader,
  XPToast,
  AchievementCelebration,
  LevelUpCelebration,
} from "@/components/loaders/ProcessLoaders";

import { landmarksToFeatures, recognize } from "@/lib/recognizer";
import { SCORING_UNAVAILABLE_BANNER } from "@/lib/scoring-policy";

// ─── Constants ───
const ALPHABET_LESSONS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const NUMBER_LESSONS = "0123456789".split("");

const RECOGNITION_CONFIDENCE_THRESHOLD = 0.7;
// At ~200ms detection interval, 5 consecutive matches ≈ 1.0 second of stable hold
const CONSECUTIVE_MATCHES_NEEDED = 5;
const DETECTION_INTERVAL = 200;
const MISS_LOG_INTERVAL_MS = 15000;

const SIGN_IMAGES = new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));

const generateSVG = (text: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300" role="img" aria-label="Sign for ${text}"><rect width="100%" height="100%" fill="#F4F4F5" /><text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="120" font-weight="600" fill="#5B35F0" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const signImage = (sign: string) => (SIGN_IMAGES.has(sign) ? `/signs/${sign}.svg` : generateSVG(sign));

const devErr = process.env.NODE_ENV !== "production" ? console.error.bind(console, "[lesson]") : () => {};

export type PracticePhase = "ready" | "countdown" | "recognizing" | "success" | "complete";

export default function InteractiveLessonPage() {
  // ─── Camera state ───
  const [cameraState, setCameraState] = useState<CameraState>("off");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [needsManualPlay, setNeedsManualPlay] = useState(false);

  // ─── Model state ───
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [scoringDisabled, setScoringDisabled] = useState(false);

  // ─── Lesson progression state ───
  const [lessonType, setLessonType] = useState<"alphabet" | "number">("alphabet");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetSign, setTargetSign] = useState("A");
  const [phase, setPhase] = useState<PracticePhase>("ready");
  const [masteredSigns, setMasteredSigns] = useState<Set<string>>(new Set());

  // ─── Recognition state ───
  const [handDetected, setHandDetected] = useState(false);
  const [isCorrectCandidate, setIsCorrectCandidate] = useState(false);
  const [predictionResult, setPredictionResult] = useState<{ prediction: string; confidence: number } | null>(null);
  const [consecutiveMatches, setConsecutiveMatches] = useState(0);
  const [feedbackState, setFeedbackState] = useState<RecognitionState>("idle");

  // ─── Stats state ───
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [xpToast, setXpToast] = useState<{ xp: number; achievements: string[] } | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  // ─── Mobile responsive tab ───
  const [mobileTab, setMobileTab] = useState<"learn" | "camera">("camera");

  // ─── Refs ───
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modelRef = useRef<handpose.HandPose | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hasSubmittedRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastMissLogRef = useRef<Map<string, number>>(new Map());

  const currentLessons = lessonType === "alphabet" ? ALPHABET_LESSONS : NUMBER_LESSONS;
  const nextSignLabel = currentIndex < currentLessons.length - 1 ? currentLessons[currentIndex + 1] : undefined;
  const holdProgress = Math.min(100, Math.round((consecutiveMatches / CONSECUTIVE_MATCHES_NEEDED) * 100));

  // ─── 1. Load TF.js model ───
  useEffect(() => {
    isMountedRef.current = true;
    let cancelled = false;

    const loadModel = async () => {
      try {
        await tf.ready();
        await tf.setBackend("webgl");
        if (cancelled) return;

        const model = await handpose.load({
          detectionConfidence: 0.8,
          maxContinuousChecks: 5,
          iouThreshold: 0.3,
          scoreThreshold: 0.75,
        });
        if (cancelled) return;

        modelRef.current = model;
        if (isMountedRef.current) {
          setModelLoaded(true);
          setIsModelLoading(false);
        }
      } catch (err) {
        devErr("Model load failed:", err);
        if (isMountedRef.current) {
          setCameraError("Failed to load hand detection model. Please refresh.");
          setIsModelLoading(false);
        }
      }
    };

    loadModel();
    return () => {
      cancelled = true;
      isMountedRef.current = false;
    };
  }, []);

  // ─── 2. Handle deep link (?set=alphabet|number&sign=A) ───
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const set = params.get("set") === "number" ? "number" : "alphabet";
    const lessons = set === "alphabet" ? ALPHABET_LESSONS : NUMBER_LESSONS;
    const idx = lessons.indexOf((params.get("sign") ?? "").toUpperCase());
    setLessonType(set);
    setCurrentIndex(idx >= 0 ? idx : 0);
  }, []);

  // Sync targetSign with currentIndex
  useEffect(() => {
    setTargetSign(currentLessons[currentIndex]);
  }, [currentIndex, currentLessons]);

  // ─── 3. Stream Cleanup ───
  const cleanupStream = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupStream();
      isMountedRef.current = false;
    };
  }, [cleanupStream]);

  // ─── 4. Camera Start / Stop / Restart ───
  const startCamera = useCallback(async () => {
    if (!isMountedRef.current) return;
    if (!modelLoaded) {
      setCameraError("Please wait for the recognition model to finish loading.");
      return;
    }

    setCameraState("requesting");
    setCameraError(null);
    setNeedsManualPlay(false);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("CAMERA_API_UNAVAILABLE");
      }
      if (!window.isSecureContext && window.location.hostname !== "localhost") {
        throw new Error("NOT_SECURE_CONTEXT");
      }

      cleanupStream();

      const constraints = [
        { video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user", frameRate: { ideal: 30 } }, audio: false },
        { video: true, audio: false },
        { video: { width: { exact: 640 }, height: { exact: 480 }, facingMode: "user" }, audio: false },
        { video: { facingMode: "user", width: { ideal: 320 }, height: { ideal: 240 } }, audio: false },
      ];

      let stream: MediaStream | null = null;
      let lastErr: Error | null = null;

      for (const c of constraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(c);
          break;
        } catch (err) {
          lastErr = err as Error;
        }
      }

      if (!stream) throw lastErr || new Error("CAMERA_FAILED");
      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      if (!videoRef.current) {
        setCameraState("error");
        setCameraError("Video element not found. Please refresh.");
        cleanupStream();
        return;
      }

      const video = videoRef.current;
      video.srcObject = stream;

      if (canvasRef.current) {
        canvasRef.current.width = 640;
        canvasRef.current.height = 480;
      }

      const cameraTimeout = setTimeout(() => {
        if (isMountedRef.current) {
          setCameraState("error");
          setCameraError("Camera startup timed out. Please try again.");
          cleanupStream();
        }
      }, 10000);

      await new Promise<void>((resolve, reject) => {
        let settled = false;
        video.onloadedmetadata = async () => {
          if (settled) return;
          clearTimeout(cameraTimeout);
          try {
            await video.play();
            settled = true;
            resolve();
          } catch {
            settled = true;
            setNeedsManualPlay(true);
            setCameraState("active");
            reject(new Error("MANUAL_PLAY_NEEDED"));
          }
        };
      });

      if (isMountedRef.current) {
        setCameraState("active");
        setCameraError(null);
        // Automatically start 3-2-1 countdown when camera becomes active
        setPhase("countdown");
        setFeedbackState("countdown");
      }
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      const name = (err as DOMException)?.name ?? "";
      const msg = (err as Error)?.message ?? "";
      if (msg === "MANUAL_PLAY_NEEDED") return;

      if (name === "NotAllowedError" || name === "SecurityError") {
        setCameraState("denied");
      } else if (name === "NotFoundError" || name === "OverconstrainedError" || msg === "CAMERA_API_UNAVAILABLE") {
        setCameraState("error");
        setCameraError("No camera found. Please connect a webcam.");
      } else if (msg === "NOT_SECURE_CONTEXT") {
        setCameraState("error");
        setCameraError("Camera access requires HTTPS or localhost.");
      } else {
        setCameraState("error");
        setCameraError("An unexpected camera error occurred.");
      }
    }
  }, [modelLoaded, cleanupStream]);

  const stopCamera = useCallback(() => {
    cleanupStream();
    if (isMountedRef.current) {
      setCameraState("stopped");
      setPhase("ready");
      setPredictionResult(null);
      setHandDetected(false);
      setIsCorrectCandidate(false);
      setFeedbackState("idle");
    }
  }, [cleanupStream]);

  const restartCamera = useCallback(() => {
    stopCamera();
    setTimeout(() => startCamera(), 300);
  }, [stopCamera, startCamera]);

  const handleManualPlay = useCallback(() => {
    if (!videoRef.current || !streamRef.current) return;
    videoRef.current
      .play()
      .then(() => setNeedsManualPlay(false))
      .catch(() => setCameraError("Browser prevented video playback."));
  }, []);

  // ─── 5. Server Attempt Logging ───
  const recordAttempt = useCallback(
    async (attempt: { signLabel: string; lessonType: "alphabet" | "number"; features: number[] }) => {
      try {
        const res = await fetch("/api/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attempt),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.scoringEnabled === false) setScoringDisabled(true);

        if (data.xpGained > 0 || (data.unlockedAchievements?.length ?? 0) > 0) {
          setSessionXp((p) => p + (data.xpGained || 0));
          setXpToast({
            xp: data.xpGained,
            achievements: (data.unlockedAchievements ?? []).map((a: { name: string }) => a.name),
          });
          setTimeout(() => setXpToast(null), 4000);
        }
        if (data.leveledUp) {
          setLevelUp(data.level);
        }
      } catch {
        /* attempt recording fail-safe */
      }
    },
    []
  );

  // ─── 6. Hand Landmark Canvas Drawing ───
  const drawHandLandmarks = (ctx: CanvasRenderingContext2D, landmarks: number[][]) => {
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
      [0, 9], [9, 10], [10, 11], [11, 12], [0, 13], [13, 14], [14, 15], [15, 16],
      [0, 17], [17, 18], [18, 19], [19, 20], [5, 9], [9, 13], [13, 17],
    ];

    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

    connections.forEach(([i1, i2]) => {
      if (!landmarks[i1] || !landmarks[i2]) return;
      const [x1, y1] = landmarks[i1];
      const [x2, y2] = landmarks[i2];
      if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) return;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = "#7D54FF";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });

    landmarks.forEach((l) => {
      const [x, y] = l;
      if (isNaN(x) || isNaN(y)) return;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#A78BFA";
      ctx.fill();
    });
  };

  // ─── 7. Active Recognition & Hold Stability Loop ───
  useEffect(() => {
    if (cameraState !== "active" || phase !== "recognizing" || !modelRef.current || !videoRef.current) return;

    let active = true;

    const detect = async () => {
      if (!active || !modelRef.current || !videoRef.current || !canvasRef.current) return;

      try {
        if (videoRef.current.readyState !== 4) return;

        const predictions = await modelRef.current.estimateHands(videoRef.current);
        if (!active) return;

        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        if (predictions.length > 0) {
          const rawLandmarks = predictions[0].landmarks;
          drawHandLandmarks(ctx, rawLandmarks);
          setHandDetected(true);

          try {
            const video = videoRef.current;
            const features = landmarksToFeatures(rawLandmarks, video.videoWidth, video.videoHeight);
            if (!features) return;

            const result = recognize(features);
            setPredictionResult(result);
            setTotalAttempts((p) => p + 1);

            const confidence = result.confidence || 0;
            const isMatch = result.prediction === targetSign && confidence >= RECOGNITION_CONFIDENCE_THRESHOLD;

            if (isMatch) {
              setIsCorrectCandidate(true);
              setTotalCorrect((p) => p + 1);

              setConsecutiveMatches((prev) => {
                const nextMatches = prev + 1;
                if (nextMatches >= CONSECUTIVE_MATCHES_NEEDED) {
                  // Stability hold complete! Trigger success moment
                  setPhase("success");
                  setFeedbackState("success");

                  if (!hasSubmittedRef.current) {
                    hasSubmittedRef.current = true;
                    setMasteredSigns((s) => new Set([...s, targetSign]));
                    void recordAttempt({ signLabel: targetSign, lessonType, features });
                  }
                  return CONSECUTIVE_MATCHES_NEEDED;
                }
                setFeedbackState("holding");
                return nextMatches;
              });
            } else {
              setIsCorrectCandidate(false);
              // Jitter decay: decrement matches gracefully rather than harsh 0% wipe
              setConsecutiveMatches((prev) => Math.max(0, prev - 1));

              if (result.prediction && result.prediction !== targetSign && confidence >= RECOGNITION_CONFIDENCE_THRESHOLD) {
                setFeedbackState("incorrect");
                const last = lastMissLogRef.current.get(targetSign) ?? 0;
                if (Date.now() - last > MISS_LOG_INTERVAL_MS) {
                  lastMissLogRef.current.set(targetSign, Date.now());
                  void recordAttempt({ signLabel: targetSign, lessonType, features });
                }
              } else {
                setFeedbackState("detected");
              }
            }
          } catch {
            setFeedbackState("error");
          }
        } else {
          // No hand landmarks found
          setHandDetected(false);
          setIsCorrectCandidate(false);
          setPredictionResult(null);
          setConsecutiveMatches(0);
          setFeedbackState("waiting");
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      } catch {
        /* frame-level skip */
      }
    };

    detectionIntervalRef.current = setInterval(detect, DETECTION_INTERVAL);

    return () => {
      active = false;
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [cameraState, phase, targetSign, lessonType, recordAttempt]);

  // ─── 8. Progression & Navigation Handlers ───
  const startNextSign = useCallback(() => {
    if (currentIndex < currentLessons.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setTargetSign(currentLessons[nextIdx]);
      hasSubmittedRef.current = false;
      setConsecutiveMatches(0);
      setPredictionResult(null);
      setIsCorrectCandidate(false);
      setPhase("countdown");
      setFeedbackState("countdown");
    } else {
      setPhase("complete");
    }
  }, [currentIndex, currentLessons]);

  const goToPreviousSign = useCallback(() => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setTargetSign(currentLessons[prevIdx]);
      hasSubmittedRef.current = false;
      setConsecutiveMatches(0);
      setPredictionResult(null);
      setIsCorrectCandidate(false);
      setPhase("countdown");
      setFeedbackState("countdown");
    }
  }, [currentIndex, currentLessons]);

  const restartAttempt = useCallback(() => {
    hasSubmittedRef.current = false;
    setConsecutiveMatches(0);
    setPredictionResult(null);
    setIsCorrectCandidate(false);
    setPhase("countdown");
    setFeedbackState("countdown");
  }, []);

  const handleLessonComplete = useCallback(() => {
    setPhase("ready");
    setCurrentIndex(0);
    setTargetSign(currentLessons[0]);
    hasSubmittedRef.current = false;
    setConsecutiveMatches(0);
    setTotalCorrect(0);
    setTotalAttempts(0);
    setSessionXp(0);
  }, [currentLessons]);

  const handleToggleType = useCallback(() => {
    const newType = lessonType === "alphabet" ? "number" : "alphabet";
    setLessonType(newType);
    setTargetSign(newType === "alphabet" ? "A" : "0");
    setCurrentIndex(0);
    hasSubmittedRef.current = false;
    setConsecutiveMatches(0);
    setPredictionResult(null);
    setMasteredSigns(new Set());
    setPhase("ready");
    setFeedbackState("idle");
    if (cameraState === "active") stopCamera();
  }, [lessonType, cameraState, stopCamera]);

  // ─── 9. Keyboard Shortcuts (Space for Continue/Skip) ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        if (phase === "success") {
          startNextSign();
        } else if (phase === "countdown") {
          setPhase("recognizing");
          setFeedbackState("waiting");
        }
      } else if (e.code === "ArrowRight") {
        if (currentIndex < currentLessons.length - 1) {
          e.preventDefault();
          startNextSign();
        }
      } else if (e.code === "ArrowLeft") {
        if (currentIndex > 0) {
          e.preventDefault();
          goToPreviousSign();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, startNextSign, goToPreviousSign, currentIndex, currentLessons.length]);

  // ─── 10. Fullscreen toggle ───
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return (
    <>
      {/* ─── Root Workspace: 100dvh, overflow-hidden, no desktop scrollbar ─── */}
      <div
        ref={containerRef}
        className="h-[100dvh] max-h-[100dvh] w-full flex flex-col bg-canvas overflow-hidden select-none"
      >
        {/* ─── Compact Header (48px - 52px) ─── */}
        <header className="h-12 lg:h-13 px-4 lg:px-6 flex items-center justify-between shrink-0 border-b border-line bg-panel z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" href="/dashboard/lessons" icon={ArrowLeft} className="text-xs">
              Lessons
            </Button>
            <span className="h-4 w-px bg-line hidden sm:inline-block" />
            <span className="text-xs font-semibold text-fg hidden sm:inline-block">
              {lessonType === "alphabet" ? "ASL Alphabet Finger-Spelling" : "ASL Number Signs"}
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Mobile Tab Switcher */}
            <div className="flex lg:hidden bg-subtle p-0.5 rounded-lg border border-line">
              <button
                onClick={() => setMobileTab("learn")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  mobileTab === "learn" ? "bg-panel text-brand shadow-sm" : "text-fg-subtle"
                }`}
              >
                Learn
              </button>
              <button
                onClick={() => setMobileTab("camera")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  mobileTab === "camera" ? "bg-panel text-brand shadow-sm" : "text-fg-subtle"
                }`}
              >
                Camera
              </button>
            </div>

            <button
              onClick={handleToggleType}
              className="bg-subtle text-fg text-xs px-3 py-1.5 rounded-lg hover:bg-subtle-hover transition-colors font-medium border border-line"
            >
              {lessonType === "alphabet" ? "123 Numbers" : "ABC Alphabet"}
            </button>

            <Button
              variant="icon"
              size="sm"
              icon={isFullscreen ? Minimize2 : Maximize2}
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            />
          </div>
        </header>

        {/* Scoring Disabled Banner if policy active */}
        {scoringDisabled && (
          <div role="status" className="mx-4 lg:mx-6 mt-2 rounded-lg border border-line bg-subtle px-3 py-1.5 shrink-0">
            <p className="text-xs text-fg-muted">{SCORING_UNAVAILABLE_BANNER}</p>
          </div>
        )}

        {/* Model Initializing Loader */}
        {isModelLoading && (
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <ModelInitLoader message="Initializing Real-time Recognition..." />
          </div>
        )}

        {/* ─── Main Practice Workspace (2 Columns, Desktop Fits Viewport) ─── */}
        {!isModelLoading && (
          <main className="flex-1 min-h-0 p-3 lg:p-4 grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 overflow-hidden">
            {/* ─── Left Column: Focused Learning Panel ─── */}
            <div
              className={`flex flex-col min-h-0 h-full rounded-2xl border border-line bg-panel overflow-hidden shadow-sm ${
                mobileTab === "learn" ? "flex" : "hidden lg:flex"
              }`}
            >
              <LessonPanel
                targetSign={targetSign}
                lessonType={lessonType}
                currentIndex={currentIndex}
                totalLessons={currentLessons.length}
                completedCount={masteredSigns.size}
                imageUrl={signImage(targetSign)}
                hasHandImage={SIGN_IMAGES.has(targetSign)}
                onPrevious={goToPreviousSign}
                onNext={startNextSign}
              />
            </div>

            {/* ─── Right Column: Interactive Camera Workspace ─── */}
            <div
              className={`flex flex-col min-h-0 h-full rounded-2xl bg-zinc-950 border border-zinc-800 p-3 lg:p-4 gap-3 overflow-hidden justify-between ${
                mobileTab === "camera" ? "flex" : "hidden lg:flex"
              }`}
            >
              {/* Top Camera Bar: Recognition Pill + Session XP */}
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/10 rounded-full px-3 py-1">
                    <span
                      className={`size-2 rounded-full ${
                        cameraState === "active" ? "bg-green-400 animate-pulse" : "bg-zinc-500"
                      }`}
                    />
                    <span className="text-xs text-zinc-300 font-medium">
                      {cameraState === "active"
                        ? phase === "countdown"
                          ? "Starting..."
                          : phase === "success"
                          ? "Completed"
                          : "Recognizing"
                        : "Camera Off"}
                    </span>
                  </div>

                  {predictionResult && phase === "recognizing" && (
                    <span className="text-xs bg-zinc-900 border border-white/10 text-zinc-300 px-2.5 py-1 rounded-full font-mono">
                      Detected: <strong className="text-white">{predictionResult.prediction}</strong> (
                      {Math.round(predictionResult.confidence * 100)}%)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {sessionXp > 0 && (
                    <span className="text-xs font-semibold bg-brand/20 text-brand-soft border border-brand/30 px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="size-3 text-amber-300" />
                      +{sessionXp} XP
                    </span>
                  )}
                </div>
              </div>

              {/* ─── Dominant Camera Feed ─── */}
              <CameraPanel
                cameraState={cameraState}
                cameraError={cameraError}
                isModelLoading={false}
                needsManualPlay={needsManualPlay}
                videoRef={videoRef}
                canvasRef={canvasRef}
                handDetected={handDetected}
                isCorrectCandidate={isCorrectCandidate}
                onStart={startCamera}
                onStop={stopCamera}
                onRestart={restartCamera}
                onManualPlay={handleManualPlay}
              >
                {/* 3-2-1-GO Countdown Overlay */}
                {phase === "countdown" && cameraState === "active" && (
                  <CountdownOverlay
                    targetSign={targetSign}
                    onComplete={() => {
                      setPhase("recognizing");
                      setFeedbackState("waiting");
                    }}
                    onSkip={() => {
                      setPhase("recognizing");
                      setFeedbackState("waiting");
                    }}
                  />
                )}
              </CameraPanel>

              {/* ─── Recognition Status & Stability Feedback ─── */}
              <div className="shrink-0">
                <FeedbackCard
                  state={feedbackState}
                  targetSign={targetSign}
                  detectedSign={predictionResult?.prediction}
                  confidence={predictionResult?.confidence}
                  holdProgress={holdProgress}
                  nextSignLabel={nextSignLabel}
                  xpEarned={xpToast?.xp}
                  onContinue={startNextSign}
                  onRetry={restartAttempt}
                />
              </div>

              {/* ─── Camera & Interaction Controls ─── */}
              <div className="flex items-center justify-between shrink-0 pt-1 border-t border-zinc-850">
                <div className="flex items-center gap-2">
                  {cameraState === "active" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={CameraOff}
                        onClick={stopCamera}
                        className="!text-zinc-400 hover:!text-white !bg-zinc-900 border !border-white/10 text-xs"
                      >
                        Pause
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={RefreshCw}
                        onClick={restartAttempt}
                        className="!text-zinc-400 hover:!text-white !bg-zinc-900 border !border-white/10 text-xs"
                      >
                        Reset Sign
                      </Button>
                    </>
                  )}
                </div>

                {/* Status Hint */}
                <div className="text-[11px] text-zinc-500 font-medium">
                  {phase === "countdown"
                    ? "Skip with Space"
                    : phase === "success"
                    ? "Press Space to continue"
                    : cameraState === "active"
                    ? "Keep hand centered"
                    : "Ready"}
                </div>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* ─── Modals & Celebrations ─── */}
      {xpToast && (
        xpToast.achievements.length > 0 ? (
          <AchievementCelebration
            name={xpToast.achievements[0]}
            icon="✨"
            xp={xpToast.xp}
            onDone={() => setXpToast(null)}
          />
        ) : (
          <XPToast xp={xpToast.xp} achievements={[]} onDone={() => setXpToast(null)} />
        )
      )}

      {levelUp !== null && <LevelUpCelebration newLevel={levelUp} onDone={() => setLevelUp(null)} />}

      {/* Lesson Complete Screen */}
      {phase === "complete" && (
        <CompletionScreen
          accuracy={accuracy}
          xpEarned={sessionXp}
          totalXp={sessionXp}
          timeTaken={Math.floor((Date.now() - sessionStartTime) / 1000)}
          signsMastered={masteredSigns.size}
          totalSigns={currentLessons.length}
          achievementsUnlocked={xpToast?.achievements.length ?? 0}
          onContinue={handleLessonComplete}
        />
      )}
    </>
  );
}
