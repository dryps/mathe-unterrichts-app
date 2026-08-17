import assert from "node:assert/strict";
import test from "node:test";

import {
  SUBTRACTION_START,
  formatSubtraction,
  negativeTermDirection,
  snapNegativeSubtrahend,
  subtractionEffectiveDirection,
  subtractionMovement,
  subtractionPointIsOnLine,
  subtractionResult,
  subtractionStepCount,
  subtractionValueToPoint,
  xToNegativeSubtrahend,
} from "../src/subtraction-negative-geometry.js";

test("alle vier negativen Subtrahenden liefern exakte Ergebnisse", () => {
  const expected = new Map([
    [-1, 5],
    [-2, 6],
    [-3, 7],
    [-4, 8],
  ]);
  for (const [subtrahend, result] of expected) {
    assert.equal(subtractionResult(subtrahend), result);
    assert.equal(negativeTermDirection(subtrahend), "left");
    assert.equal(subtractionEffectiveDirection(subtrahend), "right");
    assert.equal(subtractionStepCount(subtrahend), Math.abs(subtrahend));
  }
});

test("Subtraktion kehrt ausschließlich die Richtung bei gleicher Schrittzahl um", () => {
  for (let subtrahend = -4; subtrahend <= -1; subtrahend += 1) {
    const movement = subtractionMovement(subtrahend);
    assert.equal(movement.originalDirection, "left");
    assert.equal(movement.effectiveDirection, "right");
    assert.equal(movement.originalStepCount, movement.effectiveStepCount);
    assert.equal(movement.originalStepCount, Math.abs(subtrahend));
    assert.equal(
      Math.abs(movement.startX - movement.originalEndX),
      Math.abs(movement.effectiveEndX - movement.startX),
    );
  }
});

test("zwei Schritte führen deterministisch von vier über fünf nach sechs", () => {
  const movement = subtractionMovement(-2);
  assert.equal(movement.start, SUBTRACTION_START);
  assert.equal(movement.subtrahend, -2);
  assert.equal(movement.magnitude, 2);
  assert.equal(movement.result, 6);
  assert.deepEqual(movement.originalValues, [4, 3, 2]);
  assert.deepEqual(movement.effectiveValues, [4, 5, 6]);
  assert.equal(movement.originalBoundaries.length, 3);
  assert.equal(movement.effectiveBoundaries.length, 3);
});

test("Einrasten kennt keine Zwischenwerte und schützt beide Grenzen", () => {
  assert.equal(snapNegativeSubtrahend(-2.49), -2);
  assert.equal(snapNegativeSubtrahend(-2.51), -3);
  assert.equal(snapNegativeSubtrahend(20), -1);
  assert.equal(snapNegativeSubtrahend(-20), -4);
});

test("Pfeilposition steuert ausschließlich den negativen Subtrahenden", () => {
  for (let subtrahend = -4; subtrahend <= -1; subtrahend += 1) {
    assert.equal(
      xToNegativeSubtrahend(subtractionMovement(subtrahend).originalEndX),
      subtrahend,
    );
  }
  assert.equal(xToNegativeSubtrahend(-9999), -4);
  assert.equal(xToNegativeSubtrahend(9999), -1);
});

test("alle Start-, Original- und Ergebnispositionen liegen exakt auf der Zahlengeraden", () => {
  assert.equal(subtractionPointIsOnLine(subtractionValueToPoint(4)), true);
  for (let subtrahend = -4; subtrahend <= -1; subtrahend += 1) {
    const movement = subtractionMovement(subtrahend);
    assert.equal(subtractionPointIsOnLine(subtractionValueToPoint(4 + subtrahend)), true);
    assert.equal(subtractionPointIsOnLine(subtractionValueToPoint(movement.result)), true);
  }
});

test("Rechnung zeigt Subtraktion, Addition und Gleichheit korrekt", () => {
  assert.deepEqual(formatSubtraction(-1), {
    subtraction: "4 − (−1) = 5",
    addition: "4 + 1 = 5",
    equivalence: "4 − (−1) = 4 + 1",
  });
  assert.deepEqual(formatSubtraction(-2), {
    subtraction: "4 − (−2) = 6",
    addition: "4 + 2 = 6",
    equivalence: "4 − (−2) = 4 + 2",
  });
  assert.equal(formatSubtraction(-4).subtraction, "4 − (−4) = 8");
});
