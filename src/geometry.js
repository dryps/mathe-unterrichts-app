const FULL_TURN = Math.PI * 2;
const HALF_TURN_DEGREES = 180;

export const BOARD = Object.freeze({
  width: 1000,
  height: 680,
  padding: 72,
  minDistance: 150,
  minArea: 24000,
  minAngle: 12,
});

export const INITIAL_POINTS = Object.freeze([
  Object.freeze({ x: 180, y: 520 }),
  Object.freeze({ x: 820, y: 520 }),
  Object.freeze({ x: 500, y: 140 }),
]);

export function clonePoints(points) {
  return points.map(({ x, y }) => ({ x, y }));
}

export function distance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

export function triangleArea(points) {
  const [a, b, c] = points;
  return Math.abs(
    (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2,
  );
}

function angleAt(vertex, firstNeighbor, secondNeighbor) {
  const first = {
    x: firstNeighbor.x - vertex.x,
    y: firstNeighbor.y - vertex.y,
  };
  const second = {
    x: secondNeighbor.x - vertex.x,
    y: secondNeighbor.y - vertex.y,
  };
  const denominator = Math.hypot(first.x, first.y) * Math.hypot(second.x, second.y);

  if (denominator === 0) {
    return Number.NaN;
  }

  const cosine = (first.x * second.x + first.y * second.y) / denominator;
  const safeCosine = Math.max(-1, Math.min(1, cosine));
  return (Math.acos(safeCosine) * HALF_TURN_DEGREES) / Math.PI;
}

export function calculateAngles(points) {
  if (points.length !== 3) {
    throw new TypeError("Ein Dreieck benötigt genau drei Eckpunkte.");
  }

  return [
    angleAt(points[0], points[1], points[2]),
    angleAt(points[1], points[2], points[0]),
    angleAt(points[2], points[0], points[1]),
  ];
}

export function roundAnglesTo180(angles) {
  if (
    angles.length !== 3 ||
    angles.some((angle) => !Number.isFinite(angle) || angle <= 0)
  ) {
    throw new TypeError("Es werden drei positive, endliche Winkel benötigt.");
  }

  const base = angles.map(Math.floor);
  const missingDegrees = HALF_TURN_DEGREES - base.reduce((sum, angle) => sum + angle, 0);
  const byLargestRemainder = angles
    .map((angle, index) => ({ index, remainder: angle - base[index] }))
    .sort((left, right) => right.remainder - left.remainder || left.index - right.index);

  for (let step = 0; step < missingDegrees; step += 1) {
    base[byLargestRemainder[step % byLargestRemainder.length].index] += 1;
  }

  return base;
}

export function isPointInsideBoard(point, constraints = BOARD) {
  return (
    point.x >= constraints.padding &&
    point.x <= constraints.width - constraints.padding &&
    point.y >= constraints.padding &&
    point.y <= constraints.height - constraints.padding
  );
}

export function clampPointToBoard(point, constraints = BOARD) {
  return {
    x: Math.max(constraints.padding, Math.min(constraints.width - constraints.padding, point.x)),
    y: Math.max(constraints.padding, Math.min(constraints.height - constraints.padding, point.y)),
  };
}

export function validateTriangle(points, constraints = BOARD) {
  if (points.length !== 3 || points.some((point) => !isPointInsideBoard(point, constraints))) {
    return { valid: false, reason: "edge" };
  }

  const pairDistances = [
    distance(points[0], points[1]),
    distance(points[1], points[2]),
    distance(points[2], points[0]),
  ];

  if (pairDistances.some((value) => value < constraints.minDistance)) {
    return { valid: false, reason: "distance" };
  }

  if (triangleArea(points) < constraints.minArea) {
    return { valid: false, reason: "area" };
  }

  const angles = calculateAngles(points);
  if (
    angles.some(
      (angle) => !Number.isFinite(angle) || angle < constraints.minAngle,
    )
  ) {
    return { valid: false, reason: "angle" };
  }

  return { valid: true, reason: null, angles };
}

export function moveVertex(points, vertexIndex, requestedPoint, constraints = BOARD) {
  if (!Number.isInteger(vertexIndex) || vertexIndex < 0 || vertexIndex > 2) {
    throw new RangeError("Der Eckpunktindex muss 0, 1 oder 2 sein.");
  }

  const candidate = clonePoints(points);
  candidate[vertexIndex] = clampPointToBoard(requestedPoint, constraints);
  const validation = validateTriangle(candidate, constraints);

  if (!validation.valid) {
    return {
      points: clonePoints(points),
      accepted: false,
      reason: validation.reason,
    };
  }

  return {
    points: candidate,
    accepted: true,
    reason: null,
  };
}

function shortestAngleDelta(start, end) {
  let delta = (end - start) % FULL_TURN;
  if (delta > Math.PI) delta -= FULL_TURN;
  if (delta < -Math.PI) delta += FULL_TURN;
  return delta;
}

function formatCoordinate(value) {
  return Number(value.toFixed(2));
}

export function describeInteriorAngle(
  vertex,
  firstNeighbor,
  secondNeighbor,
  radius = 62,
  labelRadius = 112,
) {
  const startAngle = Math.atan2(
    firstNeighbor.y - vertex.y,
    firstNeighbor.x - vertex.x,
  );
  const endAngle = Math.atan2(
    secondNeighbor.y - vertex.y,
    secondNeighbor.x - vertex.x,
  );
  const delta = shortestAngleDelta(startAngle, endAngle);
  const steps = 18;
  const arcPoints = Array.from({ length: steps + 1 }, (_, index) => {
    const angle = startAngle + (delta * index) / steps;
    return {
      x: vertex.x + Math.cos(angle) * radius,
      y: vertex.y + Math.sin(angle) * radius,
    };
  });
  const midpointAngle = startAngle + delta / 2;
  const label = {
    x: vertex.x + Math.cos(midpointAngle) * labelRadius,
    y: vertex.y + Math.sin(midpointAngle) * labelRadius,
  };
  const arcCommands = arcPoints.map(
    (point, index) =>
      `${index === 0 ? "M" : "L"} ${formatCoordinate(point.x)} ${formatCoordinate(point.y)}`,
  );

  return {
    arcPath: arcCommands.join(" "),
    sectorPath: [
      `M ${formatCoordinate(vertex.x)} ${formatCoordinate(vertex.y)}`,
      `L ${formatCoordinate(arcPoints[0].x)} ${formatCoordinate(arcPoints[0].y)}`,
      ...arcCommands.slice(1),
      "Z",
    ].join(" "),
    label: {
      x: formatCoordinate(label.x),
      y: formatCoordinate(label.y),
    },
  };
}

