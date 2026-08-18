import assert from "node:assert/strict";
import test from "node:test";

import { RELATIVE_FREQUENCY_REVEAL_DURATION, relativeFrequencyRevealFrame } from "../src/relative-frequency-animation.js";

test("Reveal bleibt kurz, monoton und endet exakt", () => {
  assert.equal(RELATIVE_FREQUENCY_REVEAL_DURATION, 650);
  const frames = [0, 130, 260, 390, 520, 650].map(relativeFrequencyRevealFrame);
  assert.equal(frames[0].opacity, 0);
  assert.equal(frames.at(-1).opacity, 1);
  assert.equal(frames.at(-1).complete, true);
  for (let index = 1; index < frames.length; index += 1) assert.ok(frames[index].opacity >= frames[index - 1].opacity);
});

test("ungültige Animationszeiten werden abgewiesen", () => {
  assert.throws(() => relativeFrequencyRevealFrame(Number.NaN), /Zeit/);
  assert.throws(() => relativeFrequencyRevealFrame(-1), /Zeit/);
});
