import assert from "node:assert/strict";
import test from "node:test";

import {
  BOARD,
  INITIAL_POINTS,
  calculateAngles,
  clampPointToBoard,
  clonePoints,
  describeInteriorAngle,
  moveVertex,
  roundAnglesTo180,
  triangleArea,
  validateTriangle,
} from "../src/geometry.js";

const sum = (values) => values.reduce((total, value) => total + value, 0);
const closeTo = (actual, expected, tolerance = 1e-8) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} sollte nahe bei ${expected} liegen`,
  );
};

test("Ausgangsdreieck ist gültig und hat präzise 180°", () => {
  const points = clonePoints(INITIAL_POINTS);
  const angles = calculateAngles(points);

  assert.equal(validateTriangle(points).valid, true);
  closeTo(sum(angles), 180);
  assert.ok(triangleArea(points) > BOARD.minArea);
});

test("gleichseitiges Dreieck ergibt dreimal 60°", () => {
  const points = [
    { x: 200, y: 500 },
    { x: 800, y: 500 },
    { x: 500, y: 500 - 300 * Math.sqrt(3) },
  ];
  const angles = calculateAngles(points);

  angles.forEach((angle) => closeTo(angle, 60));
  assert.deepEqual(roundAnglesTo180(angles), [60, 60, 60]);
});

test("rechtwinkliges Dreieck enthält einen Winkel von 90°", () => {
  const angles = calculateAngles([
    { x: 180, y: 520 },
    { x: 780, y: 520 },
    { x: 180, y: 120 },
  ]);

  closeTo(angles[0], 90);
  closeTo(sum(angles), 180);
  assert.equal(roundAnglesTo180(angles).includes(90), true);
});

test("stumpfwinkliges Dreieck wird korrekt erkannt", () => {
  const points = [
    { x: 160, y: 500 },
    { x: 840, y: 500 },
    { x: 300, y: 300 },
  ];
  const angles = calculateAngles(points);

  assert.equal(validateTriangle(points).valid, true);
  assert.ok(angles.some((angle) => angle > 90));
  closeTo(sum(angles), 180);
});

test("gleichschenkliges Dreieck hat zwei gleiche Basiswinkel", () => {
  const angles = calculateAngles([
    { x: 180, y: 520 },
    { x: 820, y: 520 },
    { x: 500, y: 160 },
  ]);

  closeTo(angles[0], angles[1]);
  closeTo(sum(angles), 180);
});

test("größte-Reste-Rundung zeigt immer exakt 180°", () => {
  const cases = [
    [59.6, 59.6, 60.8],
    [47.49, 62.49, 70.02],
    [89.51, 45.245, 45.245],
    [12.1, 12.1, 155.8],
  ];

  for (const angles of cases) {
    const visible = roundAnglesTo180(angles);
    assert.equal(sum(visible), 180);
    visible.forEach((angle, index) => {
      assert.ok(Math.abs(angle - angles[index]) < 1);
    });
  }
});

test("Eckpunkte werden an den sichtbaren Bereich geklemmt", () => {
  assert.deepEqual(clampPointToBoard({ x: -500, y: 900 }), {
    x: BOARD.padding,
    y: BOARD.height - BOARD.padding,
  });
});

test("zu kleine Eckpunktabstände werden abgewiesen", () => {
  const points = clonePoints(INITIAL_POINTS);
  const movement = moveVertex(points, 0, {
    x: points[1].x - BOARD.minDistance + 1,
    y: points[1].y,
  });

  assert.equal(movement.accepted, false);
  assert.equal(movement.reason, "distance");
  assert.deepEqual(movement.points, points);
});

test("fast kollineare Punkte werden abgewiesen", () => {
  const points = [
    { x: 160, y: 340 },
    { x: 840, y: 340 },
    { x: 500, y: 345 },
  ];
  const validation = validateTriangle(points);

  assert.equal(validation.valid, false);
  assert.ok(["area", "angle"].includes(validation.reason));
});

test("extrem kleine und unlesbare Winkel werden abgewiesen", () => {
  const points = [
    { x: 100, y: 500 },
    { x: 900, y: 500 },
    { x: 770, y: 360 },
  ];
  const validation = validateTriangle(points);

  assert.equal(validation.valid, false);
  assert.equal(validation.reason, "angle");
});

test("schnelle gültige Ziehbewegungen behalten eine gültige Geometrie", () => {
  let points = clonePoints(INITIAL_POINTS);
  const path = [
    { x: 240, y: 440 },
    { x: 320, y: 350 },
    { x: 420, y: 250 },
    { x: 530, y: 180 },
    { x: 690, y: 230 },
  ];

  for (const requestedPoint of path) {
    const movement = moveVertex(points, 2, requestedPoint);
    if (movement.accepted) points = movement.points;
    assert.equal(validateTriangle(points).valid, true);
    closeTo(sum(calculateAngles(points)), 180);
  }
});

test("ungültiger Zug verändert den letzten gültigen Zustand nicht", () => {
  const points = clonePoints(INITIAL_POINTS);
  const before = clonePoints(points);
  const movement = moveVertex(points, 2, points[0]);

  assert.equal(movement.accepted, false);
  assert.deepEqual(points, before);
  assert.deepEqual(movement.points, before);
});

test("Winkelbogen liefert endliche Pfade und eine Labelposition", () => {
  const [a, b, c] = INITIAL_POINTS;
  const description = describeInteriorAngle(a, b, c);

  assert.match(description.arcPath, /^M /);
  assert.match(description.sectorPath, /^M .* Z$/);
  assert.equal(Number.isFinite(description.label.x), true);
  assert.equal(Number.isFinite(description.label.y), true);
  assert.equal(description.arcPath.includes("NaN"), false);
});
