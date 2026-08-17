import assert from "node:assert/strict";

import { termDivisionBuildFrame } from "../src/term-division-animation.js";
import { createTermDivisionModel } from "../src/term-division-math.js";
import {
  TERM_DIVISION_VIEWS,
  createTermDivisionState,
  termDivisionViewModel,
} from "../src/term-division-state.js";

const states = [
  createTermDivisionState(),
  { view: TERM_DIVISION_VIEWS.factors, groups: 3, locked: false },
  { view: TERM_DIVISION_VIEWS.building, groups: 3, locked: true },
  { view: TERM_DIVISION_VIEWS.groups, groups: 3, locked: false },
  { view: TERM_DIVISION_VIEWS.division, groups: 3, locked: false },
  { view: TERM_DIVISION_VIEWS.result, groups: 3, locked: false },
  { view: TERM_DIVISION_VIEWS.explore, groups: 3, locked: false },
  { view: TERM_DIVISION_VIEWS.conclusion, groups: 5, locked: false },
];

function renderState(state) {
  const model = termDivisionViewModel(state);
  const packages = model.packages
    .map((units, index) => `<li data-group="${index + 1}">${units.join(" · ")}</li>`)
    .join("");
  return `<section data-state="${state.view}" data-locked="${state.locked}">
    <p data-division>${model.divisionExpression}</p>
    <ul data-groups="${model.groups}">${packages}</ul>
    <p data-result>${model.resultExpression}</p>
    <p data-insight>${model.insight}</p>
  </section>`;
}

let rendered = 0;

for (const state of states) {
  const first = renderState(state);
  const second = renderState({ ...state });
  assert.equal(first, second);
  assert.doesNotMatch(first, /undefined|NaN|Infinity/);
  assert.match(first, /4x/);
  rendered += 1;
}

for (let groups = 2; groups <= 5; groups += 1) {
  const model = createTermDivisionModel(groups);
  const output = renderState({
    view: TERM_DIVISION_VIEWS.conclusion,
    groups,
    locked: false,
  });
  assert.match(output, new RegExp(`data-groups="${groups}"`));
  assert.equal((output.match(/<li /g) ?? []).length, groups);
  assert.equal(model.resultExpression, "4x");
  rendered += 1;
}

let previous = [0, 0, 0];
for (const elapsed of [0, 250, 500, 750, 1000]) {
  const frame = termDivisionBuildFrame(elapsed, 3);
  frame.packageProgress.forEach((progress, index) => assert.ok(progress >= previous[index]));
  previous = frame.packageProgress;
  rendered += 1;
}

assert.equal(rendered, 17);
console.log(`${rendered}/${rendered} Terme-dividieren-Zustände gerendert`);
