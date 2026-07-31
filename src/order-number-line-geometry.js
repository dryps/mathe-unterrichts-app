import { createIntegerNumberLineScale } from "./number-line-geometry.js";

const scale = createIntegerNumberLineScale({
  min: -10,
  max: 3,
  lineStart: 115,
  lineEnd: 1285,
  y: 270,
});

export const ORDER_NUMBER_LINE_LIMITS = Object.freeze({
  ...scale.limits,
  boardWidth: 1400,
  boardHeight: 520,
  tickTop: 238,
  tickBottom: 302,
  labelY: 368,
});

export const ORDER_REFERENCE_VALUES = Object.freeze([-8, -3, 0]);
export const ORDER_LABELED_VALUES = Object.freeze([-10, -8, -3, 0, 3]);

export function clampOrderNumberLineValue(value) {
  return scale.clamp(value);
}

export function snapOrderNumberLineValue(value) {
  return scale.snap(value);
}

export function orderValueToX(value) {
  return scale.valueToX(value);
}

export function orderXToValue(x) {
  return scale.xToValue(x);
}

export function orderValueToPoint(value) {
  return scale.valueToPoint(value);
}

export function orderNumberLineTicks() {
  return scale.ticks();
}

export function orderPointIsOnNumberLine(point, tolerance = 1e-9) {
  return scale.pointIsOnLine(point, tolerance);
}

export function formatOrderTickValue(value) {
  const integer = snapOrderNumberLineValue(value);
  return integer < 0 ? `−${Math.abs(integer)}` : String(integer);
}

export function formatOrderCurrentValue(value) {
  const integer = snapOrderNumberLineValue(value);
  if (integer > 0) return `+${integer}`;
  return formatOrderTickValue(integer);
}

export function orderComparisonIsCorrect(left = -8, right = -3) {
  return left < right && orderValueToX(left) < orderValueToX(right);
}
