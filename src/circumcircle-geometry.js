export const CIRCUMCIRCLE_BOARD = Object.freeze({
  width: 1200,
  height: 760,
  linePadding: 58,
});

export const INITIAL_VERTICES = Object.freeze({
  A: Object.freeze({ x: 300, y: 460 }),
  B: Object.freeze({ x: 900, y: 460 }),
  C: Object.freeze({ x: 540, y: 100 }),
});

export const INITIAL_TEST_TARGET = Object.freeze({ x: 600, y: 220 });

export const VERTEX_LIMITS = Object.freeze({
  minX: 120,
  maxX: 1080,
  minY: 100,
  maxY: 660,
});

export const PROTECTION_LIMITS = Object.freeze({
  minimumSide: 170,
  minimumDoubledArea: 64000,
  maximumRadius: 480,
  minimumCircleInset: 26,
  centerMinX: 48,
  centerMaxX: 1152,
  centerMinY: 48,
  centerMaxY: 712,
});

const EPSILON = 1e-8;
const SIDE_KEYS = Object.freeze([
  Object.freeze(["A", "B"]),
  Object.freeze(["B", "C"]),
  Object.freeze(["C", "A"]),
]);

function assertPoint(point, label = "Punkt") {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    throw new TypeError(`${label} benötigt endliche x- und y-Koordinaten.`);
  }
}

function copyPoint(point) {
  return { x: point.x, y: point.y };
}

export function copyVertices(vertices) {
  return {
    A: copyPoint(vertices.A),
    B: copyPoint(vertices.B),
    C: copyPoint(vertices.C),
  };
}

