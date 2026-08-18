import assert from "node:assert/strict";
import test from "node:test";

import { RANDOM_EVENT_REVEAL_DURATION, randomEventRevealFrame } from "../src/random-event-animation.js";

test("Reveal bleibt kurz, monoton und endet exakt", () => {
  assert.equal(RANDOM_EVENT_REVEAL_DURATION, 650);
  let previous = -1;
  for (const time of [0, 100, 250, 400, 550, 650, 900]) {
    const frame = randomEventRevealFrame(time);
    assert.ok(frame.opacity >= previous);
    assert.ok(frame.opacity >= 0 && frame.opacity <= 1);
    previous = frame.opacity;
  }
  assert.deepEqual(randomEventRevealFrame(650), { progress: 1, opacity: 1, complete: true });
});

test("ungültige Animationszeiten werden abgewiesen", () => {
  assert.throws(() => randomEventRevealFrame(-1), /Animationszeit/);
  assert.throws(() => randomEventRevealFrame(Number.NaN), /Animationszeit/);
});
