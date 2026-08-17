import assert from "node:assert/strict";
import test from "node:test";
import { REFLECTION_DURATION, reflectionFrame } from "../src/negative-inequality-animation.js";

test("Spiegelung dauert ruhig genau eine Sekunde", () => {
  assert.equal(REFLECTION_DURATION, 1000);
  assert.deepEqual(reflectionFrame(0), { progress: 0, multiplier: 1, complete: false });
  assert.deepEqual(reflectionFrame(1000), { progress: 1, multiplier: -1, complete: true });
});

test("beide Punkte verwenden in jedem Frame denselben Spiegelungsfaktor", () => {
  const half = reflectionFrame(500);
  assert.equal(half.progress, 0.5);
  assert.equal(half.multiplier, 0);
  for (const elapsed of [100, 250, 750, 900]) {
    const frame = reflectionFrame(elapsed);
    assert.equal(frame.multiplier >= -1 && frame.multiplier <= 1, true);
  }
});

test("Animation begrenzt verspätete Frames und weist ungültige Zeiten ab", () => {
  assert.deepEqual(reflectionFrame(5000), { progress: 1, multiplier: -1, complete: true });
  assert.throws(() => reflectionFrame(-1), /nicht negativ/);
  assert.throws(() => reflectionFrame(Infinity), /endlich/);
});
