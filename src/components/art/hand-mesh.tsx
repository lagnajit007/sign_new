import { cn } from "@/lib/utils";
import { BASE, BONES, POSES } from "./hand-poses";

/**
 * Static 21-point hand skeleton for a sign, drawn the way the hand tracker
 * sees it. Decorative: pair it with visible text.
 */
export function HandMesh({ sign = "B", className }: { sign?: keyof typeof POSES | string; className?: string }) {
  const pts = [...BASE, ...(POSES[sign] ?? POSES.B)];
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={cn("text-brand", className)}>
      {BONES.map(([a, b], k) => (
        <line
          key={k}
          x1={pts[a][0]}
          y1={pts[a][1]}
          x2={pts[b][0]}
          y2={pts[b][1]}
          stroke="currentColor"
          strokeOpacity={0.55}
          strokeWidth={1}
          strokeLinecap="round"
        />
      ))}
      {pts.map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r={k === 0 ? 2 : 1.6} fill="currentColor" fillOpacity={k % 4 === 0 ? 1 : 0.75} />
      ))}
    </svg>
  );
}
