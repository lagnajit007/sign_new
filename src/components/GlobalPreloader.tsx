'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Loader from './Loader';
import LoadingEffect from './LoadingEffect';

export default function GlobalPreloader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const isInitialMount = useRef(true);
  const previousPathname = useRef(pathname);
  const previousSearchParams = useRef(searchParams);

  useEffect(() => {
    // Skip the loader on initial page load
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Check if pathname or searchParams actually changed
    const searchParamsString = searchParams.toString();
    const prevSearchParamsString = previousSearchParams.current.toString();
    
    if (pathname === previousPathname.current && searchParamsString === prevSearchParamsString) {
      return;
    }
    
    // Update refs
    previousPathname.current = pathname;
    previousSearchParams.current = searchParams;
    
    // Show loader
    setIsLoading(true);
    
    // Hide loader after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <>
      <LoadingEffect active={isLoading} />
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center backdrop-blur-sm"
            style={{ pointerEvents: 'none' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              <Loader color="#7D54FF" />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 120 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="h-1 bg-[#7D54FF] rounded-full mt-4"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 