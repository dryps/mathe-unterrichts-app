import assert from "node:assert/strict";
import test from "node:test";

import {
  LIKE_TERMS_MERGE_DURATION_MS,
  easeInOutCubic,
  likeTermsMergeFrame,
} from "../src/like-terms-animation.js";

test("die Zusammenführung startet mit getrennten Gruppen", () => {
  assert.equal(LIKE_TERMS_MERGE_DURATION_MS, 1100);
  assert.deepEqual(likeTermsMergeFrame(0), {
    progress: 0,
    shift: 0,
    gap: 1,
    complete: false,
  });
});

test("nach der Hälfte sind Weg und Lücke genau halbiert", () => {
  assert.deepEqual(likeTermsMergeFrame(550), {
    progress: 0.5,
    shift: 0.5,
    gap: 0.5,
    complete: false,
  });
});

test("am Ende sind die Gruppen vollständig zusammengeführt", () => {
  assert.deepEqual(likeTermsMergeFrame(1100), {
    progress: 1,
    shift: 1,
    gap: 0,
    complete: true,
  });
});

test("verspätete Frames liefern deterministisch denselben Endzustand", () => {
  assert.deepEqual(likeTermsMergeFrame(99999), likeTermsMergeFrame(1100));
});

test("kubisches Easing bleibt begrenzt und monoton", () => {
  const samples = [-1, 0, 0.1, 0.25, 0.5, 0.75, 0.9, 1, 2].map(
    easeInOutCubic,
  );

  assert.equal(samples[0], 0);
  assert.equal(samples[1], 0);
  assert.equal(samples[4], 0.5);
  assert.equal(samples.at(-2), 1);
  assert.equal(samples.at(-1), 1);
  for (let index = 1; index < samples.length; index += 1) {
    assert.ok(samples[index] >= samples[index - 1]);
  }
});

test("nicht endliche Animationszeiten werden abgewiesen", () => {
  for (const elapsed of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    assert.throws(() => likeTermsMergeFrame(elapsed), RangeError);
  }
});
