import assert from "node:assert/strict";
import test from "node:test";

import { BOTH_SIDES_REMOVAL_DURATION, bothSidesRemovalFrame } from "../src/both-sides-animation.js";

test("beide gleichen Termgruppen verschwinden synchron in 900 Millisekunden", () => {
  assert.deepEqual(bothSidesRemovalFrame(0), { progress: 0, opacity: 1, lift: 0, complete: false });
  assert.deepEqual(bothSidesRemovalFrame(BOTH_SIDES_REMOVAL_DURATION), { progress: 1, opacity: 0, lift: -24, complete: true });
});

test("Entfernung bleibt monoton, synchron und bei verspäteten Frames deterministisch", () => {
  let previous = 1;
  for (const elapsed of [0, 225, 450, 675, 900, 2000]) {
    const frame = bothSidesRemovalFrame(elapsed);
    assert.ok(frame.opacity <= previous);
    previous = frame.opacity;
  }
});

test("ungültige Zeiten werden abgewiesen", () => {
  assert.throws(() => bothSidesRemovalFrame(-1), /Zeit/);
  assert.throws(() => bothSidesRemovalFrame(Number.NaN), /Zeit/);
});
