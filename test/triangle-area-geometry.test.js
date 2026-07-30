import assert from "node:assert/strict";
import test from "node:test";

import {
  APEX_LIMITS,
  AREA_BOARD,
  INITIAL_APEX,
  areParallel,
  buildTriangleAreaGeometry,
  clampApex,
  polygonArea,
  sideLengths,
  vector,
} from "../src/triangle-area-geometry.js";

const ALLOWED_APEXES = [
  INITIAL_APEX,
  { x: APEX_LIMITS.minX, y: APEX_LIMITS.minY },
  { x: APEX_LIMITS.maxX, y: APEX_LIMITS.minY },
  { x: APEX_LIMITS.minX, y: APEX_LIMITS.maxY },
  { x: APEX_LIMITS.maxX, y: APEX_LIMITS.maxY },
  { x: 470, y: 330 },
];

test("Original und ergänzte Kopie sind für mehrere Spitzenpositionen kongruent", () => {
  for (const apex of ALLOWED_APEXES) {
    const geometry = buildTriangleAreaGeometry(apex);
    assert.deepEqual(
      sideLengths(geometry.original).map((length) => Number(length.toFixed(8))),
      sideLengths(geometry.copy).map((length) => Number(length.toFixed(8))),
    );
  }
});

test("gemeinsames Außenviereck ist für mehrere Spitzenpositionen ein Parallelogramm", () => {
  for (const apex of ALLOWED_APEXES) {
    const { left, right, apex: topLeft, fourth } = buildTriangleAreaGeometry(apex);
    assert.ok(areParallel(vector(left, right), vector(topLeft, fourth)));
    assert.ok(areParallel(vector(left, topLeft), vector(right, fourth)));
  }
});

test("gegenüberliegende Seiten sind gleich lang", () => {
  const { left, right, apex, fourth } = buildTriangleAreaGeometry();
  assert.equal(
    Math.hypot(right.x - left.x, right.y - left.y),
    Math.hypot(fourth.x - apex.x, fourth.y - apex.y),
  );
  assert.equal(
    Math.hypot(apex.x - left.x, apex.y - left.y),
    Math.hypot(fourth.x - right.x, fourth.y - right.y),
  );
});

test("Höhe steht senkrecht auf der festen horizontalen Grundseite", () => {
  for (const apex of ALLOWED_APEXES) {
    const geometry = buildTriangleAreaGeometry(apex);
    const base = vector(geometry.left, geometry.right);
    const height = vector(geometry.apex, geometry.heightFoot);
    assert.equal(base.x * height.x + base.y * height.y, 0);
    assert.equal(geometry.heightFoot.y, geometry.left.y);
  }
});

test("Parallelogrammfläche ist exakt doppelt so groß wie Dreiecksfläche", () => {
  for (const apex of ALLOWED_APEXES) {
    const geometry = buildTriangleAreaGeometry(apex);
    assert.equal(geometry.parallelogramArea, 2 * geometry.triangleArea);
    assert.equal(geometry.parallelogramArea, geometry.baseLength * geometry.height);
  }
});

test("Flächenberechnung ist unabhängig von der Reihenfolge im Uhrzeigersinn", () => {
  const geometry = buildTriangleAreaGeometry();
  assert.equal(polygonArea(geometry.parallelogram), geometry.parallelogramArea);
  assert.equal(
    polygonArea([...geometry.parallelogram].reverse()),
    geometry.parallelogramArea,
  );
});

test("Schutzgrenzen halten die Spitze oberhalb und den Höhenfuß innerhalb der Grundseite", () => {
  const geometry = buildTriangleAreaGeometry({ x: -500, y: 900 });
  assert.deepEqual(geometry.apex, {
    x: APEX_LIMITS.minX,
    y: APEX_LIMITS.maxY,
  });
  assert.ok(geometry.apex.y < AREA_BOARD.baseLeft.y);
  assert.ok(geometry.heightFoot.x > AREA_BOARD.baseLeft.x);
  assert.ok(geometry.heightFoot.x < AREA_BOARD.baseRight.x);
});

test("entgegengesetzte Grenzüberschreitungen werden ebenfalls sicher geklemmt", () => {
  assert.deepEqual(clampApex({ x: 5000, y: -1000 }), {
    x: APEX_LIMITS.maxX,
    y: APEX_LIMITS.minY,
  });
});

test("rechter Winkel bleibt vollständig und sichtbar definiert", () => {
  for (const apex of ALLOWED_APEXES) {
    const { rightAngle, heightFoot } = buildTriangleAreaGeometry(apex);
    assert.equal(rightAngle.length, 3);
    assert.equal(rightAngle[0].x, heightFoot.x);
    assert.equal(rightAngle[2].y, heightFoot.y);
  }
});

test("Zielpunkt der Kopie wird direkt aus der Parallelogrammgeometrie erzeugt", () => {
  const { left, right, apex, fourth, copy } = buildTriangleAreaGeometry();
  assert.deepEqual(fourth, {
    x: right.x + apex.x - left.x,
    y: apex.y,
  });
  assert.deepEqual(copy, [right, fourth, apex]);
});
