import assert from "node:assert/strict";
import test from "node:test";

import {
  EQUIVALENCE_TILT_DURATION,
  balanceTilt,
  equivalenceTiltFrame,
} from "../src/equivalence-animation.js";

test("gleiche Werte halten die Waage waagerecht, ungleiche kippen begrenzt", () => {
  assert.equal(balanceTilt(20, 20), 0);
  assert.equal(balanceTilt(15, 20), -6);
  assert.equal(balanceTilt(30, 20), 6);
});

test("Tilt-Animation beginnt exakt am Ausgangswert und endet exakt am Ziel", () => {
  assert.deepEqual(equivalenceTiltFrame(0, 0, -6), { progress: 0, tilt: 0, complete: false });
  assert.deepEqual(equivalenceTiltFrame(EQUIVALENCE_TILT_DURATION, 0, -6), { progress: 1, tilt: -6, complete: true });
});

test("Tilt-Animation bleibt vor und nach dem Zeitfenster deterministisch", () => {
  assert.equal(equivalenceTiltFrame(-50, 6, 0).tilt, 6);
  assert.equal(equivalenceTiltFrame(9999, -6, 0).tilt, 0);
});
