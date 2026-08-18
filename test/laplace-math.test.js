import assert from "node:assert/strict";
import test from "node:test";

import { EQUAL_SPINNER_ANGLES, UNEQUAL_SPINNER_ANGLES, countingProbability, spinnerProbability, spinnerSegments } from "../src/laplace-math.js";

test("beide Räder besitzen vier Ergebnisse und exakt 360 Grad", () => {
  assert.deepEqual(EQUAL_SPINNER_ANGLES, [90, 90, 90, 90]);
  assert.deepEqual(UNEQUAL_SPINNER_ANGLES, [180, 72, 60, 48]);
  assert.equal(EQUAL_SPINNER_ANGLES.reduce((sum, angle) => sum + angle, 0), 360);
  assert.equal(UNEQUAL_SPINNER_ANGLES.reduce((sum, angle) => sum + angle, 0), 360);
});

test("reines Zählen liefert für jedes einzelne Ergebnis stets ein Viertel", () => {
  for (const result of [1, 2, 3, 4]) {
    assert.deepEqual(countingProbability(result), { numerator: 1, denominator: 4, fraction: "1/4" });
  }
});

test("Flächenanteile liefern am ungleichen Rad die tatsächlichen Wahrscheinlichkeiten", () => {
  assert.equal(spinnerProbability(EQUAL_SPINNER_ANGLES, 1).fraction, "1/4");
  assert.deepEqual(UNEQUAL_SPINNER_ANGLES.map((_, index) => spinnerProbability(UNEQUAL_SPINNER_ANGLES, index + 1).fraction), ["1/2", "1/5", "1/6", "2/15"]);
});

test("Segmentgeometrie bleibt endlich, vollständig und innerhalb des Glücksrads", () => {
  for (const angles of [EQUAL_SPINNER_ANGLES, UNEQUAL_SPINNER_ANGLES]) {
    const segments = spinnerSegments(angles);
    assert.equal(segments.length, 4);
    assert.equal(segments.reduce((sum, segment) => sum + segment.angle, 0), 360);
    for (const segment of segments) {
      assert.doesNotMatch(segment.path, /NaN|Infinity/);
      assert.ok(segment.label.x >= 30 && segment.label.x <= 270);
      assert.ok(segment.label.y >= 30 && segment.label.y <= 270);
    }
  }
});

test("ungültige Winkel und Ergebnisse werden abgewiesen", () => {
  assert.throws(() => spinnerProbability([90, 90, 90], 1), /vier Felder/);
  assert.throws(() => spinnerProbability([90, 90, 90, 80], 1), /360 Grad/);
  assert.throws(() => spinnerProbability(UNEQUAL_SPINNER_ANGLES, 5), /Ergebnis/);
  assert.throws(() => countingProbability(0), /Ergebnis/);
});
