import { animate } from "motion/react";

/** Small particle burst + pop on an element. No-op under reduced motion. */
export function celebrate(element: HTMLElement | null) {
  if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  animate(element, { scale: [1, 1.15, 1] }, { duration: 0.35, ease: [0.22, 1, 0.36, 1] });

  const rect = element.getBoundingClientRect();
  const colors = ["#5b35f0", "#f5a524", "#16a34a", "#f97316", "#0ea5e9"];
  for (let i = 0; i < 12; i++) {
    const p = document.createElement("div");
    p.style.cssText = `position:fixed;pointer-events:none;z-index:9999;width:8px;height:8px;border-radius:9999px;background:${colors[i % colors.length]};left:${rect.left + rect.width / 2}px;top:${rect.top + rect.height / 2}px;`;
    document.body.appendChild(p);
    const angle = (i / 12) * Math.PI * 2;
    const distance = 80 + Math.random() * 60;
    animate(
      p,
      { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance - 40, opacity: 0, scale: 0 },
      { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    ).then(() => p.remove());
  }
}
