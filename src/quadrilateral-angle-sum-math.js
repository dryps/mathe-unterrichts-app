const FULL_ANGLE = 360;
const STRAIGHT_ANGLE = 180;

const clone = (points) => points.map(({ x, y }) => ({ x, y }));
const cross = (a, b, c) =>
  (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);

export function createAngleSumQuadrilateral(position = 0) {
  if (!Number.isFinite(position)) throw new RangeError("Die Reglerposition muss endlich sein.");
  if (position < -100 || position > 100) {
    throw new RangeError("Die Reglerposition muss zwischen -100 und 100 liegen.");
  }
  const p = position / 100;
  return Object.freeze([
    Object.freeze({ x: 140, y: 520 }),
    Object.freeze({ x: 850, y: 520 }),
    Object.freeze({ x: 800 + 70 * p, y: 155 + 35 * p }),
    Object.freeze({ x: 220 - 75 * p, y: 115 - 25 * p }),
  ]);
}

export function isStrictlyConvex(points) {
  if (!Array.isArray(points) || points.length !== 4) return false;
  const turns = points.map((point, index) =>
    cross(point, points[(index + 1) % 4], points[(index + 2) % 4]),
  );
  return turns.every((turn) => turn > 1e-8) || turns.every((turn) => turn < -1e-8);
}

function angleAt(vertex, previous, next) {
  const first = { x: previous.x - vertex.x, y: previous.y - vertex.y };
  const second = { x: next.x - vertex.x, y: next.y - vertex.y };
  const denominator = Math.hypot(first.x, first.y) * Math.hypot(second.x, second.y);
  if (!denominator) throw new RangeError("Zusammenfallende Eckpunkte sind nicht erlaubt.");
  const cosine = Math.max(-1, Math.min(1, (first.x * second.x + first.y * second.y) / denominator));
  return (Math.acos(cosine) * STRAIGHT_ANGLE) / Math.PI;
}

function calculateTriangleAngles(points) {
  if (!Array.isArray(points) || points.length !== 3) {
    throw new TypeError("Ein Dreieck benötigt drei Eckpunkte.");
  }
  return points.map((point, index) =>
    angleAt(point, points[(index + 2) % 3], points[(index + 1) % 3]),
  );
}

export function calculateQuadrilateralAngles(points) {
  if (!Array.isArray(points) || points.length !== 4) {
    throw new TypeError("Ein Viereck benötigt genau vier Eckpunkte.");
  }
  if (!isStrictlyConvex(points)) {
    throw new RangeError("Für dieses Modul wird ein streng konvexes Viereck benötigt.");
  }
  return points.map((point, index) =>
    angleAt(point, points[(index + 3) % 4], points[(index + 1) % 4]),
  );
}

export function roundAnglesTo360(angles) {
  if (
    !Array.isArray(angles) ||
    angles.length !== 4 ||
    angles.some((angle) => !Number.isFinite(angle) || angle <= 0 || angle >= 180)
  ) {
    throw new TypeError("Es werden vier positive Innenwinkel unter 180 Grad benötigt.");
  }
  const base = angles.map(Math.floor);
  const missing = FULL_ANGLE - base.reduce((sum, angle) => sum + angle, 0);
  const order = angles
    .map((angle, index) => ({ index, remainder: angle - base[index] }))
    .sort((left, right) => right.remainder - left.remainder || left.index - right.index);
  for (let step = 0; step < missing; step += 1) base[order[step % 4].index] += 1;
  return base;
}

export function splitByDiagonal(points) {
  calculateQuadrilateralAngles(points);
  const firstPoints = [points[0], points[1], points[2]];
  const secondPoints = [points[0], points[2], points[3]];
  return Object.freeze({
    diagonal: Object.freeze([Object.freeze({ ...points[0] }), Object.freeze({ ...points[2] })]),
    first: Object.freeze({ indices: Object.freeze([0, 1, 2]), points: clone(firstPoints), angles: calculateTriangleAngles(firstPoints) }),
    second: Object.freeze({ indices: Object.freeze([0, 2, 3]), points: clone(secondPoints), angles: calculateTriangleAngles(secondPoints) }),
  });
}
