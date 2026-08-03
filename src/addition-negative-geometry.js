import { createIntegerNumberLineScale } from "./number-line-geometry.js";

export const ADDITION_START = 3;
export const ADDITION_SUMMAND_MIN = -6;
export const ADDITION_SUMMAND_MAX = -1;

const scale = createIntegerNumberLineScale({ min: -3, max: 4, lineStart: 132, lineEnd: 1268, y: 290 });

export const ADDITION_LIMITS = Object.freeze({ ...scale.limits, boardWidth: 1400, boardHeight: 520, motionY: 186 });

export function clampNegativeSummand(value) {
  if (!Number.isFinite(value)) throw new RangeError("Der Summand muss endlich sein.");
  return Math.max(ADDITION_SUMMAND_MIN, Math.min(ADDITION_SUMMAND_MAX, value));
}

export function snapNegativeSummand(value) {
  const rounded = Math.round(clampNegativeSummand(value));
  return Object.is(rounded, -0) ? ADDITION_SUMMAND_MAX : rounded;
}

export function additionResult(summand) { return ADDITION_START + snapNegativeSummand(summand); }
export function additionDirection(summand) { snapNegativeSummand(summand); return "left"; }
export function additionStepCount(summand) { return Math.abs(snapNegativeSummand(summand)); }
export function additionValueToX(value) { return scale.valueToX(value); }
export function additionValueToPoint(value) { return scale.valueToPoint(value); }
export function additionNumberLineTicks() { return scale.ticks(); }
export function additionPointIsOnLine(point, tolerance = 1e-9) { return scale.pointIsOnLine(point, tolerance); }

export function xToNegativeSummand(x) {
  if (!Number.isFinite(x)) throw new RangeError("Die Pfeilposition muss endlich sein.");
  const endValue = scale.xToValue(x);
  return snapNegativeSummand(endValue - ADDITION_START);
}

export function additionMovement(summand) {
  const snapped = snapNegativeSummand(summand);
  const result = additionResult(snapped);
  const startX = additionValueToX(ADDITION_START);
  const endX = additionValueToX(result);
  const step = scale.limits.step;
  return Object.freeze({
    start: ADDITION_START, summand: snapped, direction: "left", stepCount: Math.abs(snapped), result,
    startX, endX, y: ADDITION_LIMITS.motionY,
    values: Object.freeze(Array.from({ length: Math.abs(snapped) + 1 }, (_, i) => ADDITION_START - i)),
    boundaries: Object.freeze(Array.from({ length: Math.abs(snapped) + 1 }, (_, i) => startX - i * step)),
  });
}

export function formatSigned(value) { return value < 0 ? `−${Math.abs(value)}` : String(value); }
export function formatAddition(summand, includeResult = true) {
  const snapped = snapNegativeSummand(summand);
  return `3 + (${formatSigned(snapped)})${includeResult ? ` = ${formatSigned(additionResult(snapped))}` : ""}`;
}
