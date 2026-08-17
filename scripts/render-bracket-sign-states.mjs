import assert from "node:assert/strict";

import { bracketSignActionFrame } from "../src/bracket-sign-animation.js";
import { createBracketSignModel } from "../src/bracket-sign-math.js";
import { BRACKET_SIGN_VIEWS, bracketSignViewModel, createBracketSignState } from "../src/bracket-sign-state.js";

const states = [
  createBracketSignState(),
  { view: BRACKET_SIGN_VIEWS.package, outerFactor: -1, locked: false },
  { view: BRACKET_SIGN_VIEWS.plus, outerFactor: -1, locked: false },
  { view: BRACKET_SIGN_VIEWS.acting, outerFactor: -1, locked: true },
  { view: BRACKET_SIGN_VIEWS.minus, outerFactor: -1, locked: false },
  { view: BRACKET_SIGN_VIEWS.comparison, outerFactor: -1, locked: false },
  { view: BRACKET_SIGN_VIEWS.explore, outerFactor: -1, locked: false },
  { view: BRACKET_SIGN_VIEWS.conclusion, outerFactor: 1, locked: false },
];

const render = (state) => {
  const model = bracketSignViewModel(state);
  return `<section data-state="${state.view}" data-locked="${state.locked}">
    <p data-factor="${model.outerFactor}">${model.multiplicationExpression}</p>
    <p data-terms>${model.resultLabels.join(" | ")}</p>
    <p data-result>${model.resultExpression}</p>
    <p data-insight>${model.insight}</p>
  </section>`;
};

let rendered = 0;
for (const state of states) {
  const first = render(state);
  assert.equal(first, render({ ...state }));
  assert.doesNotMatch(first, /undefined|NaN|Infinity/);
  assert.match(first, /x/);
  rendered += 1;
}

for (const factor of [-1, 1]) {
  const model = createBracketSignModel(factor);
  assert.deepEqual(model.resultTerms, factor === -1 ? [-1, 3] : [1, -3]);
  assert.match(render({ view: BRACKET_SIGN_VIEWS.conclusion, outerFactor: factor, locked: false }), /data-result/);
  rendered += 1;
}

let previous = bracketSignActionFrame(0);
for (const elapsed of [250, 500, 750, 1000]) {
  const frame = bracketSignActionFrame(elapsed);
  assert.ok(frame.reach >= previous.reach);
  assert.ok(frame.flip >= previous.flip);
  previous = frame;
  rendered += 1;
}

assert.equal(rendered, 14);
console.log(`${rendered}/${rendered} Plus-Minus-Klammer-Zustände gerendert`);
