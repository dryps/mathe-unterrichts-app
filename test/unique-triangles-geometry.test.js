import assert from "node:assert/strict";
import test from "node:test";

import {
  AMBIGUOUS_CONSTRUCTION,
  SSS_CONSTRUCTION,
  UNIQUE_BOARD,
  UNIQUE_PROTECTION_LIMITS,
  buildAmbiguousGeometry,
  buildSssGeometry,
  buildUniqueTriangleGeometry,
  circleCircleIntersections,
  cross,
  distance,
  doubledTriangleArea,
  nearlyEqual,
  pointWithinBoard,
  rayCircleIntersections,
  reflectPointAcrossLine,
  triangleSideLengths,
  trianglesCongruent,
  vector,
} from "../src/unique-triangles-geometry.js";

function closeTo(actual, expected, tolerance = 1e-7) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} liegt nicht innerhalb ${tolerance} von ${expected}`,
  );
}

test("Kreis-Kreisschnitt liefert genau zwei Punkte auf beiden Kreisen", () => {
  const first = { x: 0, y: 0 };
  const second = { x: 6, y: 0 };
  const intersections = circleCircleIntersections(first, 5, second, 5);
  assert.equal(intersections.length, 2);
  for (const point of intersections) {
    closeTo(distance(first, point), 5);
    closeTo(distance(second, point), 5);
  }
});

test("tangentiale, getrennte und konzentrische Kreise werden abgelehnt", () => {
  assert.throws(() =>
    circleCircleIntersections({ x: 0, y: 0 }, 3, { x: 6, y: 0 }, 3),
  );
  assert.throws(() =>
    circleCircleIntersections({ x: 0, y: 0 }, 2, { x: 8, y: 0 }, 2),
  );
  assert.throws(() =>
    circleCircleIntersections({ x: 0, y: 0 }, 4, { x: 0, y: 0 }, 2),
  );
});

test("SSS-Schnittpunkte sind exakt symmetrisch zur Grundseite", () => {
  const geometry = buildSssGeometry();
  closeTo(geometry.upper.x, geometry.lower.x);
  closeTo(
    geometry.upper.y + geometry.lower.y,
    SSS_CONSTRUCTION.A.y + SSS_CONSTRUCTION.B.y,
  );
  assert.ok(
    geometry.intersectionSeparation >
      UNIQUE_PROTECTION_LIMITS.minimumCircleIntersectionSeparation,
  );
});

test("beide SSS-Dreiecke besitzen exakt dieselben drei Seitenlängen", () => {
  const geometry = buildSssGeometry();
  const upper = triangleSideLengths(geometry.upperTriangle);
  const lower = triangleSideLengths(geometry.lowerTriangle);
  assert.equal(upper.length, 3);
  upper.forEach((length, index) => closeTo(length, lower[index]));
  assert.equal(geometry.congruent, true);
  assert.equal(trianglesCongruent(geometry.upperTriangle, geometry.lowerTriangle), true);
});

test("Spiegelung an AB bildet den unteren Schnittpunkt exakt auf den oberen", () => {
  const geometry = buildSssGeometry();
  const reflected = reflectPointAcrossLine(
    geometry.lower,
    geometry.A,
    geometry.B,
  );
  closeTo(reflected.x, geometry.upper.x);
  closeTo(reflected.y, geometry.upper.y);
  assert.equal(
    trianglesCongruent(geometry.upperTriangle, geometry.reflectedLower),
    true,
  );
});

test("Spiegelung funktioniert auch an einer schrägen Geraden", () => {
  const reflected = reflectPointAcrossLine(
    { x: 2, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  );
  closeTo(reflected.x, 0);
  closeTo(reflected.y, 2);
});

test("SSS-Dreiecke sind nicht flach und vollständig sichtbar", () => {
  const geometry = buildSssGeometry();
  for (const triangle of [geometry.upperTriangle, geometry.lowerTriangle]) {
    assert.ok(doubledTriangleArea(triangle) > 150000);
    triangle.forEach((point) =>
      assert.equal(pointWithinBoard(point, UNIQUE_PROTECTION_LIMITS.boardInset), true),
    );
  }
});

test("Strahl-Kreis-Schnitt liefert zwei positive, geordnete Lösungen", () => {
  const geometry = buildAmbiguousGeometry();
  const [near, far] = geometry.intersections;
  assert.ok(near.amount > 0);
  assert.ok(far.amount > near.amount);
  for (const intersection of geometry.intersections) {
    closeTo(distance(geometry.B, intersection.point), geometry.circle.radius);
    closeTo(
      Math.abs(cross(vector(geometry.A, intersection.point), geometry.direction)),
      0,
    );
  }
});

test("Tangentiallage und nur rückwärts liegende Strahlschnittpunkte werden abgelehnt", () => {
  assert.throws(() =>
    rayCircleIntersections(
      { x: 0, y: 3 },
      { x: 1, y: 0 },
      { x: 4, y: 0 },
      3,
    ),
  );
  assert.throws(() =>
    rayCircleIntersections(
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 5, y: 0 },
      2,
    ),
  );
});

test("Mehrdeutigkeitsdreiecke erfüllen dieselbe Grundseite, Seite und Winkelvorgabe", () => {
  const geometry = buildAmbiguousGeometry();
  const [nearTriangle, farTriangle] = geometry.triangles;
  closeTo(distance(nearTriangle[0], nearTriangle[1]), geometry.sameBase);
  closeTo(distance(farTriangle[0], farTriangle[1]), geometry.sameBase);
  closeTo(geometry.sameMarkedSide[0], geometry.sameMarkedSide[1]);
  closeTo(geometry.sameMarkedSide[0], AMBIGUOUS_CONSTRUCTION.radiusFromB);
  closeTo(geometry.sameAngle, Math.abs(AMBIGUOUS_CONSTRUCTION.angle));
});

test("Mehrdeutigkeitsdreiecke sind nicht kongruent und deutlich verschieden", () => {
  const geometry = buildAmbiguousGeometry();
  assert.equal(geometry.congruent, false);
  assert.equal(trianglesCongruent(geometry.triangles[0], geometry.triangles[1]), false);
  const firstVariableSide = distance(
    geometry.triangles[0][0],
    geometry.triangles[0][2],
  );
  const secondVariableSide = distance(
    geometry.triangles[1][0],
    geometry.triangles[1][2],
  );
  assert.ok(
    Math.abs(firstVariableSide - secondVariableSide) >
      UNIQUE_PROTECTION_LIMITS.minimumShapeDifference,
  );
});

test("beide Mehrdeutigkeitsdreiecke sind echte sichtbare Dreiecke", () => {
  const geometry = buildAmbiguousGeometry();
  for (const triangle of geometry.triangles) {
    assert.ok(
      doubledTriangleArea(triangle) >
        UNIQUE_PROTECTION_LIMITS.minimumTriangleDoubledArea,
    );
    triangle.forEach((point) =>
      assert.equal(pointWithinBoard(point, UNIQUE_PROTECTION_LIMITS.boardInset - 12), true),
    );
  }
});

test("Kreis und Strahl bleiben vollständig mit Sicherheitsrand sichtbar", () => {
  const geometry = buildAmbiguousGeometry();
  const { center, radius } = geometry.circle;
  assert.ok(center.x - radius >= UNIQUE_PROTECTION_LIMITS.boardInset);
  assert.ok(center.x + radius <= UNIQUE_BOARD.width - UNIQUE_PROTECTION_LIMITS.boardInset);
  assert.ok(center.y - radius >= UNIQUE_PROTECTION_LIMITS.boardInset);
  assert.ok(center.y + radius <= UNIQUE_BOARD.height - UNIQUE_PROTECTION_LIMITS.boardInset);
  assert.equal(pointWithinBoard(geometry.rayEnd, 28), true);
});

test("Schutzgrenzen verhindern flache SSS- und fast tangentiale Strahlfälle", () => {
  assert.throws(() =>
    buildSssGeometry({
      ...SSS_CONSTRUCTION,
      radiusA: 301,
      radiusB: 301,
    }),
  );
  assert.throws(() =>
    buildAmbiguousGeometry({
      ...AMBIGUOUS_CONSTRUCTION,
      radiusFromB: 263,
    }),
  );
});

test("Gesamtgeometrie ist deterministisch und enthält keine Näherungszustände", () => {
  const first = buildUniqueTriangleGeometry();
  const second = buildUniqueTriangleGeometry();
  assert.deepEqual(first, second);
  assert.equal(nearlyEqual(first.sss.upper.x, second.sss.upper.x), true);
});
