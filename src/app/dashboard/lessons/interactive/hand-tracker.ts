"use client";

import type { HandLandmarker } from "@mediapipe/tasks-vision";

/**
 * MediaPipe Hand Landmarker (the same tracker family the sign model was
 * trained with). Landmarks come back normalised to 0..1 of the frame, which
 * is exactly the coordinate system `landmarksToFeatures(points, 1, 1)` needs.
 *
 * The WASM runtime is served from jsdelivr at the installed package version
 * and the model from Google's model CDN; both are allowed by the CSP.
 */

const VERSION = "1.2.3"; // keep in sync with @mediapipe/tasks-vision in package.json
const WASM_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export type Landmarks = [number, number][];

export interface HandTracker {
  /** Detect at most one hand in the current video frame. */
  detect(video: HTMLVideoElement, timestampMs: number): Landmarks | null;
  close(): void;
}

let pending: Promise<HandTracker> | null = null;

async function create(): Promise<HandTracker> {
  const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
  const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
  const options = (delegate: "GPU" | "CPU") => ({
    baseOptions: { modelAssetPath: MODEL_URL, delegate },
    runningMode: "VIDEO" as const,
    numHands: 1,
    minHandDetectionConfidence: 0.6,
    minHandPresenceConfidence: 0.6,
    minTrackingConfidence: 0.5,
  });

  let landmarker: HandLandmarker;
  try {
    landmarker = await HandLandmarker.createFromOptions(fileset, options("GPU"));
  } catch {
    // No WebGL2 / GPU delegate: the CPU path is slower but works everywhere.
    landmarker = await HandLandmarker.createFromOptions(fileset, options("CPU"));
  }

  let lastTs = -1;
  return {
    detect(video, timestampMs) {
      // MediaPipe requires strictly increasing timestamps in VIDEO mode.
      const ts = timestampMs <= lastTs ? lastTs + 1 : timestampMs;
      lastTs = ts;
      const result = landmarker.detectForVideo(video, ts);
      const hand = result.landmarks[0];
      return hand ? hand.map((p) => [p.x, p.y] as [number, number]) : null;
    },
    close() {
      landmarker.close();
      pending = null;
    },
  };
}

/** Load once per page; later callers share the same instance. */
export function loadHandTracker(): Promise<HandTracker> {
  if (!pending) {
    pending = create().catch((err) => {
      pending = null;
      throw err;
    });
  }
  return pending;
}
