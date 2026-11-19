/**
 * Parity test: the TypeScript recognizer must match sklearn's predict_proba
 * on the fixtures exported by backend/export_model.py.
 *   npm run test:model
 */
import assert from "node:assert/strict";
import fixtures from "../src/lib/recognizer/fixtures.json" with { type: "json" };
import { isValidFeatures, landmarksToFeatures, recognize } from "../src/lib/recognizer";

const TOLERANCE = 1e-6;
let maxDiff = 0;

for (const [i, f] of fixtures.entries()) {
  const r = recognize(f.input);
  assert.equal(r.prediction, f.label, `fixture ${i}: label ${r.prediction} != ${f.label}`);
  f.probabilities.forEach((p, k) => {
    const d = Math.abs(p - r.probabilities[k]);
    maxDiff = Math.max(maxDiff, d);
    assert.ok(d < TOLERANCE, `fixture ${i} class ${k}: diff ${d}`);
  });
}

// Feature extraction: pixels → frame-normalised, min-subtracted.
const hand = Array.from({ length: 21 }, (_, i) => [100 + i * 10, 200 + i * 5]);
const feats = landmarksToFeatures(hand, 640, 480)!;
assert.equal(feats.length, 42);
assert.equal(feats[0], 0);
assert.equal(feats[1], 0);
assert.ok(Math.abs(feats[2] - 10 / 640) < 1e-12);
assert.ok(isValidFeatures(feats));
assert.equal(landmarksToFeatures(hand.slice(1), 640, 480), null);
assert.equal(isValidFeatures(new Array(42).fill(320)), false);
assert.equal(isValidFeatures(new Array(41).fill(0.1)), false);

console.log(`recognizer parity OK: ${fixtures.length} fixtures, max |Δp| = ${maxDiff.toExponential(2)}`);
