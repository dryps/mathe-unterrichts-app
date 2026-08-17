import assert from "node:assert/strict";
import test from "node:test";

import {
  TERM_DIVISION_BUILD_DURATION,
  termDivisionBuildFrame,
} from "../src/term-division-animation.js";

test("Gruppenaufbau dauert ruhig genau eine Sekunde", () => {
  assert.equal(TERM_DIVISION_BUILD_DURATION, 1000);
  assert.deepEqual(termDivisionBuildFrame(0, 3), {
    progress: 0,
    packageProgress: [0, 0, 0],
    complete: false,
  });
  assert.deepEqual(termDivisionBuildFrame(1000, 3), {
    progress: 1,
    packageProgress: [1, 1, 1],
    complete: true,
  });
});

test("Pakete erscheinen nacheinander und bleiben monoton sichtbar", () => {
  let previous = [0, 0, 0];
  for (const elapsed of [0, 125, 250, 500, 750, 1000]) {
    const frame = termDivisionBuildFrame(elapsed, 3);
    for (let index = 0; index < 3; index += 1) {
      assert.ok(frame.packageProgress[index] >= previous[index]);
      assert.ok(frame.packageProgress[index] >= 0);
      assert.ok(frame.packageProgress[index] <= 1);
    }
    assert.ok(frame.packageProgress[0] >= frame.packageProgress[1]);
    assert.ok(frame.packageProgress[1] >= frame.packageProgress[2]);
    previous = frame.packageProgress;
  }
});

test("Endframe bleibt bei verspäteten Browserframes deterministisch", () => {
  assert.deepEqual(termDivisionBuildFrame(4000, 5), termDivisionBuildFrame(1000, 5));
});

test("jede erlaubte Gruppenanzahl erzeugt exakt einen Fortschritt pro Paket", () => {
  for (let groups = 2; groups <= 5; groups += 1) {
    const frame = termDivisionBuildFrame(500, groups);
    assert.equal(frame.packageProgress.length, groups);
    assert.ok(Object.isFrozen(frame.packageProgress));
    assert.ok(Object.isFrozen(frame));
  }
});

test("ungültige Zeiten und Gruppenzahlen werden kontrolliert abgewiesen", () => {
  for (const elapsed of [Number.NaN, Number.POSITIVE_INFINITY, -1]) {
    assert.throws(() => termDivisionBuildFrame(elapsed, 3), /Animationszeit/);
  }
  for (const groups of [1, 6, 2.5, Number.NaN]) {
    assert.throws(() => termDivisionBuildFrame(200, groups), /Gruppenanzahl/);
  }
});
