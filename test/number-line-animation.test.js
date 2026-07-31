import assert from "node:assert/strict";
import test from "node:test";

import {
  AUTOMATIC_STEP_DURATION_MS,
  NUMBER_LINE_MOTION_PATHS,
  automaticMotionDuration,
  automaticMotionFrame,
  easeInOutCubic,
} from "../src/number-line-animation.js";

test("die drei Bewegungswege zeigen rechts, zurück zur Null und weiter nach links", () => {
  assert.deepEqual(NUMBER_LINE_MOTION_PATHS.right, [0, 1, 2, 3]);
  assert.deepEqual(NUMBER_LINE_MOTION_PATHS.home, [3, 2, 1, 0]);
  assert.deepEqual(NUMBER_LINE_MOTION_PATHS.negative, [0, -1, -2, -3]);
});

test("jede automatische Bewegung durchläuft drei gleich lange ruhige Schritte", () => {
  for (const path of Object.values(NUMBER_LINE_MOTION_PATHS)) {
    assert.equal(
      automaticMotionDuration(path),
      3 * AUTOMATIC_STEP_DURATION_MS,
    );
  }
});

test("exakte Schrittzeitpunkte treffen exakt die ganzzahligen Positionen", () => {
  for (const path of Object.values(NUMBER_LINE_MOTION_PATHS)) {
    path.forEach((value, index) => {
      const frame = automaticMotionFrame(
        index * AUTOMATIC_STEP_DURATION_MS,
        path,
      );
      assert.equal(frame.value, value);
    });
  }
});

test("die Bewegung ist stetig, ruhig beschleunigt und endet deterministisch", () => {
  assert.equal(easeInOutCubic(0), 0);
  assert.equal(easeInOutCubic(0.5), 0.5);
  assert.equal(easeInOutCubic(1), 1);
  const firstQuarter = easeInOutCubic(0.25);
  const lastQuarter = easeInOutCubic(0.75);
  assert.ok(firstQuarter > 0 && firstQuarter < 0.25);
  assert.ok(lastQuarter > 0.75 && lastQuarter < 1);
  const final = automaticMotionFrame(999999, NUMBER_LINE_MOTION_PATHS.negative);
  assert.equal(final.value, -3);
  assert.equal(final.complete, true);
});

test("ungültige Bewegungseingaben werden kontrolliert abgelehnt", () => {
  assert.throws(() => automaticMotionDuration([0]), RangeError);
  assert.throws(() => automaticMotionDuration([0, 1], 0), RangeError);
  assert.throws(
    () => automaticMotionFrame(Number.NaN, NUMBER_LINE_MOTION_PATHS.right),
    RangeError,
  );
});
