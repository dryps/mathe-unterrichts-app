import assert from "node:assert/strict";
import test from "node:test";

import {
  MULTIPLICATION_REVEAL_DURATION_MS,
  easeInOutCubic,
  multiplicationRevealFrame,
} from "../src/multiplication-negative-animation.js";

test("ruhige Einblendung beginnt verborgen und endet nach 650 Millisekunden exakt sichtbar", () => {
  const first = multiplicationRevealFrame(0);
  const middle = multiplicationRevealFrame(MULTIPLICATION_REVEAL_DURATION_MS / 2);
  const last = multiplicationRevealFrame(MULTIPLICATION_REVEAL_DURATION_MS);
  assert.equal(MULTIPLICATION_REVEAL_DURATION_MS, 650);
  assert.deepEqual(first, { progress: 0, opacity: 0, translateY: 12, complete: false });
  assert.equal(middle.progress, 0.5);
  assert.equal(middle.opacity, 0.5);
  assert.equal(middle.translateY, 6);
  assert.deepEqual(last, { progress: 1, opacity: 1, translateY: 0, complete: true });
});

test("verspätete Frames bleiben begrenzt und erzeugen denselben Endzustand", () => {
  assert.deepEqual(
    multiplicationRevealFrame(9999),
    multiplicationRevealFrame(MULTIPLICATION_REVEAL_DURATION_MS),
  );
  assert.deepEqual(multiplicationRevealFrame(-50), multiplicationRevealFrame(0));
  assert.throws(() => multiplicationRevealFrame(Number.NaN), RangeError);
});

test("kubisches Easing bleibt symmetrisch, monoton und innerhalb null bis eins", () => {
  const samples = [-1, 0, 0.2, 0.5, 0.8, 1, 2].map(easeInOutCubic);
  assert.deepEqual(samples.slice(0, 2), [0, 0]);
  assert.equal(samples[3], 0.5);
  assert.deepEqual(samples.slice(-2), [1, 1]);
  assert.ok(Math.abs(samples[2] - (1 - samples[4])) < 1e-12);
  for (let index = 1; index < samples.length; index += 1) {
    assert.ok(samples[index] >= samples[index - 1]);
  }
});
