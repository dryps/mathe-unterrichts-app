import assert from "node:assert/strict";

import { likeTermsMergeFrame } from "../src/like-terms-animation.js";
import { TERM_KINDS, createTerm, formatSum } from "../src/like-terms-math.js";
import {
  LIKE_TERM_VIEWS,
  createLikeTermsState,
  likeTermsViewModel,
} from "../src/like-terms-state.js";

const states = [
  createLikeTermsState(),
  { view: LIKE_TERM_VIEWS.groups, first: 3, second: 2, locked: false },
  { view: LIKE_TERM_VIEWS.merging, first: 3, second: 2, locked: true },
  { view: LIKE_TERM_VIEWS.combined, first: 3, second: 2, locked: false },
  { view: LIKE_TERM_VIEWS.counterexample, first: 3, second: 2, locked: false },
  { view: LIKE_TERM_VIEWS.comparison, first: 3, second: 2, locked: false },
  { view: LIKE_TERM_VIEWS.explore, first: 3, second: 2, locked: false },
  { view: LIKE_TERM_VIEWS.conclusion, first: 4, second: 2, locked: false },
];

function blocks(kind, count) {
  const label = kind === TERM_KINDS.x ? "x" : "1";
  return Array.from(
    { length: count },
    () => `<span data-block="${kind}">${label}</span>`,
  ).join("");
}

function renderState(state) {
  const model = likeTermsViewModel(state);
  return `<section data-state="${state.view}" data-locked="${state.locked}">
    <p data-formula>${model.formula}</p>
    <div data-first>${blocks(TERM_KINDS.x, state.first)}</div>
    <div data-second>${blocks(TERM_KINDS.x, state.second)}</div>
    <div data-unlike>${blocks(TERM_KINDS.x, 3)}${blocks(TERM_KINDS.one, 2)}</div>
    <p data-insight>${model.insight}</p>
  </section>`;
}

let rendered = 0;
for (const state of states) {
  const output = renderState(state);
  assert.doesNotMatch(output, /undefined|NaN/);
  assert.match(output, /3x \+ 2x = 5x|4x \+ 2x = 6x/);
  assert.equal((output.match(/data-block="one"/g) ?? []).length, 2);
  rendered += 1;
}

for (let first = 1; first <= 4; first += 1) {
  for (let second = 1; second <= 4; second += 1) {
    const output = renderState({
      view: LIKE_TERM_VIEWS.conclusion,
      first,
      second,
      locked: false,
    });
    const expected = formatSum(
      createTerm(TERM_KINDS.x, first),
      createTerm(TERM_KINDS.x, second),
    );
    assert.match(output, new RegExp(expected.replaceAll("+", "\\+")));
    assert.equal((output.match(/data-block="x"/g) ?? []).length, first + second + 3);
    rendered += 1;
  }
}

for (const elapsed of [0, 275, 550, 825, 1100]) {
  const frame = likeTermsMergeFrame(elapsed);
  assert.equal(Number.isFinite(frame.shift), true);
  assert.equal(Number.isFinite(frame.gap), true);
  assert.equal(frame.shift + frame.gap, 1);
  rendered += 1;
}

assert.equal(rendered, 29);
console.log(`${rendered}/${rendered} Gleichartige-Terme-Zustände gerendert`);
