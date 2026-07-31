export const UNIQUE_BOARD = Object.freeze({
  width: 1200,
  height: 760,
});

export const SSS_CONSTRUCTION = Object.freeze({
  A: Object.freeze({ x: 300, y: 380 }),
  B: Object.freeze({ x: 900, y: 380 }),
  radiusA: 400,
  radiusB: 400,
});

export const AMBIGUOUS_CONSTRUCTION = Object.freeze({
  A: Object.freeze({ x: 260, y: 390 }),
  B: Object.freeze({ x: 820, y: 390 }),
  angle: (-28 * Math.PI) / 180,
  radiusFromB: 320,
});

export const UNIQUE_PROTECTION_LIMITS = Object.freeze({
  boardInset: 40,
  minimumCircleIntersectionSeparation: 260,
  minimumSssAltitude: 180,
  minimumAnimationInset: 48,
  minimumRayIntersectionSeparation: 240,
  minimumTriangleDoubledArea: 70000,
  minimumShapeDifference: 220,
});

const EPSILON = 1e-9;

function assertPoint(point, label = "Punkt") {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    throw new TypeError(`${label} benötigt endliche x- und y-Koordinaten.`);
  }
}

function assertPositive(value, label) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} muss positiv sein.`);
  }
}

export function copyPoint(point) {
  assertPoint(point);
  return { x: point.x, y: point.y };
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
  assertPoint(first);
  assertPoint(second);
  return Math.hypot(second.x - first.x, second.y - first.y);
}

export function midpoint(first, second) {
  assertPoint(first);
  assertPoint(second);
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

export function pointAt(origin, direction, amount) {
  assertPoint(origin);
  return {
    x: origin.x + direction.x * amount,
    y: origin.y + direction.y * amount,
  };
}

export function circleCircleIntersections(firstCenter, firstRadius, secondCenter, secondRadius) {
  assertPoint(firstCenter, "Erster Mittelpunkt");
  assertPoint(secondCenter, "Zweiter Mittelpunkt");
  assertPositive(firstRadius, "Erster Radius");
  assertPositive(secondRadius, "Zweiter Radius");

  const connection = vector(firstCenter, secondCenter);
  const centerDistance = Math.hypot(connection.x, connection.y);
  if (
    centerDistance <= EPSILON ||
    centerDistance >= firstRadius + secondRadius - EPSILON ||
    centerDistance <= Math.abs(firstRadius - secondRadius) + EPSILON
  ) {
    throw new RangeError("Die Kreise benötigen zwei echte, getrennte Schnittpunkte.");
  }

  const along =
    (firstRadius ** 2 - secondRadius ** 2 + centerDistance ** 2) /
    (2 * centerDistance);
  const heightSquared = firstRadius ** 2 - along ** 2;
  if (heightSquared <= EPSILON) {
    throw new RangeError("Eine Tangentiallage ist für diese Darstellung nicht zulässig.");
  }

  const unit = {
    x: connection.x / centerDistance,
    y: connection.y / centerDistance,
  };
  const perpendicular = { x: -unit.y, y: unit.x };
  const base = pointAt(firstCenter, unit, along);
  const height = Math.sqrt(heightSquared);
  return [
    pointAt(base, perpendicular, height),
    pointAt(base, perpendicular, -height),
  ].sort((first, second) => first.y - second.y);
}

export function rayCircleIntersections(origin, direction, center, radius) {
  assertPoint(origin, "Strahlursprung");
  assertPoint(center, "Kreismittelpunkt");
  assertPositive(radius, "Radius");
  const unit = normalize(direction);
  const offset = vector(center, origin);
  const linear = 2 * dot(offset, unit);
  const constant = dot(offset, offset) - radius ** 2;
  const discriminant = linear ** 2 - 4 * constant;
  if (discriminant <= EPSILON) {
    throw new RangeError("Strahl und Kreis benötigen zwei echte Schnittpunkte.");
  }

  const root = Math.sqrt(discriminant);
  const amounts = [(-linear - root) / 2, (-linear + root) / 2]
    .filter((amount) => amount > EPSILON)
    .sort((first, second) => first - second);
  if (amounts.length !== 2) {
    throw new RangeError("Beide Schnittpunkte müssen auf dem sichtbaren Strahl liegen.");
  }
  return amounts.map((amount) => ({
    point: pointAt(origin, unit, amount),
    amount,
  }));
}

export function reflectPointAcrossLine(point, lineFirst, lineSecond) {
  assertPoint(point);
  assertPoint(lineFirst);
  assertPoint(lineSecond);
  const direction = vector(lineFirst, lineSecond);
  const squaredLength = dot(direction, direction);
  if (squaredLength <= EPSILON) {
    throw new RangeError("Eine Spiegelachse benötigt zwei verschiedene Punkte.");
  }
  const fraction = dot(vector(lineFirst, point), direction) / squaredLength;
  const projection = pointAt(lineFirst, direction, fraction);
  return {
    x: 2 * projection.x - point.x,
    y: 2 * projection.y - point.y,
  };
}

export function doubledTriangleArea(triangle) {
  const [A, B, C] = triangle;
  return Math.abs(cross(vector(A, B), vector(A, C)));
}

export function triangleSideLengths(triangle) {
  const [A, B, C] = triangle;
  return [distance(A, B), distance(B, C), distance(C, A)];
}

export function trianglesCongruent(first, second, tolerance = 1e-7) {
  const firstLengths = triangleSideLengths(first).sort((a, b) => a - b);
  const secondLengths = triangleSideLengths(second).sort((a, b) => a - b);
  return firstLengths.every(
    (length, index) => Math.abs(length - secondLengths[index]) <= tolerance,
  );
}

export function pointWithinBoard(point, inset = 0) {
  return (
    point.x >= inset &&
    point.x <= UNIQUE_BOARD.width - inset &&
    point.y >= inset &&
    point.y <= UNIQUE_BOARD.height - inset
  );
}

function validateSssGeometry(geometry) {
  const { A, B, upper, lower } = geometry;
  const separation = distance(upper, lower);
  const altitude = Math.abs(upper.y - A.y);
  if (separation < UNIQUE_PROTECTION_LIMITS.minimumCircleIntersectionSeparation) {
    throw new RangeError("Die Kreisschnittpunkte wären nicht deutlich genug getrennt.");
  }
  if (altitude < UNIQUE_PROTECTION_LIMITS.minimumSssAltitude) {
    throw new RangeError("Die Dreiecke wären für die Darstellung zu flach.");
  }
  for (const point of [A, B, upper, lower]) {
    if (!pointWithinBoard(point, UNIQUE_PROTECTION_LIMITS.boardInset)) {
      throw new RangeError("Die SSS-Konstruktion muss vollständig sichtbar bleiben.");
    }
  }
}

export function buildSssGeometry(construction = SSS_CONSTRUCTION) {
  const A = copyPoint(construction.A);
  const B = copyPoint(construction.B);
  const [upper, lower] = circleCircleIntersections(
    A,
    construction.radiusA,
    B,
    construction.radiusB,
  );
  const upperTriangle = [A, B, upper].map(copyPoint);
  const lowerTriangle = [A, B, lower].map(copyPoint);
  const reflectedLower = [
    reflectPointAcrossLine(A, A, B),
    reflectPointAcrossLine(B, A, B),
    reflectPointAcrossLine(lower, A, B),
  ];
  const geometry = {
    A,
    B,
    upper,
    lower,
    upperTriangle,
    lowerTriangle,
    reflectedLower,
    baseMidpoint: midpoint(A, B),
    radii: {
      A: construction.radiusA,
      B: construction.radiusB,
    },
    intersectionSeparation: distance(upper, lower),
    congruent: trianglesCongruent(upperTriangle, lowerTriangle),
  };
  validateSssGeometry(geometry);
  if (!geometry.congruent || !trianglesCongruent(upperTriangle, reflectedLower)) {
    throw new RangeError("Die beiden SSS-Dreiecke müssen exakt kongruent sein.");
  }
  return geometry;
}

function visibleRayEnd(origin, direction, inset = 28) {
  const unit = normalize(direction);
  const candidates = [];
  if (unit.x > EPSILON) {
    candidates.push((UNIQUE_BOARD.width - inset - origin.x) / unit.x);
  } else if (unit.x < -EPSILON) {
    candidates.push((inset - origin.x) / unit.x);
  }
  if (unit.y > EPSILON) {
    candidates.push((UNIQUE_BOARD.height - inset - origin.y) / unit.y);
  } else if (unit.y < -EPSILON) {
    candidates.push((inset - origin.y) / unit.y);
  }
  const amount = Math.min(...candidates.filter((candidate) => candidate > 0));
  return pointAt(origin, unit, amount);
}

function angleArcPoints(center, direction, radius = 72) {
  const endAngle = Math.atan2(direction.y, direction.x);
  return Array.from({ length: 15 }, (_, index) => {
    const angle = (endAngle * index) / 14;
    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    };
  });
}

function validateAmbiguousGeometry(geometry) {
  const { A, B, intersections, circle } = geometry;
  const [near, far] = intersections;
  if (
    far.amount - near.amount <
    UNIQUE_PROTECTION_LIMITS.minimumRayIntersectionSeparation
  ) {
    throw new RangeError("Die beiden Strahlschnittpunkte wären nicht deutlich getrennt.");
  }
  for (const triangle of geometry.triangles) {
    if (
      doubledTriangleArea(triangle) <
      UNIQUE_PROTECTION_LIMITS.minimumTriangleDoubledArea
    ) {
      throw new RangeError("Ein Mehrdeutigkeitsdreieck wäre zu flach.");
    }
  }
  if (
    Math.abs(near.amount - far.amount) <
    UNIQUE_PROTECTION_LIMITS.minimumShapeDifference
  ) {
    throw new RangeError("Die beiden Dreiecksformen wären zu ähnlich.");
  }
  for (const point of [A, B, near.point, far.point, geometry.rayEnd]) {
    if (!pointWithinBoard(point, UNIQUE_PROTECTION_LIMITS.boardInset - 12)) {
      throw new RangeError("Die Mehrdeutigkeitskonstruktion muss sichtbar bleiben.");
    }
  }
  if (
    circle.center.x - circle.radius < UNIQUE_PROTECTION_LIMITS.boardInset ||
    circle.center.x + circle.radius > UNIQUE_BOARD.width - UNIQUE_PROTECTION_LIMITS.boardInset ||
    circle.center.y - circle.radius < UNIQUE_PROTECTION_LIMITS.boardInset ||
    circle.center.y + circle.radius > UNIQUE_BOARD.height - UNIQUE_PROTECTION_LIMITS.boardInset
  ) {
    throw new RangeError("Der Kreis muss mit Sicherheitsrand sichtbar bleiben.");
  }
}

export function buildAmbiguousGeometry(construction = AMBIGUOUS_CONSTRUCTION) {
  const A = copyPoint(construction.A);
  const B = copyPoint(construction.B);
  const direction = {
    x: Math.cos(construction.angle),
    y: Math.sin(construction.angle),
  };
  const intersections = rayCircleIntersections(
    A,
    direction,
    B,
    construction.radiusFromB,
  );
  const triangles = intersections.map(({ point }) => [A, B, point].map(copyPoint));
  const geometry = {
    A,
    B,
    direction,
    rayEnd: visibleRayEnd(A, direction),
    intersections,
    triangles,
    circle: {
      center: copyPoint(B),
      radius: construction.radiusFromB,
    },
    angleArc: angleArcPoints(A, direction),
    sameBase: distance(A, B),
    sameMarkedSide: intersections.map(({ point }) => distance(B, point)),
    sameAngle: Math.abs(construction.angle),
    congruent: trianglesCongruent(triangles[0], triangles[1]),
  };
  validateAmbiguousGeometry(geometry);
  if (geometry.congruent) {
    throw new RangeError("Der Mehrdeutigkeitsfall benötigt zwei verschiedene Formen.");
  }
  return geometry;
}

export function buildUniqueTriangleGeometry() {
  return {
    board: UNIQUE_BOARD,
    sss: buildSssGeometry(),
    ambiguity: buildAmbiguousGeometry(),
  };
}

export function nearlyEqual(first, second, tolerance = 1e-7) {
  return Math.abs(first - second) <= tolerance;
}

export function pointsAttribute(points) {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}
