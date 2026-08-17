import assert from "node:assert/strict";
import test from "node:test";

import { createSolutionSetModel, normalizeTestValue, solutionLinePercent } from "../src/solution-set-math.js";

test("2x < 6 wird für einzelne Werte exakt ausgewertet", () => {
  assert.deepEqual(createSolutionSetModel(2), {
    x: 2,
    left: 4,
    sourceEquation: "2x < 6",
    substitution: "2 · 2 = 4",
    testedComparison: "4 < 6",
    isSolution: true,
    truthText: "wahr",
    solutionInequality: "x < 3",
    boundary: 3,
  });
  assert.equal(createSolutionSetModel(3).isSolution, false);
  assert.equal(createSolutionSetModel(4).testedComparison, "8 < 6");
});

test("Testwerte werden robust auf den sichtbaren Bereich begrenzt", () => {
  assert.equal(normalizeTestValue(""), 4);
  assert.equal(normalizeTestValue("unbekannt"), 4);
  assert.equal(normalizeTestValue(-20), -2);
  assert.equal(normalizeTestValue(20), 6);
  assert.equal(normalizeTestValue(2.6), 3);
});

test("die Zahlengerade bildet −2 bis 6 monoton auf 0 bis 100 Prozent ab", () => {
  assert.equal(solutionLinePercent(-2), 0);
  assert.equal(solutionLinePercent(3), 62.5);
  assert.equal(solutionLinePercent(6), 100);
  assert.ok(solutionLinePercent(1) < solutionLinePercent(2));
  assert.throws(() => solutionLinePercent(Number.NaN), /endlich/);
});
