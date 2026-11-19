/**
 * Client for the Sanjog recognition backend (Flask on Hugging Face Spaces).
 *
 * - One request in flight at a time: callers get `null` while busy, so the
 *   detection loop never queues requests faster than the backend answers.
 * - No automatic retries on prediction — the next detection frame is the retry.
 * - Predictions carry an HMAC signature that /api/attempts verifies before
 *   awarding XP.
 */

export interface SignedPrediction {
  prediction: string;
  confidence: number;
  issuedAt: number;
  nonce: string;
  signature: string | null;
}

export type BackendStatus = 'online' | 'waking' | 'offline';

export class HandTrackingAPIClient {
  private readonly baseUrl: string;
  private inFlight = false;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Health check. Free hosts sleep when idle; a slow or 503 answer while the
   * container starts is reported as `waking` rather than `offline`.
   */
  async checkStatus(timeoutMs = 8000): Promise<BackendStatus> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}/`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
        cache: 'no-store',
      });
      if (res.ok) {
        const body = await res.json().catch(() => null);
        return body?.model_loaded === true ? 'online' : 'waking';
      }
      return res.status === 503 || res.status === 502 ? 'waking' : 'offline';
    } catch (err) {
      return (err as Error).name === 'AbortError' ? 'waking' : 'offline';
    } finally {
      clearTimeout(timer);
    }
  }

  /** Returns `null` if a request is already in flight. Throws on API errors. */
  async predict(landmarks: number[]): Promise<SignedPrediction | null> {
    if (this.inFlight) return null;
    if (landmarks.length !== 42) throw new Error('Expected 42 landmark values');

    this.inFlight = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ landmarks }),
        signal: controller.signal,
      });
      if (res.status === 429) return null; // back off silently; next frame retries
      if (!res.ok) throw new Error(`Recognition API error ${res.status}`);

      const r = await res.json();
      if (
        typeof r?.prediction !== 'string' ||
        typeof r?.confidence !== 'number' ||
        !Number.isFinite(r.confidence) ||
        r.confidence < 0 ||
        r.confidence > 1
      ) {
        throw new Error('Invalid recognition response');
      }
      return {
        prediction: r.prediction,
        confidence: r.confidence,
        issuedAt: Number(r.issued_at) || 0,
        nonce: typeof r.nonce === 'string' ? r.nonce : '',
        signature: typeof r.signature === 'string' ? r.signature : null,
      };
    } finally {
      clearTimeout(timer);
      this.inFlight = false;
    }
  }
}
