import assert from "node:assert/strict";
import test from "node:test";

import { OUTCOME_SPACE_REVEAL_DURATION, outcomeSpaceRevealFrame } from "../src/outcome-space-animation.js";

test("Reveal bleibt kurz, monoton und endet exakt", () => {
  assert.equal(OUTCOME_SPACE_REVEAL_DURATION, 650);
  let previous = -1;
  for (const time of [0, 100, 250, 400, 550, 650, 900]) {
    const frame = outcomeSpaceRevealFrame(time);
    assert.ok(frame.opacity >= previous);
    assert.ok(frame.opacity >= 0 && frame.opacity <= 1);
    previous = frame.opacity;
  }
  assert.deepEqual(outcomeSpaceRevealFrame(650), { progress: 1, opacity: 1, complete: true });
});

test("ungültige Animationszeiten werden abgewiesen", () => {
  assert.throws(() => outcomeSpaceRevealFrame(-1), /Animationszeit/);
  assert.throws(() => outcomeSpaceRevealFrame(Number.NaN), /Animationszeit/);
});
