import assert from "node:assert/strict";
import test from "node:test";

import { PROPERTIES_TRANSFORM_DURATION, quadrilateralTransformFrame } from "../src/quadrilateral-properties-animation.js";

test("die kombinierte Veränderung beginnt und endet exakt", () => {
  assert.deepEqual(quadrilateralTransformFrame(0).config, { rotation: 0, shiftX: 0, slant: 0 });
  assert.deepEqual(quadrilateralTransformFrame(PROPERTIES_TRANSFORM_DURATION).config, { rotation: 28, shiftX: 55, slant: -50 });
  assert.equal(quadrilateralTransformFrame(PROPERTIES_TRANSFORM_DURATION).complete, true);
});

test("alle drei Veränderungen laufen ruhig und monoton", () => {
  const frames = [0, 275, 550, 825, PROPERTIES_TRANSFORM_DURATION].map(quadrilateralTransformFrame);
  for (let index = 1; index < frames.length; index += 1) {
    assert.ok(frames[index].config.rotation >= frames[index - 1].config.rotation);
    assert.ok(frames[index].config.shiftX >= frames[index - 1].config.shiftX);
    assert.ok(frames[index].config.slant <= frames[index - 1].config.slant);
  }
});

test("ungültige Animationszeiten werden abgewiesen", () => {
  assert.throws(() => quadrilateralTransformFrame(-1), /negativ/);
  assert.throws(() => quadrilateralTransformFrame(Number.NaN), /endlich/);
});
