export const INCIRCLE_BOARD = Object.freeze({
  width: 1200,
  height: 760,
});

export const INITIAL_VERTICES = Object.freeze({
  A: Object.freeze({ x: 250, y: 560 }),
  B: Object.freeze({ x: 950, y: 560 }),
  C: Object.freeze({ x: 600, y: 140 }),
});

export const INITIAL_TEST_TARGET = Object.freeze({ x: 480, y: 450 });

export const VERTEX_LIMITS = Object.freeze({
  minX: 105,
  maxX: 1095,
  minY: 90,
  maxY: 670,
});

export const PROTECTION_LIMITS = Object.freeze({
  minimumSide: 190,
  minimumDoubledArea: 90000,
  minimumAngle: (24 * Math.PI) / 180,
  minimumRadius: 58,
  minimumCircleInset: 34,
  minimumTouchpointClearance: 52,
  testMinimumFraction: 0.26,
  testMaximumFraction: 0.74,
});

const EPSILON = 1e-9;
const VERTEX_KEYS = Object.freeze(["A", "B", "C"]);
const SIDE_DEFINITIONS = Object.freeze([
  Object.freeze({ key: "AB", first: "A", second: "B", opposite: "C" }),
  Object.freeze({ key: "BC", first: "B", second: "C", opposite: "A" }),
  Object.freeze({ key: "CA", first: "C", second: "A", opposite: "B" }),
]);
const BISECTOR_DEFINITIONS = Object.freeze([
  Object.freeze({ vertex: "A", first: "B", second: "C", opposite: ["B", "C"] }),
  Object.freeze({ vertex: "B", first: "C", second: "A", opposite: ["C", "A"] }),
  Object.freeze({ vertex: "C", first: "A", second: "B", opposite: ["A", "B"] }),
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

export function midpoint(first, second) {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

export function normalize(direction) {
  const length = Math.hypot(direction.x, direction.y);
  if (length <= EPSILON) {
    throw new RangeError("Eine Richtung benötigt eine positive Länge.");
  }
  return { x: direction.x / length, y: direction.y / length };
}

function pointAt(point, direction, amount) {
  return {
    x: point.x + direction.x * amount,
    y: point.y + direction.y * amount,
  };
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function doubledTriangleArea(vertices) {
  return Math.abs(cross(vector(vertices.A, vertices.B), vector(vertices.A, vertices.C)));
}

export function angleBetween(first, second) {
  const firstUnit = normalize(first);
  const secondUnit = normalize(second);
  return Math.acos(clamp(dot(firstUnit, secondUnit), -1, 1));
}

export function triangleAngles(vertices) {
  return {
    A: angleBetween(vector(vertices.A, vertices.B), vector(vertices.A, vertices.C)),
    B: angleBetween(vector(vertices.B, vertices.C), vector(vertices.B, vertices.A)),
    C: angleBetween(vector(vertices.C, vertices.A), vector(vertices.C, vertices.B)),
  };
}

export function projectPointToLine(point, first, second) {
  assertPoint(point);
  assertPoint(first);
  assertPoint(second);
  const side = vector(first, second);
  const squaredLength = dot(side, side);
  if (squaredLength <= EPSILON) {
    throw new RangeError("Eine Projektion benötigt eine echte Gerade.");
  }
  const fraction = dot(vector(first, point), side) / squaredLength;
  return {
    point: pointAt(first, side, fraction),
    fraction,
  };
}

function lineIntersection(firstPoint, firstDirection, secondPoint, secondDirection) {
  const denominator = cross(firstDirection, secondDirection);
  if (Math.abs(denominator) <= EPSILON) {
    throw new RangeError("Die Geraden besitzen keinen eindeutigen Schnittpunkt.");
  }
  const connection = vector(firstPoint, secondPoint);
  const firstAmount = cross(connection, secondDirection) / denominator;
  const secondAmount = cross(connection, firstDirection) / denominator;
  return {
    point: pointAt(firstPoint, firstDirection, firstAmount),
    firstAmount,
    secondAmount,
  };
}

export function internalAngleBisector(vertex, firstArm, secondArm) {
  const firstDirection = normalize(vector(vertex, firstArm));
  const secondDirection = normalize(vector(vertex, secondArm));
  return normalize({
    x: firstDirection.x + secondDirection.x,
    y: firstDirection.y + secondDirection.y,
  });
}

function bisectorFor(vertices, definition) {
  const vertex = vertices[definition.vertex];
  const direction = internalAngleBisector(
    vertex,
    vertices[definition.first],
    vertices[definition.second],
  );
  const oppositeFirst = vertices[definition.opposite[0]];
  const oppositeSecond = vertices[definition.opposite[1]];
  const intersection = lineIntersection(
    vertex,
    direction,
    oppositeFirst,
    vector(oppositeFirst, oppositeSecond),
  );
  return {
    vertex: definition.vertex,
    direction,
    start: copyPoint(vertex),
    end: intersection.point,
    oppositeFraction: intersection.secondAmount,
  };
}

export function incenter(vertices) {
  const a = distance(vertices.B, vertices.C);
  const b = distance(vertices.C, vertices.A);
  const c = distance(vertices.A, vertices.B);
  const perimeter = a + b + c;
  if (perimeter <= EPSILON) {
    throw new RangeError("Für dieses Dreieck ist kein Inkreismittelpunkt definiert.");
  }
  return {
    x: (a * vertices.A.x + b * vertices.B.x + c * vertices.C.x) / perimeter,
    y: (a * vertices.A.y + b * vertices.B.y + c * vertices.C.y) / perimeter,
  };
}

function rightAngleMarker(foot, point, sideFirst, sideSecond, size = 22) {
  const towardPoint = normalize(vector(foot, point));
  const alongTarget =
    distance(foot, sideFirst) > distance(foot, sideSecond) ? sideFirst : sideSecond;
  const alongSide = normalize(vector(foot, alongTarget));
  const alongPoint = pointAt(foot, alongSide, size);
  return [
    alongPoint,
    pointAt(alongPoint, towardPoint, size),
    pointAt(foot, towardPoint, size),
  ];
}

function lengthMark(first, second, size = 22) {
  const middle = midpoint(first, second);
  const perpendicular = normalize({
    x: -(second.y - first.y),
    y: second.x - first.x,
  });
  return {
    start: pointAt(middle, perpendicular, -size / 2),
    end: pointAt(middle, perpendicular, size / 2),
  };
}

function projectionGeometry(point, sideFirst, sideSecond) {
  const projection = projectPointToLine(point, sideFirst, sideSecond);
  return {
    foot: projection.point,
    fraction: projection.fraction,
    length: distance(point, projection.point),
    rightAngle: rightAngleMarker(
      projection.point,
      point,
      sideFirst,
      sideSecond,
    ),
    lengthMark: lengthMark(point, projection.point),
  };
}

function arcPoints(center, firstDirection, secondDirection, radius) {
  const firstAngle = Math.atan2(firstDirection.y, firstDirection.x);
  let delta = Math.atan2(
    cross(firstDirection, secondDirection),
    dot(firstDirection, secondDirection),
  );
  if (delta <= -Math.PI) delta += 2 * Math.PI;
  if (delta > Math.PI) delta -= 2 * Math.PI;
  return Array.from({ length: 13 }, (_, index) => {
    const angle = firstAngle + (delta * index) / 12;
    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    };
  });
}

function angleMark(vertex, firstDirection, secondDirection, radius) {
  const middleDirection = normalize({
    x: firstDirection.x + secondDirection.x,
    y: firstDirection.y + secondDirection.y,
  });
  return {
    arc: arcPoints(vertex, firstDirection, secondDirection, radius),
    dot: pointAt(vertex, middleDirection, radius),
  };
}

function firstAngleMarks(vertices, firstBisector) {
  const fromAtoB = normalize(vector(vertices.A, vertices.B));
  const fromAtoC = normalize(vector(vertices.A, vertices.C));
  return [
    angleMark(vertices.A, fromAtoB, firstBisector.direction, 74),
    angleMark(vertices.A, firstBisector.direction, fromAtoC, 74),
  ];
}

function clampTestPoint(target, firstBisector) {
  const projected = projectPointToLine(
    target,
    firstBisector.start,
    firstBisector.end,
  );
  const fraction = clamp(
    projected.fraction,
    PROTECTION_LIMITS.testMinimumFraction,
    PROTECTION_LIMITS.testMaximumFraction,
  );
  return {
    point: {
      x:
        firstBisector.start.x +
        (firstBisector.end.x - firstBisector.start.x) * fraction,
      y:
        firstBisector.start.y +
        (firstBisector.end.y - firstBisector.start.y) * fraction,
    },
    fraction,
  };
}

function rawIncircle(vertices) {
  const center = incenter(vertices);
  const touches = Object.fromEntries(
    SIDE_DEFINITIONS.map((side) => [
      side.key,
      projectionGeometry(center, vertices[side.first], vertices[side.second]),
    ]),
  );
  const radius = touches.AB.length;
  return { center, touches, radius };
}

function withinVertexBounds(point) {
  return (
    point.x >= VERTEX_LIMITS.minX &&
    point.x <= VERTEX_LIMITS.maxX &&
    point.y >= VERTEX_LIMITS.minY &&
    point.y <= VERTEX_LIMITS.maxY
  );
}

export function pointInsideTriangle(point, vertices, tolerance = 1e-7) {
  const signs = [
    cross(vector(vertices.A, vertices.B), vector(vertices.A, point)),
    cross(vector(vertices.B, vertices.C), vector(vertices.B, point)),
    cross(vector(vertices.C, vertices.A), vector(vertices.C, point)),
  ];
  return (
    signs.every((value) => value >= -tolerance) ||
    signs.every((value) => value <= tolerance)
  );
}

export function validateTriangle(vertices) {
  for (const key of VERTEX_KEYS) {
    try {
      assertPoint(vertices[key], `Eckpunkt ${key}`);
    } catch {
      return { valid: false, reason: "Bitte bleibe innerhalb der Zeichenfläche." };
    }
    if (!withinVertexBounds(vertices[key])) {
      return { valid: false, reason: "Bitte bleibe innerhalb der Zeichenfläche." };
    }
  }

  const sideLengths = SIDE_DEFINITIONS.map((side) =>
    distance(vertices[side.first], vertices[side.second]),
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

  let angles;
  try {
    angles = triangleAngles(vertices);
  } catch {
    return {
      valid: false,
      reason: "Das Dreieck darf nicht fast auf einer Geraden liegen.",
    };
  }
  if (Object.values(angles).some((angle) => angle < PROTECTION_LIMITS.minimumAngle)) {
    return {
      valid: false,
      reason: "Das Dreieck wäre zu schmal für eine klare Darstellung.",
    };
  }

  let circle;
  try {
    circle = rawIncircle(vertices);
  } catch {
    return {
      valid: false,
      reason: "Das Dreieck darf nicht fast auf einer Geraden liegen.",
    };
  }
  if (!pointInsideTriangle(circle.center, vertices)) {
    return { valid: false, reason: "Der Mittelpunkt wäre nicht mehr lesbar." };
  }
  if (circle.radius < PROTECTION_LIMITS.minimumRadius) {
    return {
      valid: false,
      reason: "Der Inkreis wäre für die Darstellung zu klein.",
    };
  }
  if (
    circle.center.x - circle.radius < PROTECTION_LIMITS.minimumCircleInset ||
    circle.center.x + circle.radius >
      INCIRCLE_BOARD.width - PROTECTION_LIMITS.minimumCircleInset ||
    circle.center.y - circle.radius < PROTECTION_LIMITS.minimumCircleInset ||
    circle.center.y + circle.radius >
      INCIRCLE_BOARD.height - PROTECTION_LIMITS.minimumCircleInset
  ) {
    return {
      valid: false,
      reason: "So wäre der Inkreis nicht vollständig sichtbar.",
    };
  }
  for (const side of SIDE_DEFINITIONS) {
    const touch = circle.touches[side.key];
    if (touch.fraction < -EPSILON || touch.fraction > 1 + EPSILON) {
      return {
        valid: false,
        reason: "Die Berührpunkte müssen auf den Dreiecksseiten bleiben.",
      };
    }
    if (
      distance(touch.foot, vertices[side.first]) <
        PROTECTION_LIMITS.minimumTouchpointClearance ||
      distance(touch.foot, vertices[side.second]) <
        PROTECTION_LIMITS.minimumTouchpointClearance
    ) {
      return {
        valid: false,
        reason: "Die Lotstrecken brauchen mehr sichtbaren Abstand zu den Ecken.",
      };
    }
  }

  return { valid: true, reason: "", angles, circle };
}

export function buildIncircleGeometry(
  vertices = INITIAL_VERTICES,
  testTarget = INITIAL_TEST_TARGET,
) {
  const safeVertices = copyVertices(vertices);
  const validation = validateTriangle(safeVertices);
  if (!validation.valid) {
    throw new RangeError(validation.reason);
  }

  const bisectors = BISECTOR_DEFINITIONS.map((definition) =>
    bisectorFor(safeVertices, definition),
  );
  const test = clampTestPoint(testTarget, bisectors[0]);
  const testProjections = {
    AB: projectionGeometry(test.point, safeVertices.A, safeVertices.B),
    AC: projectionGeometry(test.point, safeVertices.A, safeVertices.C),
  };
  const center = validation.circle.center;
  const centerDistances = Object.fromEntries(
    Object.entries(validation.circle.touches).map(([key, value]) => [
      key,
      value.length,
    ]),
  );

  return {
    board: INCIRCLE_BOARD,
    vertices: safeVertices,
    triangle: [safeVertices.A, safeVertices.B, safeVertices.C],
    angles: validation.angles,
    angleMarks: firstAngleMarks(safeVertices, bisectors[0]),
    bisectors,
    testPoint: test.point,
    testFraction: test.fraction,
    testProjections,
    testDistances: {
      AB: testProjections.AB.length,
      AC: testProjections.AC.length,
    },
    center,
    radius: validation.circle.radius,
    touches: validation.circle.touches,
    centerDistances,
    bisectorErrors: bisectors.map((bisector) =>
      Math.abs(cross(vector(bisector.start, center), bisector.direction)),
    ),
  };
}

export function attemptVertexMove(vertices, key, requestedPoint) {
  if (!VERTEX_KEYS.includes(key)) {
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
