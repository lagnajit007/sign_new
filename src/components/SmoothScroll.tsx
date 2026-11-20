"use client";

import "lenis/dist/lenis.css";
import { ReactLenis } from "lenis/react";
import { useEffect, useState } from "react";

/**
 * Site-wide smooth scrolling. Off for people who prefer reduced motion.
 * Nested scroll areas (dashboard panels, menus) keep native scrolling, and
 * in-page anchors (#how-it-works) glide through Lenis.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!enabled) return <>{children}</>;
  return (
    <ReactLenis
      root
      options={{
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // ease-out-expo
        smoothWheel: true,
        allowNestedScroll: true,
        anchors: { offset: -72 },
      }}
    >
      {children}
    </ReactLenis>
  );
}
