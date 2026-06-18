// useHandTracking.ts
// This hook manages hand tracking with MediaPipe

import { useState, useEffect, useRef } from 'react';

interface HandLandmark {
  x: number;
  y: number;
  z?: number;
}

interface HandTrackingResult {
  multiHandLandmarks?: HandLandmark[][];
}

interface UseHandTrackingProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  enabled: boolean;
  onResults?: (results: HandTrackingResult) => void;
}

interface UseHandTrackingReturn {
  handLandmarks: HandLandmark[] | null;
  cameraError: string | null;
  resetTracking: () => void;
  isMockMode: boolean;
  reinitialize: () => Promise<void>;
}

export function useHandTracking({
  videoRef,
  enabled,
  onResults,
}: UseHandTrackingProps): UseHandTrackingReturn {
  const [handLandmarks, setHandLandmarks] = useState<HandLandmark[] | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const trackerRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const retryAttemptRef = useRef<number>(0);
  const maxRetries = 5; // Increased from 3 to 5
  const isInitializingRef = useRef<boolean>(false);

  const resetTracking = () => {
    if (cameraRef.current) {
      try {
        cameraRef.current.stop();
      } catch (e) {
        console.warn("Error stopping camera:", e);
      }
      cameraRef.current = null;
    }
    
    if (trackerRef.current) {
      try {
        trackerRef.current.close();
      } catch (e) {
        console.warn("Error closing tracker:", e);
      }
      trackerRef.current = null;
    }
    
    setHandLandmarks(null);
    setCameraError(null);
    isInitializingRef.current = false;
  };

  // Helper function to ensure a video element is available
  const ensureVideoElement = (): HTMLVideoElement | null => {
    // First check our ref
    if (videoRef.current) {
      console.log("Using existing videoRef.current");
      return videoRef.current;
    }
    
    // Try to find a video element in the DOM
    console.log("Looking for video element in DOM");
    const videoElement = document.querySelector('video');
    if (videoElement) {
      console.log("Found video element in DOM");
      // Don't directly set videoRef.current as it's read-only
      return videoElement;
    }
    
    // If nothing found, create a new video element
    console.log("Creating new video element");
    try {
      const newVideoElement = document.createElement('video');
      newVideoElement.autoplay = true;
      newVideoElement.playsInline = true;
      newVideoElement.muted = true;
      newVideoElement.style.width = '640px';
      newVideoElement.style.height = '480px';
      newVideoElement.style.display = 'none'; // Hide it initially
      
      // Append to DOM - look for a container or use body
      const container = document.querySelector('.camera-container') || document.body;
      container.appendChild(newVideoElement);
      
      console.log("New video element created and appended to DOM");
      return newVideoElement;
    } catch (error) {
      console.error("Failed to create video element:", error);
      return null;
    }
  };

  const initializeHandTracking = async () => {
    console.log("Starting hand tracking initialization");
    // Prevent multiple simultaneous initializations
    if (isInitializingRef.current) {
      console.log("Initialization already in progress, skipping");
      return;
    }
    
    isInitializingRef.current = true;
    
    try {
      // Check if MediaPipe is loaded
      if (!(window as any).Hands) {
        console.error("MediaPipe Hands not loaded");
        setIsMockMode(true);
        setCameraError("MediaPipe Hands library not loaded properly. Please refresh the page.");
        isInitializingRef.current = false;
        return;
      }

      // Ensure video element exists before proceeding
      const videoElement = ensureVideoElement();
      if (!videoElement) {
        throw new Error("Could not find or create a video element. Please refresh the page.");
      }
      
      console.log("Video element secured:", videoElement.readyState);

      // Reset any existing tracking
      resetTracking();
      
      // Wait a moment before continuing to ensure DOM is stable
      await new Promise(resolve => setTimeout(resolve, 500));

      // Initialize MediaPipe Hands
      console.log("Initializing MediaPipe Hands");
      const hands = new (window as any).Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      // Set up the result handler
      hands.onResults((results: HandTrackingResult) => {
        const landmarks = results.multiHandLandmarks?.[0] || null;
        setHandLandmarks(landmarks);
        if (onResults) {
          onResults(results);
        }
      });

      // Ensure we have a valid video stream
      if (!videoElement.srcObject) {
        console.log("Video element has no stream, requesting camera access");
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: "user" 
            },
            audio: false
          });
          
          console.log("Camera stream obtained successfully");
          videoElement.srcObject = stream;
          
          // Make sure the video is visible in the DOM
          videoElement.style.display = "block";
          
          // Force play the video immediately to test stream
          try {
            await videoElement.play();
            console.log("Video playback started automatically");
          } catch (playError) {
            console.warn("Could not autoplay video:", playError);
            // Continue anyway as we'll handle this later
          }
        } catch (streamError) {
          console.error("Error getting camera stream:", streamError);
          throw new Error(`Could not access camera: ${streamError instanceof Error ? streamError.message : String(streamError)}`);
        }
      } else {
        console.log("Video element already has a stream:", videoElement.srcObject);
      }

      // Ensure video is ready or wait for it
      if (videoElement.readyState < 2) {
        console.log("Video not ready yet (readyState:", videoElement.readyState, "), waiting for it to load");
        
        // Create a promise that resolves when the video is ready
        await new Promise<void>((resolve, reject) => {
          // Increase timeout from 10s to 20s
          const timeoutId = setTimeout(() => {
            console.warn("Video element load timeout - trying to continue anyway");
            // Instead of rejecting immediately, try to continue with the current state
            try {
              console.log("Current video readyState:", videoElement.readyState);
              // If we at least have some data, try to proceed
              if (videoElement.readyState >= 1) {
                console.log("Video has enough data to continue, proceeding with available state");
                resolve();
                return;
              }
              
              // If no data at all, try forcing a play() call
              videoElement.play()
                .then(() => {
                  console.log("Forced play succeeded");
                  resolve();
                })
                .catch(e => {
                  console.error("Forced play failed:", e);
                  // Only reject if we really cannot continue
                  reject(new Error(`Video element load timeout - cannot play video: ${e.message}`));
                });
            } catch (e) {
              console.error("Error in timeout handler:", e);
              reject(new Error(`Video element load timeout: ${e instanceof Error ? e.message : String(e)}`));
            }
          }, 20000); // Increased from 15000 to 20000
          
          const handleVideoReady = () => {
            console.log("Video ready event fired");
            clearTimeout(timeoutId);
            videoElement.removeEventListener('loadeddata', handleVideoReady);
            videoElement.removeEventListener('loadedmetadata', handleVideoMetadata);
            videoElement.removeEventListener('canplay', handleVideoCanPlay);
            resolve();
          };
          
          const handleVideoMetadata = () => {
            console.log("Video metadata loaded");
            if (videoElement.readyState >= 2) {
              handleVideoReady();
            }
          };
          
          const handleVideoCanPlay = () => {
            console.log("Video can play event");
            handleVideoReady();
          };
          
          videoElement.addEventListener('loadeddata', handleVideoReady);
          videoElement.addEventListener('loadedmetadata', handleVideoMetadata);
          videoElement.addEventListener('canplay', handleVideoCanPlay);
          
          // If already loaded, resolve immediately
          if (videoElement.readyState >= 2) {
            console.log("Video already loaded, resolving immediately");
            clearTimeout(timeoutId);
            videoElement.removeEventListener('loadeddata', handleVideoReady);
            videoElement.removeEventListener('loadedmetadata', handleVideoMetadata);
            videoElement.removeEventListener('canplay', handleVideoCanPlay);
            resolve();
          }
        });
      }

      // Start the camera feed
      console.log("Initializing camera with MediaPipe", videoElement.readyState);
      
      // If videoRef.current is null, but we have a valid videoElement, use that for MediaPipe
      // This is a workaround for the "Video element is not available" error
      const camera = new (window as any).Camera(videoElement, {
        onFrame: async () => {
          try {
            // Add a check to see if the video is playing
            if (videoElement.paused) {
              console.log("Video is paused, attempting to play");
              await videoElement.play().catch(e => console.warn("Could not play paused video:", e));
            }
            
            if (videoElement && trackerRef.current) {
              await trackerRef.current.send({ image: videoElement });
            }
          } catch (error) {
            console.warn("Error sending frame to MediaPipe:", error instanceof Error ? error.message : String(error));
          }
        },
        width: 640,
        height: 480
      });
      
      // Save references
      trackerRef.current = hands;
      cameraRef.current = camera;
      
      // Update videoRef if it was null but we have a working video element
      if (!videoRef.current && videoElement) {
        console.log("Updating working video element reference");
        // Can't directly set videoRef.current, but we can use the videoElement we found/created
      }
      
      // Start camera
      console.log("Starting MediaPipe camera");
      await camera.start();
      console.log("Camera started successfully");
      
      // Reset retry counter on success
      retryAttemptRef.current = 0;
      setCameraError(null);
      isInitializingRef.current = false;
      
    } catch (error: any) {
      console.error("Error initializing hand tracking:", error);
      
      // Auto-retry logic
      if (retryAttemptRef.current < maxRetries) {
        retryAttemptRef.current++;
        console.log(`Retrying hand tracking initialization (${retryAttemptRef.current}/${maxRetries})...`);
        
        // Set a user-friendly error message during retry
        setCameraError(`Camera initialization issue. Retrying... (${retryAttemptRef.current}/${maxRetries})`);
        
        // Wait a moment before retrying
        isInitializingRef.current = false;
        setTimeout(() => {
          initializeHandTracking();
        }, 2000); // Increased delay between retries
        return;
      }
      
      // If max retries reached, set error state
      setIsMockMode(true);
      setCameraError(`Error initializing sign language detection: ${error.message}. Please try refreshing the page.`);
      isInitializingRef.current = false;
    }
  };

  // Public method to manually reinitialize
  const reinitialize = async (): Promise<void> => {
    setCameraError("Reinitializing camera...");
    resetTracking();
    retryAttemptRef.current = 0;
    
    // Add a small delay before reinitializing
    await new Promise(resolve => setTimeout(resolve, 1000));
    return initializeHandTracking();
  };

  useEffect(() => {
    if (!enabled) {
      resetTracking();
      return;
    }

    // Initial delay to ensure video element is properly created in the DOM
    const timeoutId = setTimeout(() => {
      initializeHandTracking();
    }, 2000); // Increased from 1500 to 2000

    return () => {
      clearTimeout(timeoutId);
      resetTracking();
    };
  }, [enabled]);

  return {
    handLandmarks,
    cameraError,
    resetTracking,
    isMockMode,
    reinitialize
  };
}