import assert from "node:assert/strict";
import test from "node:test";

import { createParallelogram, normalizeParallelogramConfig } from "../src/quadrilateral-properties-geometry.js";

const cross = (a, b) => a.x * b.y - a.y * b.x;

test("Drehung, Verschiebung und Verformung erhalten die Parallelogramm-Eigenschaften", () => {
  for (const config of [
    { rotation: 0, shiftX: 0, slant: 0 },
    { rotation: 28, shiftX: 55, slant: -50 },
    { rotation: -35, shiftX: -90, slant: 70 },
    { rotation: 35, shiftX: 90, slant: -70 },
  ]) {
    const model = createParallelogram(config);
    const [ab, bc, cd, da] = model.sideVectors;
    assert.ok(Math.abs(cross(ab, cd)) < 1e-9);
    assert.ok(Math.abs(cross(bc, da)) < 1e-9);
    assert.ok(Math.abs(model.sideLengths[0] - model.sideLengths[2]) < 1e-9);
    assert.ok(Math.abs(model.sideLengths[1] - model.sideLengths[3]) < 1e-9);
    assert.equal(model.invariants.oppositeSidesParallel, true);
    assert.equal(model.invariants.oppositeSidesEqual, true);
    for (const point of model.points) {
      assert.ok(point.x >= 0 && point.x <= 800);
      assert.ok(point.y >= 0 && point.y <= 480);
    }
  }
});

test("Verschiebung ändert nur den Schwerpunkt und Drehung keine Seitenlänge", () => {
  const base = createParallelogram({ rotation: 0, shiftX: 0, slant: 20 });
  const moved = createParallelogram({ rotation: 31, shiftX: 70, slant: 20 });
  assert.equal(Math.round(moved.centroid.x - base.centroid.x), 70);
  assert.equal(Math.round(moved.centroid.y - base.centroid.y), 0);
  assert.deepEqual(moved.sideLengths.map(Math.round), base.sideLengths.map(Math.round));
});

test("Steuerwerte werden endlich, ganzzahlig und innerhalb der sicheren Bühne normalisiert", () => {
  assert.deepEqual(normalizeParallelogramConfig({}), { rotation: 0, shiftX: 0, slant: 0 });
  assert.deepEqual(normalizeParallelogramConfig({ rotation: 90, shiftX: -200, slant: 20.6 }), { rotation: 35, shiftX: -90, slant: 21 });
  assert.deepEqual(normalizeParallelogramConfig({ rotation: Number.NaN, shiftX: "x", slant: Infinity }), { rotation: 0, shiftX: 0, slant: 0 });
});
