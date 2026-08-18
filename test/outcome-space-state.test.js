import assert from "node:assert/strict";
import test from "node:test";

import { OUTCOME_SPACE_VIEWS, createOutcomeSpaceState, finishOutcomeSpaceReveal, nextOutcomeSpaceState, outcomeSpaceViewModel, resetOutcomeSpaceState } from "../src/outcome-space-state.js";

test("Lernweg öffnet falsche Rechnung, fehlendes Ergebnis, vollständigen Raum und Schluss seriell", () => {
  let state = createOutcomeSpaceState();
  const views = [];
  for (let step = 0; step < 5; step += 1) {
    const model = outcomeSpaceViewModel(state);
    views.push(model.view);
    assert.equal(model.showWrong, step >= 1);
    assert.equal(model.showMissing, step === 2);
    assert.equal(model.showComplete, step >= 3);
    assert.equal(model.showConclusion, step >= 4);
    state = finishOutcomeSpaceReveal(nextOutcomeSpaceState(state));
  }
  assert.deepEqual(views, Object.values(OUTCOME_SPACE_VIEWS));
});

test("die Sechs wird vor dem eigenen Gate weder sichtbar noch zugänglich benannt", () => {
  let state = createOutcomeSpaceState();
  for (let step = 0; step < 2; step += 1) {
    const model = outcomeSpaceViewModel(state);
    assert.equal(model.showSix, false);
    assert.doesNotMatch(model.labAriaLabel, /Ergebnis 6|sechs/);
    state = finishOutcomeSpaceReveal(nextOutcomeSpaceState(state));
  }
  assert.match(outcomeSpaceViewModel(state).labAriaLabel, /Ergebnis 6/);
});

test("vollständiger Zustand korrigiert Zähler, Nenner, Menge und Prozentwert gemeinsam", () => {
  let state = createOutcomeSpaceState();
  for (let step = 0; step < 3; step += 1) state = finishOutcomeSpaceReveal(nextOutcomeSpaceState(state));
  const model = outcomeSpaceViewModel(state);
  assert.equal(model.showSix, true);
  assert.equal(model.showMissing, false);
  assert.equal(model.correctEquation, "3/6 = 1/2 = 50 %");
  assert.equal(model.completeSet, "{1, 2, 3, 4, 5, 6}");
  assert.deepEqual(model.favorableResults, [2, 4, 6]);
});

test("Reset und gesperrte Übergänge bleiben deterministisch", () => {
  const locked = nextOutcomeSpaceState(createOutcomeSpaceState());
  assert.equal(nextOutcomeSpaceState(locked), locked);
  assert.deepEqual(resetOutcomeSpaceState(), createOutcomeSpaceState());
});
