import assert from "node:assert/strict";
import test from "node:test";
import { createReflectionModel, normalizeReflectionBase, numberLinePercent } from "../src/negative-inequality-math.js";

test("verbindliches Beispiel spiegelt 2 < 5 exakt zu −2 > −5", () => {
  const model = createReflectionModel(2);
  assert.deepEqual(model.positive, [2, 5]);
  assert.deepEqual(model.negative, [-2, -5]);
  assert.equal(model.sourceEquation, "2 < 5");
  assert.equal(model.resultEquation, "−2 > −5");
  assert.equal(model.sourceTrue, true);
  assert.equal(model.resultTrue, true);
});

test("alle Erkundungspaare behalten Abstand drei und kehren ihre Ordnung um", () => {
  for (let base = 1; base <= 4; base += 1) {
    const model = createReflectionModel(base);
    assert.equal(model.positive[1] - model.positive[0], 3);
    assert.equal(model.negative[0] > model.negative[1], true);
    assert.equal(model.resultEquation, `−${base} > −${base + 3}`);
  }
});

test("Normalisierung schützt Ganzzahlgrenzen eins bis vier", () => {
  assert.equal(normalizeReflectionBase(-9), 1);
  assert.equal(normalizeReflectionBase(2.6), 3);
  assert.equal(normalizeReflectionBase(99), 4);
  assert.equal(normalizeReflectionBase(""), 2);
  assert.equal(normalizeReflectionBase("unbekannt"), 2);
});

test("Zahlengerade bildet −8 bis 8 linear und symmetrisch ab", () => {
  assert.equal(numberLinePercent(-8), 0);
  assert.equal(numberLinePercent(0), 50);
  assert.equal(numberLinePercent(8), 100);
  for (let value = 1; value <= 8; value += 1) {
    assert.equal(numberLinePercent(value) + numberLinePercent(-value), 100);
  }
});

test("Zahlengeradenwerte werden sicher begrenzt", () => {
  assert.equal(numberLinePercent(-20), 0);
  assert.equal(numberLinePercent(20), 100);
  assert.throws(() => numberLinePercent(Number.NaN), /endlich/);
});
