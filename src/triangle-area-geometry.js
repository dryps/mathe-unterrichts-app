export const AREA_BOARD = Object.freeze({
  width: 1200,
  height: 760,
  baseLeft: Object.freeze({ x: 180, y: 590 }),
  baseRight: Object.freeze({ x: 680, y: 590 }),
});

export const APEX_LIMITS = Object.freeze({
  minX: 290,
  maxX: 570,
  minY: 150,
  maxY: 410,
});

export const INITIAL_APEX = Object.freeze({ x: 390, y: 225 });

const EPSILON = 1e-9;

function assertPoint(point, label = "Punkt") {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    throw new TypeError(`${label} benötigt endliche x- und y-Koordinaten.`);
  }
}

export function clampApex(point, limits = APEX_LIMITS) {
  assertPoint(point, "Die Spitze");
  return {
    x: Math.max(limits.minX, Math.min(limits.maxX, point.x)),
    y: Math.max(limits.minY, Math.min(limits.maxY, point.y)),
  };
}

export function polygonArea(points) {
  if (!Array.isArray(points) || points.length < 3) {
    throw new TypeError("Eine Fläche benötigt mindestens drei Punkte.");
  }
  points.forEach((point) => assertPoint(point));

  const doubledArea = points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length];
    return sum + point.x * next.y - point.y * next.x;
  }, 0);

  return Math.abs(doubledArea) / 2;
}

export function vector(from, to) {
  assertPoint(from);
  assertPoint(to);
  return { x: to.x - from.x, y: to.y - from.y };
}

export function areParallel(first, second, epsilon = EPSILON) {
  return Math.abs(first.x * second.y - first.y * second.x) <= epsilon;
}

export function sideLengths(points) {
  if (!Array.isArray(points) || points.length !== 3) {
    throw new TypeError("Seitenlängen werden für genau drei Punkte bestimmt.");
  }
  return points
    .map((point, index) => {
      const next = points[(index + 1) % points.length];
      return Math.hypot(next.x - point.x, next.y - point.y);
    })
    .sort((left, right) => left - right);
}

export function buildTriangleAreaGeometry(requestedApex = INITIAL_APEX, board = AREA_BOARD) {
  const apex = clampApex(requestedApex);
  const left = { ...board.baseLeft };
  const right = { ...board.baseRight };
  const baseLength = right.x - left.x;

  if (baseLength <= 0 || Math.abs(right.y - left.y) > EPSILON) {
    throw new RangeError("Die Grundseite muss fest, horizontal und von links nach rechts verlaufen.");
  }

  const heightFoot = { x: apex.x, y: left.y };
  const fourth = {
    x: right.x + apex.x - left.x,
    y: apex.y,
  };
  const original = [left, right, apex];
  const copy = [right, fourth, apex];
  const parallelogram = [left, right, fourth, apex];
  const height = left.y - apex.y;
  const triangleArea = polygonArea(original);
  const parallelogramArea = polygonArea(parallelogram);

  return {
    board,
    left,
    right,
    apex,
    fourth,
    heightFoot,
    height,
    baseLength,
    original,
    copy,
    parallelogram,
    rotationCenter: {
      x: (right.x + apex.x) / 2,
      y: (right.y + apex.y) / 2,
    },
    triangleArea,
    parallelogramArea,
    rightAngle: [
      { x: heightFoot.x, y: heightFoot.y - 30 },
      { x: heightFoot.x + 30, y: heightFoot.y - 30 },
      { x: heightFoot.x + 30, y: heightFoot.y },
    ],
  };
}

export function pointsAttribute(points) {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}
