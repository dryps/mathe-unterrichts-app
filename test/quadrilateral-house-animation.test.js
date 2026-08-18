import assert from "node:assert/strict";
import test from "node:test";

import { HOUSE_REVEAL_DURATION, houseRevealFrame } from "../src/quadrilateral-house-animation.js";

test("Eigenschafts-Reveal beginnt unsichtbar und endet vollständig", () => {
  assert.deepEqual(houseRevealFrame(0), { progress: 0, opacity: 0, complete: false });
  assert.deepEqual(houseRevealFrame(HOUSE_REVEAL_DURATION), { progress: 1, opacity: 1, complete: true });
});

test("Reveal bleibt ruhig, monoton und begrenzt", () => {
  let previous = -1;
  for (const elapsed of [0, 130, 260, 390, 520, 650, 1000]) {
    const frame = houseRevealFrame(elapsed);
    assert.ok(frame.opacity >= previous && frame.opacity >= 0 && frame.opacity <= 1);
    previous = frame.opacity;
  }
});

test("ungültige Animationszeiten werden abgewiesen", () => {
  assert.throws(() => houseRevealFrame(-1), RangeError);
  assert.throws(() => houseRevealFrame(Number.NaN), RangeError);
});
