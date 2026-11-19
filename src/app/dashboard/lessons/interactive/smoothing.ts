/**
 * Signal smoothing for live hand tracking (pure, deterministic, unit-tested).
 *
 * - OneEuroFilter: removes landmark jitter while keeping fast movements
 *   responsive (Casiez et al., CHI 2012).
 * - LandmarkSmoother: one filter per coordinate of the 21 landmarks.
 * - ProbabilitySmoother: exponential moving average of the class
 *   probabilities, so a single noisy frame can't flip the recognised sign.
 * - PresenceDebounce: a hand only counts as gone after a short absence.
 */

export class OneEuroFilter {
  private xPrev: number | null = null;
  private dxPrev = 0;
  private tPrev: number | null = null;

  constructor(
    private minCutoff = 1.2, // Hz: lower = smoother when still
    private beta = 12, // speed coefficient: higher = less lag when moving
    private dCutoff = 1.0,
  ) {}

  private static alpha(cutoff: number, dt: number) {
    const tau = 1 / (2 * Math.PI * cutoff);
    return 1 / (1 + tau / dt);
  }

  filter(x: number, tMs: number): number {
    if (this.xPrev === null || this.tPrev === null || tMs <= this.tPrev) {
      this.xPrev = x;
      this.tPrev = tMs;
      this.dxPrev = 0;
      return x;
    }
    const dt = (tMs - this.tPrev) / 1000;
    const dx = (x - this.xPrev) / dt;
    const aD = OneEuroFilter.alpha(this.dCutoff, dt);
    const dxHat = aD * dx + (1 - aD) * this.dxPrev;
    const cutoff = this.minCutoff + this.beta * Math.abs(dxHat);
    const a = OneEuroFilter.alpha(cutoff, dt);
    const xHat = a * x + (1 - a) * this.xPrev;
    this.xPrev = xHat;
    this.dxPrev = dxHat;
    this.tPrev = tMs;
    return xHat;
  }

  reset() {
    this.xPrev = null;
    this.tPrev = null;
    this.dxPrev = 0;
  }
}

export type Point = [number, number];

export class LandmarkSmoother {
  private filters: OneEuroFilter[][];

  constructor(count = 21, minCutoff?: number, beta?: number) {
    this.filters = Array.from({ length: count }, () => [new OneEuroFilter(minCutoff, beta), new OneEuroFilter(minCutoff, beta)]);
  }

  smooth(points: Point[], tMs: number): Point[] {
    return points.map(([x, y], i) => [this.filters[i][0].filter(x, tMs), this.filters[i][1].filter(y, tMs)]);
  }

  reset() {
    this.filters.forEach(([fx, fy]) => {
      fx.reset();
      fy.reset();
    });
  }
}

export class ProbabilitySmoother {
  private avg: number[] | null = null;

  /** alpha = weight of the newest frame (0.35 ≈ the last ~5 frames matter). */
  constructor(private alpha = 0.35) {}

  push(probabilities: number[], classes: readonly string[]): { prediction: string; confidence: number } {
    if (!this.avg || this.avg.length !== probabilities.length) {
      this.avg = probabilities.slice();
    } else {
      for (let i = 0; i < probabilities.length; i++) {
        this.avg[i] = this.alpha * probabilities[i] + (1 - this.alpha) * this.avg[i];
      }
    }
    let best = 0;
    for (let i = 1; i < this.avg.length; i++) if (this.avg[i] > this.avg[best]) best = i;
    return { prediction: classes[best], confidence: this.avg[best] };
  }

  reset() {
    this.avg = null;
  }
}

export class PresenceDebounce {
  private lastSeen = -Infinity;

  constructor(private graceMs = 300) {}

  /** Returns whether a hand should be considered present at `tMs`. */
  update(seen: boolean, tMs: number): boolean {
    if (seen) this.lastSeen = tMs;
    return tMs - this.lastSeen <= this.graceMs;
  }

  reset() {
    this.lastSeen = -Infinity;
  }
}
