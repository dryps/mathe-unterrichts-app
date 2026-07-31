import assert from "node:assert/strict";
import test from "node:test";

import {
  TRIANGLE_COMPARE_DURATION_MS,
  animationPreservesSideLengths,
  comparisonAnimationFrame,
  easeInOutCubic,
} from "../src/unique-triangles-animation.js";
import {
  buildSssGeometry,
  distance,
  pointWithinBoard,
  UNIQUE_PROTECTION_LIMITS,
} from "../src/unique-triangles-geometry.js";

function closePoint(actual, expected, tolerance = 1e-7) {
  assert.ok(distance(actual, expected) <= tolerance);
}

test("Spiegelvergleich dauert ruhig zwischen 1,3 und 1,8 Sekunden", () => {
  assert.ok(TRIANGLE_COMPARE_DURATION_MS >= 1300);
  assert.ok(TRIANGLE_COMPARE_DURATION_MS <= 1800);
});

test("Easing beginnt und endet exakt", () => {
  assert.equal(easeInOutCubic(0), 0);
  assert.equal(easeInOutCubic(1), 1);
  assert.equal(easeInOutCubic(-1), 0);
  assert.equal(easeInOutCubic(2), 1);
});

test("Animationsanfang ist exakt das untere Dreieck", () => {
  const geometry = buildSssGeometry();
  const frame = comparisonAnimationFrame(
    0,
    geometry.lowerTriangle,
    geometry.upperTriangle,
  );
  frame.points.forEach((point, index) =>
    closePoint(point, geometry.lowerTriangle[index]),
  );
  assert.equal(frame.complete, false);
});

test("jeder Animationsframe bleibt ein starres kongruentes Dreieck", () => {
  const geometry = buildSssGeometry();
  for (const progress of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
    const frame = comparisonAnimationFrame(
      TRIANGLE_COMPARE_DURATION_MS * progress,
      geometry.lowerTriangle,
      geometry.upperTriangle,
    );
    assert.equal(
      animationPreservesSideLengths(frame, geometry.lowerTriangle),
      true,
    );
  }
});

test("die vollständige Spiegelbewegung bleibt mit Sicherheitsrand sichtbar", () => {
  const geometry = buildSssGeometry();
  for (let step = 0; step <= 100; step += 1) {
    const frame = comparisonAnimationFrame(
      TRIANGLE_COMPARE_DURATION_MS * (step / 100),
      geometry.lowerTriangle,
      geometry.upperTriangle,
    );
    assert.equal(
      frame.points.every((point) =>
        pointWithinBoard(
          point,
          UNIQUE_PROTECTION_LIMITS.minimumAnimationInset,
        ),
      ),
      true,
    );
  }
});

test("Animationsendzustand liegt als Punktmenge exakt auf dem oberen Dreieck", () => {
  const geometry = buildSssGeometry();
  const frame = comparisonAnimationFrame(
    TRIANGLE_COMPARE_DURATION_MS,
    geometry.lowerTriangle,
    geometry.upperTriangle,
  );
  const sortedFrame = [...frame.points].sort((a, b) => a.x - b.x || a.y - b.y);
  const sortedUpper = [...geometry.upperTriangle].sort(
    (a, b) => a.x - b.x || a.y - b.y,
  );
  sortedFrame.forEach((point, index) => closePoint(point, sortedUpper[index]));
  assert.equal(frame.complete, true);
});

test("ungültige Animationszeiten werden kontrolliert abgelehnt", () => {
  const geometry = buildSssGeometry();
  assert.throws(() =>
    comparisonAnimationFrame(
      Number.NaN,
      geometry.lowerTriangle,
      geometry.upperTriangle,
    ),
  );
  assert.throws(() =>
    comparisonAnimationFrame(
      10,
      geometry.lowerTriangle,
      geometry.upperTriangle,
      0,
    ),
  );
});
