"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"

// TypeScript interfaces for hand landmarks
interface HandLandmark {
  x: number;
  y: number;
}

export default function LessonPage() {
  const [cameraActive, setCameraActive] = useState(false)
  const [handLandmarks, setHandLandmarks] = useState<HandLandmark[]>([])
  const [lessonStatus, setLessonStatus] = useState("waiting") // waiting, recording, success, failure
  const [countdown, setCountdown] = useState(3)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
      })
      if (videoRef.current) {
        const videoElement = videoRef.current as HTMLVideoElement
        videoElement.srcObject = stream
        setCameraActive(true)
        setLessonStatus("waiting")

        // Simulate hand landmark detection
        simulateHandLandmarkDetection()
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject instanceof MediaStream) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach((track: MediaStreamTrack) => track.stop())
      videoRef.current.srcObject = null
      setCameraActive(false)
      setHandLandmarks([])
      setLessonStatus("waiting")
    }
  }

  // Simulate hand landmark detection
  const simulateHandLandmarkDetection = () => {
    // This would be replaced with actual ML-based hand detection
    // For demo purposes, we'll generate random points that look like a hand

    const generateRandomHandLandmarks = () => {
      // Base position for the hand in the center of the frame
      const centerX = 320
      const centerY = 240

      // Generate 21 landmarks (standard for hand landmarks in MediaPipe)
      const landmarks = []

      // Wrist
      landmarks.push({ x: centerX, y: centerY })

      // Thumb (4 points)
      landmarks.push({ x: centerX - 20, y: centerY - 10 })
      landmarks.push({ x: centerX - 40, y: centerY - 30 })
      landmarks.push({ x: centerX - 60, y: centerY - 50 })
      landmarks.push({ x: centerX - 70, y: centerY - 70 })

      // Index finger (4 points)
      landmarks.push({ x: centerX, y: centerY - 30 })
      landmarks.push({ x: centerX, y: centerY - 60 })
      landmarks.push({ x: centerX, y: centerY - 90 })
      landmarks.push({ x: centerX, y: centerY - 120 })

      // Middle finger (4 points)
      landmarks.push({ x: centerX + 20, y: centerY - 25 })
      landmarks.push({ x: centerX + 20, y: centerY - 55 })
      landmarks.push({ x: centerX + 20, y: centerY - 85 })
      landmarks.push({ x: centerX + 20, y: centerY - 115 })

      // Ring finger (4 points)
      landmarks.push({ x: centerX + 40, y: centerY - 20 })
      landmarks.push({ x: centerX + 40, y: centerY - 50 })
      landmarks.push({ x: centerX + 40, y: centerY - 80 })
      landmarks.push({ x: centerX + 40, y: centerY - 110 })

      // Pinky finger (4 points)
      landmarks.push({ x: centerX + 60, y: centerY - 15 })
      landmarks.push({ x: centerX + 60, y: centerY - 45 })
      landmarks.push({ x: centerX + 60, y: centerY - 75 })
      landmarks.push({ x: centerX + 60, y: centerY - 105 })

      // Add some random movement
      return landmarks.map((point) => ({
        x: point.x + (Math.random() * 10 - 5),
        y: point.y + (Math.random() * 10 - 5),
      }))
    }

    // Update landmarks every 100ms
    const intervalId = setInterval(() => {
      if (cameraActive) {
        setHandLandmarks(generateRandomHandLandmarks())
      } else {
        clearInterval(intervalId)
      }
    }, 100)

    return () => clearInterval(intervalId)
  }

  // Draw hand landmarks on canvas
  useEffect(() => {
    if (canvasRef.current && handLandmarks.length > 0) {
      const canvas = canvasRef.current as HTMLCanvasElement
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw landmarks
      handLandmarks.forEach((point, index) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
        ctx.fillStyle = "#7D54FF"
        ctx.fill()

        // Draw index number
        ctx.fillStyle = "white"
        ctx.font = "8px Arial"
        ctx.fillText(index.toString(), point.x - 2, point.y + 2)
      })

      // Connect landmarks with lines
      // Thumb
      drawLine(ctx, handLandmarks, 0, 1)
      drawLine(ctx, handLandmarks, 1, 2)
      drawLine(ctx, handLandmarks, 2, 3)
      drawLine(ctx, handLandmarks, 3, 4)

      // Index finger
      drawLine(ctx, handLandmarks, 0, 5)
      drawLine(ctx, handLandmarks, 5, 6)
      drawLine(ctx, handLandmarks, 6, 7)
      drawLine(ctx, handLandmarks, 7, 8)

      // Middle finger
      drawLine(ctx, handLandmarks, 0, 9)
      drawLine(ctx, handLandmarks, 9, 10)
      drawLine(ctx, handLandmarks, 10, 11)
      drawLine(ctx, handLandmarks, 11, 12)

      // Ring finger
      drawLine(ctx, handLandmarks, 0, 13)
      drawLine(ctx, handLandmarks, 13, 14)
      drawLine(ctx, handLandmarks, 14, 15)
      drawLine(ctx, handLandmarks, 15, 16)

      // Pinky finger
      drawLine(ctx, handLandmarks, 0, 17)
      drawLine(ctx, handLandmarks, 17, 18)
      drawLine(ctx, handLandmarks, 18, 19)
      drawLine(ctx, handLandmarks, 19, 20)

      // Palm
      drawLine(ctx, handLandmarks, 0, 5)
      drawLine(ctx, handLandmarks, 5, 9)
      drawLine(ctx, handLandmarks, 9, 13)
      drawLine(ctx, handLandmarks, 13, 17)
    }
  }, [handLandmarks])

  // Helper function to draw lines between landmarks
  const drawLine = (
    ctx: CanvasRenderingContext2D, 
    landmarks: HandLandmark[], 
    index1: number, 
    index2: number
  ) => {
    if (landmarks[index1] && landmarks[index2]) {
      ctx.beginPath()
      ctx.moveTo(landmarks[index1].x, landmarks[index1].y)
      ctx.lineTo(landmarks[index2].x, landmarks[index2].y)
      ctx.strokeStyle = "#7D54FF"
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }

  // Start lesson recording
  const startRecording = () => {
    setLessonStatus("recording")
    setCountdown(3)

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          // Simulate gesture recognition (50% chance of success for demo)
          setTimeout(() => {
            const success = Math.random() > 0.5
            setLessonStatus(success ? "success" : "failure")
          }, 2000)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Reset lesson
  const resetLesson = () => {
    setLessonStatus("waiting")
  }

  // Continue to next lesson
  const continueToNextLesson = () => {
    // In a real app, this would navigate to the next lesson
    resetLesson()
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/lessons" className="flex items-center text-[#7E7A93] hover:text-[#7D54FF]">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Lessons
        </Link>
      </div>

      <div className="bg-white rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#2D1B69]">Letter A</h1>
          <div className="bg-[#EAE4FF] text-[#7D54FF] text-xs px-3 py-1 rounded-full">Alphabets</div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-bold text-[#2D1B69] mb-4">Instructions</h2>
            <p className="text-[#7E7A93] mb-4">
              To sign the letter "A" in American Sign Language (ASL), follow these steps:
            </p>
            <ol className="space-y-2 text-[#7E7A93] mb-6">
              <li>1. Make a fist with your hand</li>
              <li>2. Extend your thumb to the side</li>
              <li>3. The thumb and fist together form the letter "A"</li>
            </ol>

            <div className="bg-[#ffe9ac] p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-[#ff2600] text-lg">💡</div>
                <div className="font-medium text-[#2D1B69]">Tip</div>
              </div>
              <p className="text-sm text-[#7E7A93]">
                Make sure your thumb is pointing straight up, not angled forward or backward.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-[#2D1B69] mb-2">Example</h3>
              <div className="bg-[#FAF7FF] rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=200&width=300"
                  alt="ASL Letter A Example"
                  width={300}
                  height={200}
                  className="w-full object-contain"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: "4/3" }}>
              {!cameraActive ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="mb-4">
                    <Image
                      src="/placeholder.svg?height=100&width=100"
                      alt="Camera"
                      width={100}
                      height={100}
                      className="opacity-50"
                    />
                  </div>
                  <p className="text-center mb-4">Enable your camera to practice signing</p>
                  <button
                    onClick={startCamera}
                    className="bg-[#7D54FF] text-white px-6 py-2 rounded-full shadow-btn transition-transform hover:scale-[1.03] active:translate-y-1 active:shadow-none hover:bg-opacity-90"
                  >
                    Start Camera
                  </button>
                </div>
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full" />

                  {lessonStatus === "recording" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-70 text-white text-6xl font-bold rounded-full w-24 h-24 flex items-center justify-center">
                        {countdown}
                      </div>
                    </div>
                  )}

                  {lessonStatus === "success" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                      <div className="bg-white p-6 rounded-xl max-w-xs text-center">
                        <div className="flex justify-center mb-4">
                          <CheckCircle className="w-16 h-16 text-[#22C55E]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#2D1B69] mb-2">Great Job!</h3>
                        <p className="text-[#7E7A93] mb-4">You've successfully signed the letter A!</p>
                        <button
                          onClick={continueToNextLesson}
                          className="bg-[#7D54FF] text-white px-6 py-2 rounded-full shadow-btn transition-transform hover:scale-[1.03] active:translate-y-1 active:shadow-none hover:bg-opacity-90 w-full"
                        >
                          Continue to Next Lesson
                        </button>
                      </div>
                    </div>
                  )}

                  {lessonStatus === "failure" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                      <div className="bg-white p-6 rounded-xl max-w-xs text-center">
                        <div className="flex justify-center mb-4">
                          <XCircle className="w-16 h-16 text-[#FF7A59]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#2D1B69] mb-2">Try Again</h3>
                        <p className="text-[#7E7A93] mb-4">
                          Your sign wasn't quite right. Check the example and try again.
                        </p>
                        <button
                          onClick={resetLesson}
                          className="bg-[#7D54FF] text-white px-6 py-2 rounded-full shadow-btn transition-transform hover:scale-[1.03] active:translate-y-1 active:shadow-none hover:bg-opacity-90 w-full"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {cameraActive && lessonStatus === "waiting" && (
              <div className="flex flex-col items-center">
                <p className="text-[#7E7A93] mb-4 text-center">
                  Position your hand in the frame and make the sign for "A"
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={stopCamera}
                    className="border border-[#EAE4FF] px-6 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Stop Camera
                  </button>
                  <button
                    onClick={startRecording}
                    className="bg-[#7D54FF] text-white px-6 py-2 rounded-full shadow-btn transition-transform hover:scale-[1.03] active:translate-y-1 active:shadow-none hover:bg-opacity-90"
                  >
                    Capture Sign
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6">
        <h2 className="text-lg font-bold text-[#2D1B69] mb-4">Next Lessons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/lessons/alphabets/b"
            className="flex items-center p-3 border border-[#EAE4FF] rounded-lg hover:border-[#7D54FF] transition-colors"
          >
            <div className="bg-[#ffe9ac] w-12 h-12 rounded-lg flex items-center justify-center mr-3">
              <span className="text-[#ff2600] text-xl font-bold">B</span>
            </div>
            <div>
              <div className="font-medium text-[#2D1B69]">Letter B</div>
              <div className="text-xs text-[#7E7A93]">Beginner • 2 min</div>
            </div>
          </Link>

          <Link
            href="/dashboard/lessons/alphabets/c"
            className="flex items-center p-3 border border-[#EAE4FF] rounded-lg hover:border-[#7D54FF] transition-colors"
          >
            <div className="bg-[#ffe9ac] w-12 h-12 rounded-lg flex items-center justify-center mr-3">
              <span className="text-[#ff2600] text-xl font-bold">C</span>
            </div>
            <div>
              <div className="font-medium text-[#2D1B69]">Letter C</div>
              <div className="text-xs text-[#7E7A93]">Beginner • 2 min</div>
            </div>
          </Link>

          <Link
            href="/dashboard/lessons/alphabets/d"
            className="flex items-center p-3 border border-[#EAE4FF] rounded-lg hover:border-[#7D54FF] transition-colors"
          >
            <div className="bg-[#ffe9ac] w-12 h-12 rounded-lg flex items-center justify-center mr-3">
              <span className="text-[#ff2600] text-xl font-bold">D</span>
            </div>
            <div>
              <div className="font-medium text-[#2D1B69]">Letter D</div>
              <div className="text-xs text-[#7E7A93]">Beginner • 2 min</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
