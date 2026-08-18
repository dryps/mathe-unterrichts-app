import assert from "node:assert/strict";
import test from "node:test";

import { LAPLACE_REVEAL_DURATION, laplaceRevealFrame } from "../src/laplace-animation.js";

test("Reveal bleibt kurz, monoton und endet exakt", () => {
  assert.equal(LAPLACE_REVEAL_DURATION, 650);
  let previous = -1;
  for (const time of [0, 100, 250, 400, 550, 650, 900]) {
    const frame = laplaceRevealFrame(time);
    assert.ok(frame.opacity >= previous);
    assert.ok(frame.opacity >= 0 && frame.opacity <= 1);
    previous = frame.opacity;
  }
  assert.deepEqual(laplaceRevealFrame(650), { progress: 1, opacity: 1, complete: true });
});

test("ungültige Animationszeiten werden abgewiesen", () => {
  assert.throws(() => laplaceRevealFrame(-1), /Animationszeit/);
  assert.throws(() => laplaceRevealFrame(Number.NaN), /Animationszeit/);
});
