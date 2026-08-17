import assert from "node:assert/strict";
import test from "node:test";

import {
  DISTRIBUTION_DEFAULT_FACTOR,
  createDistributionModel,
  normalizeDistributionFactor,
} from "../src/distribution-math.js";

test("Faktor drei vervielfacht das gesamte Paket zu drei x und sechs Einern", () => {
  const model = createDistributionModel(3);
  assert.equal(DISTRIBUTION_DEFAULT_FACTOR, 3);
  assert.equal(model.packages.length, 3);
  assert.ok(model.packages.every((entry) => entry.xUnits === 1 && entry.ones === 2));
  assert.equal(model.totalX, 3);
  assert.equal(model.totalOnes, 6);
  assert.equal(model.sourceExpression, "3(x + 2)");
  assert.equal(model.expandedExpression, "3x + 6");
  assert.equal(model.equation, "3(x + 2) = 3x + 6");
});

test("jeder erlaubte Faktor trifft beide Terme exakt gleich oft", () => {
  for (let factor = 2; factor <= 5; factor += 1) {
    const model = createDistributionModel(factor);
    assert.equal(model.packages.length, factor);
    assert.equal(model.totalX, factor);
    assert.equal(model.totalOnes, factor * 2);
    assert.equal(model.expandedExpression, `${factor}x + ${factor * 2}`);
    assert.ok(Object.isFrozen(model));
    assert.ok(Object.isFrozen(model.packages));
  }
});

test("Paketbestandteile werden nicht stillschweigend ausgelassen", () => {
  for (const factor of [2, 3, 4, 5]) {
    const model = createDistributionModel(factor);
    assert.equal(model.packages.reduce((sum, item) => sum + item.xUnits, 0), model.totalX);
    assert.equal(model.packages.reduce((sum, item) => sum + item.ones, 0), model.totalOnes);
  }
});

test("Faktoreingaben rasten ganzzahlig zwischen zwei und fünf ein", () => {
  assert.equal(normalizeDistributionFactor(1), 2);
  assert.equal(normalizeDistributionFactor(2.4), 2);
  assert.equal(normalizeDistributionFactor(3.6), 4);
  assert.equal(normalizeDistributionFactor(8), 5);
});

test("fehlende und nicht endliche Eingaben fallen sicher auf drei zurück", () => {
  for (const value of [undefined, null, "", Number.NaN, Number.POSITIVE_INFINITY, "x"]) {
    assert.equal(normalizeDistributionFactor(value), 3);
  }
});
