import assert from "node:assert/strict";
import test from "node:test";
import { UNIQUE_QUADRILATERAL_REVEAL_DURATION, uniqueQuadrilateralRevealFrame } from "../src/unique-quadrilateral-animation.js";

test("Reveal dauert 650 Millisekunden und endet exakt", () => {
  assert.equal(UNIQUE_QUADRILATERAL_REVEAL_DURATION, 650);
  assert.deepEqual(uniqueQuadrilateralRevealFrame(0), { progress: 0, opacity: 0, complete: false });
  assert.deepEqual(uniqueQuadrilateralRevealFrame(650), { progress: 1, opacity: 1, complete: true });
});

test("Reveal bleibt monoton und weist ungültige Zeiten ab", () => {
  let previous = -1;
  for (const elapsed of [0, 100, 250, 400, 550, 650, 900]) {
    const frame = uniqueQuadrilateralRevealFrame(elapsed);
    assert.ok(frame.opacity >= previous && frame.opacity <= 1);
    previous = frame.opacity;
  }
  assert.throws(() => uniqueQuadrilateralRevealFrame(-1), /nicht negativ/);
  assert.throws(() => uniqueQuadrilateralRevealFrame(Number.NaN), /endlich/);
});
