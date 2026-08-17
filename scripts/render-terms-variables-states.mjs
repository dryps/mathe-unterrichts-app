import assert from "node:assert/strict";

import { TERM_EXPRESSION, termSnapshot } from "../src/terms-variables-math.js";
import {
  TERMS_VARIABLES_VIEWS,
  createTermsVariablesState,
  termsVariablesViewModel,
} from "../src/terms-variables-state.js";

const states = [
  createTermsVariablesState(),
  { view: TERMS_VARIABLES_VIEWS.structure, x: null, locked: false },
  { view: TERMS_VARIABLES_VIEWS.assigned, x: 1, locked: false },
  { view: TERMS_VARIABLES_VIEWS.changing, x: 3, locked: false },
  { view: TERMS_VARIABLES_VIEWS.comparison, x: 3, locked: false },
  { view: TERMS_VARIABLES_VIEWS.exploration, x: 3, locked: false },
];

function renderState(state) {
  const model = termsVariablesViewModel(state);
  const snapshot = state.x === null ? null : termSnapshot(state.x);
  const xContent = snapshot?.x ?? "x";
  const xBlocks = Array.from(
    { length: 2 },
    () => `<div data-term-block="x">${xContent}</div>`,
  ).join("");
  const units = Array.from(
    { length: 3 },
    () => '<div data-term-block="unit">1</div>',
  ).join("");
  return `<section data-state="${state.view}">
    <p data-expression>${TERM_EXPRESSION}</p>
    <div data-visible="${model.showBlocks}">${xBlocks}${units}</div>
    <p data-insight>${model.insight}</p>
    <p data-equation>${snapshot?.substituted ?? "noch kein Wert"}</p>
  </section>`;
}

let rendered = 0;
for (const state of states) {
  const output = renderState(state);
  assert.doesNotMatch(output, /undefined|NaN/);
  assert.match(output, /2x \+ 3/);
  assert.equal((output.match(/data-term-block="x"/g) ?? []).length, 2);
  assert.equal((output.match(/data-term-block="unit"/g) ?? []).length, 3);
  rendered += 1;
}

const expectedValues = [3, 5, 7, 9, 11, 13];
for (let x = 0; x <= 5; x += 1) {
  const state = { view: TERMS_VARIABLES_VIEWS.exploration, x, locked: false };
  const output = renderState(state);
  const snapshot = termSnapshot(x);
  assert.equal(snapshot.value, expectedValues[x]);
  assert.match(output, new RegExp(`2 · ${x} \\+ 3 = ${expectedValues[x]}`));
  assert.equal((output.match(/data-term-block="x"/g) ?? []).length, 2);
  assert.equal((output.match(/data-term-block="unit"/g) ?? []).length, 3);
  rendered += 1;
}

assert.equal(rendered, 12);
console.log(`${rendered}/${rendered} Terme-und-Variablen-Zustände gerendert`);
