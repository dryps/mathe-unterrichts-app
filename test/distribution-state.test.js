import assert from "node:assert/strict";
import test from "node:test";

import {
  DISTRIBUTION_VIEWS,
  createDistributionState,
  distributionViewModel,
  finishDistributionCopy,
  nextDistributionState,
  resetDistributionState,
  setDistributionFactor,
} from "../src/distribution-state.js";

test("acht didaktische Ansichten bleiben trotz internem Kopierzustand getrennt", () => {
  let state = createDistributionState();
  assert.deepEqual(state, { view: "irritation", factor: 3, locked: false });
  for (const view of ["package", "factor"]) {
    state = nextDistributionState(state);
    assert.equal(state.view, view);
  }
  state = nextDistributionState(state);
  assert.deepEqual(state, { view: "copying", factor: 3, locked: true });
  state = finishDistributionCopy(state);
  assert.equal(state.view, "copies");
  for (const view of ["regroup", "result", "explore"]) {
    state = nextDistributionState(state);
    assert.equal(state.view, view);
  }
  assert.equal(distributionViewModel(state).showNext, false);
});

test("Mehrfachtipps und Regler überspringen die Kopieranimation nicht", () => {
  const copying = { view: DISTRIBUTION_VIEWS.copying, factor: 3, locked: true };
  assert.strictEqual(nextDistributionState(copying), copying);
  assert.strictEqual(setDistributionFactor(copying, 5), copying);
  const initial = createDistributionState();
  assert.strictEqual(finishDistributionCopy(initial), initial);
});

test("jede Ansicht gibt ausschließlich die benötigten Ebenen frei", () => {
  const view = (name) => distributionViewModel({ view: name, factor: 3, locked: name === "copying" });
  assert.equal(view("irritation").showIrritation, true);
  assert.equal(view("package").showPackage, true);
  assert.equal(view("factor").showFactor, true);
  assert.equal(view("copying").showCopying, true);
  assert.equal(view("copies").showCopies, true);
  assert.equal(view("regroup").showRegroup, true);
  assert.equal(view("result").showResult, true);
  assert.equal(view("explore").showExplore, true);
  assert.equal(view("explore").showConclusion, false);
});

test("freie Erkundung reagiert erst auf einen echten Faktorwechsel", () => {
  const explore = { view: DISTRIBUTION_VIEWS.explore, factor: 3, locked: false };
  assert.strictEqual(setDistributionFactor(explore, 3), explore);
  const changed = setDistributionFactor(explore, 5);
  assert.deepEqual(changed, { view: "conclusion", factor: 5, locked: false });
  assert.equal(distributionViewModel(changed).equation, "5(x + 2) = 5x + 10");
  assert.equal(distributionViewModel(changed).packages.length, 5);
});

test("Reset stellt aus Animation und Schlussansicht exakt den Anfang her", () => {
  for (const state of [
    { view: DISTRIBUTION_VIEWS.copying, factor: 3, locked: true },
    { view: DISTRIBUTION_VIEWS.conclusion, factor: 5, locked: false },
  ]) assert.deepEqual(resetDistributionState(state), createDistributionState());
});

test("Kernerkenntnis bleibt auf die Vervielfachung des gesamten Pakets begrenzt", () => {
  for (const view of Object.values(DISTRIBUTION_VIEWS)) {
    const model = distributionViewModel({ view, factor: 3, locked: view === "copying" });
    assert.doesNotMatch(model.insight, /Gleichung lösen|Binom/i);
  }
  assert.equal(
    distributionViewModel({ view: "conclusion", factor: 5, locked: false }).conclusion,
    "Der Faktor 5 vervielfacht das gesamte Paket.",
  );
  assert.equal(
    distributionViewModel({ view: "conclusion", factor: 5, locked: false }).conclusionDetail,
    "Darum entstehen aus fünf Paketen 5 x-Bausteine und 10 Einer.",
  );
});
