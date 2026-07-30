import assert from "node:assert/strict";
import test from "node:test";

import {
  INCIRCLE_BOARD,
  INITIAL_VERTICES,
  PROTECTION_LIMITS,
  angleBetween,
  attemptVertexMove,
  buildIncircleGeometry,
  cross,
  distance,
  dot,
  internalAngleBisector,
  nearlyEqual,
  pointInsideTriangle,
  projectPointToLine,
  triangleAngles,
  validateTriangle,
  vector,
} from "../src/incircle-geometry.js";

const RIGHT_TRIANGLE = Object.freeze({
  A: Object.freeze({ x: 300, y: 580 }),
  B: Object.freeze({ x: 900, y: 580 }),
  C: Object.freeze({ x: 300, y: 180 }),
});

const OBTUSE_TRIANGLE = Object.freeze({
  A: Object.freeze({ x: 230, y: 560 }),
  B: Object.freeze({ x: 970, y: 560 }),
  C: Object.freeze({ x: 430, y: 280 }),
});

test("innere Winkelhalbierende teilt den Winkel bei A numerisch gleich", () => {
  const direction = internalAngleBisector(
    INITIAL_VERTICES.A,
    INITIAL_VERTICES.B,
    INITIAL_VERTICES.C,
  );
  const first = angleBetween(vector(INITIAL_VERTICES.A, INITIAL_VERTICES.B), direction);
  const second = angleBetween(direction, vector(INITIAL_VERTICES.A, INITIAL_VERTICES.C));
  assert.ok(nearlyEqual(first, second));
});

test("alle drei berechneten Winkelhalbierenden enden auf der Gegenseite", () => {
  const geometry = buildIncircleGeometry();
  for (const bisector of geometry.bisectors) {
    assert.ok(bisector.oppositeFraction >= 0);
    assert.ok(bisector.oppositeFraction <= 1);
  }
});

test("P liegt nach beliebiger Zielbewegung exakt auf der ersten Winkelhalbierenden", () => {
  for (const target of [
    { x: 100, y: 100 },
    { x: 1080, y: 700 },
    { x: 530, y: 330 },
  ]) {
    const geometry = buildIncircleGeometry(INITIAL_VERTICES, target);
    const bisector = geometry.bisectors[0];
    assert.ok(
      nearlyEqual(
        cross(vector(bisector.start, geometry.testPoint), bisector.direction),
        0,
      ),
    );
    assert.ok(
      geometry.testFraction >= PROTECTION_LIMITS.testMinimumFraction,
    );
    assert.ok(
      geometry.testFraction <= PROTECTION_LIMITS.testMaximumFraction,
    );
  }
});

test("P besitzt zu AB und AC gleiche senkrechte Abstände", () => {
  for (const target of [
    { x: 330, y: 530 },
    { x: 480, y: 450 },
    { x: 760, y: 240 },
  ]) {
    const geometry = buildIncircleGeometry(INITIAL_VERTICES, target);
    assert.ok(nearlyEqual(geometry.testDistances.AB, geometry.testDistances.AC));
    assert.ok(
      nearlyEqual(
        dot(
          vector(geometry.testProjections.AB.foot, geometry.testPoint),
          vector(INITIAL_VERTICES.A, INITIAL_VERTICES.B),
        ),
        0,
      ),
    );
    assert.ok(
      nearlyEqual(
        dot(
          vector(geometry.testProjections.AC.foot, geometry.testPoint),
          vector(INITIAL_VERTICES.A, INITIAL_VERTICES.C),
        ),
        0,
      ),
    );
  }
});

test("Lotprojektion liefert den exakten Lotfußpunkt und Seitenparameter", () => {
  const projection = projectPointToLine(
    { x: 510, y: 340 },
    INITIAL_VERTICES.A,
    INITIAL_VERTICES.B,
  );
  assert.equal(projection.point.y, INITIAL_VERTICES.A.y);
  assert.ok(projection.fraction > 0 && projection.fraction < 1);
  assert.ok(
    nearlyEqual(
      dot(
        vector(projection.point, { x: 510, y: 340 }),
        vector(INITIAL_VERTICES.A, INITIAL_VERTICES.B),
      ),
      0,
    ),
  );
});

test("I liegt im Dreieck und auf allen drei Winkelhalbierenden", () => {
  const geometry = buildIncircleGeometry();
  assert.equal(pointInsideTriangle(geometry.center, geometry.vertices), true);
  for (const error of geometry.bisectorErrors) {
    assert.ok(error < 1e-7);
  }
});

test("I besitzt zu allen drei Seiten denselben Abstand", () => {
  const geometry = buildIncircleGeometry();
  assert.ok(nearlyEqual(geometry.centerDistances.AB, geometry.centerDistances.BC));
  assert.ok(nearlyEqual(geometry.centerDistances.BC, geometry.centerDistances.CA));
  assert.ok(nearlyEqual(geometry.radius, geometry.centerDistances.AB));
});

