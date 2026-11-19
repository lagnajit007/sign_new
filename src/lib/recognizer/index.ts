/**
 * Sign recognizer: a forward pass of the trained scikit-learn MLP
 * (42 inputs → 100 ReLU → 36 softmax), exported to JSON by
 * backend/export_model.py. Runs identically in the browser (instant lesson
 * feedback) and on the server (/api/attempts re-checks before awarding XP).
 *
 * Parity with sklearn's predict_proba is covered by scripts/test-recognizer.ts.
 */
import model from "./model.json";

export const FEATURE_COUNT = 42;
export const CLASSES: readonly string[] = model.classes;

interface Layer {
  weights: number[][]; // [in][out]
  biases: number[];
}
const layers = model.layers as Layer[];

export interface Recognition {
  prediction: string;
  confidence: number;
  probabilities: number[];
}

/**
 * Turn 21 hand landmarks in video pixels into the 42 features the model was
 * trained on (MediaPipe pipeline): normalise to the frame (0..1), then subtract
 * the hand's minimum x and y.
 */
export function landmarksToFeatures(landmarks: number[][], width: number, height: number): number[] | null {
  if (!landmarks || landmarks.length !== 21 || !(width > 0) || !(height > 0)) return null;
  const xs = landmarks.map((l) => l[0] / width);
  const ys = landmarks.map((l) => l[1] / height);
  if (![...xs, ...ys].every(Number.isFinite)) return null;
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return xs.flatMap((x, i) => [x - minX, ys[i] - minY]);
}

/** True for a well-formed feature vector (42 finite numbers, roughly 0..1). */
export function isValidFeatures(features: unknown): features is number[] {
  return (
    Array.isArray(features) &&
    features.length === FEATURE_COUNT &&
    features.every((v) => typeof v === "number" && Number.isFinite(v) && v >= -0.05 && v <= 1.05)
  );
}

export function recognize(features: number[]): Recognition {
  if (features.length !== FEATURE_COUNT) throw new Error(`Expected ${FEATURE_COUNT} features`);
  let activations = features;
  layers.forEach((layer, li) => {
    const out = layer.biases.slice();
    for (let i = 0; i < activations.length; i++) {
      const a = activations[i];
      if (a === 0) continue;
      const row = layer.weights[i];
      for (let j = 0; j < out.length; j++) out[j] += a * row[j];
    }
    const hidden = li < layers.length - 1;
    activations = hidden ? out.map((v) => (v > 0 ? v : 0)) : out;
  });

  // Numerically stable softmax.
  const max = Math.max(...activations);
  const exps = activations.map((v) => Math.exp(v - max));
  const sum = exps.reduce((s, v) => s + v, 0);
  const probabilities = exps.map((v) => v / sum);

  let best = 0;
  for (let i = 1; i < probabilities.length; i++) if (probabilities[i] > probabilities[best]) best = i;
  return { prediction: CLASSES[best], confidence: probabilities[best], probabilities };
}
