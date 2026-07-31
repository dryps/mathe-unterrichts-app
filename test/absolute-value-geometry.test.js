import assert from "node:assert/strict";
import test from "node:test";

import {
  ABSOLUTE_LABELED_VALUES,
  ABSOLUTE_REFERENCE_VALUES,
  ABSOLUTE_VALUE_LIMITS,
  absoluteNumberLineTicks,
  absolutePointIsOnNumberLine,
  absoluteValue,
  absoluteValueToPoint,
  absoluteValueToX,
  absoluteXToValue,
  distanceSegmentToZero,
  distanceToZero,
  formatAbsoluteCurrentValue,
  formatAbsoluteFormula,
  oppositeValuesHaveEqualDistance,
  snapAbsoluteValueNumber,
} from "../src/absolute-value-geometry.js";

test("Betragszahlengerade bildet minus sechs bis plus sechs linear ab", () => {
  assert.equal(ABSOLUTE_VALUE_LIMITS.min, -6);
  assert.equal(ABSOLUTE_VALUE_LIMITS.max, 6);
  assert.equal(ABSOLUTE_VALUE_LIMITS.step, 97.5);
  assert.equal(absoluteValueToX(-6), 115);
  assert.equal(absoluteValueToX(-4), 310);
  assert.equal(absoluteValueToX(0), 700);
  assert.equal(absoluteValueToX(4), 1090);
  assert.equal(absoluteValueToX(6), 1285);
});

test("alle dreizehn ganzzahligen Positionen besitzen denselben Abstand", () => {
  const ticks = absoluteNumberLineTicks();
  assert.equal(ticks.length, 13);
  for (let index = 1; index < ticks.length; index += 1) {
    assert.equal(ticks[index].x - ticks[index - 1].x, 97.5);
    assert.equal(ticks[index].y, 270);
  }
});

test("Betrag ist die nie negative absolute Differenz zur Null", () => {
  for (const [value, expected] of [[-6, 6], [-4, 4], [0, 0], [4, 4], [6, 6]]) {
    assert.equal(absoluteValue(value), expected);
    assert.equal(distanceToZero(value), expected);
    assert.ok(distanceToZero(value) >= 0);
  }
  assert.throws(() => absoluteValue(Number.NaN), RangeError);
});

test("gegenüberliegende Zahlen besitzen exakt denselben Abstand", () => {
  for (let value = -6; value <= 6; value += 1) {
    assert.equal(oppositeValuesHaveEqualDistance(value), true);
    assert.equal(distanceToZero(value), distanceToZero(-value));
  }
});

test("Abstandsstrecke entspricht exakt dem Betrag in Einheitsschritten", () => {
  const negative = distanceSegmentToZero(-4);
  assert.equal(negative.startX, 310);
  assert.equal(negative.endX, 700);
  assert.equal(negative.fromX, 700);
  assert.equal(negative.toX, 310);
  assert.equal(negative.distance, 4);
  assert.deepEqual(negative.unitBoundaries, [700, 602.5, 505, 407.5, 310]);

  const positive = distanceSegmentToZero(4);
  assert.equal(positive.startX, 700);
  assert.equal(positive.endX, 1090);
  assert.deepEqual(positive.unitBoundaries, [700, 797.5, 895, 992.5, 1090]);
});

test("Null besitzt eine exakte Abstandsstrecke der Länge null", () => {
  const zero = distanceSegmentToZero(0);
  assert.equal(zero.startX, zero.endX);
  assert.equal(zero.startX, absoluteValueToX(0));
  assert.equal(zero.distance, 0);
  assert.deepEqual(zero.unitBoundaries, [700]);
});

test("Hin- und Rückabbildung sowie Einrasten sind für alle Werte exakt", () => {
  for (let value = -6; value <= 6; value += 1) {
    assert.equal(absoluteXToValue(absoluteValueToX(value)), value);
    assert.equal(snapAbsoluteValueNumber(value + 0.2), value);
    assert.deepEqual(absoluteValueToPoint(value), { x: absoluteValueToX(value), y: 270 });
  }
  assert.equal(snapAbsoluteValueNumber(-999), -6);
  assert.equal(snapAbsoluteValueNumber(999), 6);
});

test("Punkt bleibt unabhängig von vertikaler Eingabe exakt auf der Geraden", () => {
  for (const value of [-99, -6, -4, 0, 4, 6, 99]) {
    assert.equal(absolutePointIsOnNumberLine(absoluteValueToPoint(value)), true);
  }
  assert.equal(absolutePointIsOnNumberLine({ x: 700, y: 271 }), false);
});

test("Endwerte, Formeln und Schlüsselmarken bleiben geschützt und lesbar", () => {
  assert.ok(absoluteValueToX(-6) - 60 >= 20);
  assert.ok(ABSOLUTE_VALUE_LIMITS.boardWidth - absoluteValueToX(6) - 60 >= 20);
  assert.equal(formatAbsoluteCurrentValue(-4), "−4");
  assert.equal(formatAbsoluteCurrentValue(4), "+4");
  assert.equal(formatAbsoluteFormula(-4), "|−4| = 4");
  assert.equal(formatAbsoluteFormula(0), "|0| = 0");
  assert.deepEqual(ABSOLUTE_REFERENCE_VALUES, [-4, 0, 4]);
  assert.deepEqual(ABSOLUTE_LABELED_VALUES, [-6, -4, 0, 4, 6]);
});
