import assert from "node:assert/strict";
import test from "node:test";

import {
  BRACKET_SIGN_DEFAULT_OUTER_FACTOR,
  createBracketSignModel,
  normalizeBracketOuterFactor,
} from "../src/bracket-sign-math.js";

test("Minus eins wirkt auf beide Terme des gesamten Pakets", () => {
  const model = createBracketSignModel(-1);

  assert.equal(model.outerFactor, -1);
  assert.deepEqual(model.innerTerms, [1, -3]);
  assert.deepEqual(model.resultTerms, [-1, 3]);
  assert.equal(model.sourceExpression, "−(x − 3)");
  assert.equal(model.multiplicationExpression, "−1 · (x − 3)");
  assert.equal(model.resultExpression, "−x + 3");
  assert.deepEqual(model.innerLabels, ["+x", "−3"]);
  assert.deepEqual(model.resultLabels, ["−x", "+3"]);
});

test("Plus eins erhält beide Vorzeichen des gesamten Pakets", () => {
  const model = createBracketSignModel(1);

  assert.equal(model.outerFactor, 1);
  assert.deepEqual(model.resultTerms, [1, -3]);
  assert.equal(model.sourceExpression, "+(x − 3)");
  assert.equal(model.multiplicationExpression, "+1 · (x − 3)");
  assert.equal(model.resultExpression, "x − 3");
  assert.deepEqual(model.resultLabels, ["+x", "−3"]);
});

test("jede Ergebniskomponente ist exakt das Produkt mit demselben äußeren Faktor", () => {
  for (const factor of [-1, 1]) {
    const model = createBracketSignModel(factor);
    assert.equal(model.resultTerms[0], factor * model.innerTerms[0]);
    assert.equal(model.resultTerms[1], factor * model.innerTerms[1]);
    assert.ok(Object.isFrozen(model.innerTerms));
    assert.ok(Object.isFrozen(model.resultTerms));
    assert.ok(Object.isFrozen(model));
  }
});

test("äußerer Faktor rastet ausschließlich auf minus eins oder plus eins", () => {
  assert.equal(BRACKET_SIGN_DEFAULT_OUTER_FACTOR, -1);
  assert.equal(normalizeBracketOuterFactor(-99), -1);
  assert.equal(normalizeBracketOuterFactor(-1), -1);
  assert.equal(normalizeBracketOuterFactor(1), 1);
  assert.equal(normalizeBracketOuterFactor(99), 1);
});

test("fehlende, nullte und nicht endliche Eingaben fallen sicher auf minus eins zurück", () => {
  for (const value of [undefined, null, "", 0, Number.NaN, Number.POSITIVE_INFINITY, "x"]) {
    assert.equal(normalizeBracketOuterFactor(value), -1);
  }
});

