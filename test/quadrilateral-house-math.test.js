import assert from "node:assert/strict";
import test from "node:test";

import { createHouseQuadrilateral, quadrilateralType } from "../src/quadrilateral-house-math.js";

test("die vier Eigenschaftskombinationen ergeben genau Parallelogramm, Rechteck, Raute und Quadrat", () => {
  assert.equal(quadrilateralType(false, false), "Parallelogramm");
  assert.equal(quadrilateralType(true, false), "Rechteck");
  assert.equal(quadrilateralType(false, true), "Raute");
  assert.equal(quadrilateralType(true, true), "Quadrat");
});

test("jede speziellere Figur behält die Parallelogramm-Eigenschaften", () => {
  for (const rightAngles of [false, true]) {
    for (const equalSides of [false, true]) {
      const model = createHouseQuadrilateral({ rightAngles, equalSides });
      assert.equal(model.invariants.oppositeSidesParallel, true);
      assert.equal(model.invariants.oppositeSidesEqual, true);
      assert.equal(model.invariants.fourRightAngles, rightAngles);
      assert.equal(model.invariants.fourEqualSides, equalSides);
      assert.ok(model.points.every(({ x, y }) => x >= 0 && x <= 720 && y >= 0 && y <= 420));
    }
  }
});

test("Quadrat erfüllt gleichzeitig die Definition von Rechteck und Raute", () => {
  const square = createHouseQuadrilateral({ rightAngles: true, equalSides: true });
  assert.equal(square.type, "Quadrat");
  assert.equal(square.isRectangle, true);
  assert.equal(square.isRhombus, true);
  assert.equal(new Set(square.sideLengths.map((length) => length.toFixed(6))).size, 1);
});
