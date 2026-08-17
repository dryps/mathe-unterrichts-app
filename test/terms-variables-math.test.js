import assert from "node:assert/strict";
import test from "node:test";

import {
  TERM_COEFFICIENT,
  TERM_CONSTANT,
  TERM_EXPRESSION,
  X_MAX,
  X_MIN,
  normalizeX,
  termSnapshot,
  termValue,
} from "../src/terms-variables-math.js";

const cases = [
  { x: 0, value: 3, substituted: "2 · 0 + 3 = 3", expanded: "0 + 0 + 3 = 3" },
  { x: 1, value: 5, substituted: "2 · 1 + 3 = 5", expanded: "1 + 1 + 3 = 5" },
  { x: 2, value: 7, substituted: "2 · 2 + 3 = 7", expanded: "2 + 2 + 3 = 7" },
  { x: 3, value: 9, substituted: "2 · 3 + 3 = 9", expanded: "3 + 3 + 3 = 9" },
  { x: 4, value: 11, substituted: "2 · 4 + 3 = 11", expanded: "4 + 4 + 3 = 11" },
  { x: 5, value: 13, substituted: "2 · 5 + 3 = 13", expanded: "5 + 5 + 3 = 13" },
];

test("der unveränderte Term liefert für x von null bis fünf die sechs exakten Werte", () => {
  assert.equal(TERM_EXPRESSION, "2x + 3");
  assert.equal(TERM_COEFFICIENT, 2);
  assert.equal(TERM_CONSTANT, 3);
  assert.equal(X_MIN, 0);
  assert.equal(X_MAX, 5);

  for (const expected of cases) {
    assert.equal(termValue(expected.x), expected.value);
    const snapshot = termSnapshot(expected.x);
    assert.equal(snapshot.expression, "2x + 3");
    assert.equal(snapshot.value, expected.value);
    assert.equal(snapshot.substituted, expected.substituted);
    assert.equal(snapshot.expanded, expected.expanded);
  }
});

test("jeder Snapshot bewahrt genau zwei gleiche x-Bausteine und drei Einer", () => {
  for (const expected of cases) {
    const snapshot = termSnapshot(expected.x);
    assert.deepEqual(snapshot.xBlockValues, [expected.x, expected.x]);
    assert.deepEqual(snapshot.unitValues, [1, 1, 1]);
    assert.equal(snapshot.coefficient, 2);
    assert.equal(snapshot.constant, 3);
    assert.equal(Object.isFrozen(snapshot), true);
    assert.equal(Object.isFrozen(snapshot.xBlockValues), true);
    assert.equal(Object.isFrozen(snapshot.unitValues), true);
  }
});

test("freie Eingaben rasten ganzzahlig ein und bleiben im Bereich null bis fünf", () => {
  assert.equal(normalizeX(-99), 0);
  assert.equal(normalizeX(99), 5);
  assert.equal(normalizeX(1.49), 1);
  assert.equal(normalizeX(1.5), 2);
  assert.equal(normalizeX("4"), 4);
});

test("nicht endliche x-Werte werden statt stiller Falschergebnisse abgewiesen", () => {
  for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, "x"]) {
    assert.throws(() => normalizeX(value), RangeError);
    assert.throws(() => termValue(value), RangeError);
  }
});
