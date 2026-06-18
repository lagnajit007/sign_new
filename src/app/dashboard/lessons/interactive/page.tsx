"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Camera,
  CameraOff,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Head from "next/head";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import { HandTrackingAPIClient } from "@/utils/HandTrackingAPIClient";
import "@tensorflow/tfjs-backend-webgl";
import {
  ModelInitLoader,
  CameraInitLoader,
  GestureDetectionLoader,
  XPToast,
  AchievementCelebration,
  ButtonLoader,
} from "@/components/loaders/ProcessLoaders";

// Base URL of the Flask recognition backend (configurable per environment).
const BACKEND_URL = process.env.NEXT_PUBLIC_RECOGNITION_API_URL || 'http://127.0.0.1:5000';

const apiClient = new HandTrackingAPIClient(BACKEND_URL);

// Check backend connectivity
const checkBackendConnectivity = async (): Promise<boolean> => {
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch (error) {
    devErr("Backend connectivity check failed:", error);
    return false;
  }
};

// Browser detection utility
const getBrowserInfo = () => {
  if (typeof window === "undefined" || !window.navigator) {
    return { name: "unknown", version: "unknown" };
  }

  const userAgent = navigator.userAgent;
  let browserName = "unknown";
  let browserVersion = "unknown";

  if (userAgent.includes("Chrome")) {
    browserName = "Chrome";
    const match = userAgent.match(/Chrome\/(\d+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes("Firefox")) {
    browserName = "Firefox";
    const match = userAgent.match(/Firefox\/(\d+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes("Safari")) {
    browserName = "Safari";
    const match = userAgent.match(/Version\/(\d+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes("Edg")) {
    browserName = "Edge";
    const match = userAgent.match(/Edg\/(\d+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) {
    browserName = "Internet Explorer";
    const match = userAgent.match(/(?:MSIE |rv:)(\d+)/);
    if (match) browserVersion = match[1];
  }

  return { name: browserName, version: browserVersion };
};

// Browser-specific camera instructions
const getBrowserSpecificInstructions = () => {
  const { name } = getBrowserInfo();
  switch (name) {
    case "Chrome":
    case "Edge":
      return "Click the camera icon in the address bar and select 'Allow' for camera access.";
    case "Firefox":
      return "Click the camera icon in the address bar and choose 'Allow' for camera access.";
    case "Safari":
      return "Go to Safari > Preferences > Websites > Camera and allow access for this site.";
    default:
      return "Check your browser settings to allow camera access for this site.";
  }
};

// Define lessons
const ALPHABET_LESSONS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const NUMBER_LESSONS = "0123456789".split("");

// SVG placeholder generator
const generateSVG = (text: string) => {
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300" role="img" aria-label="Sign for ${text}">
      <rect width="100%" height="100%" fill="#FAF7FF" />
      <text x="50%" y="50%" font-family="Arial" font-size="120" font-weight="bold" fill="#7D54FF" text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
};

// Interfaces
interface HandLandmark {
  x: number;
  y: number;
  z?: number;
}

interface HandPrediction {
  landmarks: number[][];
}

// Preprocess landmarks for the backend
const preprocessLandmarks = (landmarks: number[][]): number[] => {
  if (!landmarks || landmarks.length !== 21) {
    devWarn(`Expected 21 landmarks, got ${landmarks?.length || 0}`);
    return [];
  }
  
  // Find minimum x and y coordinates for normalization
  let minX = Number.MAX_VALUE;
  let minY = Number.MAX_VALUE;
  
  landmarks.forEach(landmark => {
    minX = Math.min(minX, landmark[0]);
    minY = Math.min(minY, landmark[1]);
  });
  
  // Flatten x, y coordinates and normalize them like updated_inference.py does
  return landmarks.flatMap(landmark => [
    landmark[0] - minX, // Normalize X coordinate
    landmark[1] - minY  // Normalize Y coordinate
  ]);
};

// Predict gesture by sending landmarks to backend
const predictGesture = async (landmarks: number[][]): Promise<{ prediction: string; confidence: number }> => {
  if (!landmarks || landmarks.length === 0) {
    throw new Error("No hand landmarks detected");
  }
  
  try {
    const processedLandmarks = preprocessLandmarks(landmarks);
    if (processedLandmarks.length === 0) {
      throw new Error("Invalid hand landmarks format");
    }
    
    const isBackendConnected = await checkBackendConnectivity();
    if (!isBackendConnected) {
      throw new Error("Cannot connect to the sign language recognition server. Please ensure the Flask backend is running.");
    }
    
    const result = await apiClient.predictGesture(processedLandmarks);
    if (!result || typeof result.prediction !== 'string') {
      throw new Error("Invalid response format from prediction server");
    }
    
    return {
      prediction: result.prediction,
      confidence: result.confidence || 0.5,
    };
  } catch (error: any) {
    devErr("Error predicting gesture:", error);
    throw error;
  }
};

// Manual Play Button Component
const ManualPlayButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <button
        onClick={onClick}
        className="bg-[#7D54FF] text-white px-6 py-3 rounded-full shadow-btn transition-transform hover:scale-[1.03] active:translate-y-1 active:shadow-none text-lg font-semibold flex items-center space-x-2 hover:bg-opacity-90 transition-colors"
      >
        <Play className="w-6 h-6 mr-2" />
        Click to Enable Camera
      </button>
    </div>
  );
};

// Near the top of the file, with other constants
const RECOGNITION_CONFIDENCE_THRESHOLD = 0.7; // Minimum confidence to accept a prediction
const CONSECUTIVE_MATCHES_NEEDED = 3; // Number of consecutive matches needed to confirm a gesture
const SMOOTHING_FACTOR = 0.05; // Reduced from 0.92 for faster response
const VELOCITY_DAMPING = 0.1; // Reduced from 0.7 for faster movement
const DETECTION_INTERVAL = 75; // Reduced from 300ms for more frequent updates

// Add a throttle utility function near the top with proper TypeScript types
const throttle = <T extends (...args: any[]) => any>(func: T, limit: number): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Add motion interpolation utility - helps create smoother animation between frames
const interpolatePositions = (p1: number[][], p2: number[][], alpha: number): number[][] => {
  if (!p1 || !p2 || p1.length !== p2.length) return p2 || p1;
  return p1.map((landmark, i) => {
    if (!p2[i]) return landmark;
    return [
      landmark[0] + (p2[i][0] - landmark[0]) * alpha,
      landmark[1] + (p2[i][1] - landmark[1]) * alpha,
      landmark.length > 2 ? landmark[2] + (p2[i][2] - landmark[2]) * alpha : 0
    ];
  });
};

// Dev-only logging helper — no-oped in production
const devLog = (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production')
  ? console.log.bind(console, '[dev]')
  : () => {};
const devWarn = (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production')
  ? console.warn.bind(console, '[dev]')
  : () => {};
const devErr = (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production')
  ? console.error.bind(console, '[dev]')
  : () => {};

export default function InteractiveLessonPage() {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [lessonStatus, setLessonStatus] = useState<"waiting" | "recording" | "success" | "failure">("waiting");
  const [progress, setProgress] = useState(0);
  const [currentGesture, setCurrentGesture] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [lessonType, setLessonType] = useState<"alphabet" | "number">("alphabet");
  const [targetSign, setTargetSign] = useState("A");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  const [predictionResult, setPredictionResult] = useState<{ prediction: string; confidence: number } | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [cameraRetryCount, setCameraRetryCount] = useState(0);
  const [predictionHistory, setPredictionHistory] = useState<string[]>([]);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [videoElementReady, setVideoElementReady] = useState(false);
  const [needsManualPlay, setNeedsManualPlay] = useState(false);
  const [consecutiveMatches, setConsecutiveMatches] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [debugLandmarks, setDebugLandmarks] = useState<number[] | null>(null);
  const [isCorrectSignShown, setIsCorrectSignShown] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const [xpToast, setXpToast] = useState<{ xp: number; achievements: string[] } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modelRef = useRef<handpose.HandPose | null>(null);
  const predictionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cameraRetryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Tracks the sign for which we've already recorded a successful attempt this
  // cycle, so we POST once per confirmed sign instead of once per frame.
  const recordedSignRef = useRef<string | null>(null);

  const ACCURACY_THRESHOLD = 70;
  const currentLessons = lessonType === "alphabet" ? ALPHABET_LESSONS : NUMBER_LESSONS;

  // Create memoized value for lesson content to prevent recreating on every render
  const lessonContent = useMemo(() => ({
    id: currentLessons.indexOf(targetSign) + 1,
    name: targetSign,
    description: `Sign for ${lessonType === "alphabet" ? "letter" : "number"} ${targetSign}`,
    difficulty: "Beginner",
    imageUrl: generateSVG(targetSign),
    instructions: [
      "Position your hand in front of the camera",
      `Form the ${lessonType === "alphabet" ? "letter" : "number"} ${targetSign} sign`,
      "Hold the position steady for best recognition",
      "Try to match the example image shown",
    ],
  }), [targetSign, lessonType, currentLessons]);

  // Load TensorFlow.js HandPose model with retry mechanism
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    
    const loadModel = async () => {
      if (!isMounted) return;
      setIsModelLoading(true);
      
      try {
        // First ensure TensorFlow is ready with optimized settings
        devLog("Initializing TensorFlow.js...");
        await tf.ready();
        
        // Set performance optimizations for TensorFlow.js
        try {
          // Prefer WebGL acceleration
          await tf.setBackend('webgl');
          
          // Allow lower precision calculations when possible - improves performance
          const webGLBackend = tf.backend() as any;
          if (webGLBackend && webGLBackend.setFlags) {
            webGLBackend.setFlags({
              'WEBGL_FORCE_F16_TEXTURES': true, // Use 16-bit floating point
              'WEBGL_PACK': true, // Enable texture packing
              'WEBGL_FLUSH_THRESHOLD': 1, // Flush less frequently
            });
          }
        } catch (e) {
          devWarn("Could not apply WebGL optimizations:", e);
        }
        
        devLog("TensorFlow.js ready with optimized settings");
        
        // Skip loading if component unmounted
        if (!isMounted) return;
        
        // Load the handpose model with retry mechanism
        let handposeModel = null;
        let lastError = null;
        
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            devLog(`Loading HandPose model (attempt ${attempt}/${MAX_RETRIES})...`);
            handposeModel = await handpose.load({
              detectionConfidence: 0.8,
              maxContinuousChecks: 5,
              iouThreshold: 0.3,
              scoreThreshold: 0.75,
            });
            break; // Success, exit retry loop
          } catch (err) {
            lastError = err;
            devWarn(`Attempt ${attempt} failed:`, err);
            if (attempt < MAX_RETRIES && isMounted) {
              // Wait before retrying (increasing delay with each attempt)
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        }
        
        // Check if we successfully loaded the model
        if (!handposeModel) {
          throw lastError || new Error("Failed to load handpose model after multiple attempts");
        }
        
        // Skip state updates if component unmounted
        if (!isMounted) return;
        
        modelRef.current = handposeModel;
        setModelLoaded(true);
        devLog("HandPose model loaded successfully");
      } catch (error) {
        // Skip state updates if component unmounted
        if (!isMounted) return;
        
        devErr("Failed to load HandPose model:", error);
        setCameraError("Failed to load hand detection model. Please refresh the page or check your internet connection.");
      } finally {
        // Skip state updates if component unmounted
        if (isMounted) setIsModelLoading(false);
      }
    };
    
    loadModel();
    
    // Clean up function
    return () => {
      isMounted = false;
    };
  }, []);

  // Check backend connectivity
  useEffect(() => {
    const checkConnectivity = async () => {
      const isConnected = await checkBackendConnectivity();
      setBackendConnected(isConnected);
    };
    checkConnectivity();
    const intervalId = setInterval(checkConnectivity, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Start camera with more robust error handling and fallbacks
  const startCamera = async () => {
    if (!modelLoaded) {
      setCameraError("Hand detection model is not ready. Please wait or refresh the page.");
      return;
    }

    if (cameraRetryTimeoutRef.current) {
      clearTimeout(cameraRetryTimeoutRef.current);
      cameraRetryTimeoutRef.current = null;
    }

    setIsInitializingCamera(true);
    setCameraError(null);
    setNeedsManualPlay(false);
    
    // Array of camera constraint options to try if the first one fails
    const cameraConstraintOptions = [
      // Option 1: Preferred settings
      { 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 }, 
          facingMode: "user", 
          frameRate: { ideal: 30 } 
        },
        audio: false
      },
      // Option 2: Simplified settings
      { 
        video: true, 
        audio: false 
      },
      // Option 3: Exact dimensions (some devices require exact)
      { 
        video: { 
          width: { exact: 640 }, 
          height: { exact: 480 }, 
          facingMode: "user"
        },
        audio: false
      },
      // Option 4: Mobile-friendly
      { 
        video: { 
          facingMode: "user",
          width: { ideal: 320 },
          height: { ideal: 240 }
        },
        audio: false
      }
    ];

    try {
      const isSecureContext = window.isSecureContext || window.location.hostname === 'localhost';
      if (!isSecureContext) {
        throw new Error("Camera access requires HTTPS or localhost.");
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API not supported in this browser.");
      }

      // Ensure video element is ready before proceeding
      if (!videoRef.current) {
        devLog("Video element not found, creating new video element");
        
        // Create and set up video element if it doesn't exist
        const videoElement = document.createElement('video');
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.muted = true;
        videoElement.width = 640;
        videoElement.height = 480;
        
        // Assign to ref
        videoRef.current = videoElement;
      }
      
      // Stop any existing stream
      if (videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
        // Small delay to ensure previous stream is fully stopped
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Try each constraint option until one works
      let stream = null;
      let error = null;
      let successOption = -1;
      
      for (let i = 0; i < cameraConstraintOptions.length; i++) {
        try {
          devLog(`Trying camera constraints option ${i+1}:`, cameraConstraintOptions[i]);
          stream = await navigator.mediaDevices.getUserMedia(cameraConstraintOptions[i]);
          successOption = i;
          devLog(`Successfully got stream with option ${i+1}`);
          break;
        } catch (err) {
          error = err;
          devWarn(`Option ${i+1} failed:`, err);
          // Wait a bit before trying the next option
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      if (!stream) {
        throw error || new Error("Failed to access camera with all constraint options");
      }
      
      devLog(`Got camera stream using option ${successOption+1}`);
      
      // Log stream information
      const videoTracks = stream.getVideoTracks();
      devLog(`Got ${videoTracks.length} video tracks:`, videoTracks.map(track => track.label));
      
      if (videoTracks.length === 0) {
        throw new Error("No video tracks found in the stream. Camera might not be accessible.");
      }

      // Check capabilities
      const videoTrack = videoTracks[0];
      try {
        const capabilities = videoTrack.getCapabilities();
        const settings = videoTrack.getSettings();
        devLog("Video track capabilities:", capabilities);
        devLog("Current video settings:", settings);
      } catch (capError) {
        devLog("Could not get video track capabilities:", capError);
      }

      if (!videoRef.current) {
        // Clean up the stream if videoRef is no longer available
        stream.getTracks().forEach(track => track.stop());
        throw new Error("Video element not available after camera access.");
      }

      // Explicitly set video element properties
      videoRef.current.width = 640;
      videoRef.current.height = 480;
      videoRef.current.setAttribute('autoplay', 'true');
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('muted', 'true');
      
      // Add event listeners for debugging
      videoRef.current.addEventListener('playing', () => {
        devLog('Video is now playing');
      });
      videoRef.current.addEventListener('suspend', () => {
        devLog('Video playback suspended');
      });
      videoRef.current.addEventListener('stalled', () => {
        devLog('Video playback stalled');
      });
      videoRef.current.addEventListener('error', (e) => {
        devErr('Video error:', e);
      });
      
      // Assign the stream to the video element
      videoRef.current.srcObject = stream;
      devLog("Stream attached to video element");
      
      // Ensure canvas is sized properly
      if (canvasRef.current) {
        canvasRef.current.width = 640;
        canvasRef.current.height = 480;
      } else {
        devWarn("Canvas element not available.");
      }
      
      // Wait for video to be ready before playing
      videoRef.current.onloadedmetadata = async () => {
        if (videoRef.current) {
          try {
            devLog("Video metadata loaded, starting playback");
            
            // Force play to start
            const playPromise = videoRef.current.play();
            if (playPromise) {
              try {
                await playPromise;
                devLog("Video playback started successfully");
                
                // Only set these if we actually started playing
                if (!videoRef.current.paused) {
                  devLog("Camera setup complete");
                  setCameraActive(true);
                  setLessonStatus("waiting");
                  setIsInitializingCamera(false);
                  setCameraRetryCount(0);
                } else {
                  devLog("Video is paused despite successful play()");
                  setNeedsManualPlay(true);
                  setIsInitializingCamera(false);
                }
              } catch (playError) {
                devErr("Error playing video:", playError);
                setNeedsManualPlay(true);
                setIsInitializingCamera(false);
              }
            } else {
              devLog("Play promise not returned");
              // Try to detect if video is actually playing
              if (!videoRef.current.paused) {
                setCameraActive(true);
                setLessonStatus("waiting");
                setIsInitializingCamera(false);
              } else {
                setNeedsManualPlay(true);
                setIsInitializingCamera(false);
              }
            }
          } catch (playError) {
            devErr("Error in video playback setup:", playError);
            setNeedsManualPlay(true);
            setIsInitializingCamera(false);
          }
        }
      };
      
      // Schedule a visibility check after a short delay
      setTimeout(() => {
        if (!videoRef.current) return;
        
        // Check if the video is playing and visible
        if (videoRef.current.readyState < 2) {
          devLog("Video not ready yet, attempting to force playback");
          try {
            videoRef.current.play().catch(e => devLog("Could not force play:", e));
          } catch (e) {
            devLog("Error in play attempt:", e);
          }
        }
        
        // Get computed style to check visibility
        try {
          const computedStyle = window.getComputedStyle(videoRef.current);
          devLog("Video element computed style:", {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            width: computedStyle.width,
            height: computedStyle.height
          });
        } catch (e) {
          devLog("Could not get computed style:", e);
        }
        
        // If camera is still initializing after delay, handle timeout
        if (isInitializingCamera) {
          if (!videoRef.current || videoRef.current.paused) {
            devLog("Video is paused, showing manual play button");
            setNeedsManualPlay(true);
          } else {
            devLog("Forced camera activation after timeout");
            setCameraActive(true);
            setLessonStatus("waiting");
          }
          setIsInitializingCamera(false);
        }
      }, 3000);
      
    } catch (err: any) {
      devErr("Camera initialization error:", err);
      let errorMessage = "Failed to access camera. ";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMessage += "Please allow camera access in your browser settings. " + getBrowserSpecificInstructions();
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errorMessage += "No camera found. Please connect a camera.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        errorMessage += "Camera is in use by another application. Please close other apps.";
      } else if (err.name === "OverconstrainedError") {
        errorMessage += "Camera doesn't support requested resolution. Try a different camera.";
      } else if (err.name === "AbortError") {
        errorMessage += "Camera access was aborted. Please try again.";
      } else if (err.name === "SecurityError") {
        errorMessage += "Camera access was blocked due to security restrictions.";
      } else {
        errorMessage += err.message || "Unknown error occurred.";
      }
      setCameraError(errorMessage);
      setIsInitializingCamera(false);
      setNeedsManualPlay(false);

      if (cameraRetryCount < 3) {
        const nextRetryCount = cameraRetryCount + 1;
        setCameraRetryCount(nextRetryCount);
        devLog(`Auto-retrying camera initialization (attempt ${nextRetryCount}/3)...`);
        cameraRetryTimeoutRef.current = setTimeout(() => {
          if (!cameraActive) {
            startCamera();
          }
        }, 1500);
      }
    }
  };

  // Handle manual play button click with improved error handling
  const handleManualPlay = useCallback(() => {
    devLog("Manual play button clicked");
    
    if (!videoRef.current || !videoRef.current.srcObject) {
      devErr("Video element or stream not available for manual play");
      // Restart camera initialization if there's no stream
      setCameraError("Camera stream not available. Restarting camera...");
      setNeedsManualPlay(false);
      setTimeout(() => startCamera(), 500);
      return;
    }
    
    try {
      // Check if stream is active
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getVideoTracks();
      if (tracks.length === 0 || !tracks[0].enabled || tracks[0].readyState !== 'live') {
        devWarn("Video track not active, restarting camera");
        // Restart camera initialization
        setCameraError("Camera stream not active. Restarting camera...");
        setNeedsManualPlay(false);
        setTimeout(() => startCamera(), 500);
        return;
      }
      
      // Try to play the video
      if (videoRef.current.paused) {
        devLog("Attempting to play paused video");
        videoRef.current.play()
          .then(() => {
            devLog("Manual play successful");
            setNeedsManualPlay(false);
            setCameraActive(true);
            setLessonStatus("waiting");
            // Force remounting the video element
            videoRef.current?.setAttribute('key', `webcam-video-${Date.now()}`);
          })
          .catch(error => {
            devErr("Failed to play video after manual interaction:", error);
            setCameraError("Browser prevented video playback. Please check camera permissions and refresh the page.");
          });
      } else {
        devLog("Video is already playing, just activating UI");
        setNeedsManualPlay(false);
        setCameraActive(true);
        setLessonStatus("waiting");
      }
    } catch (error) {
      devErr("Error in manual play:", error);
      setCameraError("Error starting video: " + (error instanceof Error ? error.message : String(error)));
    }
  }, []);

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setLessonStatus("waiting");
    setProgress(0);
    setFeedbackMessage("");
    setCameraError(null);
    setPredictionResult(null);
    setPredictionError(null);
    if (predictionIntervalRef.current) {
      clearInterval(predictionIntervalRef.current);
      predictionIntervalRef.current = null;
    }
  };

  // Persist a recognition attempt to the backend, awarding XP/streak/achievements.
  // Fire-and-forget: a failed POST (e.g. not signed in, DB down) must never
  // interrupt the live recognition loop.
  const recordAttempt = useCallback(
    async (attempt: {
      signLabel: string;
      lessonType: "alphabet" | "number";
      predictedLabel: string;
      confidence: number;
      correct: boolean;
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
          setXpToast({
            xp: data.xpGained,
            achievements: (data.unlockedAchievements ?? []).map(
              (a: { name: string }) => a.name
            ),
          });
          setTimeout(() => setXpToast(null), 4000);
        }
      } catch (err) {
        devWarn("Failed to record attempt:", err);
      }
    },
    []
  );

  // Detect hands and send landmarks to backend
  useEffect(() => {
    // Only run this effect when conditions are met
    if (!cameraActive || lessonStatus !== "recording" || isPaused || !modelLoaded || !videoRef.current) return;

    let isEffectActive = true; // Track if the effect is still active
    let lastLandmarks: number[][] | null = null;
    let currentLandmarks: number[][] | null = null;
    let lastVelocities: number[][] | null = null; // Track velocities for motion prediction
    let lastDetectionTime = 0;
    let rafId: number | null = null;

    // Enhanced smoothing that accounts for velocity but with less delay
    const smoothLandmarks = (current: number[][], previous: number[][] | null, velocities: number[][] | null, smoothingFactor = SMOOTHING_FACTOR): [number[][], number[][]] => {
      if (!previous) return [current, current.map(landmark => [0, 0, 0])];
      
      const newVelocities: number[][] = [];
      const smoothed = current.map((landmark, i) => {
        if (!previous[i]) return landmark;
        
        // Calculate current velocity
        const vx = (landmark[0] - previous[i][0]);
        const vy = (landmark[1] - previous[i][1]);
        const vz = landmark.length > 2 ? (landmark[2] - previous[i][2]) : 0;
        
        // Apply damping to velocity if previous velocities exist
        const dampedVx = velocities ? vx * (1 - VELOCITY_DAMPING) + velocities[i][0] * VELOCITY_DAMPING : vx;
        const dampedVy = velocities ? vy * (1 - VELOCITY_DAMPING) + velocities[i][1] * VELOCITY_DAMPING : vy;
        const dampedVz = velocities ? vz * (1 - VELOCITY_DAMPING) + velocities[i][2] * VELOCITY_DAMPING : vz;
        
        // Store new velocity
        newVelocities.push([dampedVx, dampedVy, dampedVz]);
        
        // Apply lower smoothing for faster response
        return [
          landmark[0] * (1 - smoothingFactor) + previous[i][0] * smoothingFactor + dampedVx * 0.5,
          landmark[1] * (1 - smoothingFactor) + previous[i][1] * smoothingFactor + dampedVy * 0.5,
          landmark.length > 2 ? landmark[2] * (1 - smoothingFactor) + previous[i][2] * smoothingFactor + dampedVz * 0.5 : 0
        ];
      });
      
      return [smoothed, newVelocities];
    };

    // Render loop for smooth animations with faster response
    const renderFrame = () => {
      if (!isEffectActive || !canvasRef.current || !lastLandmarks) {
        // If no landmarks are available, clear the canvas
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }
        rafId = null;
        return;
      }
      
      // Calculate interpolation factor based on time since last detection
      const now = performance.now();
      const elapsed = now - lastDetectionTime;
      
      // If too much time has passed without a detection, stop rendering and clear canvas
      if (elapsed > DETECTION_INTERVAL * 3) {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }
        lastLandmarks = null;
        currentLandmarks = null;
        rafId = null;
        return;
      }
      
      const alpha = Math.min(elapsed / DETECTION_INTERVAL, 0.8); // Cap at 0.8 to avoid over-prediction
      
      // Interpolate between current and predicted next position
      // Use less interpolation for faster response
      const interpolated = currentLandmarks && alpha < 0.8 && lastVelocities
        ? interpolatePositions(lastLandmarks, currentLandmarks, alpha * 1.5) // Faster interpolation
        : lastLandmarks;
      
      // Draw the landmarks
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        // Clear previous frame first
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        // Then draw new landmarks
        drawHandLandmarks(ctx, interpolated);
      }
      
      // Request next frame
      rafId = requestAnimationFrame(renderFrame);
    };

    const detectHands = async () => {
      // Skip if effect is no longer active
      if (!isEffectActive) return;
      
      if (!modelRef.current || !videoRef.current || !canvasRef.current) {
        devWarn("Missing resources for hand detection - model, video, or canvas not ready");
        return;
      }

      try {
        // Only proceed if the video is ready and playing
        if (videoRef.current.readyState !== 4) {
          devLog("Video not ready yet, waiting...");
          return;
        }

        lastDetectionTime = performance.now();
        const predictions = await modelRef.current.estimateHands(videoRef.current);
        
        // Skip processing if effect is no longer active
        if (!isEffectActive || !canvasRef.current) return;
        
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) {
          devWarn("Canvas context not available");
          return;
        }

        if (predictions.length > 0) {
          // Hand detected - process as normal
          // Get the raw landmarks from the prediction
          const rawLandmarks = predictions[0].landmarks;
          
          // Apply enhanced smoothing with velocity
          const [smoothedLandmarks, newVelocities] = smoothLandmarks(rawLandmarks, lastLandmarks, lastVelocities);
          
          // Update references for next frame
          currentLandmarks = lastLandmarks; // Previous becomes current for interpolation
          lastLandmarks = smoothedLandmarks;
          lastVelocities = newVelocities;
          
          // Start render loop if not already running
          if (rafId === null) {
            rafId = requestAnimationFrame(renderFrame);
          }

          // Skip further processing if effect is no longer active
          if (!isEffectActive) return;

          try {
            setPredictionError(null);
            
            // Process landmarks for debugging only
            if (debugMode) {
              const debugProcessedLandmarks = preprocessLandmarks(smoothedLandmarks);
              setDebugLandmarks(debugProcessedLandmarks);
            }
            
            // Pass the original landmarks to predictGesture, which will preprocess them internally
            const result = await predictGesture(smoothedLandmarks);
            
            // Immediately update the prediction result state to trigger UI updates
            setPredictionResult(result);
            
            // Skip state updates if effect is no longer active
            if (!isEffectActive) return;
            
            if (result.prediction) {
              setPredictionHistory(prev => {
                const newHistory = [result.prediction, ...prev];
                return newHistory.slice(0, 5);
              });

              // Calculate confidence and check if the prediction matches the target sign
              const confidencePercent = Math.round(result.confidence * 100);
              const isCorrectSign = result.prediction === targetSign;
              
              // Update state to track if correct sign is currently shown
              setIsCorrectSignShown(isCorrectSign && result.confidence > RECOGNITION_CONFIDENCE_THRESHOLD);
              
              // Update consecutive matches count - ONLY if showing the instructed sign
              if (isCorrectSign && result.confidence > RECOGNITION_CONFIDENCE_THRESHOLD) {
                setConsecutiveMatches(prev => prev + 1);
              } else {
                setConsecutiveMatches(0);
              }

              // Update feedback based on prediction with clearer messaging
              if (isCorrectSign) {
                // Correct sign shown - positive feedback based on confidence
                setFeedbackMessage(
                  result.confidence > 0.8
                    ? `Excellent! Your "${targetSign}" sign is very accurate.`
                    : result.confidence > 0.6
                    ? `Good! Your "${targetSign}" sign is recognizable.`
                    : `Your "${targetSign}" sign is detected but try to be more precise.`,
                );
                setShowTryAgain(false);
              } else {
                // Wrong sign shown - provide guidance to show the correct sign
                setFeedbackMessage(
                  `Detected "${result.prediction}" instead of "${targetSign}". Please make the "${targetSign}" sign as shown in the instructions.`
                );
                setShowTryAgain(confidencePercent < ACCURACY_THRESHOLD);
              }

              // Only advance progress if consecutively showing the CORRECT instructed sign
              if (isCorrectSign && consecutiveMatches >= CONSECUTIVE_MATCHES_NEEDED) {
                // Record the successful attempt once per confirmed sign (not per frame).
                if (recordedSignRef.current !== targetSign) {
                  recordedSignRef.current = targetSign;
                  void recordAttempt({
                    signLabel: targetSign,
                    lessonType,
                    predictedLabel: result.prediction,
                    confidence: result.confidence,
                    correct: true,
                  });
                }
                setProgress((prev) => {
                  const newProgress = prev + 5; // Increase by larger steps when we're confident
                  if (newProgress >= 100) {
                    if (currentGesture < currentLessons.length - 1) {
                      setCurrentGesture((prevGesture) => prevGesture + 1);
                      setTargetSign(currentLessons[currentGesture + 1]);
                      setConsecutiveMatches(0); // Reset consecutive matches for new target
                      return 0;
                    } else {
                      setLessonStatus("success");
                    }
                  }
                  return Math.min(newProgress, 100);
                });
              } else if (isCorrectSign && result.confidence > 0.7) {
                // Small progress increase for correct sign even without consecutive matches
                setProgress((prev) => Math.min(prev + 1, 100));
              } else if (!isCorrectSign) {
                // If showing wrong sign, slightly decrease progress to emphasize correct practice
                setProgress((prev) => Math.max(prev - 0.5, 0));
              }
            } else {
              // Skip state updates if effect is no longer active
              if (!isEffectActive) return;
              
              setPredictionResult(null);
              setFeedbackMessage("No hand detected. Position your hand in the frame.");
            }
          } catch (error: any) {
            // Skip state updates if effect is no longer active
            if (!isEffectActive) return;
            
            devErr("Prediction error:", error);
            setPredictionError(error.message || "Failed to get prediction from server.");
            setPredictionResult(null);
          }
        } else {
          // No hand detected - clear canvas and reset landmarks
          if (ctx && canvasRef.current) {
            // Clear the canvas when no hand is detected
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
          
          // Reset landmarks to stop the animation when hand is removed
          lastLandmarks = null;
          currentLandmarks = null;
          lastVelocities = null;
          
          // Cancel animation frame if running
          if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
          
          // Update prediction state
          setPredictionResult(null);
          setFeedbackMessage("No hand detected. Position your hand in the frame.");
        }
      } catch (error) {
        // Skip logging if effect is no longer active
        if (!isEffectActive) return;
        
        devErr("Hand detection error:", error);
      }
    };

    // Use a more responsive throttled detection interval
    const detectHandsThrottled = throttle(detectHands, 25); // Reduced from 50ms for faster response
    
    predictionIntervalRef.current = setInterval(detectHandsThrottled, DETECTION_INTERVAL);
    
    // Clean up function
    return () => {
      isEffectActive = false; // Mark effect as inactive
      
      if (predictionIntervalRef.current) {
        clearInterval(predictionIntervalRef.current);
        predictionIntervalRef.current = null;
      }
      
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [cameraActive, lessonStatus, isPaused, modelLoaded, targetSign, currentGesture, currentLessons, ACCURACY_THRESHOLD, debugMode]);

  // Draw hand landmarks
  const drawHandLandmarks = useCallback((ctx: CanvasRenderingContext2D, landmarks: number[][]) => {
    if (!ctx || !canvasRef.current || !landmarks || landmarks.length === 0) {
      devWarn("Cannot draw hand landmarks: missing context, canvas, or landmarks");
      return;
    }

    try {
      // Define connections between hand landmarks - move outside function to avoid recreation
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
        [0, 5], [5, 9], [9, 13], [13, 17],
      ];

      // Clear previous drawings
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Draw landmarks
      landmarks.forEach((landmark, index) => {
        const x = landmark[0];
        const y = landmark[1];
        if (isNaN(x) || isNaN(y)) return;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#7D54FF";
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "8px Arial";
        ctx.fillText(index.toString(), x - 2, y + 2);
      });

      // Draw connections
      connections.forEach(([i1, i2]) => {
        if (!landmarks[i1] || !landmarks[i2]) return;
        
        const x1 = landmarks[i1][0];
        const y1 = landmarks[i1][1];
        const x2 = landmarks[i2][0];
        const y2 = landmarks[i2][1];
        
        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) return;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "#7D54FF";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    } catch (error) {
      devErr("Error drawing hand landmarks:", error);
    }
  }, []);

  // Feedback color
  const getFeedbackColor = (score: number) => {
    if (score > 70) return "bg-[#22C55E]";
    if (score >= 50) return "bg-[#FFC83D]";
    return "bg-[#FF7A59]";
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch((err) => devErr("Fullscreen error:", err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Start recording
  const startRecording = () => {
    setLessonStatus("recording");
    setProgress(0);
    setShowTryAgain(false);
    setFeedbackMessage("");
    setPredictionResult(null);
    setPredictionError(null);
  };

  // Try again
  const tryAgain = () => {
    setProgress(0);
    setShowTryAgain(false);
    setFeedbackMessage("");
    setPredictionResult(null);
    setPredictionError(null);
  };

  // Toggle pause
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Reset lesson
  const resetLesson = () => {
    setLessonStatus("waiting");
    setProgress(0);
    setCurrentGesture(0);
    setTargetSign(currentLessons[0]);
    setShowTryAgain(false);
    setFeedbackMessage("");
    setPredictionResult(null);
    setPredictionError(null);
  };

  // Toggle lesson type
  const toggleLessonType = () => {
    const newType = lessonType === "alphabet" ? "number" : "alphabet";
    setLessonType(newType);
    setTargetSign(newType === "alphabet" ? "A" : "0");
    setCurrentGesture(0);
    setProgress(0);
    setLessonStatus("waiting");
    setPredictionResult(null);
    setPredictionError(null);
    if (cameraActive) stopCamera();
  };

  // Initialize target sign
  useEffect(() => {
    setTargetSign(lessonType === "alphabet" ? "A" : "0");
  }, [lessonType]);

  // Allow a fresh attempt record whenever the target sign changes.
  useEffect(() => {
    recordedSignRef.current = null;
  }, [targetSign]);

  // Initialize canvas and video dimensions when component mounts
  useEffect(() => {
    // Helper function to handle window resizing
    const handleResize = () => {
      if (canvasRef.current && videoRef.current) {
        if (videoRef.current.videoWidth) {
          // If video is playing, match canvas to video dimensions
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
        } else {
          // Default dimensions if video isn't playing yet
          canvasRef.current.width = 640;
          canvasRef.current.height = 480;
        }
      }
    };

    // Initial setup
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Ensure refs are set up after render
  useEffect(() => {
    // Flag when video element ref is ready
    if (videoRef.current && !videoElementReady) {
      setVideoElementReady(true);
      devLog("Video element reference is ready");
    }
  }, [videoElementReady]);

  // Clean up
  useEffect(() => {
    return () => {
      if (predictionIntervalRef.current) clearInterval(predictionIntervalRef.current);
      if (cameraRetryTimeoutRef.current) clearTimeout(cameraRetryTimeoutRef.current);
      stopCamera();
    };
  }, []);

  // Add a function to manually check webcam visibility
  const checkWebcamVisibility = useCallback(() => {
    if (!videoRef.current) return;
    
    if (videoRef.current.srcObject) {
      devLog("Current video status:", {
        paused: videoRef.current.paused,
        readyState: videoRef.current.readyState,
        videoWidth: videoRef.current.videoWidth,
        videoHeight: videoRef.current.videoHeight,
        currentTime: videoRef.current.currentTime,
        duration: videoRef.current.duration,
        ended: videoRef.current.ended,
      });
      
      // Try to force refresh the video display
      if (videoRef.current.style.display === 'none') {
        videoRef.current.style.display = 'block';
      }
      
      // Force a play attempt if the video is paused
      if (videoRef.current.paused) {
        videoRef.current.play().catch(e => devLog("Could not play video:", e));
      }
    } else {
      devLog("No source stream attached to video element");
    }
  }, []);

  // Optimize the camera component to reduce redraws
  // Add this to your component declaration for smoother video performance
  useEffect(() => {
    if (videoRef.current) {
      // Optimize video performance
      videoRef.current.playsInline = true;
      videoRef.current.muted = true;
      videoRef.current.setAttribute('playsinline', 'true');
      
      // Set video to hardware acceleration if available
      // @ts-ignore - non-standard property
      if (videoRef.current.style.webkitTransform !== undefined) {
        videoRef.current.style.webkitTransform = 'translate3d(0,0,0)';
      }
      
      // Focus on framerate over quality when possible
      // @ts-ignore - non-standard property
      if (videoRef.current.mozFrameRate !== undefined) {
        // @ts-ignore
        videoRef.current.mozFrameRate = 30;
      }
      
      // Reduce video processing latency when possible
      // @ts-ignore - non-standard property
      if (videoRef.current.style.willChange !== undefined) {
        videoRef.current.style.willChange = 'transform';
      }
    }
    
    if (canvasRef.current) {
      // Optimize canvas rendering
      const ctx = canvasRef.current.getContext('2d', {
        alpha: true,
        desynchronized: true, // Reduce latency when supported
      });
      
      if (ctx) {
        // Use faster path rendering
        // @ts-ignore - non-standard property
        if (ctx.imageSmoothingEnabled !== undefined) {
          ctx.imageSmoothingEnabled = false;
        }
      }
    }
  }, [videoRef.current, canvasRef.current]);

  // Function to move to the next sign
  const goToNextSign = () => {
    if (currentGesture < currentLessons.length - 1) {
      setCurrentGesture((prev) => prev + 1);
      setTargetSign(currentLessons[currentGesture + 1]);
      setProgress(0);
      setConsecutiveMatches(0);
      setPredictionResult(null);
      setFeedbackMessage("");
    }
  };

  // Function to move to the previous sign
  const goToPreviousSign = () => {
    if (currentGesture > 0) {
      setCurrentGesture((prev) => prev - 1);
      setTargetSign(currentLessons[currentGesture - 1]);
      setProgress(0);
      setConsecutiveMatches(0);
      setPredictionResult(null);
      setFeedbackMessage("");
    }
  };

  // Add a useEffect to hide tip after a delay
  useEffect(() => {
    if (showTip) {
      const timer = setTimeout(() => {
        setShowTip(false);
      }, 8000); // Show tip for 8 seconds
      
      return () => clearTimeout(timer);
    }
  }, [showTip]);

  const animateStyle = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.5s ease-out forwards;
    }
  `;

  return (
    <>
      <Head>
        <title>Sanjog - Interactive Sign Language Lesson</title>
        <meta
          name="description"
          content="Practice sign language with AI-powered hand gesture recognition in an interactive lesson."
        />
        <style>{animateStyle}</style>
      </Head>
      <div className="flex h-screen bg-[#FAF7FF] overflow-hidden" ref={containerRef}>
        <div className="flex-1 flex flex-col">
          {/* Top Navigation */}
          <div className="bg-white p-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/lessons"
                className="flex items-center text-[#7E7A93] hover:text-[#7D54FF]"
                aria-label="Back to lessons"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Lessons
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLessonType}
                className="bg-[#EAE4FF] text-[#7D54FF] text-xs px-3 py-1 rounded-full hover:bg-[#EAE4FF]"
                aria-label={`Switch to ${lessonType === "alphabet" ? "numbers" : "alphabet"} lessons`}
              >
                {lessonType === "alphabet" ? "Switch to Numbers" : "Switch to Alphabet"}
              </button>
              <div className="bg-[#EAE4FF] text-[#7D54FF] text-xs px-3 py-1 rounded-full">
                {lessonType === "alphabet" ? "Letter" : "Number"} {currentGesture + 1}/{currentLessons.length}
              </div>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* XP / Achievement Toast — branded */}
          {xpToast && (
            <>
              {xpToast.achievements.length > 0 ? (
                <AchievementCelebration
                  name={xpToast.achievements[0]}
                  icon="🏆"
                  xp={xpToast.xp}
                  onDone={() => setXpToast(null)}
                />
              ) : (
                <XPToast
                  xp={xpToast.xp}
                  achievements={[]}
                  onDone={() => setXpToast(null)}
                />
              )}
            </>
          )}

          {/* XP / Achievement Toast */}
          {xpToast && (
            <div className="fixed top-20 right-6 max-w-sm z-[60] animate-fade-in-up">
              <div className="bg-[#7D54FF] text-white p-4 rounded-lg shadow-lg">
                {xpToast.xp > 0 && (
                  <div className="font-bold text-lg flex items-center gap-2">
                    <span>✨</span> +{xpToast.xp} XP
                  </div>
                )}
                {xpToast.achievements.length > 0 && (
                  <div className="mt-1 text-sm">
                    🏆 Unlocked: {xpToast.achievements.join(", ")}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Floating Tip Notification */}
          {showTip && (
            <div className="fixed bottom-6 right-6 max-w-sm z-50 animate-fade-in-up">
              <div className="bg-[#ffe9ac] p-4 rounded-lg shadow-lg relative">
                <button
                  onClick={() => setShowTip(false)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                  aria-label="Close tip"
                >
                  ✕
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-[#ff2600] text-lg">💡</div>
                  <div className="font-medium text-[#2D1B69]">Tip</div>
                </div>
                <p className="text-sm text-[#7E7A93]">
                  Ensure your hand is well-lit and clearly visible. Keep it steady for better recognition.
                </p>
              </div>
            </div>
          )}
          
          {/* Lesson Content */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Panel - Instructions */}
            <div className="w-full md:w-1/2 h-full overflow-auto">
              <div className="p-2 h-full">
                <div className="bg-white rounded-xl p-6 h-full overflow-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-[#2D1B69]">
                      {lessonType === "alphabet" ? "Letter" : "Number"} {lessonContent.name}
                    </h1>
                    <div className="flex items-center gap-2">
                      <div className="bg-[#EAE4FF] text-[#7D54FF] text-xs px-3 py-1 rounded-full">
                        {lessonContent.difficulty}
                      </div>
                      {/* Add navigation buttons here */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={goToPreviousSign}
                          disabled={currentGesture === 0}
                          className={`border border-[#7D54FF] text-[#7D54FF] px-1 py-1 rounded-full hover:bg-[#EAE4FF] flex items-center ${
                            currentGesture === 0 ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          aria-label="Previous sign"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={goToNextSign}
                          disabled={currentGesture === currentLessons.length - 1}
                          className={`border border-[#7D54FF] text-[#7D54FF] px-1 py-1 rounded-full hover:bg-[#EAE4FF] flex items-center ${
                            currentGesture === currentLessons.length - 1 ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          aria-label="Next sign"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[#7E7A93] mb-6">{lessonContent.description}</p>
                  <div className="bg-[#FAF7FF] rounded-lg overflow-hidden mb-6 flex items-center justify-center">
                    <img src={lessonContent.imageUrl} alt={`Sign for ${targetSign}`} className="object-contain" width={300} height={300} />
                  </div>
                  <h2 className="text-lg font-bold text-[#2D1B69] mb-4">Instructions</h2>
                  <ol className="space-y-3 text-[#7E7A93] mb-6">
                    {lessonContent.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="bg-[#EAE4FF] w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[#7D54FF] text-xs font-bold">{index + 1}</span>
                        </div>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>

                  {/* Debug info section */}
                  {cameraActive && process.env.NODE_ENV !== 'production' && (
                    <div className="mt-6 bg-slate-100 p-3 rounded-lg">
                      <h3 className="text-sm font-semibold mb-2">Debug Information</h3>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Camera active: {cameraActive ? 'Yes' : 'No'}</p>
                        <p>Camera status: {isInitializingCamera ? 'Initializing' : needsManualPlay ? 'Needs manual play' : 'Ready'}</p>
                        <p>Model loaded: {modelLoaded ? 'Yes' : 'No'}</p>
                        <p>Video element: {videoRef.current ? 'Available' : 'Not available'}</p>
                        {videoRef.current && (
                          <>
                            <p>Video paused: {videoRef.current.paused ? 'Yes' : 'No'}</p>
                            <p>Video size: {videoRef.current.videoWidth}x{videoRef.current.videoHeight}</p>
                            <p>Video ready state: {videoRef.current.readyState}</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Webcam */}
            <div className="w-full md:w-1/2 h-full bg-[#2D1B69] flex flex-col">
              <div className="flex-1 p-2 flex flex-col">
                {/* Backend connection indicator */}
                {backendConnected === false && (
                  <div className="bg-red-500 text-white text-sm px-3 py-2 rounded-lg mb-4 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    <span>Cannot connect to the sign language recognition server. Please ensure the Flask backend is running.</span>
                  </div>
                )}

                <div className="relative bg-black rounded-lg overflow-hidden flex-1 camera-container" style={{ minHeight: "300px", aspectRatio: "4/3" }}>
                  {cameraActive || isInitializingCamera ? (
                    <>
                      {/* Video debug overlay - only in development */}
                      {process.env.NODE_ENV !== 'production' && videoRef.current && (
                        <div className="absolute top-2 left-2 z-20 bg-black bg-opacity-50 text-white text-xs p-1 rounded">
                          {videoRef.current.videoWidth}x{videoRef.current.videoHeight} | 
                          {videoRef.current.paused ? ' PAUSED' : ' PLAYING'} | 
                          Ready: {videoRef.current.readyState}
                        </div>
                      )}
                      
                      {/* Main container to ensure proper display */}
                      <div className="relative w-full h-full">
                        {/* Video element */}
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          width={640}
                          height={480}
                          className="w-full h-full object-contain"
                          style={{ 
                            display: "block",
                            backgroundColor: "#000",
                            visibility: "visible",
                            position: "relative",
                            zIndex: 1,
                            // transform: "scaleX(-1)"
                          }}
                          onLoadedMetadata={() => {
                            devLog("Video metadata loaded");
                            if (videoRef.current && canvasRef.current) {
                              canvasRef.current.width = videoRef.current.videoWidth || 640;
                              canvasRef.current.height = videoRef.current.videoHeight || 480;
                              devLog(`Canvas size set to ${canvasRef.current.width}x${canvasRef.current.height}`);
                            }
                          }}
                        />
                        
                        {/* Canvas overlay */}
                        <canvas 
                          key={`hand-canvas-${Date.now()}`}
                          ref={canvasRef} 
                          width={640} 
                          height={480} 
                          className="absolute inset-0 w-full h-full pointer-events-none" 
                          style={{ 
                            // transform: "scaleX(-1)" // Mirror the canvas to match the video
                          }} 
                        />
                      </div>
                      
                      {/* Add webcam debug button in development */}
                      {process.env.NODE_ENV !== 'production' && (
                        <button 
                          onClick={checkWebcamVisibility}
                          className="absolute bottom-4 left-4 z-50 bg-white text-black text-xs px-2 py-1 rounded opacity-70 hover:opacity-100"
                        >
                          Check Camera
                        </button>
                      )}
                      
                      {/* Manual play button overlay */}
                      {needsManualPlay && <ManualPlayButton onClick={handleManualPlay} />}
                      
                      {/* Camera init — branded process loader */}
                      {isInitializingCamera && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40 rounded-lg">
                          <CameraInitLoader message="Starting Camera" />
                        </div>
                      )}
                      
                      {predictionResult && (
                        <div className="absolute top-4 right-4 z-10">
                          {/* Gesture analysis overlay while recording */}
                          {lessonStatus === "recording" && (
                            <div className="mb-2 bg-black/70 rounded-xl p-3">
                              <GestureDetectionLoader
                                confidence={Math.round(predictionResult.confidence * 100)}
                                message="Analyzing Gesture…"
                              />
                            </div>
                          )}
                          <div
                            className="bg-[#7D54FF] text-white text-5xl font-bold px-6 py-4 rounded-lg shadow-lg"
                            style={{
                              opacity: predictionResult.confidence > 0.5 ? 1 : 0.6,
                              transition: 'opacity 0.3s, transform 0.3s, background-color 0.3s',
                              transform: `scale(${predictionResult.confidence > 0.7 ? 1.1 : 1})`,
                              backgroundColor: predictionResult.prediction === targetSign ? '#22C55E' : predictionResult.confidence < 0.6 ? '#FFC83D' : '#7D54FF',
                            }}
                          >
                            {predictionResult.prediction}
                          </div>
                          <div className="text-white text-center text-xs mt-1 bg-black bg-opacity-50 rounded px-2 py-1">
                            Confidence: {Math.round(predictionResult.confidence * 100)}%
                          </div>
                        </div>
                      )}
                      {predictionHistory.length > 0 && (
                        <div className="absolute bottom-4 right-4 z-10">
                          <div className="bg-black bg-opacity-60 text-white px-3 py-2 rounded-lg text-sm">
                            <p className="mb-1 opacity-60">Recent predictions:</p>
                            <div className="flex space-x-2">
                              {predictionHistory.map((pred, idx) => (
                                <span
                                  key={idx}
                                  className={`w-8 h-8 flex items-center justify-center rounded ${
                                    pred === targetSign ? 'bg-green-600' : 'bg-gray-700'
                                  }`}
                                >
                                  {pred}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {predictionError && lessonStatus === "recording" && (
                        <div className="absolute bottom-4 left-4 right-4 bg-red-500 bg-opacity-90 rounded-lg px-3 py-2 text-white text-center">
                          <div className="text-sm">{predictionError}</div>
                        </div>
                      )}
                      {lessonStatus === "recording" && !predictionResult && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                            Position your hand in the frame
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <div className="mb-4">
                        <Camera className="w-16 h-16 opacity-50" />
                      </div>
                      <p className="text-center mb-4">Enable your camera to practice signing</p>
                      {cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-900 bg-opacity-80 text-white p-6 z-10 rounded-lg">
                          <div className="text-center mb-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-12 w-12 mx-auto mb-2 text-red-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                            <h3 className="text-xl font-bold mb-2">Camera Issue</h3>
                            <p>{cameraError}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={startCamera}
                              className="px-4 py-2 bg-white text-indigo-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                            >
                              Retry Camera
                            </button>
                            <button
                              onClick={() => window.location.reload()}
                              className="px-4 py-2 border border-white text-white rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition-colors"
                            >
                              Refresh Page
                            </button>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={startCamera}
                        disabled={isInitializingCamera || isModelLoading}
                        className={`bg-[#7D54FF] text-white px-6 py-2 rounded-full shadow-btn transition-transform hover:scale-[1.03] active:translate-y-1 active:shadow-none hover:bg-opacity-90 flex items-center gap-2 ${
                          isInitializingCamera || isModelLoading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                        aria-label="Start camera"
                      >
                        {isModelLoading || isInitializingCamera ? (
                          <ButtonLoader size={16} />
                        ) : null}
                        {isModelLoading ? "Loading Model…" : isInitializingCamera ? "Starting Camera…" : "Start Camera"}
                      </button>
                      {isModelLoading && (
                        <div className="mt-4">
                          <ModelInitLoader message="Initializing Sign Recognition" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Real-time Score Display */}
                {cameraActive && lessonStatus === "recording" && (
                  <div className="mt-4 bg-[#111418] rounded-lg p-4" aria-live="polite">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-white font-bold text-lg flex items-center">
                        <span className="bg-[#7D54FF] text-white text-sm px-2 py-1 rounded mr-2">
                          {targetSign}
                        </span>
                        Score: {predictionResult ? Math.round(predictionResult.confidence * 100) : 0}%
                      </div>
                      {isCorrectSignShown && (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-lg flex items-center gap-1 animate-pulse">
                          <CheckCircle className="w-4 h-4" /> Done!
                        </span>
                      )}
                      {showTryAgain && !isCorrectSignShown && (
                        <button
                          onClick={tryAgain}
                          className="bg-[#FF7A59] text-white px-4 py-1 rounded-lg hover:bg-opacity-90 flex items-center gap-2"
                          aria-label="Try sign again"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Try Again
                        </button>
                      )}
                    </div>
                    <div className="h-3 bg-white bg-opacity-20 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full ${predictionResult ? getFeedbackColor(Math.round(predictionResult.confidence * 100)) : 'bg-gray-500'} rounded-full transition-all duration-300`}
                        style={{ 
                          width: `${predictionResult ? Math.round(predictionResult.confidence * 100) : 0}%`,
                          opacity: predictionResult && predictionResult.prediction === targetSign ? 1 : 0.5
                        }}
                      />
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                      {predictionResult && predictionResult.prediction !== targetSign ? (
                        <AlertTriangle className="w-4 h-4 text-[#FF7A59] flex-shrink-0 mt-0.5" />
                      ) : (
                        predictionResult && predictionResult.confidence < ACCURACY_THRESHOLD / 100 ? (
                          <AlertTriangle className="w-4 h-4 text-[#FFC83D] flex-shrink-0 mt-0.5" />
                        ) : (
                          !predictionResult && <AlertTriangle className="w-4 h-4 text-[#FFC83D] flex-shrink-0 mt-0.5" />
                        )
                      )}
                      <p className="text-white text-sm opacity-80">
                        {predictionResult ? feedbackMessage : "No hand detected. Position your hand in the frame."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex flex-wrap justify-between gap-4 mt-4">
                  <div className="flex gap-2">
                    {cameraActive && (
                      <>
                        {lessonStatus === "waiting" ? (
                          <button
                            onClick={startRecording}
                            className="bg-[#7D54FF] text-white px-4 py-2 rounded-full shadow-btn transition-transform hover:scale-[1.03] active:translate-y-1 active:shadow-none hover:bg-opacity-90 flex items-center gap-2"
                            aria-label="Start practice"
                          >
                            <Play className="w-4 h-4" />
                            Start Practice
                          </button>
                        ) : (
                          <button
                            onClick={togglePause}
                            className="bg-[#7D54FF] text-white px-4 py-2 rounded-full shadow-btn transition-transform hover:scale-[1.03] active:translate-y-1 active:shadow-none hover:bg-opacity-90 flex items-center gap-2"
                            aria-label={isPaused ? "Resume practice" : "Pause practice"}
                          >
                            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            {isPaused ? "Resume" : "Pause"}
                          </button>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={stopCamera}
                            className="border border-[#EAE4FF] text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2"
                            aria-label="Stop camera"
                          >
                            <CameraOff className="w-4 h-4" />
                            Stop Camera
                          </button>
                          
                          {isCorrectSignShown && (
                            <button
                              onClick={goToNextSign}
                              disabled={currentGesture === currentLessons.length - 1}
                              className={`bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2 transition-all duration-300 ${
                                currentGesture === currentLessons.length - 1 ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              aria-label="Next session"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Next
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {cameraActive && (
                      <>
                        <button
                          onClick={toggleMute}
                          className="border border-[#EAE4FF] text-white px-3 py-2 rounded-lg hover:bg-gray-800"
                          aria-label={isMuted ? "Unmute" : "Mute"}
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={resetLesson}
                          className="border border-[#EAE4FF] text-white px-3 py-2 rounded-lg hover:bg-gray-800"
                          aria-label="Reset lesson"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        {process.env.NODE_ENV !== 'production' && (
                          <button
                            onClick={() => setDebugMode(!debugMode)}
                            className={`border ${debugMode ? 'border-green-500 bg-green-900 bg-opacity-30' : 'border-[#EAE4FF]'} text-white px-3 py-2 rounded-lg hover:bg-gray-800`}
                            aria-label="Toggle debug mode"
                          >
                            Debug
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {cameraActive && lessonStatus === "recording" && (
                  <div className="mt-6">
                    <div className="flex justify-between text-xs text-white mb-1">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#7D54FF] rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className="text-xs text-white opacity-70">
                        {lessonType === "alphabet" ? "Letter" : "Number"} {currentGesture + 1} of {currentLessons.length}
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="text-white opacity-70 hover:opacity-100 flex items-center gap-1 text-xs"
                          onClick={() => setProgress((prev) => Math.min(prev + 10, 100))}
                          aria-label="Skip to next sign"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          Skip
                        </button>
                        <button
                          className="text-white opacity-70 hover:opacity-100 flex items-center gap-1 text-xs"
                          onClick={() => setProgress(0)}
                          aria-label="Reset current sign progress"
                        >
                          <ThumbsDown className="w-3 h-3" />
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add debug information display */}
                {debugMode && debugLandmarks && (
                  <div className="mt-4 bg-gray-900 rounded-lg p-4 text-xs text-gray-300 overflow-auto max-h-48">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold">Debug: Landmark Data</span>
                      <span>{debugLandmarks.length} values</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {debugLandmarks.map((value, index) => (
                        <div key={index} className="px-1 py-0.5 bg-gray-800 rounded">
                          {index}: {value.toFixed(4)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}