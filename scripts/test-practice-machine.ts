/**
 * State-machine tests for the Practice page (pure reducer, no browser).
 *   npm run test:practice
 */
import assert from "node:assert/strict";
import {
  HOLD_MS,
  initialState,
  practiceReducer as r,
  type PracticeAction,
  type PracticeState,
} from "../src/app/dashboard/lessons/interactive/practice-machine";
import { OneEuroFilter, PresenceDebounce, ProbabilitySmoother } from "../src/app/dashboard/lessons/interactive/smoothing";

const F = new Array(42).fill(0.1);
const run = (s: PracticeState, ...actions: PracticeAction[]) => actions.reduce(r, s);
const frame = (now: number, prediction = "A", confidence = 0.95, hand = true): PracticeAction => ({
  type: "FRAME", now, target: "A", hand, prediction, confidence, features: F,
});
const tests: [string, () => void][] = [];
const test = (name: string, fn: () => void) => tests.push([name, fn]);

/** Camera on, countdown finished: recognizing sign index 0 ("A"). */
function recognizing(): PracticeState {
  return run(initialState(26), { type: "CAMERA_READY" }, { type: "TICK" }, { type: "TICK" }, { type: "TICK" }, { type: "TICK" });
}

test("countdown runs 3 → 2 → 1 → GO → recognizing only after the camera is ready", () => {
  let s = initialState(26);
  s = r(s, { type: "TICK" });
  assert.equal(s.phase.kind, "ready", "no countdown without camera");
  s = r(s, { type: "CAMERA_READY" });
  assert.deepEqual(s.phase, { kind: "countdown", step: 3 });
  const steps = [2, 1, "go"];
  for (const step of steps) {
    s = r(s, { type: "TICK" });
    assert.deepEqual(s.phase, { kind: "countdown", step });
  }
  s = r(s, { type: "TICK" });
  assert.equal(s.phase.kind, "recognizing");
});

test("frames are ignored during the countdown (no scoring)", () => {
  let s = run(initialState(26), { type: "CAMERA_READY" });
  s = run(s, frame(0), frame(500), frame(1500));
  assert.deepEqual(s.phase, { kind: "countdown", step: 3 });
});

test("skip jumps straight to recognizing", () => {
  const s = run(initialState(26), { type: "CAMERA_READY" }, { type: "SKIP" });
  assert.equal(s.phase.kind, "recognizing");
});

test("success needs HOLD_MS of continuous matching, not before", () => {
  let s = run(recognizing(), frame(0), frame(300), frame(600), frame(HOLD_MS - 1));
  assert.equal(s.phase.kind, "recognizing");
  if (s.phase.kind === "recognizing") assert.equal(s.phase.sub, "holding");
  s = r(s, frame(HOLD_MS));
  assert.equal(s.phase.kind, "success");
});

test("success also needs the minimum number of matching frames", () => {
  const s = run(recognizing(), frame(0), frame(HOLD_MS + 500));
  assert.equal(s.phase.kind, "recognizing", "two frames 1.5s apart is not a stable hold");
});

test("losing the hand resets the hold", () => {
  let s = run(recognizing(), frame(0), frame(400), frame(800));
  s = r(s, frame(900, undefined, 0, false));
  assert.equal(s.phase.kind === "recognizing" && s.phase.holdStartedAt, null);
  s = run(s, frame(1000), frame(1400), frame(1800));
  assert.equal(s.phase.kind, "recognizing", "hold restarted at 1000, only 800ms held");
});

test("a different confident sign resets the hold and says what it saw", () => {
  let s = run(recognizing(), frame(0), frame(400));
  s = r(s, frame(600, "S", 0.9));
  assert.ok(s.phase.kind === "recognizing" && s.phase.sub === "incorrect" && s.phase.detected === "S" && s.phase.holdStartedAt === null);
});

test("low-confidence frames count as detected, not incorrect", () => {
  const s = run(recognizing(), frame(0, "S", 0.4));
  assert.ok(s.phase.kind === "recognizing" && s.phase.sub === "detected" && s.phase.detected === null);
});

