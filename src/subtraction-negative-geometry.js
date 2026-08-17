import { createIntegerNumberLineScale } from "./number-line-geometry.js";

export const SUBTRACTION_START = 4;
export const SUBTRAHEND_MIN = -4;
export const SUBTRAHEND_MAX = -1;

const scale = createIntegerNumberLineScale({
  min: 0,
  max: 8,
  lineStart: 132,
  lineEnd: 1268,
  y: 310,
});

export const SUBTRACTION_LIMITS = Object.freeze({
  ...scale.limits,
  boardWidth: 1400,
  boardHeight: 560,
  originalY: 172,
  effectiveY: 230,
});

export function clampNegativeSubtrahend(value) {
  if (!Number.isFinite(value)) {
    throw new RangeError("Der Subtrahend muss endlich sein.");
  }
  return Math.max(SUBTRAHEND_MIN, Math.min(SUBTRAHEND_MAX, value));
}

export function snapNegativeSubtrahend(value) {
  const rounded = Math.round(clampNegativeSubtrahend(value));
  return Object.is(rounded, -0) ? SUBTRAHEND_MAX : rounded;
}

export function negativeTermDirection(subtrahend) {
  snapNegativeSubtrahend(subtrahend);
  return "left";
}

export function subtractionEffectiveDirection(subtrahend) {
  snapNegativeSubtrahend(subtrahend);
  return "right";
}

export function subtractionStepCount(subtrahend) {
  return Math.abs(snapNegativeSubtrahend(subtrahend));
}

export function subtractionResult(subtrahend) {
  return SUBTRACTION_START - snapNegativeSubtrahend(subtrahend);
}

export function subtractionValueToX(value) {
  return scale.valueToX(value);
}

export function subtractionValueToPoint(value) {
  return scale.valueToPoint(value);
}

export function subtractionNumberLineTicks() {
  return scale.ticks();
}

export function subtractionPointIsOnLine(point, tolerance = 1e-9) {
  return scale.pointIsOnLine(point, tolerance);
}

export function xToNegativeSubtrahend(x) {
  if (!Number.isFinite(x)) {
    throw new RangeError("Die Pfeilposition muss endlich sein.");
  }
  return snapNegativeSubtrahend(scale.xToValue(x) - SUBTRACTION_START);
}

export function subtractionMovement(subtrahend) {
  const snapped = snapNegativeSubtrahend(subtrahend);
  const magnitude = Math.abs(snapped);
  const result = subtractionResult(snapped);
  const startX = subtractionValueToX(SUBTRACTION_START);
  const originalEndX = subtractionValueToX(SUBTRACTION_START + snapped);
  const effectiveEndX = subtractionValueToX(result);
  const step = scale.limits.step;

  return Object.freeze({
    start: SUBTRACTION_START,
    subtrahend: snapped,
    magnitude,
    result,
    originalDirection: "left",
    effectiveDirection: "right",
    originalStepCount: magnitude,
    effectiveStepCount: magnitude,
    startX,
    originalEndX,
    effectiveEndX,
    originalY: SUBTRACTION_LIMITS.originalY,
    effectiveY: SUBTRACTION_LIMITS.effectiveY,
    vectorLength: magnitude * step,
    originalValues: Object.freeze(
      Array.from({ length: magnitude + 1 }, (_, index) => SUBTRACTION_START - index),
    ),
    effectiveValues: Object.freeze(
      Array.from({ length: magnitude + 1 }, (_, index) => SUBTRACTION_START + index),
    ),
    originalBoundaries: Object.freeze(
      Array.from({ length: magnitude + 1 }, (_, index) => startX - index * step),
    ),
    effectiveBoundaries: Object.freeze(
      Array.from({ length: magnitude + 1 }, (_, index) => startX + index * step),
    ),
  });
}

export function formatSigned(value) {
  return value < 0 ? `−${Math.abs(value)}` : String(value);
}

export function formatSubtraction(subtrahend) {
  const snapped = snapNegativeSubtrahend(subtrahend);
  const magnitude = Math.abs(snapped);
  const result = subtractionResult(snapped);
  return Object.freeze({
    subtraction: `4 − (${formatSigned(snapped)}) = ${result}`,
    addition: `4 + ${magnitude} = ${result}`,
    equivalence: `4 − (${formatSigned(snapped)}) = 4 + ${magnitude}`,
  });
}
