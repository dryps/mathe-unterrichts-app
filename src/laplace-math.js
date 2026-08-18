export const EQUAL_SPINNER_ANGLES = Object.freeze([90, 90, 90, 90]);
export const UNEQUAL_SPINNER_ANGLES = Object.freeze([180, 72, 60, 48]);

function validateResult(result) {
  if (!Number.isInteger(result) || result < 1 || result > 4) throw new RangeError("Ergebnis muss zwischen 1 und 4 liegen.");
}

function validateAngles(angles) {
  if (!Array.isArray(angles) || angles.length !== 4) throw new RangeError("Ein Glücksrad braucht genau vier Felder.");
  if (!angles.every((angle) => Number.isFinite(angle) && angle > 0)) throw new RangeError("Feldwinkel müssen positiv und endlich sein.");
  if (Math.abs(angles.reduce((sum, angle) => sum + angle, 0) - 360) > 1e-9) throw new RangeError("Die Feldwinkel müssen zusammen 360 Grad ergeben.");
}

function gcd(a, b) {
  let left = Math.round(Math.abs(a));
  let right = Math.round(Math.abs(b));
  while (right) [left, right] = [right, left % right];
  return left;
}

function polar(angle, radius = 120) {
  const radians = (angle * Math.PI) / 180;
  return Object.freeze({ x: 150 + radius * Math.cos(radians), y: 150 + radius * Math.sin(radians) });
}

export function countingProbability(result) {
  validateResult(result);
  return Object.freeze({ numerator: 1, denominator: 4, fraction: "1/4" });
}

export function spinnerProbability(angles, result) {
  validateAngles(angles);
  validateResult(result);
  const angle = angles[result - 1];
  const divisor = gcd(angle, 360);
  const numerator = angle / divisor;
  const denominator = 360 / divisor;
  return Object.freeze({ angle, numerator, denominator, fraction: `${numerator}/${denominator}` });
}

export function spinnerSegments(angles) {
  validateAngles(angles);
  let start = -90;
  return Object.freeze(angles.map((angle, index) => {
    const end = start + angle;
    const from = polar(start);
    const to = polar(end);
    const label = polar(start + angle / 2, 72);
    const path = `M 150 150 L ${from.x.toFixed(3)} ${from.y.toFixed(3)} A 120 120 0 ${angle > 180 ? 1 : 0} 1 ${to.x.toFixed(3)} ${to.y.toFixed(3)} Z`;
    start = end;
    return Object.freeze({ result: index + 1, angle, path, label });
  }));
}
