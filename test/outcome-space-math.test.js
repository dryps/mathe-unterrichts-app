import assert from "node:assert/strict";
import test from "node:test";

import { COMPLETE_DIE_SPACE, INCOMPLETE_DIE_SPACE, evenProbability } from "../src/outcome-space-math.js";

test("der unvollständige Raum lässt genau das Ergebnis sechs aus", () => {
  assert.deepEqual(INCOMPLETE_DIE_SPACE, [1, 2, 3, 4, 5]);
  assert.deepEqual(COMPLETE_DIE_SPACE, [1, 2, 3, 4, 5, 6]);
});

test("der falsche Nenner erzeugt 2 durch 5 statt 3 durch 6", () => {
  assert.deepEqual(evenProbability(INCOMPLETE_DIE_SPACE), { favorable: [2, 4], numerator: 2, denominator: 5, fraction: "2/5", percent: 40 });
  assert.deepEqual(evenProbability(COMPLETE_DIE_SPACE), { favorable: [2, 4, 6], numerator: 3, denominator: 6, fraction: "3/6", percent: 50 });
});

test("ungültige oder doppelte Elementarergebnisse werden abgewiesen", () => {
  assert.throws(() => evenProbability([1, 2, 2]), /eindeutig/);
  assert.throws(() => evenProbability([1, 7]), /Würfelergebnisse/);
  assert.throws(() => evenProbability([]), /nicht leer/);
});
