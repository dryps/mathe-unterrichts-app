import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { LAPLACE_REVEAL_DURATION, laplaceRevealFrame } from "../src/laplace-animation.js";
import { EQUAL_SPINNER_ANGLES, UNEQUAL_SPINNER_ANGLES, spinnerSegments } from "../src/laplace-math.js";
import { LAPLACE_VIEWS, createLaplaceState, finishLaplaceReveal, laplaceViewModel, nextLaplaceState, setLaplaceResult } from "../src/laplace-state.js";

const html = await readFile(new URL("../laplace-wahrscheinlichkeit.html", import.meta.url), "utf8");
const css = await readFile(new URL("../laplace.css", import.meta.url), "utf8");
let state = createLaplaceState();
let count = 0;
for (let step = 0; step < Object.values(LAPLACE_VIEWS).length; step += 1) {
  const model = laplaceViewModel(state);
  assert.doesNotMatch(JSON.stringify(model), /undefined|NaN|Infinity/);
  count += 1;
  state = finishLaplaceReveal(nextLaplaceState(state));
}
for (const result of [1, 2, 3, 4]) {
  const model = laplaceViewModel(setLaplaceResult(state, result));
  assert.equal(model.equalProbability, "1/4");
  assert.ok(["1/2", "1/5", "1/6", "2/15"].includes(model.unequalProbability));
  count += 1;
}
for (const angles of [EQUAL_SPINNER_ANGLES, UNEQUAL_SPINNER_ANGLES]) {
  assert.equal(spinnerSegments(angles).length, 4);
  count += 1;
}
let previous = -1;
for (const time of [0, 130, 260, 390, 520, LAPLACE_REVEAL_DURATION]) {
  const frame = laplaceRevealFrame(time);
  assert.ok(frame.opacity >= previous);
  previous = frame.opacity;
  count += 1;
}
assert.match(html, /Laplace-Wahrscheinlichkeit/);
assert.match(css, /@media \(max-width: 720px\)/);
console.log(`${count}/${count} Laplace-Zustände gerendert`);
