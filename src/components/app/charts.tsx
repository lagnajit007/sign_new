import { cn } from "@/lib/utils";

/** Tiny inline trend line. Purely decorative; pair it with a visible number. */
export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2 || values.every((v) => v === 0)) return null;
  const w = 64;
  const h = 20;
  const max = Math.max(...values, 1);
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * (h - 2) - 1).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden className={cn("overflow-visible text-brand", className)}>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export interface BarDatum {
  label: string;
  total: number;
  highlight: number;
}

/**
 * Stacked bar chart: total attempts per bucket, with the correct portion in the
 * accent colour. Accessible via a visually hidden table.
 */
export function ActivityBars({
  data,
  height = 160,
  totalLabel = "Attempts",
  highlightLabel = "Correct",
}: {
  data: BarDatum[];
  height?: number;
  totalLabel?: string;
  highlightLabel?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.total));
  const showEvery = data.length > 14 ? Math.ceil(data.length / 8) : 1;
  return (
    <figure className="w-full">
      <div className="flex items-end gap-[3px]" style={{ height }} aria-hidden>
        {data.map((d, i) => {
          const totalPct = (d.total / max) * 100;
          const highPct = d.total ? (d.highlight / d.total) * 100 : 0;
          return (
            <div key={i} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end">
              {/* Bars grow with scaleY (transform only) from the baseline. */}
              <div
                className="relative h-full w-full origin-bottom overflow-hidden rounded-[3px] bg-subtle-hover transition-transform duration-500"
                style={{ transform: `scaleY(${Math.max(totalPct, d.total ? 3 : 1.5) / 100})` }}
              >
                <div
                  className="absolute inset-0 origin-bottom bg-brand transition-transform duration-500"
                  style={{ transform: `scaleY(${highPct / 100})` }}
                />
              </div>
              <div className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-fg px-1.5 py-1 text-[11px] text-canvas group-hover:block">
                {d.label}: {d.highlight}/{d.total}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-[3px] text-[10px] text-fg-subtle" aria-hidden>
        {data.map((d, i) => (
          <span key={i} className="min-w-0 flex-1 truncate text-center">
            {i % showEvery === 0 ? d.label : ""}
          </span>
        ))}
      </div>
      <figcaption className="mt-3 flex items-center gap-4 text-xs text-fg-muted">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-brand" />{highlightLabel}</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-subtle-hover" />{totalLabel}</span>
      </figcaption>
      <table className="sr-only">
        <thead><tr><th>Period</th><th>{totalLabel}</th><th>{highlightLabel}</th></tr></thead>
        <tbody>{data.map((d, i) => <tr key={i}><td>{d.label}</td><td>{d.total}</td><td>{d.highlight}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}
