import { createIntegerNumberLineScale } from "./number-line-geometry.js";

const scale = createIntegerNumberLineScale({
  min: -6,
  max: 6,
  lineStart: 115,
  lineEnd: 1285,
  y: 270,
});

export const ABSOLUTE_VALUE_LIMITS = Object.freeze({
  ...scale.limits,
  boardWidth: 1400,
  boardHeight: 520,
  tickTop: 238,
  tickBottom: 302,
  labelY: 368,
  distanceY: 180,
});

export const ABSOLUTE_REFERENCE_VALUES = Object.freeze([-4, 0, 4]);
export const ABSOLUTE_LABELED_VALUES = Object.freeze([-6, -4, 0, 4, 6]);

export function clampAbsoluteValueNumber(value) {
  return scale.clamp(value);
}

export function snapAbsoluteValueNumber(value) {
  return scale.snap(value);
}

export function absoluteValue(value) {
  if (!Number.isFinite(value)) {
    throw new RangeError("Der Betrag kann nur für endliche Zahlen bestimmt werden.");
  }
  return Math.abs(value) || 0;
}

export function distanceToZero(value) {
  return absoluteValue(value - 0);
}

export function absoluteValueToX(value) {
  return scale.valueToX(value);
}

export function absoluteXToValue(x) {
  return scale.xToValue(x);
}

export function absoluteValueToPoint(value) {
  return scale.valueToPoint(value);
}

export function absoluteNumberLineTicks() {
  return scale.ticks();
}

export function absolutePointIsOnNumberLine(point, tolerance = 1e-9) {
  return scale.pointIsOnLine(point, tolerance);
}

export function distanceSegmentToZero(value) {
  const integer = snapAbsoluteValueNumber(value);
  const zeroX = absoluteValueToX(0);
  const valueX = absoluteValueToX(integer);
  return Object.freeze({
    value: integer,
    distance: distanceToZero(integer),
    startX: Math.min(zeroX, valueX),
    endX: Math.max(zeroX, valueX),
    fromX: zeroX,
    toX: valueX,
    y: ABSOLUTE_VALUE_LIMITS.distanceY,
    unitBoundaries: Object.freeze(
      Array.from({ length: distanceToZero(integer) + 1 }, (_, index) =>
        integer < 0 ? zeroX - index * scale.limits.step : zeroX + index * scale.limits.step,
      ),
    ),
  });
}

export function oppositeValuesHaveEqualDistance(value) {
  return distanceToZero(value) === distanceToZero(-value);
}

export function formatAbsoluteTickValue(value) {
  const integer = snapAbsoluteValueNumber(value);
  return integer < 0 ? `−${Math.abs(integer)}` : String(integer);
}

export function formatAbsoluteCurrentValue(value) {
  const integer = snapAbsoluteValueNumber(value);
  if (integer > 0) return `+${integer}`;
  return formatAbsoluteTickValue(integer);
}

export function formatAbsoluteFormula(value) {
  const integer = snapAbsoluteValueNumber(value);
  return `|${formatAbsoluteTickValue(integer)}| = ${distanceToZero(integer)}`;
}
