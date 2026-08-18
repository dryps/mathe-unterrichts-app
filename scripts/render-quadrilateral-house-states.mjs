import assert from "node:assert/strict";
import { HOUSE_REVEAL_DURATION, houseRevealFrame } from "../src/quadrilateral-house-animation.js";
import { createHouseQuadrilateral } from "../src/quadrilateral-house-math.js";
import { HOUSE_VIEWS, createHouseState, houseViewModel } from "../src/quadrilateral-house-state.js";

const states = [
  createHouseState(),
  { view: HOUSE_VIEWS.parallelogram, locked: false, rightAngles: false, equalSides: false },
  { view: HOUSE_VIEWS.rectangle, locked: false, rightAngles: false, equalSides: false },
  { view: HOUSE_VIEWS.rhombus, locked: false, rightAngles: false, equalSides: false },
  { view: HOUSE_VIEWS.square, locked: false, rightAngles: false, equalSides: false },
  { view: HOUSE_VIEWS.explore, locked: false, rightAngles: false, equalSides: true },
  { view: HOUSE_VIEWS.conclusion, locked: false, rightAngles: true, equalSides: true },
];
const render = (state) => {
  const model = houseViewModel(state);
  const points = model.points.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  return `<section data-state="${state.view}" data-type="${model.type}"><polygon points="${points}"/><p>${model.insight}</p><p>${model.showConclusion ? model.conclusion : ""}</p></section>`;
};
let rendered = 0;
for (const state of states) {
  const first = render(state);
  assert.equal(first, render({ ...state }));
  assert.doesNotMatch(first, /undefined|NaN|Infinity/);
  rendered += 1;
}
for (const properties of [{}, { rightAngles: true }, { equalSides: true }, { rightAngles: true, equalSides: true }]) {
  const model = createHouseQuadrilateral(properties);
  assert.equal(model.invariants.oppositeSidesParallel, true);
  assert.equal(model.invariants.oppositeSidesEqual, true);
  rendered += 1;
}
let previous = -1;
for (const elapsed of [0, 130, 260, 390, 520, HOUSE_REVEAL_DURATION]) {
  const frame = houseRevealFrame(elapsed);
  assert.ok(frame.opacity >= previous);
  previous = frame.opacity;
  rendered += 1;
}
assert.equal(rendered, 17);
console.log(`${rendered}/${rendered} Haus-der-Vierecke-Zustände gerendert`);
