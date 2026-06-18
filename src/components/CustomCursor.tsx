"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show custom cursor after a delay to prevent initial position jump
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const updateCursorType = () => {
      const target = document.elementFromPoint(position.x, position.y) as HTMLElement
      if (!target) return
      
      const computedStyle = window.getComputedStyle(target)
      setIsPointer(computedStyle.cursor === 'pointer')
    }
    
    const handleMouseDown = () => setIsActive(true)
    const handleMouseUp = () => setIsActive(false)
    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    window.addEventListener("mousemove", updatePosition)
    window.addEventListener("mousemove", updateCursorType)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("mouseenter", handleMouseEnter)
    window.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", updatePosition)
      window.removeEventListener("mousemove", updateCursorType)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("mouseenter", handleMouseEnter)
      window.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [position.x, position.y])

  // Only show on desktop
  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
    return null
  }

  return (
    <>
      {/* Large outer cursor */}
      <motion.div
        className={`fixed rounded-full pointer-events-none z-50 mix-blend-difference ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundColor: isPointer ? 'transparent' : 'white',
          border: isPointer ? '2px solid white' : 'none',
          height: isPointer ? 40 : 12,
          width: isPointer ? 40 : 12,
          transition: 'height 0.2s, width 0.2s, background-color 0.2s, border 0.2s',
        }}
        animate={{
          x: position.x - (isPointer ? 20 : 6),
          y: position.y - (isPointer ? 20 : 6),
          scale: isActive ? 0.8 : 1,
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 200,
          mass: 0.5,
        }}
      />
      
      {/* Small inner cursor */}
      {isPointer && (
        <motion.div
          className={`fixed rounded-full bg-white pointer-events-none z-50 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{
            height: 5,
            width: 5,
          }}
          animate={{
            x: position.x - 2.5,
            y: position.y - 2.5,
          }}
          transition={{
            type: "spring",
            damping: 50,
            stiffness: 400,
          }}
        />
      )}
    </>
  )
} 