test("success fires once; further frames do nothing", () => {
  let s = run(recognizing(), frame(0), frame(400), frame(800), frame(1000));
  assert.equal(s.phase.kind, "success");
  const before = s;
  s = run(s, frame(1200), frame(1400));
  assert.deepEqual(s, before);
});

test("continue is blocked while saving, allowed after SAVE_OK", () => {
  let s = run(recognizing(), frame(0), frame(400), frame(800), frame(1000));
  s = r(s, { type: "CONTINUE" });
  assert.equal(s.phase.kind, "success");
  s = r(s, { type: "SAVE_OK", attempt: s.attempt, sign: "A", xp: 50, correct: true });
  assert.ok(s.phase.kind === "success" && s.phase.save === "saved" && s.phase.xp === 50);
  assert.deepEqual(s.session, { xp: 50, mastered: ["A"], firstTry: 1 });
  s = r(s, { type: "CONTINUE" });
  assert.equal(s.index, 1);
  assert.deepEqual(s.phase, { kind: "countdown", step: 3 });
});

test("save failure offers retry-save and continue-unsaved", () => {
  let s = run(recognizing(), frame(0), frame(400), frame(800), frame(1000));
  s = r(s, { type: "SAVE_FAILED", attempt: s.attempt });
  assert.ok(s.phase.kind === "success" && s.phase.save === "failed");
  const retried = r(s, { type: "RETRY_SAVE" });
  assert.ok(retried.phase.kind === "success" && retried.phase.save === "saving" && retried.phase.saveRequest === 2);
  const moved = r(s, { type: "CONTINUE" });
  assert.equal(moved.index, 1);
});

test("stale save results don't change the current attempt", () => {
  let s = run(recognizing(), frame(0), frame(400), frame(800), frame(1000));
  const oldAttempt = s.attempt;
  s = r(s, { type: "GOTO", index: 5 });
  s = r(s, { type: "SAVE_FAILED", attempt: oldAttempt });
  assert.deepEqual(s.phase, { kind: "countdown", step: 3 });
  s = r(s, { type: "SAVE_OK", attempt: oldAttempt, sign: "A", xp: 50, correct: true });
  assert.deepEqual(s.phase, { kind: "countdown", step: 3 }, "phase untouched");
  assert.equal(s.session.xp, 50, "but the server-recorded XP still counts");
});

test("retry restarts the countdown and marks the sign as not first-try", () => {
  let s = run(recognizing(), { type: "RETRY" });
  assert.deepEqual(s.phase, { kind: "countdown", step: 3 });
  assert.equal(s.resetsThisSign, 1);
  s = run(s, { type: "SKIP" }, frame(0), frame(400), frame(800), frame(1000));
  s = r(s, { type: "SAVE_OK", attempt: s.attempt, sign: "A", xp: 10, correct: true });
  assert.equal(s.session.firstTry, 0);
});

test("navigating during the countdown restarts it for the new sign", () => {
  let s = run(initialState(26), { type: "CAMERA_READY" }, { type: "TICK" });
  s = r(s, { type: "GOTO", index: 3 });
  assert.equal(s.index, 3);
  assert.deepEqual(s.phase, { kind: "countdown", step: 3 });
});

test("stopping the camera cancels the countdown", () => {
  const s = run(initialState(26), { type: "CAMERA_READY" }, { type: "TICK" }, { type: "CAMERA_STOPPED" });
  assert.deepEqual(s.phase, { kind: "ready" });
  assert.equal(r(s, { type: "TICK" }).phase.kind, "ready");
});

test("tab hidden pauses the countdown and resumes at the same step", () => {
  let s = run(initialState(26), { type: "CAMERA_READY" }, { type: "TICK" });
  s = r(s, { type: "PAUSE", reason: "tab-hidden" });
  assert.equal(s.phase.kind, "paused");
  assert.equal(r(s, { type: "TICK" }).phase.kind, "paused", "no ticks while paused");
  s = r(s, { type: "RESUME" });
  assert.deepEqual(s.phase, { kind: "countdown", step: 2 });
});

