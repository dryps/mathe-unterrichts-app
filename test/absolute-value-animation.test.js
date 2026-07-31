import assert from "node:assert/strict";
import test from "node:test";

import {
  ABSOLUTE_TRANSITION_DURATION_MS,
  absoluteTransitionDuration,
  absoluteTransitionFrame,
  easeInOutCubic,
} from "../src/absolute-value-animation.js";

test("alle Übergänge bleiben ruhig und kurz", () => {
  assert.deepEqual(ABSOLUTE_TRANSITION_DURATION_MS, {
    direction: 820,
    distance: 620,
    opposite: 720,
    free: 460,
  });
  for (const kind of Object.keys(ABSOLUTE_TRANSITION_DURATION_MS)) {
    assert.ok(absoluteTransitionDuration(kind) >= 400);
    assert.ok(absoluteTransitionDuration(kind) <= 900);
  }
});

test("kubisches Easing bleibt begrenzt und symmetrisch", () => {
  assert.equal(easeInOutCubic(-1), 0);
  assert.equal(easeInOutCubic(0), 0);
  assert.equal(easeInOutCubic(0.5), 0.5);
  assert.equal(easeInOutCubic(1), 1);
  assert.equal(easeInOutCubic(2), 1);
});

test("Richtung wächst ruhig von der Null bis minus vier", () => {
  const start = absoluteTransitionFrame(0, "direction");
  const middle = absoluteTransitionFrame(410, "direction");
  const end = absoluteTransitionFrame(820, "direction");
  assert.equal(start.directionProgress, 0);
  assert.equal(middle.directionProgress, 0.5);
  assert.equal(end.directionProgress, 1);
  assert.equal(end.complete, true);
});

test("Abstand, Gegenüberstellung und freier Punkt blenden deterministisch ein", () => {
  for (const kind of ["distance", "opposite", "free"]) {
    assert.equal(absoluteTransitionFrame(0, kind).revealOpacity, 0);
    assert.equal(
      absoluteTransitionFrame(absoluteTransitionDuration(kind), kind).revealOpacity,
      1,
    );
  }
});

test("Endframes sind unabhängig von vergangener Animationszeit direkt erzeugbar", () => {
  for (const kind of Object.keys(ABSOLUTE_TRANSITION_DURATION_MS)) {
    const frame = absoluteTransitionFrame(99999, kind);
    assert.equal(frame.complete, true);
    assert.equal(frame.revealOpacity, 1);
  }
});

test("ungültige Übergänge und Zeiten werden abgewiesen", () => {
  assert.throws(() => absoluteTransitionDuration("unbekannt"), RangeError);
  assert.throws(() => absoluteTransitionFrame(Number.NaN, "free"), RangeError);
});
