import assert from "node:assert/strict";
import test from "node:test";

import {
  ORDER_TRANSITION_DURATION_MS,
  easeInOutCubic,
  orderTransitionDuration,
  orderTransitionFrame,
} from "../src/order-number-line-animation.js";

test("Übergangsdauern bleiben ruhig und kurz", () => {
  assert.equal(orderTransitionDuration("introduction"), 1800);
  assert.equal(orderTransitionDuration("comparison"), 460);
  assert.equal(orderTransitionDuration("free"), 460);
  assert.ok(ORDER_TRANSITION_DURATION_MS.introduction >= 1500);
  assert.ok(ORDER_TRANSITION_DURATION_MS.introduction <= 2000);
});

test("kubisches Easing bleibt begrenzt und symmetrisch", () => {
  assert.equal(easeInOutCubic(-1), 0);
  assert.equal(easeInOutCubic(0), 0);
  assert.equal(easeInOutCubic(0.5), 0.5);
  assert.equal(easeInOutCubic(1), 1);
  assert.equal(easeInOutCubic(2), 1);
});

test("Zahlengerade erscheint vor den beiden gestaffelten Markierungen", () => {
  const axisOnly = orderTransitionFrame(360, "introduction");
  assert.equal(axisOnly.axisOpacity, 1);
  assert.equal(axisOnly.markerEightOpacity, 0);
  assert.equal(axisOnly.markerThreeOpacity, 0);

  const firstMarker = orderTransitionFrame(820, "introduction");
  assert.ok(firstMarker.markerEightOpacity > 0);
  assert.equal(firstMarker.markerThreeOpacity, 0);
  assert.ok(firstMarker.markerEightOffsetY < 72);

  const secondMarker = orderTransitionFrame(1380, "introduction");
  assert.equal(secondMarker.markerEightOpacity, 1);
  assert.ok(secondMarker.markerThreeOpacity > 0);
});

test("Endframe erzeugt direkt die mathematisch feste Zielansicht", () => {
  const frame = orderTransitionFrame(9999, "introduction");
  assert.equal(frame.complete, true);
  assert.equal(frame.axisOpacity, 1);
  assert.equal(frame.markerEightOpacity, 1);
  assert.equal(frame.markerThreeOpacity, 1);
  assert.equal(frame.markerEightOffsetY, 0);
  assert.equal(frame.markerThreeOffsetY, 0);
});

test("Vergleich und freier Punkt werden kontrolliert eingeblendet", () => {
  for (const kind of ["comparison", "free"]) {
    assert.equal(orderTransitionFrame(0, kind).revealOpacity, 0);
    const middle = orderTransitionFrame(230, kind);
    assert.ok(middle.revealOpacity > 0);
    assert.ok(middle.revealOpacity < 1);
    assert.equal(orderTransitionFrame(460, kind).revealOpacity, 1);
    assert.equal(orderTransitionFrame(460, kind).complete, true);
  }
});

test("ungültige Übergänge und Zeiten werden abgewiesen", () => {
  assert.throws(() => orderTransitionDuration("unbekannt"), RangeError);
  assert.throws(() => orderTransitionFrame(Number.NaN, "free"), RangeError);
});
