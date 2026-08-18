import assert from "node:assert/strict";
import test from "node:test";

import {
  ANGLE_SUM_REVEAL_DURATION,
  angleSumRevealFrame,
} from "../src/quadrilateral-angle-sum-animation.js";

test("die Einblendung dauert 650 Millisekunden und endet exakt sichtbar", () => {
  assert.equal(ANGLE_SUM_REVEAL_DURATION, 650);
  assert.deepEqual(angleSumRevealFrame(0), { progress: 0, opacity: 0, complete: false });
  assert.deepEqual(angleSumRevealFrame(650), { progress: 1, opacity: 1, complete: true });
});

test("die Einblendung ist ruhig, monoton und begrenzt", () => {
  let previous = -1;
  for (const elapsed of [0, 65, 130, 260, 390, 520, 650, 900]) {
    const frame = angleSumRevealFrame(elapsed);
    assert.ok(frame.opacity >= previous);
    assert.ok(frame.opacity >= 0 && frame.opacity <= 1);
    previous = frame.opacity;
  }
  assert.throws(() => angleSumRevealFrame(-1), /nicht negativ/);
  assert.throws(() => angleSumRevealFrame(Number.NaN), /endlich/);
});
