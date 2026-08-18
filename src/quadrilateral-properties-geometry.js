const DEFAULT_CONFIG = Object.freeze({ rotation: 0, shiftX: 0, slant: 0 });

const finiteRounded = (value, fallback) => Number.isFinite(Number(value)) ? Math.round(Number(value)) : fallback;
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

export function normalizeParallelogramConfig(config = {}) {
  return Object.freeze({
    rotation: clamp(finiteRounded(config.rotation, DEFAULT_CONFIG.rotation), -35, 35),
    shiftX: clamp(finiteRounded(config.shiftX, DEFAULT_CONFIG.shiftX), -90, 90),
    slant: clamp(finiteRounded(config.slant, DEFAULT_CONFIG.slant), -70, 70),
  });
}

const subtract = (to, from) => Object.freeze({ x: to.x - from.x, y: to.y - from.y });
const length = (vector) => Math.hypot(vector.x, vector.y);

export function createParallelogram(config = {}) {
  const normalized = normalizeParallelogramConfig(config);
  const width = 280;
  const height = 150;
  const sideX = 70 + normalized.slant;
  const local = [
    { x: -width / 2 - sideX / 2, y: height / 2 },
    { x: width / 2 - sideX / 2, y: height / 2 },
    { x: width / 2 + sideX / 2, y: -height / 2 },
    { x: -width / 2 + sideX / 2, y: -height / 2 },
  ];
  const radians = normalized.rotation * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const centroid = Object.freeze({ x: 400 + normalized.shiftX, y: 240 });
  const points = Object.freeze(local.map((point) => Object.freeze({
    x: centroid.x + point.x * cosine - point.y * sine,
    y: centroid.y + point.x * sine + point.y * cosine,
  })));
  const sideVectors = Object.freeze([
    subtract(points[1], points[0]),
    subtract(points[2], points[1]),
    subtract(points[3], points[2]),
    subtract(points[0], points[3]),
  ]);
  const sideLengths = Object.freeze(sideVectors.map(length));
  const cross = (a, b) => a.x * b.y - a.y * b.x;
  return Object.freeze({
    config: normalized,
    points,
    sideVectors,
    sideLengths,
    centroid,
    invariants: Object.freeze({
      oppositeSidesParallel: Math.abs(cross(sideVectors[0], sideVectors[2])) < 1e-9 && Math.abs(cross(sideVectors[1], sideVectors[3])) < 1e-9,
      oppositeSidesEqual: Math.abs(sideLengths[0] - sideLengths[2]) < 1e-9 && Math.abs(sideLengths[1] - sideLengths[3]) < 1e-9,
    }),
  });
}
