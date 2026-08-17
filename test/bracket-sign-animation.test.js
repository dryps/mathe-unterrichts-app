import assert from "node:assert/strict";
import test from "node:test";

import {
  BRACKET_SIGN_ACTION_DURATION,
  bracketSignActionFrame,
} from "../src/bracket-sign-animation.js";

test("Minuswirkung erreicht beide Terme gleichzeitig in einer Sekunde", () => {
  assert.equal(BRACKET_SIGN_ACTION_DURATION, 1000);
  assert.deepEqual(bracketSignActionFrame(0), {
    progress: 0,
    reach: 0,
    flip: 0,
    complete: false,
  });
  assert.deepEqual(bracketSignActionFrame(1000), {
    progress: 1,
    reach: 1,
    flip: 1,
    complete: true,
  });
});

test("Erreichen und Vorzeichenwechsel bleiben monoton und gekoppelt", () => {
  let previous = bracketSignActionFrame(0);
  for (const elapsed of [125, 250, 500, 750, 1000]) {
    const frame = bracketSignActionFrame(elapsed);
    assert.ok(frame.reach >= previous.reach);
    assert.ok(frame.flip >= previous.flip);
    assert.ok(frame.reach >= frame.flip);
    assert.ok(Object.isFrozen(frame));
    previous = frame;
  }
});

test("verspätete Frames enden deterministisch und ungültige Zeiten werden abgewiesen", () => {
  assert.deepEqual(bracketSignActionFrame(4000), bracketSignActionFrame(1000));
  for (const elapsed of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => bracketSignActionFrame(elapsed), /Animationszeit/);
  }
});
