import assert from "node:assert/strict";
import test from "node:test";

import {
  INITIAL_SIDES,
  SIDE_LIMITS,
  analyzeTriangleInequality,
  buildConstruction,
  circleIntersections,
  updateSide,
} from "../src/triangle-inequality-geometry.js";

const closeTo = (actual, expected, tolerance = 1e-8) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} sollte nahe bei ${expected} liegen`,
  );
};

test("gültiges ungleichseitiges Dreieck wird erkannt", () => {
  const result = analyzeTriangleInequality([5, 6, 8]);
  assert.equal(result.state, "possible");
  assert.equal(result.equation, "5 + 6 > 8");
});

test("gleichseitiges Dreieck ist möglich", () => {
  const result = analyzeTriangleInequality([6, 6, 6]);
  assert.equal(result.state, "possible");
  assert.equal(result.equation, "6 + 6 > 6");
});

test("Grenzfall wird als gestreckt erkannt", () => {
  const result = analyzeTriangleInequality([3, 5, 8]);
  assert.equal(result.state, "degenerate");
  assert.equal(result.equation, "3 + 5 = 8");
});

test("unmögliche Kombination wird erkannt", () => {
  const result = analyzeTriangleInequality([3, 4, 8]);
  assert.equal(result.state, "impossible");
  assert.equal(result.equation, "3 + 4 < 8");
});

test("längste Seite wird nach jedem Wechsel neu bestimmt", () => {
  const first = analyzeTriangleInequality([9, 4, 6]);
  assert.equal(first.longest.name, "a");
  assert.equal(first.equation, "4 + 6 > 9");

  const second = analyzeTriangleInequality([5, 11, 7]);
  assert.equal(second.longest.name, "b");
  assert.equal(second.equation, "5 + 7 > 11");
});

test("minimale und maximale Seitenwerte bleiben gültige Eingaben", () => {
  assert.equal(analyzeTriangleInequality([1, 1, 1]).state, "possible");
  assert.equal(analyzeTriangleInequality([20, 20, 20]).state, "possible");
  assert.throws(() => analyzeTriangleInequality([0, 1, 1]), RangeError);
  assert.throws(() => analyzeTriangleInequality([20, 20, 21]), RangeError);
});

test("Plus und Minus werden an den Grenzen sicher begrenzt", () => {
  assert.deepEqual(updateSide([1, 5, 8], 0, -1), [1, 5, 8]);
  assert.deepEqual(updateSide([20, 5, 8], 0, 1), [20, 5, 8]);
});

test("schnelle Mehrfachänderungen bleiben im gültigen Wertebereich", () => {
  let sides = [...INITIAL_SIDES];
  for (let index = 0; index < 100; index += 1) {
    sides = updateSide(sides, 2, 1);
  }
  assert.equal(sides[2], SIDE_LIMITS.max);

  for (let index = 0; index < 100; index += 1) {
    sides = updateSide(sides, 2, -1);
  }
  assert.equal(sides[2], SIDE_LIMITS.min);
});

test("zwei Kreise liefern zwei spiegelbildliche Schnittpunkte", () => {
  const result = circleIntersections({ x: 0, y: 0 }, 5, { x: 6, y: 0 }, 5);
  assert.equal(result.type, "two");
  assert.equal(result.points.length, 2);
  closeTo(result.points[0].x, result.points[1].x);
  closeTo(result.points[0].y, -result.points[1].y);
  result.points.forEach((point) => {
    closeTo(Math.hypot(point.x, point.y), 5);
    closeTo(Math.hypot(point.x - 6, point.y), 5);
  });
});

test("tangentiale Kreise liefern genau einen Berührpunkt", () => {
  const result = circleIntersections({ x: 0, y: 0 }, 3, { x: 8, y: 0 }, 5);
  assert.equal(result.type, "tangent");
  assert.equal(result.points.length, 1);
  closeTo(result.points[0].x, 3);
  closeTo(result.points[0].y, 0);
});

test("getrennte Kreise liefern keinen Schnittpunkt", () => {
  const result = circleIntersections({ x: 0, y: 0 }, 3, { x: 8, y: 0 }, 4);
  assert.equal(result.type, "none");
  assert.deepEqual(result.points, []);
});

test("Konstruktion zeigt im gültigen Zustand beide Lösungen und ein Dreieck", () => {
  const construction = buildConstruction([5, 6, 8]);
  assert.equal(construction.intersections.type, "two");
  assert.equal(construction.intersections.points.length, 2);
  assert.match(construction.upperTriangle, /^M .* Z$/);
  assert.match(construction.mirrorTriangle, /^M .* Z$/);
  assert.equal(construction.tangentPoint, null);
});

test("Konstruktion zeigt im Grenzfall nur den Berührpunkt", () => {
  const construction = buildConstruction([3, 5, 8]);
  assert.equal(construction.intersections.type, "tangent");
  assert.equal(construction.intersections.points.length, 1);
  assert.ok(construction.tangentPoint);
  assert.equal(construction.upperTriangle, "");
  assert.equal(construction.mirrorTriangle, "");
});

test("Konstruktion hält die Bögen im unmöglichen Zustand getrennt", () => {
  const construction = buildConstruction([3, 4, 8]);
  assert.equal(construction.intersections.type, "none");
  assert.equal(construction.upperTriangle, "");
  assert.equal(construction.mirrorTriangle, "");
  assert.equal(construction.tangentPoint, null);
});
