"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Head from "next/head";
import { ArrowLeft, Maximize2, Minimize2, Camera, CameraOff, RefreshCw, Play } from "lucide-react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs-backend-webgl";

import CameraPanel, { CameraState } from "./components/CameraPanel";
import LessonPanel from "./components/LessonPanel";
import FeedbackCard, { FeedbackType } from "./components/FeedbackCard";
import CompletionScreen from "./components/CompletionScreen";
import {
  ModelInitLoader,
  GestureDetectionLoader,
  XPToast,
  AchievementCelebration,
  LevelUpCelebration,
} from "@/components/loaders/ProcessLoaders";

import { HandTrackingAPIClient } from "@/utils/HandTrackingAPIClient";

// ─── Constants ─────────────────────────────────────────────────────────────────
const BACKEND_URL = process.env.NEXT_PUBLIC_RECOGNITION_API_URL || "http://127.0.0.1:5000";
const apiClient = new HandTrackingAPIClient(BACKEND_URL);

const ALPHABET_LESSONS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const NUMBER_LESSONS = "0123456789".split("");

const RECOGNITION_CONFIDENCE_THRESHOLD = 0.7;
const CONSECUTIVE_MATCHES_NEEDED = 3;
const DETECTION_INTERVAL = 75;

const BACKEND_ERROR_MESSAGE =
  "We're having trouble connecting to the recognition service. The service may be offline. Please try again later.";
const BACKEND_ERROR_TITLE = "Recognition Service Offline";

// ─── Utility functions ─────────────────────────────────────────────────────────
const generateSVG = (text: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300" role="img" aria-label="Sign for ${text}"><rect width="100%" height="100%" fill="#FAF7FF" /><text x="50%" y="50%" font-family="Arial" font-size="120" font-weight="bold" fill="#7D54FF" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const preprocessLandmarks = (landmarks: number[][]): number[] => {
  if (!landmarks || landmarks.length !== 21) return [];
  let minX = Number.MAX_VALUE;
  let minY = Number.MAX_VALUE;
  landmarks.forEach((l) => {
    minX = Math.min(minX, l[0]);
    minY = Math.min(minY, l[1]);
  });
  return landmarks.flatMap((l) => [l[0] - minX, l[1] - minY]);
};