test("alle Berührpunkte liegen auf den Seitenstrecken und Radien stehen senkrecht", () => {
  const geometry = buildIncircleGeometry();
  const definitions = {
    AB: ["A", "B"],
    BC: ["B", "C"],
    CA: ["C", "A"],
  };
  for (const [key, [first, second]] of Object.entries(definitions)) {
    const touch = geometry.touches[key];
    assert.ok(touch.fraction >= 0 && touch.fraction <= 1);
    assert.ok(
      nearlyEqual(
        dot(
          vector(touch.foot, geometry.center),
          vector(geometry.vertices[first], geometry.vertices[second]),
        ),
        0,
      ),
    );
  }
});

test("Inkreis berührt A, B und C jeweils über den gemeinsamen Radius", () => {
  const geometry = buildIncircleGeometry();
  for (const touch of Object.values(geometry.touches)) {
    assert.ok(nearlyEqual(distance(geometry.center, touch.foot), geometry.radius));
  }
});

test("spitzwinkliger Ausgangsfall ist gültig", () => {
  const angles = triangleAngles(INITIAL_VERTICES);
  assert.ok(Object.values(angles).every((angle) => angle < Math.PI / 2));
  assert.equal(validateTriangle(INITIAL_VERTICES).valid, true);
});

test("rechtwinkliger Fall ist gültig und geometrisch exakt", () => {
  const angles = triangleAngles(RIGHT_TRIANGLE);
  assert.ok(Object.values(angles).some((angle) => nearlyEqual(angle, Math.PI / 2)));
  const geometry = buildIncircleGeometry(RIGHT_TRIANGLE);
  assert.ok(nearlyEqual(geometry.centerDistances.AB, geometry.centerDistances.BC));
  assert.ok(nearlyEqual(geometry.centerDistances.BC, geometry.centerDistances.CA));
});

test("stumpfwinkliger Fall ist gültig und I bleibt innen", () => {
  const angles = triangleAngles(OBTUSE_TRIANGLE);
  assert.ok(Object.values(angles).some((angle) => angle > Math.PI / 2));
  const geometry = buildIncircleGeometry(OBTUSE_TRIANGLE);
  assert.equal(pointInsideTriangle(geometry.center, OBTUSE_TRIANGLE), true);
});

test("nahezu kollineare Dreiecke werden abgelehnt", () => {
  const invalid = {
    A: { x: 200, y: 500 },
    B: { x: 1000, y: 500 },
    C: { x: 600, y: 490 },
  };
  const validation = validateTriangle(invalid);
  assert.equal(validation.valid, false);
  assert.match(validation.reason, /Geraden|schmal/);
});

test("zu kurze Seiten werden abgelehnt", () => {
  const invalid = {
    A: { x: 400, y: 500 },
    B: { x: 540, y: 500 },
    C: { x: 600, y: 200 },
  };
  const validation = validateTriangle(invalid);
  assert.equal(validation.valid, false);
  assert.match(validation.reason, /mehr Abstand/);
});

test("zu schmale Dreiecke werden trotz ausreichender Fläche abgelehnt", () => {
  const invalid = {
    A: { x: 220, y: 560 },
    B: { x: 980, y: 560 },
    C: { x: 430, y: 320 },
  };
  const validation = validateTriangle(invalid);
  assert.equal(validation.valid, false);
  assert.match(validation.reason, /zu schmal/);
});

test("Eckpunkte und Inkreis müssen innerhalb des sichtbaren Sicherheitsrands bleiben", () => {
  const outside = {
    A: { x: 50, y: 560 },
    B: { x: 950, y: 560 },
    C: { x: 600, y: 140 },
  };
  assert.equal(validateTriangle(outside).valid, false);

  const geometry = buildIncircleGeometry();
  assert.ok(
    geometry.center.x - geometry.radius >= PROTECTION_LIMITS.minimumCircleInset,
  );
  assert.ok(
    geometry.center.x + geometry.radius <=
      INCIRCLE_BOARD.width - PROTECTION_LIMITS.minimumCircleInset,
  );
  assert.ok(
    geometry.center.y - geometry.radius >= PROTECTION_LIMITS.minimumCircleInset,
  );
  assert.ok(
    geometry.center.y + geometry.radius <=
      INCIRCLE_BOARD.height - PROTECTION_LIMITS.minimumCircleInset,
  );
});

test("gültige Eckpunktbewegung aktualisiert I, Lotfüße und Radius", () => {
  const before = buildIncircleGeometry();
  const result = attemptVertexMove(INITIAL_VERTICES, "C", { x: 720, y: 150 });
  assert.equal(result.accepted, true);
  const after = buildIncircleGeometry(result.vertices);
  assert.notDeepEqual(after.center, before.center);
  assert.notDeepEqual(after.touches.BC.foot, before.touches.BC.foot);
  assert.notEqual(after.radius, before.radius);
});

test("unzulässige Eckpunktbewegung bewahrt den letzten gültigen Zustand", () => {
  const result = attemptVertexMove(INITIAL_VERTICES, "C", { x: 600, y: 550 });
  assert.equal(result.accepted, false);
  assert.strictEqual(result.vertices, INITIAL_VERTICES);
  assert.ok(result.reason);
});
