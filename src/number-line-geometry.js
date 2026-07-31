export const NUMBER_LINE_LIMITS = Object.freeze({
  min: -3,
  max: 3,
  zeroX: 600,
  step: 150,
  y: 270,
  lineStart: 84,
  lineEnd: 1116,
  tickTop: 236,
  tickBottom: 304,
  labelY: 370,
  boardWidth: 1200,
  boardHeight: 520,
});

export function clampNumberLineValue(value) {
  if (!Number.isFinite(value)) {
    throw new RangeError("Der Wert auf der Zahlengeraden muss endlich sein.");
  }
  return Math.max(NUMBER_LINE_LIMITS.min, Math.min(NUMBER_LINE_LIMITS.max, value));
}

export function snapNumberLineValue(value) {
  return Math.round(clampNumberLineValue(value));
}

export function valueToX(value) {
  const bounded = clampNumberLineValue(value);
  return NUMBER_LINE_LIMITS.zeroX + bounded * NUMBER_LINE_LIMITS.step;
}

export function valueToPoint(value) {
  return { x: valueToX(value), y: NUMBER_LINE_LIMITS.y };
}

export function xToValue(x) {
  if (!Number.isFinite(x)) {
    throw new RangeError("Die Punktposition muss endlich sein.");
  }
  return snapNumberLineValue(
    (x - NUMBER_LINE_LIMITS.zeroX) / NUMBER_LINE_LIMITS.step,
  );
}

export function numberLineTicks(includeNegative = true) {
  const first = includeNegative ? NUMBER_LINE_LIMITS.min : 0;
  return Array.from(
    { length: NUMBER_LINE_LIMITS.max - first + 1 },
    (_, index) => {
      const value = first + index;
      return {
        value,
        x: valueToX(value),
        y: NUMBER_LINE_LIMITS.y,
      };
    },
  );
}

export function formatTickValue(value) {
  const integer = snapNumberLineValue(value);
  return integer < 0 ? `−${Math.abs(integer)}` : String(integer);
}

export function formatCurrentValue(value) {
  const integer = snapNumberLineValue(value);
  if (integer > 0) return `+${integer}`;
  return formatTickValue(integer);
}

export function pointIsOnNumberLine(point, tolerance = 1e-9) {
  return (
    Number.isFinite(point?.x) &&
    Number.isFinite(point?.y) &&
    Math.abs(point.y - NUMBER_LINE_LIMITS.y) <= tolerance &&
    point.x >= valueToX(NUMBER_LINE_LIMITS.min) - tolerance &&
    point.x <= valueToX(NUMBER_LINE_LIMITS.max) + tolerance
  );
}
