import { createIntegerNumberLineScale } from "./number-line-geometry.js";

export const FIXED_SECOND_FACTOR = -2;
export const FIRST_FACTOR_MIN = -4;
export const FIRST_FACTOR_MAX = 4;

const factorScale = createIntegerNumberLineScale({
  min: FIRST_FACTOR_MIN,
  max: FIRST_FACTOR_MAX,
  lineStart: 176,
  lineEnd: 1224,
  y: 472,
});

const productScale = createIntegerNumberLineScale({
  min: FIRST_FACTOR_MIN * Math.abs(FIXED_SECOND_FACTOR),
  max: FIRST_FACTOR_MAX * Math.abs(FIXED_SECOND_FACTOR),
  lineStart: 176,
  lineEnd: 1224,
  y: 306,
});

export const MULTIPLICATION_LIMITS = Object.freeze({
  boardWidth: 1400,
  boardHeight: 640,
  factor: factorScale.limits,
  product: productScale.limits,
});

export function snapFirstFactor(value) {
  return factorScale.snap(value);
}

export function multiplicationProduct(firstFactor) {
  const product = snapFirstFactor(firstFactor) * FIXED_SECOND_FACTOR;
  return Object.is(product, -0) ? 0 : product;
}

export function multiplicationRow(firstFactor) {
  const snapped = snapFirstFactor(firstFactor);
  return Object.freeze({
    firstFactor: snapped,
    secondFactor: FIXED_SECOND_FACTOR,
    product: multiplicationProduct(snapped),
  });
}

export function multiplicationPattern() {
  return Object.freeze(
    Array.from(
      { length: FIRST_FACTOR_MAX - FIRST_FACTOR_MIN + 1 },
      (_, index) => multiplicationRow(FIRST_FACTOR_MAX - index),
    ),
  );
}

export function productDelta(fromFactor, toFactor) {
  return multiplicationProduct(toFactor) - multiplicationProduct(fromFactor);
}

export function factorValueToX(value) {
  return factorScale.valueToX(value);
}

export function xToFirstFactor(x) {
  return factorScale.xToValue(x);
}

export function productValueToX(value) {
  return productScale.valueToX(value);
}

export function multiplicationFactorTicks() {
  return factorScale.ticks();
}

export function multiplicationProductTicks() {
  return productScale.ticks();
}

export function formatSigned(value) {
  const integer = Object.is(value, -0) ? 0 : value;
  return integer < 0 ? `−${Math.abs(integer)}` : String(integer);
}

export function formatFactor(value) {
  const snapped = snapFirstFactor(value);
  return snapped < 0 ? `(${formatSigned(snapped)})` : formatSigned(snapped);
}

export function formatMultiplication(firstFactor) {
  const snapped = snapFirstFactor(firstFactor);
  return `${formatFactor(snapped)} · (−2) = ${formatSigned(multiplicationProduct(snapped))}`;
}
