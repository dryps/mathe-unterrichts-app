import assert from "node:assert/strict";
import test from "node:test";

import {
  TERM_MULTIPLICATION_DEFAULT_X,
  TERM_MULTIPLICATION_MAX_X,
  TERM_MULTIPLICATION_MIN_X,
  createTermMultiplicationModel,
  normalizeTermMultiplicationX,
} from "../src/term-multiplication-math.js";

test("der Erkundungswert hat einen dokumentierten ganzzahligen Vertrag", () => {
  assert.equal(TERM_MULTIPLICATION_MIN_X, 1);
  assert.equal(TERM_MULTIPLICATION_MAX_X, 5);
  assert.equal(TERM_MULTIPLICATION_DEFAULT_X, 3);

  for (const [input, expected] of [
    [-8, 1],
    [1, 1],
    [2.8, 3],
    [5, 5],
    [12, 5],
    ["4", 4],
  ]) {
    assert.equal(normalizeTermMultiplicationX(input), expected);
  }
});

test("Addition verdoppelt die Länge, Multiplikation quadriert die Fläche", () => {
  for (const x of [1, 2, 3, 4, 5]) {
    const model = createTermMultiplicationModel(x);

    assert.equal(model.x, x);
    assert.equal(model.additiveLength, 2 * x);
    assert.equal(model.squareArea, x * x);
    assert.equal(model.additionFormula, `x + x = 2x = ${2 * x}`);
    assert.equal(model.multiplicationFormula, `x · x = x² = ${x * x}`);
  }
});

test("Formeln ohne eingesetzten Zahlenwert bleiben strukturell korrekt", () => {
  const model = createTermMultiplicationModel(3);

  assert.equal(model.additionStructure, "x + x = 2x");
  assert.equal(model.multiplicationStructure, "x · x = x²");
  assert.equal(model.sameNumericValue, false);
  assert.equal(model.comparisonNote, "Länge 6 und Fläche 9 haben verschiedene Werte.");
});

test("x = 2 wird als gleiche Zahl, aber nicht als gleicher Term erklärt", () => {
  const model = createTermMultiplicationModel(2);

  assert.equal(model.additiveLength, 4);
  assert.equal(model.squareArea, 4);
  assert.equal(model.sameNumericValue, true);
  assert.equal(
    model.comparisonNote,
    "Beide Zahlenwerte sind 4. Trotzdem bleibt 2x eine Länge und x² eine Fläche.",
  );
});

test("ungültige nichtnumerische Eingaben fallen sicher auf den Startwert zurück", () => {
  for (const value of [undefined, null, "", "x", Number.NaN, Infinity]) {
    assert.equal(normalizeTermMultiplicationX(value), 3);
  }
});
