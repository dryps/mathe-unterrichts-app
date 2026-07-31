import assert from "node:assert/strict";
import test from "node:test";

import {
  NUMBER_LINE_LIMITS,
  clampNumberLineValue,
  formatCurrentValue,
  formatTickValue,
  numberLineTicks,
  pointIsOnNumberLine,
  snapNumberLineValue,
  valueToPoint,
  valueToX,
  xToValue,
} from "../src/number-line-geometry.js";

test("Null liegt exakt in der Mitte der sieben ganzzahligen Positionen", () => {
  assert.equal(NUMBER_LINE_LIMITS.zeroX, 600);
  assert.equal(
    valueToX(0),
    (valueToX(NUMBER_LINE_LIMITS.min) + valueToX(NUMBER_LINE_LIMITS.max)) / 2,
  );
});

test("alle Markierungen von minus drei bis plus drei besitzen gleiche Abstände", () => {
  const ticks = numberLineTicks();
  assert.deepEqual(ticks.map(({ value }) => value), [-3, -2, -1, 0, 1, 2, 3]);
  assert.deepEqual(
    ticks.slice(1).map((tick, index) => tick.x - ticks[index].x),
    Array(6).fill(NUMBER_LINE_LIMITS.step),
  );
  assert.ok(ticks.every((tick) => tick.y === NUMBER_LINE_LIMITS.y));
});

test("der anfängliche Ausschnitt enthält ausschließlich null bis drei", () => {
  assert.deepEqual(
    numberLineTicks(false).map(({ value }) => value),
    [0, 1, 2, 3],
  );
});

test("Werte und x-Positionen werden für alle ganzen Zahlen exakt ineinander umgerechnet", () => {
  for (let value = -3; value <= 3; value += 1) {
    assert.equal(xToValue(valueToX(value)), value);
    assert.deepEqual(valueToPoint(value), {
      x: NUMBER_LINE_LIMITS.zeroX + value * NUMBER_LINE_LIMITS.step,
      y: NUMBER_LINE_LIMITS.y,
    });
  }
});

test("freie Pointerpositionen rasten ohne Zwischenwerte auf ganze Zahlen ein", () => {
  assert.equal(xToValue(valueToX(-2) + 70), -2);
  assert.equal(xToValue(valueToX(-2) + 80), -1);
  assert.equal(xToValue(valueToX(1) - 70), 1);
  assert.equal(xToValue(valueToX(1) - 80), 0);
  assert.ok(Number.isInteger(xToValue(742.4)));
});

test("Schutzgrenzen halten jeden Wert im Bereich minus drei bis plus drei", () => {
  assert.equal(clampNumberLineValue(-999), -3);
  assert.equal(clampNumberLineValue(999), 3);
  assert.equal(snapNumberLineValue(-2.6), -3);
  assert.equal(snapNumberLineValue(2.6), 3);
  assert.equal(xToValue(-9999), -3);
  assert.equal(xToValue(9999), 3);
});

test("der Punkt liegt immer exakt auf der horizontalen Zahlengeraden", () => {
  for (let value = -3; value <= 3; value += 1) {
    assert.equal(pointIsOnNumberLine(valueToPoint(value)), true);
  }
  assert.equal(pointIsOnNumberLine({ x: 600, y: 269.9 }), false);
  assert.equal(pointIsOnNumberLine({ x: 149, y: 270 }), false);
  assert.equal(pointIsOnNumberLine({ x: 1051, y: 270 }), false);
});

test("Beschriftungen verwenden ein typografisches Minus und nur die aktuelle positive Zahl ein Plus", () => {
  assert.equal(formatTickValue(-3), "−3");
  assert.equal(formatTickValue(0), "0");
  assert.equal(formatTickValue(3), "3");
  assert.equal(formatCurrentValue(-2), "−2");
  assert.equal(formatCurrentValue(0), "0");
  assert.equal(formatCurrentValue(2), "+2");
});

test("nicht endliche Werte werden statt stiller Rundungsfehler abgelehnt", () => {
  assert.throws(() => clampNumberLineValue(Number.NaN), RangeError);
  assert.throws(() => xToValue(Number.POSITIVE_INFINITY), RangeError);
});
