import assert from "node:assert/strict";
import test from "node:test";

import { createIntegerNumberLineScale } from "../src/number-line-geometry.js";
import {
  ORDER_LABELED_VALUES,
  ORDER_NUMBER_LINE_LIMITS,
  ORDER_REFERENCE_VALUES,
  clampOrderNumberLineValue,
  formatOrderCurrentValue,
  formatOrderTickValue,
  orderComparisonIsCorrect,
  orderNumberLineTicks,
  orderPointIsOnNumberLine,
  orderValueToPoint,
  orderValueToX,
  orderXToValue,
  snapOrderNumberLineValue,
} from "../src/order-number-line-geometry.js";

test("gemeinsame Ganzzahlskala validiert ihre mathematischen Grenzen", () => {
  assert.throws(
    () =>
      createIntegerNumberLineScale({
        min: 3,
        max: -3,
        lineStart: 0,
        lineEnd: 100,
        y: 0,
      }),
    RangeError,
  );
  assert.throws(
    () =>
      createIntegerNumberLineScale({
        min: -3.5,
        max: 3,
        lineStart: 0,
        lineEnd: 100,
        y: 0,
      }),
    RangeError,
  );
});

test("Ordnungszahlengerade bildet minus zehn bis plus drei linear ab", () => {
  assert.equal(ORDER_NUMBER_LINE_LIMITS.min, -10);
  assert.equal(ORDER_NUMBER_LINE_LIMITS.max, 3);
  assert.equal(ORDER_NUMBER_LINE_LIMITS.step, 90);
  assert.equal(orderValueToX(-10), 115);
  assert.equal(orderValueToX(-8), 295);
  assert.equal(orderValueToX(-3), 745);
  assert.equal(orderValueToX(0), 1015);
  assert.equal(orderValueToX(3), 1285);
});

test("alle vierzehn Ganzzahlen besitzen denselben Abstand", () => {
  const ticks = orderNumberLineTicks();
  assert.equal(ticks.length, 14);
  assert.deepEqual(
    ticks.map(({ value }) => value),
    Array.from({ length: 14 }, (_, index) => index - 10),
  );
  for (let index = 1; index < ticks.length; index += 1) {
    assert.equal(ticks[index].x - ticks[index - 1].x, 90);
    assert.equal(ticks[index].y, ORDER_NUMBER_LINE_LIMITS.y);
  }
});

test("minus acht liegt links von minus drei und minus drei links von null", () => {
  assert.equal(orderComparisonIsCorrect(), true);
  assert.ok(orderValueToX(-8) < orderValueToX(-3));
  assert.ok(orderValueToX(-3) < orderValueToX(0));
  assert.equal(-8 < -3, true);
});

test("Hin- und Rückabbildung ist an jeder ganzen Zahl exakt", () => {
  for (let value = -10; value <= 3; value += 1) {
    assert.equal(orderXToValue(orderValueToX(value)), value);
    assert.deepEqual(orderValueToPoint(value), {
      x: orderValueToX(value),
      y: 270,
    });
  }
});

test("Einrasten erzeugt ausschließlich ganze Werte und schützt beide Grenzen", () => {
  const cases = [
    [-999, -10],
    [-9.51, -10],
    [-9.49, -9],
    [-3.4, -3],
    [-0.49, 0],
    [0.5, 1],
    [2.51, 3],
    [999, 3],
  ];
  for (const [input, expected] of cases) {
    assert.equal(snapOrderNumberLineValue(input), expected);
    assert.equal(Number.isInteger(snapOrderNumberLineValue(input)), true);
  }
  assert.equal(clampOrderNumberLineValue(-11), -10);
  assert.equal(clampOrderNumberLineValue(4), 3);
});

test("beliebige Pointer-x-Positionen rasten ohne Zwischenwerte ein", () => {
  for (let x = -200; x <= 1600; x += 7.25) {
    const value = orderXToValue(x);
    assert.equal(Number.isInteger(value), true);
    assert.ok(value >= -10 && value <= 3);
  }
});

test("Punkt liegt unabhängig vom Eingabewert exakt auf der Zahlengeraden", () => {
  for (const value of [-30, -10, -8, -3, 0, 3, 30]) {
    assert.equal(orderPointIsOnNumberLine(orderValueToPoint(value)), true);
  }
  assert.equal(orderPointIsOnNumberLine({ x: 745, y: 271 }), false);
});

test("Endwerte, Griffziel und Vergleichspositionen besitzen sichtbaren Sicherheitsrand", () => {
  const touchRadius = 60;
  const minimumMargin = 20;
  assert.ok(
    orderValueToX(-10) - touchRadius >= minimumMargin,
    "linkes Touchziel bleibt sichtbar",
  );
  assert.ok(
    ORDER_NUMBER_LINE_LIMITS.boardWidth -
      orderValueToX(3) -
      touchRadius >=
      minimumMargin,
    "rechtes Touchziel bleibt sichtbar",
  );
  assert.ok(orderValueToX(-3) - orderValueToX(-8) >= 400);
});

test("Beschriftungen unterscheiden Minus, Null und positive aktuelle Werte", () => {
  assert.equal(formatOrderTickValue(-8), "−8");
  assert.equal(formatOrderTickValue(0), "0");
  assert.equal(formatOrderTickValue(3), "3");
  assert.equal(formatOrderCurrentValue(-3), "−3");
  assert.equal(formatOrderCurrentValue(0), "0");
  assert.equal(formatOrderCurrentValue(3), "+3");
  assert.deepEqual(ORDER_REFERENCE_VALUES, [-8, -3, 0]);
  assert.deepEqual(ORDER_LABELED_VALUES, [-10, -8, -3, 0, 3]);
});
