import assert from "node:assert/strict";
import test from "node:test";

import {
  TERM_MULTIPLICATION_FILL_DURATION_MS,
  easeInOutCubic,
  termMultiplicationFillFrame,
} from "../src/term-multiplication-animation.js";

test("Füllframes sind am Anfang, in der Mitte und am Ende exakt begrenzt", () => {
  assert.equal(TERM_MULTIPLICATION_FILL_DURATION_MS, 900);
  assert.deepEqual(termMultiplicationFillFrame(-20), {
    progress: 0,
    eased: 0,
    fillScale: 0,
    fillOpacity: 0.18,
    complete: false,
  });

  assert.deepEqual(termMultiplicationFillFrame(450), {
    progress: 0.5,
    eased: 0.5,
    fillScale: 0.5,
    fillOpacity: 0.59,
    complete: false,
  });

  assert.deepEqual(termMultiplicationFillFrame(900), {
    progress: 1,
    eased: 1,
    fillScale: 1,
    fillOpacity: 1,
    complete: true,
  });
  assert.deepEqual(termMultiplicationFillFrame(5000), termMultiplicationFillFrame(900));
});

test("Easing und Füllung wachsen monoton und bleiben endlich", () => {
  let previous = -1;
  for (let elapsed = 0; elapsed <= 900; elapsed += 15) {
    const frame = termMultiplicationFillFrame(elapsed);
    assert.ok(Number.isFinite(frame.fillScale));
    assert.ok(frame.fillScale >= previous);
    assert.ok(frame.fillScale >= 0 && frame.fillScale <= 1);
    previous = frame.fillScale;
  }
});

test("kubisches Easing begrenzt auch ungültige Randwerte", () => {
  assert.equal(easeInOutCubic(-1), 0);
  assert.equal(easeInOutCubic(0), 0);
  assert.equal(easeInOutCubic(0.5), 0.5);
  assert.equal(easeInOutCubic(1), 1);
  assert.equal(easeInOutCubic(2), 1);
  assert.equal(easeInOutCubic(Number.NaN), 0);
});
