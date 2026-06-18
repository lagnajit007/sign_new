"use client"

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  
  // Only animate after initial render to prevent layout shift during hydration
  useEffect(() => {
    setShouldAnimate(true);
  }, []);

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 5 } : false}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 1 }}
      transition={{
        type: 'tween',
        ease: 'easeOut',
        duration: 0.25,
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
} 