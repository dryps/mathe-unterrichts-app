export const SIDE_LIMITS = Object.freeze({
  min: 1,
  max: 20,
});

export const INITIAL_SIDES = Object.freeze([5, 6, 8]);

export const CONSTRUCTION_BOARD = Object.freeze({
  width: 800,
  height: 840,
  baseLeft: Object.freeze({ x: 170, y: 420 }),
  baseRight: Object.freeze({ x: 630, y: 420 }),
});

const EPSILON = 1e-9;
const SIDE_NAMES = ["a", "b", "c"];

function assertSides(sides) {
  if (
    !Array.isArray(sides) ||
    sides.length !== 3 ||
    sides.some(
      (side) =>
        !Number.isInteger(side) ||
        side < SIDE_LIMITS.min ||
        side > SIDE_LIMITS.max,
    )
  ) {
    throw new RangeError(
      `Es werden drei ganzzahlige Seitenlängen von ${SIDE_LIMITS.min} bis ${SIDE_LIMITS.max} benötigt.`,
    );
  }
}

export function analyzeTriangleInequality(sides) {
  assertSides(sides);

  const ordered = sides
    .map((value, index) => ({ value, index, name: SIDE_NAMES[index] }))
    .sort((left, right) => left.value - right.value || left.index - right.index);
  const shorter = ordered.slice(0, 2);
  const longest = ordered[2];
  const shorterSum = shorter[0].value + shorter[1].value;
  const difference = shorterSum - longest.value;

  let state = "impossible";
  let operator = "<";
  if (difference > 0) {
    state = "possible";
    operator = ">";
  } else if (difference === 0) {
    state = "degenerate";
    operator = "=";
  }

  return {
    state,
    operator,
    shorter,
    longest,
    shorterSum,
    difference,
    equation: `${shorter[0].value} + ${shorter[1].value} ${operator} ${longest.value}`,
  };
}

export function circleIntersections(
  firstCenter,
  firstRadius,
  secondCenter,
  secondRadius,
  epsilon = EPSILON,
) {
  if (
    [firstCenter.x, firstCenter.y, secondCenter.x, secondCenter.y, firstRadius, secondRadius].some(
      (value) => !Number.isFinite(value),
    ) ||
    firstRadius <= 0 ||
    secondRadius <= 0
  ) {
    throw new TypeError("Kreismittelpunkte und Radien müssen endlich und positiv sein.");
  }

  const deltaX = secondCenter.x - firstCenter.x;
  const deltaY = secondCenter.y - firstCenter.y;
  const centerDistance = Math.hypot(deltaX, deltaY);

  if (centerDistance <= epsilon) {
    return { type: "coincident", points: [] };
  }

  if (
    centerDistance > firstRadius + secondRadius + epsilon ||
    centerDistance < Math.abs(firstRadius - secondRadius) - epsilon
  ) {
    return { type: "none", points: [] };
  }

  const along =
    (firstRadius ** 2 - secondRadius ** 2 + centerDistance ** 2) /
    (2 * centerDistance);
  const heightSquared = firstRadius ** 2 - along ** 2;
  const basePoint = {
    x: firstCenter.x + (along * deltaX) / centerDistance,
    y: firstCenter.y + (along * deltaY) / centerDistance,
  };

  if (Math.abs(heightSquared) <= epsilon) {
    return { type: "tangent", points: [basePoint] };
  }

  if (heightSquared < 0) {
    return { type: "none", points: [] };
  }

  const height = Math.sqrt(heightSquared);
  const offset = {
    x: (-deltaY * height) / centerDistance,
    y: (deltaX * height) / centerDistance,
  };

  return {
    type: "two",
    points: [
      { x: basePoint.x + offset.x, y: basePoint.y + offset.y },
      { x: basePoint.x - offset.x, y: basePoint.y - offset.y },
    ].sort((left, right) => left.y - right.y),
  };
}

function formatCoordinate(value) {
  return Number(value.toFixed(2));
}

function arcPath(center, radius, startAngle, endAngle, steps = 48) {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const angle = startAngle + ((endAngle - startAngle) * index) / steps;
    const x = formatCoordinate(center.x + Math.cos(angle) * radius);
    const y = formatCoordinate(center.y + Math.sin(angle) * radius);
    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");
}

function trianglePath(left, right, apex) {
  return [
    `M ${formatCoordinate(left.x)} ${formatCoordinate(left.y)}`,
    `L ${formatCoordinate(apex.x)} ${formatCoordinate(apex.y)}`,
    `L ${formatCoordinate(right.x)} ${formatCoordinate(right.y)}`,
    "Z",
  ].join(" ");
}

export function buildConstruction(sides, board = CONSTRUCTION_BOARD) {
  const analysis = analyzeTriangleInequality(sides);
  const left = { ...board.baseLeft };
  const right = { ...board.baseRight };
  const basePixels = right.x - left.x;
  const scale = basePixels / analysis.longest.value;
  const leftRadius = analysis.shorter[0].value * scale;
  const rightRadius = analysis.shorter[1].value * scale;
  const intersections = circleIntersections(left, leftRadius, right, rightRadius);

  let leftSpan = 0.9;
  let rightSpan = 0.9;
  if (intersections.points.length > 0) {
    const point = intersections.points[0];
    const verticalDistance = Math.abs(point.y - left.y);
    leftSpan = Math.max(
      0.55,
      Math.min(
        2.4,
        Math.atan2(verticalDistance, Math.abs(point.x - left.x)) + 0.2,
      ),
    );
    rightSpan = Math.max(
      0.55,
      Math.min(
        2.4,
        Math.atan2(verticalDistance, Math.abs(point.x - right.x)) + 0.2,
      ),
    );
  }

  const upperPoint = intersections.points[0] ?? null;
  const lowerPoint = intersections.type === "two" ? intersections.points[1] : null;

  return {
    analysis,
    base: { left, right },
    scale,
    radii: {
      left: leftRadius,
      right: rightRadius,
    },
    arcs: {
      left: arcPath(left, leftRadius, -leftSpan, leftSpan),
      right: arcPath(right, rightRadius, Math.PI - rightSpan, Math.PI + rightSpan),
    },
    intersections,
    upperTriangle:
      analysis.state === "possible" && upperPoint
        ? trianglePath(left, right, upperPoint)
        : "",
    mirrorTriangle:
      analysis.state === "possible" && lowerPoint
        ? trianglePath(left, right, lowerPoint)
        : "",
    tangentPoint:
      analysis.state === "degenerate" ? intersections.points[0] ?? null : null,
  };
}

export function updateSide(sides, index, delta) {
  assertSides(sides);
  if (!Number.isInteger(index) || index < 0 || index > 2) {
    throw new RangeError("Der Seitenindex muss 0, 1 oder 2 sein.");
  }
  if (!Number.isInteger(delta)) {
    throw new TypeError("Die Änderung muss ganzzahlig sein.");
  }

  const next = [...sides];
  next[index] = Math.max(
    SIDE_LIMITS.min,
    Math.min(SIDE_LIMITS.max, next[index] + delta),
  );
  return next;
}
