import assert from "node:assert/strict";
import test from "node:test";

import { RELATIVE_FREQUENCY_CHECKPOINTS, chartPoint, relativeFrequency } from "../src/relative-frequency-math.js";

test("der reproduzierbare Lauf enthält exakt die vier freigegebenen Wurfzahlen", () => {
  assert.deepEqual(RELATIVE_FREQUENCY_CHECKPOINTS.map(({ throws }) => throws), [10, 100, 1_000, 10_000]);
  assert.deepEqual(RELATIVE_FREQUENCY_CHECKPOINTS.map(({ sixes }) => sixes), [2, 15, 174, 1_630]);
});

test("relative Häufigkeiten wechseln um ein Sechstel statt monoton zu verlaufen", () => {
  const rates = RELATIVE_FREQUENCY_CHECKPOINTS.map(relativeFrequency);
  assert.deepEqual(rates, [0.2, 0.15, 0.174, 0.163]);
  assert.deepEqual(rates.map((rate) => Math.sign(rate - 1 / 6)), [1, -1, 1, -1]);
});

test("Graphpunkte bleiben endlich und bilden größere Häufigkeiten weiter oben ab", () => {
  const points = RELATIVE_FREQUENCY_CHECKPOINTS.map((checkpoint, index) => chartPoint(index, relativeFrequency(checkpoint)));
  assert.deepEqual(points.map(({ x }) => x), [80, 250, 420, 590]);
  assert.equal(points.every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y) && x >= 40 && x <= 630 && y >= 30 && y <= 320), true);
  assert.ok(points[0].y < points[1].y);
});

test("ungültige Trefferzahlen und Graphindizes werden abgewiesen", () => {
  assert.throws(() => relativeFrequency({ throws: 10, sixes: 11 }), /Sechsen/);
  assert.throws(() => relativeFrequency({ throws: 0, sixes: 0 }), /Würfe/);
  assert.throws(() => chartPoint(4, 0.2), /Index/);
  assert.throws(() => chartPoint(0, Number.NaN), /Häufigkeit/);
});
