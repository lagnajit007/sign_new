'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface LoadingEffectProps {
  active: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
}

export default function LoadingEffect({ active }: LoadingEffectProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 1000, height: 800 });
  
  // Pre-compute particle positions to avoid hydration mismatches
  const particles = useMemo(() => {
    const particleArray: Particle[] = [];
    
    if (isMounted) {
      for (let i = 0; i < 8; i++) {
        particleArray.push({
          id: i,
          x: Math.random() * windowSize.width,
          y: Math.random() * windowSize.height,
          duration: 2 + Math.random() * 2,
          delay: Math.random() * 2
        });
      }
    }
    
    return particleArray;
  }, [isMounted, windowSize]);

  useEffect(() => {
    setIsMounted(true);
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    // Set initial window size
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array ensures this only runs once on mount

  if (!isMounted || !active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Left to right wipe */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ 
          x: '100%',
          transition: { duration: 1.5, ease: 'easeInOut' }
        }}
        className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-[#7D54FF]/0 via-[#7D54FF]/10 to-transparent"
      />
      
      {/* Right to left wipe */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ 
          x: '-100%',
          transition: { duration: 1.5, ease: 'easeInOut', delay: 0.2 }
        }}
        className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-[#7D54FF]/0 via-[#7D54FF]/10 to-transparent"
      />
      
      {/* Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: particle.x, 
              y: particle.y,
              opacity: 0,
              scale: 0
            }}
            animate={{ 
              y: [particle.y, particle.y + 100, particle.y],
              opacity: [0, 0.7, 0],
              scale: [0, 1, 0],
              transition: { 
                duration: particle.duration,
                repeat: Infinity,
                repeatType: 'loop',
                delay: particle.delay
              }
            }}
            className="absolute w-2 h-2 rounded-full bg-[#7D54FF]"
          />
        ))}
      </div>
    </div>
  );
} 