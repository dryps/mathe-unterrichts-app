import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateQuadrilateralAngles,
  createAngleSumQuadrilateral,
  isStrictlyConvex,
  roundAnglesTo360,
  splitByDiagonal,
} from "../src/quadrilateral-angle-sum-math.js";

const sum = (values) => values.reduce((total, value) => total + value, 0);

test("die gesamte Reglerfamilie bleibt streng konvex und in der Zeichenfläche", () => {
  for (let step = -100; step <= 100; step += 2) {
    const points = createAngleSumQuadrilateral(step);
    assert.equal(isStrictlyConvex(points), true);
    for (const point of points) {
      assert.ok(point.x >= 80 && point.x <= 920);
      assert.ok(point.y >= 70 && point.y <= 570);
    }
  }
});

test("die vier Innenwinkel ändern sich, ergeben aber immer präzise 360 Grad", () => {
  const samples = [-100, -65, -20, 0, 35, 80, 100];
  const signatures = new Set();
  for (const position of samples) {
    const angles = calculateQuadrilateralAngles(createAngleSumQuadrilateral(position));
    assert.equal(angles.length, 4);
    assert.ok(angles.every((angle) => angle > 0 && angle < 180));
    assert.ok(Math.abs(sum(angles) - 360) < 1e-8);
    const visible = roundAnglesTo360(angles);
    assert.equal(sum(visible), 360);
    signatures.add(visible.join(","));
  }
  assert.ok(signatures.size >= 5);
});

test("die Diagonale AC zerlegt jedes Modell in zwei Dreiecke mit je 180 Grad", () => {
  for (const position of [-100, -50, 0, 50, 100]) {
    const split = splitByDiagonal(createAngleSumQuadrilateral(position));
    assert.deepEqual(split.first.indices, [0, 1, 2]);
    assert.deepEqual(split.second.indices, [0, 2, 3]);
    assert.ok(Math.abs(sum(split.first.angles) - 180) < 1e-8);
    assert.ok(Math.abs(sum(split.second.angles) - 180) < 1e-8);
  }
});

test("ungültige Eingaben werden abgewiesen", () => {
  assert.throws(() => createAngleSumQuadrilateral(101), /zwischen -100 und 100/);
  assert.throws(() => createAngleSumQuadrilateral(Number.NaN), /endlich/);
  assert.throws(() => calculateQuadrilateralAngles([{ x: 0, y: 0 }]), /vier Eckpunkte/);
  assert.throws(() => roundAnglesTo360([90, 90, 180]), /vier positive/);
});
