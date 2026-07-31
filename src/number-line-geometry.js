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

export function createIntegerNumberLineScale({
  min,
  max,
  lineStart,
  lineEnd,
  y,
}) {
  if (
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    min >= max ||
    !Number.isFinite(lineStart) ||
    !Number.isFinite(lineEnd) ||
    lineStart >= lineEnd ||
    !Number.isFinite(y)
  ) {
    throw new RangeError("Die Ganzzahlskala benötigt gültige Grenzen und Koordinaten.");
  }

  const step = (lineEnd - lineStart) / (max - min);
  const limits = Object.freeze({
    min,
    max,
    lineStart,
    lineEnd,
    y,
    step,
    zeroX: min <= 0 && max >= 0 ? lineStart + (0 - min) * step : null,
  });

  function clamp(value) {
    if (!Number.isFinite(value)) {
      throw new RangeError("Der Wert auf der Zahlengeraden muss endlich sein.");
    }
    return Math.max(min, Math.min(max, value));
  }

  function snap(value) {
    const rounded = Math.round(clamp(value));
    return Object.is(rounded, -0) ? 0 : rounded;
  }

  function valueToX(value) {
    return lineStart + (clamp(value) - min) * step;
  }

  function xToValue(x) {
    if (!Number.isFinite(x)) {
      throw new RangeError("Die Punktposition muss endlich sein.");
    }
    return snap(min + (x - lineStart) / step);
  }

  function valueToPoint(value) {
    return { x: valueToX(value), y };
  }

  function ticks() {
    return Array.from({ length: max - min + 1 }, (_, index) => {
      const value = min + index;
      return { value, x: valueToX(value), y };
    });
  }

  function pointIsOnLine(point, tolerance = 1e-9) {
    return (
      Number.isFinite(point?.x) &&
      Number.isFinite(point?.y) &&
      Math.abs(point.y - y) <= tolerance &&
      point.x >= lineStart - tolerance &&
      point.x <= lineEnd + tolerance
    );
  }

  return Object.freeze({
    limits,
    clamp,
    snap,
    valueToX,
    xToValue,
    valueToPoint,
    ticks,
    pointIsOnLine,
  });
}

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
