import assert from "node:assert/strict";
import { SOLUTION_REVEAL_DURATION, solutionRevealFrame } from "../src/solution-set-animation.js";
import { createSolutionSetModel, solutionLinePercent } from "../src/solution-set-math.js";
import { SOLUTION_SET_VIEWS, createSolutionSetState, solutionSetViewModel } from "../src/solution-set-state.js";

const states = [
  createSolutionSetState(),
  { view: SOLUTION_SET_VIEWS.testing, x: 4, locked: false, hasTested: false },
  { view: SOLUTION_SET_VIEWS.boundary, x: 2, locked: false, hasTested: true },
  { view: SOLUTION_SET_VIEWS.revealing, x: 2, locked: true, hasTested: true },
  { view: SOLUTION_SET_VIEWS.solution, x: 2, locked: false, hasTested: true },
  { view: SOLUTION_SET_VIEWS.explore, x: 2, locked: false, hasTested: true },
  { view: SOLUTION_SET_VIEWS.conclusion, x: 5, locked: false, hasTested: true },
];
const render = (state) => {
  const model = solutionSetViewModel(state);
  return `<section data-state="${state.view}" data-x="${model.x}" data-solution="${model.isSolution}"><p>${model.sourceEquation}</p><p>${model.testedComparison}</p><p>${model.solutionInequality}</p><i>${solutionLinePercent(model.x)}</i><p>${model.insight}</p></section>`;
};
let rendered = 0;
for (const state of states) {
  const first = render(state);
  assert.equal(first, render({ ...state }));
  assert.doesNotMatch(first, /undefined|NaN|Infinity/);
  assert.match(first, /2x < 6/);
  rendered += 1;
}
for (let x = -2; x <= 6; x += 1) {
  const model = createSolutionSetModel(x);
  assert.equal(model.isSolution, x < 3);
  assert.equal(model.left, 2 * x);
  rendered += 1;
}
let previous = -1;
for (const elapsed of [0, 200, 400, 600, SOLUTION_REVEAL_DURATION]) {
  const frame = solutionRevealFrame(elapsed);
  assert.ok(frame.progress >= previous);
  previous = frame.progress;
  rendered += 1;
}
assert.equal(rendered, 21);
console.log(`${rendered}/${rendered} Lösungsmengen-Zustände gerendert`);
