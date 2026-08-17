import assert from "node:assert/strict";
import { PROPERTIES_TRANSFORM_DURATION, quadrilateralTransformFrame } from "../src/quadrilateral-properties-animation.js";
import { createParallelogram } from "../src/quadrilateral-properties-geometry.js";
import { PROPERTIES_VIEWS, createPropertiesState, propertiesViewModel } from "../src/quadrilateral-properties-state.js";

const states = [
  createPropertiesState(),
  { view: PROPERTIES_VIEWS.properties, config: {}, locked: false },
  { view: PROPERTIES_VIEWS.transforming, config: {}, locked: true },
  { view: PROPERTIES_VIEWS.transformed, config: { rotation: 28, shiftX: 55, slant: -50 }, locked: false },
  { view: PROPERTIES_VIEWS.explore, config: { rotation: 28, shiftX: 55, slant: -50 }, locked: false },
  { view: PROPERTIES_VIEWS.conclusion, config: { rotation: -20, shiftX: -40, slant: 60 }, locked: false },
];
const render = (state) => {
  const model = propertiesViewModel(state);
  const points = model.points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
  return `<section data-state="${state.view}" data-markers="${model.showMarkers}"><polygon points="${points}"/><p>${model.insight}</p></section>`;
};
let rendered = 0;
for (const state of states) {
  const first = render(state);
  assert.equal(first, render({ ...state }));
  assert.doesNotMatch(first, /undefined|NaN|Infinity/);
  rendered += 1;
}
for (const config of [
  { rotation: -35, shiftX: -90, slant: -70 },
  { rotation: 0, shiftX: 0, slant: 0 },
  { rotation: 35, shiftX: 90, slant: 70 },
]) {
  const geometry = createParallelogram(config);
  assert.equal(geometry.invariants.oppositeSidesParallel, true);
  assert.equal(geometry.invariants.oppositeSidesEqual, true);
  assert.ok(geometry.points.every(({ x, y }) => x >= 0 && x <= 800 && y >= 0 && y <= 480));
  rendered += 1;
}
let previous = -1;
for (const elapsed of [0, 220, 440, 660, 880, PROPERTIES_TRANSFORM_DURATION]) {
  const frame = quadrilateralTransformFrame(elapsed);
  assert.ok(frame.progress >= previous);
  previous = frame.progress;
  rendered += 1;
}
assert.equal(rendered, 15);
console.log(`${rendered}/${rendered} Viereck-Eigenschaften-Zustände gerendert`);
