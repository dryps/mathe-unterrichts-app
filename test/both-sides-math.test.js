import assert from "node:assert/strict";
import test from "node:test";

import { createCancellationModel, normalizeSharedCoefficient } from "../src/both-sides-math.js";

test("5x + 3 = 2x + 18 und 3x + 3 = 18 besitzen beide x = 5", () => {
  const model = createCancellationModel(2);
  assert.equal(model.sourceEquation, "5x + 3 = 2x + 18");
  assert.equal(model.reducedEquation, "3x + 3 = 18");
  assert.equal(model.sourceLeftValue, 28);
  assert.equal(model.sourceRightValue, 28);
  assert.equal(model.reducedLeftValue, 18);
  assert.equal(model.reducedRightValue, 18);
  assert.equal(model.solution, 5);
});

test("auf beiden Seiten verschwinden exakt dieselben zwei x-Bausteine", () => {
  const model = createCancellationModel(2);
  assert.equal(model.removedLeftX, 2);
  assert.equal(model.removedRightX, 2);
  assert.equal(model.remainingLeftX, 3);
  assert.equal(model.remainingRightX, 0);
});

test("freie gemeinsame Koeffizienten eins bis vier führen stets zur selben reduzierten Gleichung", () => {
  for (let shared = 1; shared <= 4; shared += 1) {
    const model = createCancellationModel(shared);
    assert.equal(model.sourceEquation, `${shared + 3}x + 3 = ${shared === 1 ? "x" : `${shared}x`} + 18`);
    assert.equal(model.reducedEquation, "3x + 3 = 18");
    assert.equal(model.solution, 5);
    assert.equal(model.sourceLeftValue, model.sourceRightValue);
  }
});

test("Koeffizienten rasten ganzzahlig zwischen eins und vier ein", () => {
  assert.equal(normalizeSharedCoefficient(-9), 1);
  assert.equal(normalizeSharedCoefficient(2.6), 3);
  assert.equal(normalizeSharedCoefficient(99), 4);
  assert.equal(normalizeSharedCoefficient(""), 2);
  assert.equal(normalizeSharedCoefficient(Number.NaN), 2);
});
