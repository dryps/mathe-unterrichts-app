import assert from "node:assert/strict";
import test from "node:test";

import { DISTRIBUTION_COPY_DURATION, distributionCopyFrame } from "../src/distribution-animation.js";

test("drei vollständige Pakete erscheinen ruhig in 1,1 Sekunden", () => {
  assert.equal(DISTRIBUTION_COPY_DURATION, 1100);
  assert.deepEqual(distributionCopyFrame(0, 3), { progress: 0, packageProgress: [0, 0, 0], complete: false });
  assert.deepEqual(distributionCopyFrame(1100, 3), { progress: 1, packageProgress: [1, 1, 1], complete: true });
});

test("Pakete erscheinen nacheinander und bleiben monoton vollständig", () => {
  let previous = [0, 0, 0];
  for (const elapsed of [100, 275, 550, 825, 1100]) {
    const frame = distributionCopyFrame(elapsed, 3);
    frame.packageProgress.forEach((value, index) => {
      assert.ok(value >= previous[index] && value >= 0 && value <= 1);
      if (index > 0) assert.ok(frame.packageProgress[index - 1] >= value);
    });
    previous = frame.packageProgress;
  }
});

test("alle erlaubten Paketanzahlen und verspätete Frames bleiben deterministisch", () => {
  for (let factor = 2; factor <= 5; factor += 1) {
    assert.equal(distributionCopyFrame(500, factor).packageProgress.length, factor);
    assert.deepEqual(distributionCopyFrame(5000, factor), distributionCopyFrame(1100, factor));
  }
});

test("ungültige Zeiten und Faktoren werden kontrolliert abgewiesen", () => {
  for (const elapsed of [-1, Number.NaN, Number.POSITIVE_INFINITY]) assert.throws(() => distributionCopyFrame(elapsed, 3), /Animationszeit/);
  for (const factor of [1, 6, 2.5, Number.NaN]) assert.throws(() => distributionCopyFrame(200, factor), /Faktor/);
});
