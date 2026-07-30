import assert from "node:assert/strict";
import test from "node:test";

import {
  INITIAL_VERTICES,
  PROTECTION_LIMITS,
  attemptVertexMove,
  buildCircumcircleGeometry,
  cross,
  distance,
  dot,
  doubledTriangleArea,
  midpoint,
  nearlyEqual,
  validateTriangle,
  vector,
} from "../src/circumcircle-geometry.js";

const TRIANGLES = {
  acute: INITIAL_VERTICES,
  right: {
    A: { x: 350, y: 500 },
    B: { x: 800, y: 500 },
    C: { x: 350, y: 200 },
  },
  obtuse: {
    A: { x: 300, y: 290 },
    B: { x: 900, y: 290 },
    C: { x: 450, y: 110 },
  },
};

function samePoint(first, second, tolerance = 1e-7) {
  return nearlyEqual(first.x, second.x, tolerance) && nearlyEqual(first.y, second.y, tolerance);
}

function pointLocation(point, vertices, tolerance = 1e-7) {
  const signs = [
    cross(vector(vertices.A, vertices.B), vector(vertices.A, point)),
    cross(vector(vertices.B, vertices.C), vector(vertices.B, point)),
    cross(vector(vertices.C, vertices.A), vector(vertices.C, point)),
  ];
  if (signs.some((value) => Math.abs(value) <= tolerance)) return "boundary";
  const sameSign = signs.every((value) => value > 0) || signs.every((value) => value < 0);
  return sameSign ? "inside" : "outside";
}

function circleMargins(geometry) {
  return {
    left: geometry.center.x - geometry.radius,
    right: geometry.board.width - geometry.center.x - geometry.radius,
    top: geometry.center.y - geometry.radius,
    bottom: geometry.board.height - geometry.center.y - geometry.radius,
  };
}

test("alle Seitenmittelpunkte werden exakt berechnet", () => {
  const geometry = buildCircumcircleGeometry();
  assert.ok(samePoint(geometry.bisectors[0].middle, midpoint(INITIAL_VERTICES.A, INITIAL_VERTICES.B)));
  assert.ok(samePoint(geometry.bisectors[1].middle, midpoint(INITIAL_VERTICES.B, INITIAL_VERTICES.C)));
  assert.ok(samePoint(geometry.bisectors[2].middle, midpoint(INITIAL_VERTICES.C, INITIAL_VERTICES.A)));
});

test("alle drei Mittelsenkrechten stehen exakt senkrecht auf ihren Seiten", () => {
  for (const vertices of Object.values(TRIANGLES)) {
    const geometry = buildCircumcircleGeometry(vertices);
    for (const bisector of geometry.bisectors) {
      const [first, second] = bisector.endpoints;
      assert.ok(
        nearlyEqual(
          dot(vector(vertices[first], vertices[second]), bisector.direction),
          0,
        ),
      );
      assert.ok(
        nearlyEqual(
          distance(bisector.middle, vertices[first]),
          distance(bisector.middle, vertices[second]),
        ),
      );
    }
  }
});

test("P wird für mehrere Zielpositionen exakt auf die erste Mittelsenkrechte projiziert", () => {
  for (const target of [
    { x: 80, y: 100 },
    { x: 600, y: 300 },
    { x: 1120, y: 700 },
    { x: 420, y: 620 },
  ]) {
    const geometry = buildCircumcircleGeometry(INITIAL_VERTICES, target);
    const first = geometry.bisectors[0];
    assert.ok(
      nearlyEqual(cross(vector(first.middle, geometry.testPoint), first.direction), 0),
    );
    assert.ok(nearlyEqual(geometry.testDistances.A, geometry.testDistances.B));
  }
});

test("Umkreismittelpunkt ist der Schnittpunkt der ersten beiden Mittelsenkrechten", () => {
  for (const vertices of Object.values(TRIANGLES)) {
    const geometry = buildCircumcircleGeometry(vertices);
    for (const bisector of geometry.bisectors.slice(0, 2)) {
      assert.ok(
        nearlyEqual(cross(vector(bisector.middle, geometry.center), bisector.direction), 0),
      );
    }
  }
});

test("die dritte Mittelsenkrechte läuft innerhalb der Toleranz ebenfalls durch M", () => {
  for (const vertices of Object.values(TRIANGLES)) {
    assert.ok(buildCircumcircleGeometry(vertices).thirdBisectorError < 1e-7);
  }
});

test("MA, MB und MC sind für alle Testdreiecke gleich", () => {
  for (const vertices of Object.values(TRIANGLES)) {
    const { radii } = buildCircumcircleGeometry(vertices);
    assert.ok(nearlyEqual(radii.A, radii.B));
    assert.ok(nearlyEqual(radii.B, radii.C));
  }
});

test("der Umkreis verläuft exakt durch A, B und C", () => {
  for (const vertices of Object.values(TRIANGLES)) {
    const geometry = buildCircumcircleGeometry(vertices);
    for (const key of ["A", "B", "C"]) {
      assert.ok(nearlyEqual(distance(geometry.center, vertices[key]), geometry.radius));
    }
  }
});

