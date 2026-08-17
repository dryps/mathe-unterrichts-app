import assert from "node:assert/strict";
import test from "node:test";

import { SOLUTION_REVEAL_DURATION, solutionRevealFrame } from "../src/solution-set-animation.js";

test("die Lösungsmenge wächst monoton von der Grenze nach links", () => {
  const frames = [0, 200, 400, 600, SOLUTION_REVEAL_DURATION].map(solutionRevealFrame);
  assert.equal(frames[0].progress, 0);
  assert.equal(frames.at(-1).progress, 1);
  assert.equal(frames.at(-1).complete, true);
  for (let index = 1; index < frames.length; index += 1) assert.ok(frames[index].progress >= frames[index - 1].progress);
});

test("ungültige Animationszeiten werden abgewiesen", () => {
  assert.throws(() => solutionRevealFrame(-1), /negativ/);
  assert.throws(() => solutionRevealFrame(Number.NaN), /endlich/);
});