test("camera lost pauses; camera ready restarts the countdown", () => {
  let s = run(recognizing(), frame(0), { type: "CAMERA_LOST" });
  assert.ok(s.phase.kind === "paused" && s.phase.reason === "camera-lost");
  assert.equal(r(s, { type: "RESUME" }).phase.kind, "paused", "can't resume without a camera");
  s = r(s, { type: "CAMERA_READY" });
  assert.deepEqual(s.phase, { kind: "countdown", step: 3 });
});

test("the last sign completes the set", () => {
  let s = run(initialState(2, 1), { type: "CAMERA_READY" }, { type: "SKIP" }, frame(0), frame(400), frame(800), frame(1000));
  s = r(s, { type: "SAVE_OK", attempt: s.attempt, sign: "A", xp: 10, correct: true });
  s = r(s, { type: "CONTINUE" });
  assert.equal(s.phase.kind, "complete");
});

test("switching set starts the new set's countdown at index 0", () => {
  const s = run(initialState(26, 7), { type: "CAMERA_READY" }, { type: "SET_TOTAL", total: 10 });
  assert.equal(s.index, 0);
  assert.equal(s.total, 10);
  assert.deepEqual(s.phase, { kind: "countdown", step: 3 });
});

// ── Smoothing helpers ───────────────────────────────────────────────────────

test("one-euro filter: steady input stays put, jitter is reduced", () => {
  const f = new OneEuroFilter();
  for (let t = 0; t < 1000; t += 33) assert.ok(Math.abs(f.filter(0.5, t) - 0.5) < 1e-9);
  const g = new OneEuroFilter();
  let rawVar = 0;
  let outVar = 0;
  let seed = 1;
  const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 0.02;
  for (let i = 0; i < 120; i++) {
    const raw = 0.5 + noise();
    const out = g.filter(raw, i * 33);
    if (i > 10) {
      rawVar += (raw - 0.5) ** 2;
      outVar += (out - 0.5) ** 2;
    }
  }
  assert.ok(outVar < rawVar * 0.5, `smoothed variance ${outVar} should be well below raw ${rawVar}`);
});

test("one-euro filter: follows a real move within a few frames", () => {
  const f = new OneEuroFilter();
  for (let t = 0; t < 300; t += 33) f.filter(0.2, t);
  let v = 0;
  for (let t = 300; t < 600; t += 33) v = f.filter(0.6, t);
  assert.ok(Math.abs(v - 0.6) < 0.02, `after 300ms it should be near the new position, got ${v}`);
});

test("probability smoother: one noisy frame doesn't flip the sign", () => {
  const classes = ["A", "B"];
  const p = new ProbabilitySmoother();
  for (let i = 0; i < 6; i++) p.push([0.9, 0.1], classes);
  assert.equal(p.push([0.1, 0.9], classes).prediction, "A");
  assert.equal(p.push([0.9, 0.1], classes).prediction, "A");
});

test("probability smoother: a sustained change flips within ~3 frames", () => {
  const classes = ["A", "B"];
  const p = new ProbabilitySmoother();
  for (let i = 0; i < 6; i++) p.push([0.9, 0.1], classes);
  let out = { prediction: "A", confidence: 0 };
  let frames = 0;
  while (out.prediction !== "B" && frames < 10) {
    out = p.push([0.05, 0.95], classes);
    frames++;
  }
  assert.ok(frames <= 3, `took ${frames} frames`);
});

test("presence debounce: brief dropouts keep the hand present", () => {
  const d = new PresenceDebounce(300);
  assert.equal(d.update(true, 0), true);
  assert.equal(d.update(false, 200), true);
  assert.equal(d.update(false, 301), false);
  assert.equal(d.update(true, 400), true);
});

let failed = 0;
for (const [name, fn] of tests) {
  try {
    fn();
  } catch (err) {
    failed++;
    console.error(`✗ ${name}\n  ${(err as Error).message}`);
  }
}
console.log(`practice machine: ${tests.length - failed}/${tests.length} passed`);
if (failed) process.exit(1);
