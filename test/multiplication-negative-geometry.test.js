import assert from "node:assert/strict";
import test from "node:test";

import {
  FIRST_FACTOR_MAX,
  FIRST_FACTOR_MIN,
  FIXED_SECOND_FACTOR,
  factorValueToX,
  formatMultiplication,
  multiplicationFactorTicks,
  multiplicationPattern,
  multiplicationProduct,
  multiplicationProductTicks,
  multiplicationRow,
  productDelta,
  productValueToX,
  snapFirstFactor,
  xToFirstFactor,
} from "../src/multiplication-negative-geometry.js";

const expectedRows = [
  { firstFactor: 4, secondFactor: -2, product: -8 },
  { firstFactor: 3, secondFactor: -2, product: -6 },
  { firstFactor: 2, secondFactor: -2, product: -4 },
  { firstFactor: 1, secondFactor: -2, product: -2 },
  { firstFactor: 0, secondFactor: -2, product: 0 },
  { firstFactor: -1, secondFactor: -2, product: 2 },
  { firstFactor: -2, secondFactor: -2, product: 4 },
  { firstFactor: -3, secondFactor: -2, product: 6 },
  { firstFactor: -4, secondFactor: -2, product: 8 },
];

test("alle neun ersten Faktoren liefern bei festem zweiten Faktor minus zwei exakte Produkte", () => {
  assert.equal(FIXED_SECOND_FACTOR, -2);
  assert.equal(FIRST_FACTOR_MIN, -4);
  assert.equal(FIRST_FACTOR_MAX, 4);
  assert.deepEqual(multiplicationPattern(), expectedRows);
  for (const row of expectedRows) {
    assert.equal(multiplicationProduct(row.firstFactor), row.product);
    assert.deepEqual(multiplicationRow(row.firstFactor), row);
  }
});

test("ein um eins kleinerer erster Faktor erhöht das Produkt immer exakt um zwei", () => {
  for (let factor = 4; factor > -4; factor -= 1) {
    assert.equal(productDelta(factor, factor - 1), 2);
    assert.equal(
      multiplicationProduct(factor - 1) - multiplicationProduct(factor),
      2,
    );
  }
});

test("Faktorregler rastet ausschließlich auf ganze Zahlen von minus vier bis plus vier", () => {
  const ticks = multiplicationFactorTicks();
  assert.deepEqual(ticks.map(({ value }) => value), [-4, -3, -2, -1, 0, 1, 2, 3, 4]);
  assert.equal(snapFirstFactor(-99), -4);
  assert.equal(snapFirstFactor(-2.51), -3);
  assert.equal(snapFirstFactor(-0.2), 0);
  assert.equal(Object.is(snapFirstFactor(-0.2), -0), false);
  assert.equal(snapFirstFactor(3.7), 4);
  assert.equal(snapFirstFactor(99), 4);
  assert.throws(() => snapFirstFactor(Number.NaN), RangeError);
  assert.throws(() => snapFirstFactor(Number.POSITIVE_INFINITY), RangeError);
});

test("Faktor- und Produktskala besitzen gleichmäßige ganzzahlige Positionen", () => {
  const factorTicks = multiplicationFactorTicks();
  const productTicks = multiplicationProductTicks();
  assert.deepEqual(productTicks.map(({ value }) => value), [
    -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8,
  ]);
  const factorStep = factorTicks[1].x - factorTicks[0].x;
  const productStep = productTicks[1].x - productTicks[0].x;
  for (let index = 1; index < factorTicks.length; index += 1) {
    assert.equal(factorTicks[index].x - factorTicks[index - 1].x, factorStep);
  }
  for (let index = 1; index < productTicks.length; index += 1) {
    assert.equal(productTicks[index].x - productTicks[index - 1].x, productStep);
  }
});

test("Hin- und Rückabbildung trifft jeden zulässigen Faktor und sein Produkt exakt", () => {
  for (const row of expectedRows) {
    assert.equal(xToFirstFactor(factorValueToX(row.firstFactor)), row.firstFactor);
    assert.equal(Number.isFinite(productValueToX(row.product)), true);
  }
  assert.equal(xToFirstFactor(-9999), -4);
  assert.equal(xToFirstFactor(9999), 4);
  assert.throws(() => xToFirstFactor(Number.NaN), RangeError);
});

test("vollständige Rechnungen verwenden typografische Minuszeichen und Klammern korrekt", () => {
  assert.equal(formatMultiplication(4), "4 · (−2) = −8");
  assert.equal(formatMultiplication(0), "0 · (−2) = 0");
  assert.equal(formatMultiplication(-1), "(−1) · (−2) = 2");
  assert.equal(formatMultiplication(-4), "(−4) · (−2) = 8");
});
