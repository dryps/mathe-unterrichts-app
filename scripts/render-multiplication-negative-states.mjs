import assert from "node:assert/strict";

import {
  MULTIPLICATION_REVEAL_DURATION_MS,
  multiplicationRevealFrame,
} from "../src/multiplication-negative-animation.js";
import {
  formatMultiplication,
  multiplicationPattern,
  productValueToX,
} from "../src/multiplication-negative-geometry.js";
import {
  MULTIPLICATION_VIEWS,
  createMultiplicationState,
  finishMultiplicationTransition,
  multiplicationViewModel,
  nextMultiplicationState,
} from "../src/multiplication-negative-state.js";

const states = [];
let state = createMultiplicationState();
states.push(state);
while (state.view !== MULTIPLICATION_VIEWS.free) {
  state = finishMultiplicationTransition(nextMultiplicationState(state));
  states.push(state);
}
states.push({ ...state, view: MULTIPLICATION_VIEWS.conclusion, firstFactor: -4 });

assert.deepEqual(
  states.map(({ view }) => view),
  ["prompt", "known", "pattern", "crossing", "confirmation", "free", "conclusion"],
);

for (const row of multiplicationPattern()) {
  assert.equal(Number.isFinite(productValueToX(row.product)), true);
  assert.doesNotMatch(formatMultiplication(row.firstFactor), /NaN|undefined/);
}

const endFrame = multiplicationRevealFrame(MULTIPLICATION_REVEAL_DURATION_MS);
assert.equal(endFrame.complete, true);
assert.equal(endFrame.opacity, 1);

for (const current of states) {
  const model = multiplicationViewModel(current);
  const svg = `<svg viewBox="0 0 1400 640" data-state="${current.view}">
    ${model.showKnown ? '<g id="known-pattern"></g>' : ""}
    ${model.showPattern ? '<g id="plus-two-pattern"></g>' : ""}
    ${model.showCrossing ? '<g id="cross-zero"></g>' : ""}
    ${model.showConfirmation ? '<g id="confirmation"></g>' : ""}
    ${model.showExplorer ? `<text>${formatMultiplication(current.firstFactor)}</text>` : ""}
    ${model.showConclusion ? '<text>Das Muster läuft über die Null weiter.</text>' : ""}
  </svg>`;
  assert.doesNotMatch(svg, /NaN|undefined/);
  assert.equal(svg.includes('id="known-pattern"'), model.showKnown);
  assert.equal(svg.includes('id="cross-zero"'), model.showCrossing);
  assert.equal(svg.includes('id="confirmation"'), model.showConfirmation);
}

console.log(`${states.length}/${states.length} Multiplikations-Zustände als SVG gerendert`);
