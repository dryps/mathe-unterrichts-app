import assert from "node:assert/strict";
import test from "node:test";

import {
  createFixedParallelogram,
  createMovableParallelogram,
  parallelogramInvariants,
  sideLength,
  vertexAngle,
} from "../src/unique-quadrilateral-math.js";

test("jede Reglerlage ist ein echtes konvexes Parallelogramm", () => {
  for (let shear = -120; shear <= 120; shear += 2) {
    const model = createMovableParallelogram(shear);
    assert.deepEqual(parallelogramInvariants(model.points), {
      convex: true,
      oppositeSidesParallel: true,
      oppositeSidesEqual: true,
    });
    assert.ok(model.points.every(({ x, y }) => x >= 70 && x <= 930 && y >= 90 && y <= 550));
  }
});

test("die abhängigen Eigenschaften lassen viele nicht kongruente Formen zu", () => {
  const left = createMovableParallelogram(-110);
  const center = createMovableParallelogram(0);
  const right = createMovableParallelogram(110);
  assert.notEqual(sideLength(left.points[0], left.points[3]), sideLength(center.points[0], center.points[3]));
  assert.notEqual(vertexAngle(left.points, 0), vertexAngle(right.points, 0));
  for (const model of [left, center, right]) {
    assert.equal(parallelogramInvariants(model.points).oppositeSidesEqual, true);
  }
});

test("6 cm, 4 cm und der eingeschlossene Winkel 70 Grad erzeugen die feste Figur", () => {
  const fixed = createFixedParallelogram();
  assert.ok(Math.abs(sideLength(fixed.points[0], fixed.points[1]) - 600) < 1e-8);
  assert.ok(Math.abs(sideLength(fixed.points[0], fixed.points[3]) - 400) < 1e-8);
  assert.ok(Math.abs(vertexAngle(fixed.points, 0) - 70) < 1e-8);
  assert.deepEqual(parallelogramInvariants(fixed.points), {
    convex: true,
    oppositeSidesParallel: true,
    oppositeSidesEqual: true,
  });
});

test("Grenzen und ungültige Punktmengen werden kontrolliert abgewiesen", () => {
  assert.throws(() => createMovableParallelogram(121), /zwischen -120 und 120/);
  assert.throws(() => createMovableParallelogram(Number.NaN), /endlich/);
  assert.throws(() => vertexAngle([{ x: 0, y: 0 }], 0), /vier Eckpunkte/);
});
