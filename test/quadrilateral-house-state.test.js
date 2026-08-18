import assert from "node:assert/strict";
import test from "node:test";

import { HOUSE_VIEWS, createHouseState, finishHouseReveal, houseViewModel, nextHouseState, setHouseProperty } from "../src/quadrilateral-house-state.js";

test("Haus entsteht in der Reihenfolge Oberbegriff, Rechteck, Raute, Quadrat", () => {
  let state = createHouseState();
  for (const view of [HOUSE_VIEWS.parallelogram, HOUSE_VIEWS.rectangle, HOUSE_VIEWS.rhombus, HOUSE_VIEWS.square]) {
    state = nextHouseState(state);
    assert.equal(state.view, view);
    assert.equal(state.locked, true);
    assert.equal(nextHouseState(state), state);
    state = finishHouseReveal(state);
    assert.equal(state.locked, false);
  }
  const model = houseViewModel(state);
  assert.equal(model.showParallelogram, true);
  assert.equal(model.showRectangle, true);
  assert.equal(model.showRhombus, true);
  assert.equal(model.showSquare, true);
  assert.equal(model.type, "Quadrat");
});

test("Erkundung klassifiziert jede Eigenschaftskombination synchron", () => {
  let state = { view: HOUSE_VIEWS.square, locked: false, rightAngles: true, equalSides: true };
  state = nextHouseState(state);
  assert.equal(state.view, HOUSE_VIEWS.explore);
  assert.equal(houseViewModel(state).type, "Parallelogramm");
  state = setHouseProperty(state, "rightAngles", true);
  assert.equal(houseViewModel(state).type, "Rechteck");
  state = setHouseProperty(state, "equalSides", true);
  const model = houseViewModel(state);
  assert.equal(state.view, HOUSE_VIEWS.conclusion);
  assert.equal(model.type, "Quadrat");
  assert.equal(model.conclusion, "Spezielle Figuren behalten die Eigenschaften ihrer Oberbegriffe.");
});

test("Aha bleibt bis zur eigenen Kombination beider Eigenschaften verborgen", () => {
  const explore = { view: HOUSE_VIEWS.explore, locked: false, rightAngles: false, equalSides: false };
  assert.equal(houseViewModel(explore).showConclusion, false);
  assert.equal(houseViewModel(setHouseProperty(explore, "equalSides", true)).showConclusion, false);
  assert.equal(houseViewModel(setHouseProperty(explore, "rightAngles", true)).showConclusion, false);
});
