import assert from "node:assert/strict";

import { EQUIVALENCE_TILT_DURATION, balanceTilt, equivalenceTiltFrame } from "../src/equivalence-animation.js";
import { EQUIVALENCE_VIEWS, createEquivalenceState, equivalenceViewModel } from "../src/equivalence-state.js";

const states = [
  createEquivalenceState(),
  ...Object.values(EQUIVALENCE_VIEWS).filter((view) => view !== EQUIVALENCE_VIEWS.irritation).map((view) => ({ view, delta: view === EQUIVALENCE_VIEWS.conclusion ? 4 : -5 })),
];
const render = (state) => {
  const model = equivalenceViewModel(state);
  return `<section data-state="${state.view}" data-balanced="${model.balanced}" style="--tilt:${balanceTilt(model.leftValue, model.rightValue)}deg"><p>${model.equation}</p><p>${model.leftValue}:${model.rightValue}</p><p>${model.insight}</p></section>`;
};

let rendered = 0;
for (const state of states) {
  const first = render(state);
  assert.equal(first, render({ ...state }));
  assert.doesNotMatch(first, /undefined|NaN|Infinity/);
  assert.match(first, /data-balanced="(?:true|false)"/);
  rendered += 1;
}
for (const delta of [-8, -5, 0, 4, 8]) {
  const output = render({ view: EQUIVALENCE_VIEWS.conclusion, delta });
  assert.match(output, /data-balanced="true"/);
  rendered += 1;
}
for (const elapsed of [0, EQUIVALENCE_TILT_DURATION / 2, EQUIVALENCE_TILT_DURATION]) {
  const frame = equivalenceTiltFrame(elapsed, 0, 6);
  assert.ok(frame.tilt >= 0 && frame.tilt <= 6);
  rendered += 1;
}
assert.equal(rendered, 15);
console.log(`${rendered}/${rendered} Äquivalenzumformungs-Zustände gerendert`);