const checkBackend = async (): Promise<boolean> => {
  try {
    const res = await fetch(BACKEND_URL, { method: "GET", headers: { Accept: "application/json" }, signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
};

const devLog = process.env.NODE_ENV !== "production" ? console.log.bind(console, "[lesson]") : () => {};
const devErr = process.env.NODE_ENV !== "production" ? console.error.bind(console, "[lesson]") : () => {};

// ─── Page Component ────────────────────────────────────────────────────────────
export default function InteractiveLessonPage() {
  // ── Camera state ──
  const [cameraState, setCameraState] = useState<CameraState>("off");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [needsManualPlay, setNeedsManualPlay] = useState(false);

  // ── Model state ──
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);

  // ── Lesson state ──
  const [lessonType, setLessonType] = useState<"alphabet" | "number">("alphabet");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetSign, setTargetSign] = useState("A");
  const [progress, setProgress] = useState(0);
  const [lessonStatus, setLessonStatus] = useState<"idle" | "practicing" | "complete">("idle");

  // ── Recognition state ──
  const [predictionResult, setPredictionResult] = useState<{ prediction: string; confidence: number } | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [consecutiveMatches, setConsecutiveMatches] = useState(0);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("Enable your camera and start practicing to receive feedback");

  // ── Stats state ──
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [xpToast, setXpToast] = useState<{ xp: number; achievements: string[] } | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  // ── Refs ──
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modelRef = useRef<handpose.HandPose | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedSignRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  const currentLessons = lessonType === "alphabet" ? ALPHABET_LESSONS : NUMBER_LESSONS;

  // ── Load TF model ──
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
          setCameraError("Failed to load the hand detection model. Please refresh the page.");
          setIsModelLoading(false);
        }
      }
    };

    loadModel();
    return () => { cancelled = true; isMountedRef.current = false; };
  }, []);

  // ── Backend check ──
  useEffect(() => {
    const check = async () => {
      const ok = await checkBackend();
      if (isMountedRef.current) setBackendConnected(ok);
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── Camera: Start ──
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
        const el = document.createElement("video");
        el.autoplay = true;
        el.playsInline = true;
        el.muted = true;
        el.width = 640;
        el.height = 480;
        videoRef.current = el;
      }

      const video = videoRef.current;
      video.srcObject = stream;

      if (canvasRef.current) {
        canvasRef.current.width = 640;
        canvasRef.current.height = 480;
      }

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = async () => {
          try {
            await video.play();
            resolve();
          } catch {
            setNeedsManualPlay(true);
            setCameraState("active");
            reject(new Error("MANUAL_PLAY_NEEDED"));
          }
        };
        setTimeout(() => reject(new Error("TIMEOUT")), 10000);
      });

      if (isMountedRef.current) {
        setCameraState("active");
        setCameraError(null);
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;

      const msg = err.message || "";
      if (msg === "MANUAL_PLAY_NEEDED") return;

      if (msg === "NotAllowedError" || msg.includes("PermissionDenied") || msg.includes("Permission denied")) {
        setCameraState("denied");
      } else if (msg === "NotFoundError" || msg.includes("DevicesNotFound") || msg.includes("CAMERA_API_UNAVAILABLE")) {
        setCameraState("error");
        setCameraError("No camera found. Please connect a camera and try again.");
      } else if (msg === "NOT_SECURE_CONTEXT") {
        setCameraState("error");
        setCameraError("Camera access requires a secure connection (HTTPS). Please use HTTPS or localhost.");
      } else if (msg === "TIMEOUT") {
        setCameraState("error");
        setCameraError("Camera startup timed out. Please try again.");
      } else {
        setCameraState("error");
        setCameraError("An unexpected error occurred. Please try again.");
      }
    }
  }, [modelLoaded]);

  // ── Camera: Stop ──
  const stopCamera = useCallback(() => {
    cleanupStream();
    if (isMountedRef.current) {
      setCameraState("stopped");
      setLessonStatus("idle");
      setPredictionResult(null);
      setPredictionError(null);
      setFeedbackType("idle");
      setFeedbackMessage("Camera stopped. Start the camera to continue practicing.");
    }
  }, []);

  // ── Camera: Restart ──
  const restartCamera = useCallback(() => {
    stopCamera();
    setTimeout(() => startCamera(), 300);
  }, [stopCamera, startCamera]);

  // ── Stream cleanup ──
  const cleanupStream = () => {
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
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupStream();
      isMountedRef.current = false;
    };
  }, []);

  // ── Record attempt ──
  const recordAttempt = useCallback(async (attempt: {
    signLabel: string; lessonType: "alphabet" | "number";
    predictedLabel: string; confidence: number; correct: boolean;
  }) => {
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attempt),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.xpGained > 0 || (data.unlockedAchievements?.length ?? 0) > 0) {
        setSessionXp((p) => p + (data.xpGained || 0));
        setXpToast({ xp: data.xpGained, achievements: (data.unlockedAchievements ?? []).map((a: { name: string }) => a.name) });
        setTimeout(() => setXpToast(null), 4000);
      }
      if (data.leveledUp) {
        setLevelUp(data.level);
      }
    } catch { /* fire-and-forget */ }
  }, []);

  // ── Manual play handler ──
  const handleManualPlay = useCallback(() => {
    if (!videoRef.current || !streamRef.current) return;
    videoRef.current.play().then(() => {
      setNeedsManualPlay(false);
    }).catch(() => {
      setCameraError("Browser prevented video playback. Please check camera permissions.");
    });
  }, []);

  // ── Detection loop ──
  useEffect(() => {
    if (cameraState !== "active" || lessonStatus !== "practicing" || !modelRef.current || !videoRef.current) return;

    let active = true;
    let lastLandmarks: number[][] | null = null;

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
          lastLandmarks = rawLandmarks;

          try {
            const processed = preprocessLandmarks(rawLandmarks);
            if (processed.length === 0) return;

            if (!backendConnected) {
              setPredictionError("Recognition service offline");
              setFeedbackType("error");
              setFeedbackMessage(BACKEND_ERROR_MESSAGE);
              return;
            }

            const result = await apiClient.predictGesture(processed);
            if (!active) return;

            setPredictionResult(result);
            setPredictionError(null);

            const confidence = result.confidence || 0;
            const isCorrect = result.prediction === targetSign && confidence > RECOGNITION_CONFIDENCE_THRESHOLD;
            setIsCorrectSignShown(isCorrect);

            setTotalAttempts((p) => p + 1);

            if (isCorrect) {
              setConsecutiveMatches((prev) => prev + 1);
              setFeedbackType("correct");
              setTotalCorrect((p) => p + 1);

              if (confidence > 0.9) setFeedbackMessage(`Excellent! Your "${targetSign}" sign looks perfect!`);
              else if (confidence > 0.8) setFeedbackMessage(`Great job! "${targetSign}" is very clear.`);
              else setFeedbackMessage(`Good! "${targetSign}" is being recognized well. Keep practicing.`);

              if (consecutiveMatches >= CONSECUTIVE_MATCHES_NEEDED - 1) {
                if (recordedSignRef.current !== targetSign) {
                  recordedSignRef.current = targetSign;
                  void recordAttempt({
                    signLabel: targetSign, lessonType,
                    predictedLabel: result.prediction, confidence, correct: true,
                  });
                }
                setProgress((prev) => {
                  const next = Math.min(prev + 5, 100);
                  if (next >= 100) {
                    if (currentIndex < currentLessons.length - 1) {
                      setTimeout(() => goToNextSign(), 100);
                      return 0;
                    } else {
                      setTimeout(() => setLessonStatus("complete"), 200);
                    }
                  }
                  return next;
                });
              } else {
                setProgress((prev) => Math.min(prev + 2, 100));
              }
            } else {
              setConsecutiveMatches(0);
              if (result.prediction && result.prediction !== targetSign) {
                setFeedbackType("incorrect");
                setFeedbackMessage(`Make the "${targetSign}" sign — detected "${result.prediction}" instead. Keep your hand centered.`);
              } else {
                setFeedbackType("no-hand");
                setFeedbackMessage("No hand detected. Position your hand in the frame.");
              }
              setProgress((prev) => Math.max(prev - 0.5, 0));
            }
          } catch (err: any) {
            if (err.message?.includes("Cannot connect") || err.message?.includes("Failed to fetch")) {
              setBackendConnected(false);
              setFeedbackType("error");
              setFeedbackMessage(BACKEND_ERROR_MESSAGE);
            } else {
              setFeedbackType("error");
              setFeedbackMessage("Recognition error. Please try again.");
            }
            setPredictionError(err.message);
          }
        } else {
          if (lastLandmarks) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            lastLandmarks = null;
          }
          setPredictionResult(null);
          setFeedbackType("no-hand");
          setFeedbackMessage("No hand detected. Position your hand in the frame.");
          setConsecutiveMatches(0);
        }
      } catch { /* ignore frame errors */ }
    };

    detectionIntervalRef.current = setInterval(detect, DETECTION_INTERVAL);

    return () => {
      active = false;
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [cameraState, lessonStatus, modelLoaded, targetSign, currentIndex, currentLessons, backendConnected, consecutiveMatches, recordAttempt]);

  // ── Hand landmark drawing ──
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
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    landmarks.forEach((l) => {
      const [x, y] = l;
      if (isNaN(x) || isNaN(y)) return;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#7D54FF";
      ctx.fill();
    });
  };

  // ── Navigation ──
  const goToNextSign = useCallback(() => {
    if (currentIndex < currentLessons.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setTargetSign(currentLessons[next]);
      setProgress(0);
      setConsecutiveMatches(0);
      setPredictionResult(null);
      recordedSignRef.current = null;
    }
  }, [currentIndex, currentLessons]);

  const goToPreviousSign = useCallback(() => {
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      setTargetSign(currentLessons[prev]);
      setProgress(0);
      setConsecutiveMatches(0);
      setPredictionResult(null);
      recordedSignRef.current = null;
    }
  }, [currentIndex, currentLessons]);

  const startPractice = useCallback(() => {
    setLessonStatus("practicing");
    setProgress(0);
    setPredictionResult(null);
    setPredictionError(null);
    setFeedbackType("idle");
    setFeedbackMessage("Position your hand in front of the camera");
  }, []);

  const tryAgain = useCallback(() => {
    setPredictionResult(null);
    setFeedbackType("idle");
    setFeedbackMessage("Position your hand in front of the camera");
  }, []);

  const handleLessonComplete = useCallback(() => {
    setLessonStatus("idle");
    setCurrentIndex(0);
    setTargetSign(currentLessons[0]);
    setProgress(0);
    setTotalCorrect(0);
    setTotalAttempts(0);
    setSessionXp(0);
  }, [currentLessons]);

  // ── Toggle lesson type ──
  const handleToggleType = useCallback(() => {
    const newType = lessonType === "alphabet" ? "number" : "alphabet";
    setLessonType(newType);
    setTargetSign(newType === "alphabet" ? "A" : "0");
    setCurrentIndex(0);
    setProgress(0);
    setLessonStatus("idle");
    setPredictionResult(null);
    if (cameraState === "active") stopCamera();
  }, [lessonType, cameraState, stopCamera]);

  // ── Fullscreen ──
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // ── Sync target sign with currentIndex ──
  useEffect(() => {
    setTargetSign(currentLessons[currentIndex]);
  }, [currentIndex, currentLessons]);

  // ── Accuracy calculation ──
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  // ── Render ──
  return (
    <>
      <Head>
        <title>Sanjog - Interactive Sign Language Lesson</title>
        <meta name="description" content="Practice sign language with AI-powered hand gesture recognition." />
      </Head>

      <div ref={containerRef} className="flex h-screen bg-[#FAF7FF] overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navigation */}
          <header className="bg-white px-4 lg:px-6 py-3 flex items-center justify-between border-b border-[#EAE4FF] shrink-0">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/lessons"
                className="flex items-center text-[#7E7A93] hover:text-[#7D54FF] transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Lessons
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleType}
                className="bg-[#EAE4FF] text-[#7D54FF] text-xs px-3 py-1.5 rounded-full hover:bg-[#DDD4FF] transition-colors font-medium"
              >
                {lessonType === "alphabet" ? "Switch to Numbers" : "Switch to Alphabet"}
              </button>
              <div className="bg-[#EAE4FF] text-[#7D54FF] text-xs px-3 py-1.5 rounded-full font-medium">
                {lessonType === "alphabet" ? "Letter" : "Number"} {currentIndex + 1}/{currentLessons.length}
              </div>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-gray-100 text-[#7E7A93]"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </header>

          {/* XP Toast / Achievement Celebration */}
          {xpToast && (
            xpToast.achievements.length > 0 ? (
              <AchievementCelebration
                name={xpToast.achievements[0]}
                icon="🏆"
                xp={xpToast.xp}
                onDone={() => setXpToast(null)}
              />
            ) : (
              <XPToast xp={xpToast.xp} achievements={[]} onDone={() => setXpToast(null)} />
            )
          )}

          {/* Level Up Celebration */}
          {levelUp !== null && (
            <LevelUpCelebration
              newLevel={levelUp}
              onDone={() => setLevelUp(null)}
            />
          )}

          {/* Backend offline banner */}
          {backendConnected === false && (
            <div className="bg-orange-50 border-b border-orange-200 px-4 lg:px-6 py-2 flex items-center gap-2 shrink-0">
              <span className="text-orange-500 text-sm">⚠</span>
              <p className="text-sm text-orange-700">
                {BACKEND_ERROR_TITLE}.{" "}
                <button
                  onClick={() => { setBackendConnected(null); checkBackend().then(setBackendConnected); }}
                  className="underline font-medium hover:text-orange-800"
                >
                  Retry
                </button>
              </p>
            </div>
          )}

          {/* Model Loading */}
          {isModelLoading && (
            <div className="flex-1 flex items-center justify-center">
              <ModelInitLoader message="Initializing Sign Recognition" />
            </div>
          )}

          {/* Main Content */}
          {!isModelLoading && (
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Left Panel - Lesson Info */}
              <div className="w-full lg:w-1/2 border-r border-[#EAE4FF] bg-white overflow-hidden">
                <LessonPanel
                  targetSign={targetSign}
                  lessonType={lessonType}
                  currentIndex={currentIndex}
                  totalLessons={currentLessons.length}
                  description={`Learn the sign for ${lessonType === "alphabet" ? "letter" : "number"} "${targetSign}"`}
                  difficulty="Beginner"
                  imageUrl={generateSVG(targetSign)}
                  tips={[
                    "Position your hand in front of the camera",
                    `Form the ${lessonType} "${targetSign}" sign clearly`,
                    "Keep your hand steady for best recognition",
                    "Ensure good lighting on your hand",
                  ]}
                  progress={progress}
                  onPrevious={goToPreviousSign}
                  onNext={goToNextSign}
                />
              </div>

              {/* Right Panel - Webcam + Feedback */}
              <div className="w-full lg:w-1/2 bg-[#1a1a2e] flex flex-col overflow-hidden">
                <div className="flex-1 p-3 lg:p-4 flex flex-col gap-3">
                  {/* Recognition Status Bar */}
                  {cameraState === "active" && lessonStatus === "practicing" && (
                    <div className="flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-black/40 rounded-full px-3 py-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-xs text-green-300 font-medium">Recognizing</span>
                        </div>
                        {predictionResult && (
                          <span className="text-xs bg-black/40 text-white px-3 py-1.5 rounded-full font-mono">
                            Target: {targetSign}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {sessionXp > 0 && (
                          <span className="text-xs bg-[#7D54FF]/30 text-[#C4B5FF] px-3 py-1.5 rounded-full">
                            ✨ +{sessionXp} XP
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Camera Panel */}
                  <CameraPanel
                    cameraState={cameraState}
                    cameraError={cameraError}
                    isModelLoading={false}
                    needsManualPlay={needsManualPlay}
                    videoRef={videoRef}
                    canvasRef={canvasRef}
                    onStart={startCamera}
                    onStop={stopCamera}
                    onRestart={restartCamera}
                    onManualPlay={handleManualPlay}
                  >
                    {/* Prediction overlay inside camera */}
                    {cameraState === "active" && predictionResult && lessonStatus === "practicing" && (
                      <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
                        <div className="bg-black/70 rounded-lg px-3 py-2">
                          <GestureDetectionLoader
                            confidence={Math.round(predictionResult.confidence * 100)}
                            message="Analyzing…"
                          />
                        </div>
                      </div>
                    )}
                    {cameraState === "active" && predictionResult && (
                      <div
                        className="absolute bottom-20 right-3 z-10 text-white text-4xl font-black px-4 py-2 rounded-lg shadow-lg transition-all duration-300"
                        style={{
                          backgroundColor: predictionResult.prediction === targetSign ? "#22C55E" : "#7D54FF",
                          opacity: predictionResult.confidence > 0.5 ? 1 : 0.6,
                          transform: `scale(${predictionResult.confidence > 0.7 ? 1.1 : 1})`,
                        }}
                      >
                        {predictionResult.prediction}
                        <div className="text-xs text-center text-white/80 font-normal mt-0.5">
                          {Math.round(predictionResult.confidence * 100)}%
                        </div>
                      </div>
                    )}
                  </CameraPanel>

                  {/* Controls */}
                  <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      {cameraState === "off" || cameraState === "stopped" ? (
                        <button
                          onClick={startCamera}
                          className="bg-[#7D54FF] text-white px-5 py-2 rounded-full hover:bg-[#6840E0] transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                          <Camera className="w-4 h-4" />
                          Start Camera
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={stopCamera}
                            className="border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
                          >
                            <CameraOff className="w-4 h-4" />
                            Stop
                          </button>
                          <button
                            onClick={restartCamera}
                            className="border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Restart
                          </button>
                          {cameraState === "active" && lessonStatus === "idle" && (
                            <button
                              onClick={startPractice}
                              className="bg-green-500 text-white px-5 py-2 rounded-full hover:bg-green-600 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                              <Play className="w-4 h-4" />
                              Start Practice
                            </button>
                          )}
                          {cameraState === "active" && lessonStatus === "practicing" && (
                            <button
                              onClick={tryAgain}
                              className="border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Reset
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* XP counter */}
                    <div className="flex items-center gap-2">
                      {cameraState === "active" && (
                        <span className="text-xs text-gray-400">
                          {lessonStatus === "practicing" ? "Practicing…" : "Ready"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  {cameraState === "active" && lessonStatus === "practicing" && (
                    <div className="shrink-0">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#7D54FF] to-[#9B7CFF] rounded-full transition-all duration-300"
                          style={{ width: `${Math.round(progress)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Live Feedback Card */}
                  {cameraState === "active" && (
                    <FeedbackCard
                      type={feedbackType}
                      message={feedbackMessage}
                      confidence={predictionResult?.confidence}
                      xpEarned={xpToast?.xp}
                      targetSign={targetSign}
                      detectedSign={predictionResult?.prediction}
                      onTryAgain={tryAgain}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Completion Screen */}
      {lessonStatus === "complete" && (
        <CompletionScreen
          accuracy={accuracy}
          xpEarned={sessionXp}
          totalXp={sessionXp}
          timeTaken={Math.floor((Date.now() - sessionStartTime) / 1000)}
          signsMastered={totalCorrect}
          totalSigns={currentLessons.length}
          achievementsUnlocked={xpToast?.achievements.length ?? 0}
          onContinue={handleLessonComplete}
        />
      )}
    </>
  );
}
