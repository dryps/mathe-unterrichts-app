import assert from "node:assert/strict";
import test from "node:test";

import {
  UNIQUE_QUADRILATERAL_VIEWS,
  createUniqueQuadrilateralState,
  finishUniqueQuadrilateralReveal,
  nextUniqueQuadrilateralState,
  resetUniqueQuadrilateralState,
  setQuadrilateralShear,
  uniqueQuadrilateralViewModel,
} from "../src/unique-quadrilateral-state.js";

test("Start verrät keine Angaben, Marker oder Eindeutigkeitsaussage", () => {
  const model = uniqueQuadrilateralViewModel(createUniqueQuadrilateralState());
  assert.equal(model.showParallel, false);
  assert.equal(model.showEqual, false);
  assert.equal(model.showFreedom, false);
  assert.equal(model.showIndependent, false);
  assert.equal(model.showConclusion, false);
});

test("Parallelität, abhängige Folgerung und unabhängige Angaben erscheinen nacheinander", () => {
  let state = createUniqueQuadrilateralState();
  for (const view of [UNIQUE_QUADRILATERAL_VIEWS.insufficient, UNIQUE_QUADRILATERAL_VIEWS.dependent, UNIQUE_QUADRILATERAL_VIEWS.independent]) {
    state = nextUniqueQuadrilateralState(state);
    assert.equal(state.view, view);
    assert.equal(state.locked, true);
    assert.equal(nextUniqueQuadrilateralState(state), state);
    state = finishUniqueQuadrilateralReveal(state);
  }
  const final = uniqueQuadrilateralViewModel(state);
  assert.equal(final.showIndependent, true);
  assert.equal(final.showConclusion, true);
  assert.equal(final.showNext, false);
});

test("der Freiheitsgrad bleibt bei unzureichenden und abhängigen Angaben beweglich", () => {
  const insufficient = { view: UNIQUE_QUADRILATERAL_VIEWS.insufficient, locked: false, shear: 0 };
  const dependent = { view: UNIQUE_QUADRILATERAL_VIEWS.dependent, locked: false, shear: 0 };
  assert.equal(setQuadrilateralShear(insufficient, 85).shear, 85);
  assert.equal(setQuadrilateralShear(dependent, -70).shear, -70);
  assert.equal(uniqueQuadrilateralViewModel(dependent).showEqual, true);
  assert.equal(uniqueQuadrilateralViewModel(dependent).controlsInteractive, true);
});

test("unabhängige Angaben schließen den Regler und zeigen die feste Figur", () => {
  const state = { view: UNIQUE_QUADRILATERAL_VIEWS.independent, locked: false, shear: 90 };
  const unchanged = setQuadrilateralShear(state, -90);
  const model = uniqueQuadrilateralViewModel(state);
  assert.equal(unchanged, state);
  assert.equal(model.controlsInteractive, false);
  assert.equal(model.dimensionText, "AB = 6 cm · AD = 4 cm · ∠DAB = 70°");
  assert.equal(model.conclusion, "Nicht die Anzahl, sondern die Unabhängigkeit der Angaben legt die Figur fest.");
  assert.match(model.scopeNote, /dieses Parallelogramm/);
});

test("Reset stellt die offene Irritation vollständig wieder her", () => {
  assert.deepEqual(resetUniqueQuadrilateralState(), createUniqueQuadrilateralState());
});
