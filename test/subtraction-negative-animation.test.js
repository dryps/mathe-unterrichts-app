import assert from "node:assert/strict";
import test from "node:test";

import {
  DIRECTION_REVERSAL_DURATION_MS,
  SUBTRACTION_MOVEMENT_DURATION_MS,
  directionReversalFrame,
  easeInOutCubic,
  subtractionMovementFrame,
} from "../src/subtraction-negative-animation.js";
import { subtractionMovement } from "../src/subtraction-negative-geometry.js";

test("Richtungsumkehr dauert ruhig 1,2 Sekunden und endet exakt bei 180 Grad", () => {
  const movement = subtractionMovement(-2);
  const first = directionReversalFrame(0, movement);
  const middle = directionReversalFrame(DIRECTION_REVERSAL_DURATION_MS / 2, movement);
  const last = directionReversalFrame(DIRECTION_REVERSAL_DURATION_MS, movement);
  assert.equal(DIRECTION_REVERSAL_DURATION_MS, 1200);
  assert.equal(first.angle, 0);
  assert.equal(middle.angle, 90);
  assert.equal(last.angle, 180);
  assert.equal(last.complete, true);
});

test("Umkehrung verändert in keinem Animationsframe Länge oder Schrittzahl", () => {
  for (const subtrahend of [-1, -2, -3, -4]) {
    const movement = subtractionMovement(subtrahend);
    for (const elapsed of [0, 100, 599, 600, 1199, 1200, 9999]) {
      const frame = directionReversalFrame(elapsed, movement);
      assert.equal(frame.vectorLength, movement.vectorLength);
      assert.equal(frame.stepCount, movement.originalStepCount);
      assert.ok(frame.angle >= 0 && frame.angle <= 180);
    }
  }
});

test("Bewegung startet bei vier und endet deterministisch bei sechs", () => {
  const movement = subtractionMovement(-2);
  const first = subtractionMovementFrame(0, movement);
  const last = subtractionMovementFrame(SUBTRACTION_MOVEMENT_DURATION_MS, movement);
  assert.equal(first.x, movement.startX);
  assert.equal(first.visibleSteps, 0);
  assert.equal(last.x, movement.effectiveEndX);
  assert.equal(last.visibleSteps, 2);
  assert.equal(last.complete, true);
});

test("gedrosselte Frames verändern nie Ergebnis oder Endpunkt", () => {
  const movement = subtractionMovement(-4);
  for (const elapsed of [0, 1, 777, 1499, 1500, 10000]) {
    const frame = subtractionMovementFrame(elapsed, movement);
    assert.equal(movement.result, 8);
    assert.ok(frame.x >= movement.startX && frame.x <= movement.effectiveEndX);
    assert.ok(Number.isInteger(frame.visibleSteps));
  }
  assert.equal(subtractionMovementFrame(10000, movement).x, movement.effectiveEndX);
});

test("Easing bleibt symmetrisch, begrenzt und monoton", () => {
  const samples = [-1, 0, 0.2, 0.5, 0.8, 1, 2].map(easeInOutCubic);
  assert.deepEqual(samples, [0, 0, ...samples.slice(2, 5), 1, 1]);
  assert.ok(Math.abs(samples[2] - (1 - samples[4])) < 1e-12);
  for (let index = 1; index < samples.length; index += 1) {
    assert.ok(samples[index] >= samples[index - 1]);
  }
});