test("der initiale Umkreis besitzt vollständig einen sichtbaren Innenrand", () => {
  const geometry = buildCircumcircleGeometry();
  const margins = circleMargins(geometry);
  for (const [side, margin] of Object.entries(margins)) {
    assert.ok(
      margin >= PROTECTION_LIMITS.minimumCircleInset,
      `${side} unterschreitet den sicheren Innenrand`,
    );
  }
  assert.ok(Math.min(...Object.values(margins)) <= 60);
});

test("jede akzeptierte repräsentative Eckpunktlage hält den ganzen Kreis sichtbar", () => {
  for (const vertices of [
    TRIANGLES.acute,
    TRIANGLES.right,
    TRIANGLES.obtuse,
    {
      A: { x: 340, y: 500 },
      B: { x: 860, y: 470 },
      C: { x: 580, y: 150 },
    },
  ]) {
    const validation = validateTriangle(vertices);
    assert.equal(validation.valid, true);
    const geometry = buildCircumcircleGeometry(vertices);
    for (const margin of Object.values(circleMargins(geometry))) {
      assert.ok(margin >= PROTECTION_LIMITS.minimumCircleInset);
    }
  }
});

test("eine sonst gültige Bewegung mit abgeschnittenem Umkreis wird abgelehnt", () => {
  const clipped = {
    A: { x: 300, y: 540 },
    B: { x: 900, y: 540 },
    C: { x: 540, y: 180 },
  };
  assert.ok(doubledTriangleArea(clipped) >= PROTECTION_LIMITS.minimumDoubledArea);
  assert.equal(validateTriangle(clipped).valid, false);
  assert.match(validateTriangle(clipped).reason, /Umkreis/);
});

test("M liegt beim spitzen Testfall innen", () => {
  const geometry = buildCircumcircleGeometry(TRIANGLES.acute);
  assert.equal(pointLocation(geometry.center, TRIANGLES.acute), "inside");
});

test("M liegt beim rechten Testfall auf der Hypotenuse", () => {
  const geometry = buildCircumcircleGeometry(TRIANGLES.right);
  assert.equal(pointLocation(geometry.center, TRIANGLES.right), "boundary");
  assert.ok(samePoint(geometry.center, midpoint(TRIANGLES.right.B, TRIANGLES.right.C)));
});

test("M liegt beim stumpfen Testfall außerhalb", () => {
  const geometry = buildCircumcircleGeometry(TRIANGLES.obtuse);
  assert.equal(pointLocation(geometry.center, TRIANGLES.obtuse), "outside");
});

test("nahezu kollineare Dreiecke werden geschützt", () => {
  const vertices = {
    A: { x: 200, y: 400 },
    B: { x: 1000, y: 400 },
    C: { x: 600, y: 401 },
  };
  assert.ok(doubledTriangleArea(vertices) < PROTECTION_LIMITS.minimumDoubledArea);
  assert.deepEqual(validateTriangle(vertices), {
    valid: false,
    reason: "Das Dreieck darf nicht fast auf einer Geraden liegen.",
  });
});

test("zu kleine Seiten werden geschützt", () => {
  const vertices = {
    A: { x: 300, y: 500 },
    B: { x: 400, y: 500 },
    C: { x: 700, y: 160 },
  };
  assert.equal(validateTriangle(vertices).valid, false);
  assert.match(validateTriangle(vertices).reason, /mehr Abstand/);
});

test("unlesbar große Umkreise und außerhalb liegende Eckpunkte werden geschützt", () => {
  const outside = attemptVertexMove(INITIAL_VERTICES, "A", { x: 20, y: 20 });
  assert.equal(outside.accepted, false);
  assert.strictEqual(outside.vertices, INITIAL_VERTICES);

  const huge = {
    A: { x: 140, y: 400 },
    B: { x: 1060, y: 400 },
    C: { x: 600, y: 330 },
  };
  assert.equal(validateTriangle(huge).valid, false);
});

test("ungültiges Ziehen bewahrt den letzten gültigen Zustand", () => {
  const result = attemptVertexMove(INITIAL_VERTICES, "C", { x: 600, y: 539 });
  assert.equal(result.accepted, false);
  assert.strictEqual(result.vertices, INITIAL_VERTICES);
  assert.ok(result.reason);
});

test("gültiges Ziehen erzeugt sofort eine neue exakte Umkreisgeometrie", () => {
  const result = attemptVertexMove(INITIAL_VERTICES, "C", { x: 650, y: 130 });
  assert.equal(result.accepted, true);
  const geometry = buildCircumcircleGeometry(result.vertices);
  assert.ok(nearlyEqual(geometry.radii.A, geometry.radii.B));
  assert.ok(nearlyEqual(geometry.radii.B, geometry.radii.C));
  assert.ok(geometry.thirdBisectorError < 1e-7);
});
