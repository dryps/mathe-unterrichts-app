import assert from "node:assert/strict";
import test from "node:test";

import {
  COPY_ANIMATION_DURATION_MS,
  copyAnimationFrame,
  easeInOutCubic,
} from "../src/triangle-area-animation.js";
import { buildTriangleAreaGeometry } from "../src/triangle-area-geometry.js";

const { rotationCenter } = buildTriangleAreaGeometry();

test("Animation dauert ruhig 1,7 Sekunden", () => {
  assert.equal(COPY_ANIMATION_DURATION_MS, 1700);
});

test("Kopie startet deckungsgleich ohne Drehung und halbtransparent", () => {
  const frame = copyAnimationFrame(0, rotationCenter);
  assert.equal(frame.angle, 0);
  assert.equal(frame.opacity, 0.42);
  assert.equal(frame.complete, false);
  assert.match(frame.transform, /^rotate\(0\.000 /);
});

test("Kopie bewegt und dreht sich zur Halbzeit sanft", () => {
  const frame = copyAnimationFrame(COPY_ANIMATION_DURATION_MS / 2, rotationCenter);
  assert.equal(frame.progress, 0.5);
  assert.equal(frame.angle, 90);
  assert.ok(frame.opacity > 0.42 && frame.opacity < 0.92);
});

test("Animation endet exakt bei 180 Grad", () => {
  const frame = copyAnimationFrame(COPY_ANIMATION_DURATION_MS, rotationCenter);
  assert.equal(frame.progress, 1);
  assert.equal(frame.angle, 180);
  assert.ok(Math.abs(frame.opacity - 0.92) < 1e-12);
  assert.equal(frame.complete, true);
  assert.match(frame.transform, /^rotate\(180\.000 /);
});

test("Endframe bleibt bei verspäteten Browserframes deterministisch", () => {
  const frame = copyAnimationFrame(COPY_ANIMATION_DURATION_MS * 3, rotationCenter);
  assert.equal(frame.progress, 1);
  assert.equal(frame.angle, 180);
  assert.equal(frame.complete, true);
});

test("Easing bleibt monoton und in den Grenzen null bis eins", () => {
  const values = Array.from({ length: 21 }, (_, index) => easeInOutCubic(index / 20));
  assert.equal(values[0], 0);
  assert.equal(values.at(-1), 1);
  values.forEach((value, index) => {
    assert.ok(value >= 0 && value <= 1);
    if (index > 0) assert.ok(value >= values[index - 1]);
  });
});
