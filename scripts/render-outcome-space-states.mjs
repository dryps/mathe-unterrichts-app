import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { OUTCOME_SPACE_REVEAL_DURATION, outcomeSpaceRevealFrame } from "../src/outcome-space-animation.js";
import { COMPLETE_DIE_SPACE, INCOMPLETE_DIE_SPACE, evenProbability } from "../src/outcome-space-math.js";
import { OUTCOME_SPACE_VIEWS, createOutcomeSpaceState, finishOutcomeSpaceReveal, nextOutcomeSpaceState, outcomeSpaceViewModel } from "../src/outcome-space-state.js";

const html = await readFile(new URL("../ergebnisraum.html", import.meta.url), "utf8");
const css = await readFile(new URL("../outcome-space.css", import.meta.url), "utf8");
let state = createOutcomeSpaceState();
let count = 0;
for (let step = 0; step < Object.values(OUTCOME_SPACE_VIEWS).length; step += 1) {
  const model = outcomeSpaceViewModel(state);
  assert.doesNotMatch(JSON.stringify(model), /undefined|NaN|Infinity/);
  if ([OUTCOME_SPACE_VIEWS.irritation, OUTCOME_SPACE_VIEWS.wrong].includes(model.view)) {
    assert.doesNotMatch(model.labAriaLabel, /Ergebnis 6|sechs/);
  }
  count += 1;
  state = finishOutcomeSpaceReveal(nextOutcomeSpaceState(state));
}
assert.deepEqual(evenProbability(INCOMPLETE_DIE_SPACE).favorable, [2, 4]);
assert.deepEqual(evenProbability(COMPLETE_DIE_SPACE).favorable, [2, 4, 6]);
count += 2;
let previous = -1;
for (const time of [0, 130, 260, 390, 520, OUTCOME_SPACE_REVEAL_DURATION]) {
  const frame = outcomeSpaceRevealFrame(time);
  assert.ok(frame.opacity >= previous);
  previous = frame.opacity;
  count += 1;
}
assert.match(html, /Ergebnisraum/);
assert.match(css, /@media \(max-width: 720px\)/);
console.log(`${count}/${count} Ergebnisraum-Zustände gerendert`);
