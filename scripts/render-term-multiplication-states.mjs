import assert from "node:assert/strict";

import { termMultiplicationFillFrame } from "../src/term-multiplication-animation.js";
import { createTermMultiplicationModel } from "../src/term-multiplication-math.js";
import {
  TERM_MULTIPLICATION_VIEWS,
  createTermMultiplicationState,
  termMultiplicationViewModel,
} from "../src/term-multiplication-state.js";

const states = [
  createTermMultiplicationState(),
  { view: TERM_MULTIPLICATION_VIEWS.addition, x: 3, locked: false },
  { view: TERM_MULTIPLICATION_VIEWS.square, x: 3, locked: false },
  { view: TERM_MULTIPLICATION_VIEWS.filling, x: 3, locked: true },
  { view: TERM_MULTIPLICATION_VIEWS.area, x: 3, locked: false },
  { view: TERM_MULTIPLICATION_VIEWS.comparison, x: 3, locked: false },
  { view: TERM_MULTIPLICATION_VIEWS.explore, x: 3, locked: false },
  { view: TERM_MULTIPLICATION_VIEWS.conclusion, x: 2, locked: false },
];

function renderState(state) {
  const model = termMultiplicationViewModel(state);
  return `<section data-state="${state.view}" data-locked="${state.locked}">
    <p data-addition>${model.additionFormula}</p>
    <p data-multiplication>${model.multiplicationFormula}</p>
    <div data-length="${model.additiveLength}">${"x".repeat(2)}</div>
    <div data-square-side="${model.x}" data-area="${model.squareArea}">x²</div>
    <p data-insight>${model.insight}</p>
    <p data-comparison>${model.comparisonNote}</p>
  </section>`;
}

let rendered = 0;
for (const state of states) {
  const first = renderState(state);
  const second = renderState({ ...state });
  assert.equal(first, second);
  assert.doesNotMatch(first, /undefined|NaN|Infinity/);
  assert.match(first, /x \+ x = 2x/);
  assert.match(first, /x · x = x²/);
  rendered += 1;
}

for (let x = 1; x <= 5; x += 1) {
  const expected = createTermMultiplicationModel(x);
  const output = renderState({
    view: TERM_MULTIPLICATION_VIEWS.conclusion,
    x,
    locked: false,
  });
  assert.match(output, new RegExp(`data-length="${2 * x}"`));
  assert.match(output, new RegExp(`data-area="${x * x}"`));
  assert.equal(expected.sameNumericValue, x === 2);
  rendered += 1;
}

let previousScale = -1;
for (const elapsed of [0, 225, 450, 675, 900]) {
  const frame = termMultiplicationFillFrame(elapsed);
  assert.ok(frame.fillScale >= previousScale);
  assert.ok(frame.fillOpacity >= 0.18 && frame.fillOpacity <= 1);
  previousScale = frame.fillScale;
  rendered += 1;
}

assert.equal(rendered, 18);
console.log(`${rendered}/${rendered} Terme-multiplizieren-Zustände gerendert`);
