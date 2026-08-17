import assert from "node:assert/strict";
import test from "node:test";

import {
  TERM_KINDS,
  areLikeTerms,
  combineLikeTerms,
  createTerm,
  formatSum,
  formatTerm,
} from "../src/like-terms-math.js";

test("gleichartige x-Terme addieren ausschließlich ihre Koeffizienten", () => {
  for (const [left, right, expected] of [
    [3, 2, 5],
    [1, 4, 5],
    [4, 4, 8],
  ]) {
    const combined = combineLikeTerms(
      createTerm(TERM_KINDS.x, left),
      createTerm(TERM_KINDS.x, right),
    );
    assert.deepEqual(combined, { kind: "x", coefficient: expected });
  }
});

test("x-Bausteine und Einer sind nicht gleichartig und bleiben getrennt", () => {
  const xTerm = createTerm(TERM_KINDS.x, 3);
  const oneTerm = createTerm(TERM_KINDS.one, 2);

  assert.equal(areLikeTerms(xTerm, oneTerm), false);
  assert.equal(combineLikeTerms(xTerm, oneTerm), null);
  assert.equal(formatSum(xTerm, oneTerm), "3x + 2");
});

test("Gleichartigkeit hängt nur vom Bausteintyp und nie vom Koeffizienten ab", () => {
  assert.equal(
    areLikeTerms(createTerm(TERM_KINDS.x, 1), createTerm(TERM_KINDS.x, 4)),
    true,
  );
  assert.equal(
    areLikeTerms(createTerm(TERM_KINDS.one, 1), createTerm(TERM_KINDS.one, 4)),
    true,
  );
  assert.equal(
    areLikeTerms(createTerm(TERM_KINDS.x, 4), createTerm(TERM_KINDS.one, 4)),
    false,
  );
});

test("Formeln zeigen auch den Koeffizienten eins sichtbar", () => {
  assert.equal(formatTerm(createTerm(TERM_KINDS.x, 1)), "1x");
  assert.equal(formatTerm(createTerm(TERM_KINDS.one, 1)), "1");
  assert.equal(
    formatSum(createTerm(TERM_KINDS.x, 1), createTerm(TERM_KINDS.x, 4)),
    "1x + 4x = 5x",
  );
  assert.equal(
    formatSum(createTerm(TERM_KINDS.x, 4), createTerm(TERM_KINDS.x, 4)),
    "4x + 4x = 8x",
  );
});

test("Termtypen und Koeffizienten werden streng validiert", () => {
  assert.throws(() => createTerm("banana", 2), TypeError);
  for (const coefficient of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => createTerm(TERM_KINDS.x, coefficient), RangeError);
  }
});