export function midpoint(first, second) {
  assertPoint(first);
  assertPoint(second);
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

export function vector(first, second) {
  assertPoint(first);
  assertPoint(second);
  return { x: second.x - first.x, y: second.y - first.y };
}

export function dot(first, second) {
  return first.x * second.x + first.y * second.y;
}

export function cross(first, second) {
  return first.x * second.y - first.y * second.x;
}

export function distance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

export function doubledTriangleArea(vertices) {
  return Math.abs(cross(vector(vertices.A, vertices.B), vector(vertices.A, vertices.C)));
}

function normalize(direction) {
  const length = Math.hypot(direction.x, direction.y);
  if (length <= EPSILON) {
    throw new RangeError("Eine Richtung benötigt eine positive Länge.");
  }
  return { x: direction.x / length, y: direction.y / length };
}

export function perpendicularDirection(first, second) {
  const side = vector(first, second);
  return normalize({ x: -side.y, y: side.x });
}

function lineInterval(point, direction, board = CIRCUMCIRCLE_BOARD) {
  const bounds = {
    minX: board.linePadding,
    maxX: board.width - board.linePadding,
    minY: board.linePadding,
    maxY: board.height - board.linePadding,
  };
  let minimum = Number.NEGATIVE_INFINITY;
  let maximum = Number.POSITIVE_INFINITY;

  for (const [coordinate, lower, upper] of [
    ["x", bounds.minX, bounds.maxX],
    ["y", bounds.minY, bounds.maxY],
  ]) {
    const component = direction[coordinate];
    if (Math.abs(component) <= EPSILON) {
      if (point[coordinate] < lower || point[coordinate] > upper) {
        throw new RangeError("Die Gerade liegt außerhalb der Zeichenfläche.");
      }
      continue;
    }
    const first = (lower - point[coordinate]) / component;
    const second = (upper - point[coordinate]) / component;
    minimum = Math.max(minimum, Math.min(first, second));
    maximum = Math.min(maximum, Math.max(first, second));
  }

  if (minimum > maximum) {
    throw new RangeError("Die Gerade schneidet die Zeichenfläche nicht.");
  }
  return { minimum, maximum };
}

function pointAt(point, direction, amount) {
  return {
    x: point.x + direction.x * amount,
    y: point.y + direction.y * amount,
  };
}

export function clipInfiniteLine(point, direction, board = CIRCUMCIRCLE_BOARD) {
  const interval = lineInterval(point, direction, board);
  return {
    start: pointAt(point, direction, interval.minimum),
    end: pointAt(point, direction, interval.maximum),
    minimum: interval.minimum,
    maximum: interval.maximum,
  };
}

export function projectPointToLine(target, point, direction) {
  assertPoint(target);
  assertPoint(point);
  const unit = normalize(direction);
  const amount = dot(vector(point, target), unit);
  return pointAt(point, unit, amount);
}

function rightAngleMarker(sideStart, sideEnd, middle, perpendicular) {
  const along = normalize(vector(sideStart, sideEnd));
  const size = 24;
  return [
    pointAt(middle, along, size),
    pointAt(pointAt(middle, along, size), perpendicular, size),
    pointAt(middle, perpendicular, size),
  ];
}

export function perpendicularBisector(first, second, board = CIRCUMCIRCLE_BOARD) {
  const middle = midpoint(first, second);
  const direction = perpendicularDirection(first, second);
  const line = clipInfiniteLine(middle, direction, board);
  return {
    middle,
    direction,
    line,
    rightAngle: rightAngleMarker(first, second, middle, direction),
  };
}

export function circumcenter(vertices) {
  const { A, B, C } = vertices;
  const denominator =
    2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  if (Math.abs(denominator) <= EPSILON) {
    throw new RangeError("Für nahezu kollineare Punkte ist kein lesbarer Umkreis definiert.");
  }

  const squareA = A.x * A.x + A.y * A.y;
  const squareB = B.x * B.x + B.y * B.y;
  const squareC = C.x * C.x + C.y * C.y;
  return {
    x:
      (squareA * (B.y - C.y) +
        squareB * (C.y - A.y) +
        squareC * (A.y - B.y)) /
      denominator,
    y:
      (squareA * (C.x - B.x) +
        squareB * (A.x - C.x) +
        squareC * (B.x - A.x)) /
      denominator,
  };
}

function withinVertexBounds(point) {
  return (
    point.x >= VERTEX_LIMITS.minX &&
    point.x <= VERTEX_LIMITS.maxX &&
    point.y >= VERTEX_LIMITS.minY &&
    point.y <= VERTEX_LIMITS.maxY
  );
}

function rawCircumcircle(vertices) {
  const center = circumcenter(vertices);
  const radii = {
    A: distance(center, vertices.A),
    B: distance(center, vertices.B),
    C: distance(center, vertices.C),
  };
  return { center, radii, radius: radii.A };
}

export function validateTriangle(vertices) {
  for (const key of ["A", "B", "C"]) {
    try {
      assertPoint(vertices[key], `Eckpunkt ${key}`);
    } catch {
      return { valid: false, reason: "Bitte bleibe innerhalb der Zeichenfläche." };
    }
    if (!withinVertexBounds(vertices[key])) {
      return { valid: false, reason: "Bitte bleibe innerhalb der Zeichenfläche." };
    }
  }

  const sideLengths = SIDE_KEYS.map(([first, second]) =>
    distance(vertices[first], vertices[second]),
  );
  if (sideLengths.some((length) => length < PROTECTION_LIMITS.minimumSide)) {
    return { valid: false, reason: "Die Eckpunkte brauchen mehr Abstand." };
  }
  if (doubledTriangleArea(vertices) < PROTECTION_LIMITS.minimumDoubledArea) {
    return {
      valid: false,
      reason: "Das Dreieck darf nicht fast auf einer Geraden liegen.",
    };
  }

  let circle;
  try {
    circle = rawCircumcircle(vertices);
  } catch {
    return {
      valid: false,
      reason: "Das Dreieck darf nicht fast auf einer Geraden liegen.",
    };
  }
  const { center, radius } = circle;
  if (
    radius > PROTECTION_LIMITS.maximumRadius ||
    center.x - radius < PROTECTION_LIMITS.minimumCircleInset ||
    center.x + radius >
      CIRCUMCIRCLE_BOARD.width - PROTECTION_LIMITS.minimumCircleInset ||
    center.y - radius < PROTECTION_LIMITS.minimumCircleInset ||
    center.y + radius >
      CIRCUMCIRCLE_BOARD.height - PROTECTION_LIMITS.minimumCircleInset ||
    center.x < PROTECTION_LIMITS.centerMinX ||
    center.x > PROTECTION_LIMITS.centerMaxX ||
    center.y < PROTECTION_LIMITS.centerMinY ||
    center.y > PROTECTION_LIMITS.centerMaxY
  ) {
    return {
      valid: false,
      reason: "So würde der Umkreis zu groß oder unlesbar.",
    };
  }
  return { valid: true, reason: "", circle };
}

function clampTestPoint(target, bisector) {
  const projected = projectPointToLine(target, bisector.middle, bisector.direction);
  const amount = dot(vector(bisector.middle, projected), bisector.direction);
  const inset = 42;
  const clampedAmount = Math.max(
    bisector.line.minimum + inset,
    Math.min(bisector.line.maximum - inset, amount),
  );
  return pointAt(bisector.middle, bisector.direction, clampedAmount);
}

export function buildCircumcircleGeometry(
  vertices = INITIAL_VERTICES,
  testTarget = INITIAL_TEST_TARGET,
  board = CIRCUMCIRCLE_BOARD,
) {
  const safeVertices = copyVertices(vertices);
  const validation = validateTriangle(safeVertices);
  if (!validation.valid) {
    throw new RangeError(validation.reason);
  }

  const bisectors = SIDE_KEYS.map(([first, second]) => ({
    endpoints: [first, second],
    ...perpendicularBisector(safeVertices[first], safeVertices[second], board),
  }));
  const testPoint = clampTestPoint(testTarget, bisectors[0]);
  const center = validation.circle.center;
  const radii = validation.circle.radii;

  return {
    board,
    vertices: safeVertices,
    triangle: [safeVertices.A, safeVertices.B, safeVertices.C],
    bisectors,
    testPoint,
    testDistances: {
      A: distance(testPoint, safeVertices.A),
      B: distance(testPoint, safeVertices.B),
    },
    center,
    radius: validation.circle.radius,
    radii,
    thirdBisectorError: Math.abs(
      cross(vector(bisectors[2].middle, center), bisectors[2].direction),
    ),
  };
}

export function attemptVertexMove(vertices, key, requestedPoint) {
  if (!["A", "B", "C"].includes(key)) {
    throw new RangeError("Unbekannter Eckpunkt.");
  }
  const candidate = copyVertices(vertices);
  candidate[key] = copyPoint(requestedPoint);
  const validation = validateTriangle(candidate);
  if (!validation.valid) {
    return { accepted: false, vertices, reason: validation.reason };
  }
  return { accepted: true, vertices: candidate, reason: "" };
}

export function pointsAttribute(points) {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}

export function nearlyEqual(first, second, tolerance = 1e-7) {
  return Math.abs(first - second) <= tolerance;
}
