"use client"

import { useEffect, useState } from "react"

// ─── Shared brand dots ────────────────────────────────────────────────────────
function BrandDots({ color = "#7D54FF" }: { color?: string }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2.5 h-2.5 rounded-full inline-block"
          style={{
            backgroundColor: color,
            animation: `bounce-dots 1.4s ease-in-out ${i * 0.16}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ─── 1. AI Model Initialization ───────────────────────────────────────────────
export function ModelInitLoader({ message = "Initializing Sign Recognition" }: { message?: string }) {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f + 1) % 4), 400)
    return () => clearInterval(t)
  }, [])

  // Animated hand landmarks SVG
  const landmarks = [
    [50, 85], [42, 70], [38, 55], [35, 42], [32, 32],   // thumb
    [52, 68], [52, 52], [52, 38], [52, 28],              // index
    [57, 68], [58, 52], [58, 38], [58, 28],              // middle
    [62, 68], [64, 52], [64, 38], [64, 28],              // ring
    [68, 70], [72, 56], [73, 44], [74, 34],              // pinky
  ]
  const connections = [
    [0,1],[1,2],[2,3],[3,4],
    [0,5],[5,6],[6,7],[7,8],
    [0,9],[9,10],[10,11],[11,12],
    [0,13],[13,14],[14,15],[15,16],
    [0,17],[17,18],[18,19],[19,20],
    [5,9],[9,13],[13,17],
  ]

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-28 h-28">
        {/* Pulse rings */}
        <span className="absolute inset-0 rounded-full bg-[#7D54FF]/20 animate-pulse-ring" />
        <span className="absolute inset-0 rounded-full bg-[#7D54FF]/10 animate-pulse-ring" style={{ animationDelay: "0.4s" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="20 25 60 70" className="w-20 h-20">
            {connections.map(([a, b], i) => (
              <line
                key={i}
                x1={landmarks[a][0]} y1={landmarks[a][1]}
                x2={landmarks[b][0]} y2={landmarks[b][1]}
                stroke="#7D54FF"
                strokeWidth="1.2"
                strokeOpacity={frame > i % 4 ? 1 : 0.2}
                style={{ transition: "stroke-opacity 0.3s" }}
              />
            ))}
            {landmarks.map(([x, y], i) => (
              <circle
                key={i}
                cx={x} cy={y} r={i === 0 ? 2.5 : 1.8}
                fill={i === 0 ? "#FFC83D" : "#7D54FF"}
                opacity={frame > i % 4 ? 1 : 0.2}
                style={{ transition: "opacity 0.3s" }}
              />
            ))}
          </svg>
        </div>
      </div>
      <p className="text-sm font-semibold text-[#7D54FF]">{message}</p>
      <BrandDots />
    </div>
  )
}

// ─── 2. Webcam Initialization ─────────────────────────────────────────────────
export function CameraInitLoader({ message = "Starting Camera" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-24 h-24">
        {/* Scanning frame */}
        <div className="w-24 h-24 border-4 border-[#7D54FF] rounded-2xl relative overflow-hidden">
          {/* Corner accents */}
          <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FFC83D] rounded-tl" />
          <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FFC83D] rounded-tr" />
          <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FFC83D] rounded-bl" />
          <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FFC83D] rounded-br" />
          {/* Scan line */}
          <div
            className="absolute left-0 right-0 h-0.5 bg-[#7D54FF]/60"
            style={{ animation: "scan-line 2s linear infinite" }}
          />
        </div>
        {/* Pulse */}
        <span className="absolute inset-0 rounded-2xl border-2 border-[#7D54FF]/30 animate-pulse-ring" />
      </div>
      <p className="text-sm font-semibold text-[#7D54FF]">{message}</p>
      <BrandDots />
    </div>
  )
}

// ─── 3. Gesture Detection / Inference ────────────────────────────────────────
export function GestureDetectionLoader({
  confidence = 0,
  message = "Analyzing Gesture…",
}: {
  confidence?: number
  message?: string
}) {
  const circumference = 2 * Math.PI * 20  // r=20 → ~125.7
  const offset = circumference - (confidence / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-16 h-16">
        {/* Confidence ring */}
        <svg viewBox="0 0 50 50" className="w-16 h-16 -rotate-90">
          <circle cx="25" cy="25" r="20" fill="none" stroke="#EAE4FF" strokeWidth="4" />
          <circle
            cx="25" cy="25" r="20"
            fill="none"
            stroke="#7D54FF"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.3s ease" }}
          />
        </svg>
        {/* Hand icon inside */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">🤚</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-[#7D54FF]">{message}</p>
      {confidence > 0 && (
        <p className="text-xs text-[#7E7A93]">{confidence}% confidence</p>
      )}
    </div>
  )
}

// ─── 4. Lesson Completion / Results ──────────────────────────────────────────
export function LessonCompleteLoader({
  xp = 10,
  message = "Calculating Results…",
}: {
  xp?: number
  message?: string
}) {
  const [filled, setFilled] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col items-center gap-4">
      {/* XP orb */}
      <div className="relative w-20 h-20">
        <div className="w-20 h-20 rounded-full bg-[#EAE4FF] overflow-hidden border-4 border-[#7D54FF]">
          <div
            className="w-full bg-gradient-to-t from-[#7D54FF] to-[#9B7CFF] rounded-b-full"
            style={{
              height: filled ? "100%" : "0%",
              transition: "height 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              transformOrigin: "bottom",
            }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-sm drop-shadow">+{xp}</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-[#7D54FF]">{message}</p>
      <BrandDots />
    </div>
  )
}

// ─── 5. Achievement Unlock Celebration ───────────────────────────────────────
const CONFETTI_COLORS = ["#7D54FF", "#FFC83D", "#22C55E", "#FF7A59", "#5EC8FF", "#FF7A59"]

export function AchievementCelebration({
  name,
  icon,
  xp,
  onDone,
}: {
  name: string
  icon: string
  xp: number
  onDone?: () => void
}) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCount((c) => Math.min(xp, c + Math.ceil(xp / 30))), 50)
    const done = setTimeout(() => { clearInterval(t); onDone?.() }, 3500)
    return () => { clearInterval(t); clearTimeout(done) }
  }, [xp, onDone])

  const confetti = Array.from({ length: 20 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: `${Math.random() * 0.8}s`,
    duration: `${0.8 + Math.random() * 0.8}s`,
    size: 6 + Math.random() * 6,
    shape: Math.random() > 0.5 ? "rounded-full" : "rounded-sm",
  }))

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((c, i) => (
          <span
            key={i}
            className={`absolute top-0 ${c.shape}`}
            style={{
              left: c.left,
              width: c.size,
              height: c.size,
              backgroundColor: c.color,
              animation: `confetti-fall ${c.duration} ${c.delay} ease-in forwards`,
            }}
          />
        ))}
      </div>

      <div className="relative bg-white rounded-3xl p-8 max-w-xs w-full mx-4 text-center shadow-2xl animate-badge-pop">
        {/* Badge */}
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-[#7D54FF] to-[#6840E0] flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
          {icon}
        </div>
        <div className="text-xs font-bold text-[#7D54FF] uppercase tracking-widest mb-1">Achievement Unlocked!</div>
        <h2 className="text-xl font-bold text-[#2D1B69] mb-2">{name}</h2>
        {/* XP counter */}
        <div className="inline-flex items-center gap-2 bg-[#EAE4FF] text-[#7D54FF] font-bold px-4 py-2 rounded-full animate-xp-counter">
          <span>⭐</span>
          <span>+{count} XP</span>
        </div>
        <button
          onClick={onDone}
          className="mt-4 w-full py-2.5 bg-[#7D54FF] text-white rounded-xl font-medium hover:bg-[#6840E0] transition-colors text-sm"
        >
          Awesome! 🎉
        </button>
      </div>
    </div>
  )
}

// ─── 6. Level Up Celebration ──────────────────────────────────────────────────
export function LevelUpCelebration({
  newLevel,
  onDone,
}: {
  newLevel: number
  onDone?: () => void
}) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 4000)
    return () => clearTimeout(t)
  }, [onDone])

  const confetti = Array.from({ length: 30 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: `${Math.random() * 1}s`,
    duration: `${1 + Math.random() * 1}s`,
    size: 8 + Math.random() * 8,
    shape: Math.random() > 0.5 ? "rounded-full" : "rounded-sm",
  }))

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((c, i) => (
          <span
            key={i}
            className={`absolute top-0 ${c.shape}`}
            style={{
              left: c.left,
              width: c.size,
              height: c.size,
              backgroundColor: c.color,
              animation: `confetti-fall ${c.duration} ${c.delay} ease-in forwards`,
            }}
          />
        ))}
      </div>

      <div className="relative bg-white rounded-3xl p-10 max-w-sm w-full mx-4 text-center shadow-2xl">
        {/* Level badge burst */}
        <div className="relative w-36 h-36 mx-auto mb-6">
          {[1, 2, 3].map((ring) => (
            <span
              key={ring}
              className="absolute inset-0 rounded-full bg-[#7D54FF]/20"
              style={{
                animation: `pulse-ring ${0.8 + ring * 0.3}s ease-out ${ring * 0.2}s infinite`,
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center animate-level-burst">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#7D54FF] to-[#9B7CFF] flex flex-col items-center justify-center shadow-lg">
              <span className="text-white/80 text-xs font-bold uppercase tracking-wider">Level</span>
              <span className="text-white text-4xl font-black leading-none">{newLevel}</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-black text-[#2D1B69] mb-2">Level Up! 🚀</h2>
        <p className="text-[#7E7A93] text-sm mb-6">
          You've reached <strong className="text-[#7D54FF]">Level {newLevel}</strong>. Keep signing!
        </p>

        <button
          onClick={onDone}
          className="w-full py-3 bg-gradient-to-r from-[#7D54FF] to-[#9B7CFF] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          Continue Learning 🎯
        </button>
      </div>
    </div>
  )
}

// ─── 7. Daily Streak Reward ───────────────────────────────────────────────────
export function StreakReward({
  streakDays,
  xp = 5,
  onDone,
}: {
  streakDays: number
  xp?: number
  onDone?: () => void
}) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCount((c) => Math.min(streakDays, c + 1)), 80)
    const done = setTimeout(() => { clearInterval(t); onDone?.() }, 3000)
    return () => { clearInterval(t); clearTimeout(done) }
  }, [streakDays, onDone])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-xs w-full mx-4 text-center shadow-2xl animate-badge-pop">
        {/* Flame */}
        <div className="text-7xl mb-3 animate-flame inline-block">🔥</div>
        <div className="text-xs font-bold text-[#FFC83D] uppercase tracking-widest mb-1">Streak Reward!</div>
        <h2 className="text-3xl font-black text-[#2D1B69] mb-1">{count} Days</h2>
        <p className="text-sm text-[#7E7A93] mb-4">You're on a roll! Don't break it.</p>
        <div className="inline-flex items-center gap-2 bg-[#fff8da] text-[#FFC83D] font-bold px-4 py-2 rounded-full mb-4">
          ⭐ +{xp} XP
        </div>
        <button
          onClick={onDone}
          className="w-full py-2.5 bg-[#FFC83D] text-white rounded-xl font-medium hover:opacity-90 transition-opacity text-sm"
        >
          Keep it up! 🔥
        </button>
      </div>
    </div>
  )
}

// ─── 8. Challenge Complete ────────────────────────────────────────────────────
export function ChallengeComplete({
  name,
  xp,
  onDone,
}: {
  name: string
  xp: number
  onDone?: () => void
}) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 3500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-xs w-full mx-4 text-center shadow-2xl animate-badge-pop">
        {/* Ring fills to 100% */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg viewBox="0 0 50 50" className="w-24 h-24 -rotate-90">
            <circle cx="25" cy="25" r="20" fill="none" stroke="#EAE4FF" strokeWidth="5" />
            <circle
              cx="25" cy="25" r="20"
              fill="none" stroke="#7D54FF" strokeWidth="5"
              strokeDasharray="125.7"
              strokeDashoffset="125.7"
              strokeLinecap="round"
              style={{ animation: "confidence-ring 1s ease-out 0.2s forwards" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🏆</div>
        </div>
        <div className="text-xs font-bold text-[#7D54FF] uppercase tracking-widest mb-1">Challenge Complete!</div>
        <h2 className="text-lg font-bold text-[#2D1B69] mb-2">{name}</h2>
        <div className="inline-flex items-center gap-2 bg-[#EAE4FF] text-[#7D54FF] font-bold px-4 py-2 rounded-full mb-4">
          ⭐ +{xp} XP
        </div>
        <button
          onClick={onDone}
          className="w-full py-2.5 bg-[#7D54FF] text-white rounded-xl font-medium hover:bg-[#6840E0] transition-colors text-sm"
        >
          Claim Reward 🎉
        </button>
      </div>
    </div>
  )
}

// ─── 9. Button loading state ──────────────────────────────────────────────────
export function ButtonLoader({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      aria-label="Loading"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor" strokeWidth="3" strokeLinecap="round"
      />
    </svg>
  )
}

// ─── 10. XP Toast (in-page reward pop) ────────────────────────────────────────
export function XPToast({
  xp,
  achievements = [],
  onDone,
}: {
  xp: number
  achievements?: string[]
  onDone?: () => void
}) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 4000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-xp-counter">
      <div className="bg-[#7D54FF] text-white px-5 py-3 rounded-2xl shadow-xl flex flex-col gap-1 max-w-xs">
        <div className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">⭐</span>
          +{xp} XP
        </div>
        {achievements.map((a) => (
          <div key={a} className="text-xs text-white/80 flex items-center gap-1">
            🏆 <span>{a} unlocked!</span>
          </div>
        ))}
      </div>
    </div>
  )
}
