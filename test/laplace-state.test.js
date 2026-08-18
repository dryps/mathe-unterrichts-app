import assert from "node:assert/strict";
import test from "node:test";

import { LAPLACE_VIEWS, createLaplaceState, finishLaplaceReveal, laplaceViewModel, nextLaplaceState, resetLaplaceState, setLaplaceResult } from "../src/laplace-state.js";

test("Lernweg öffnet Zählung, Flächen, Wahrscheinlichkeiten und Erkundung seriell", () => {
  let state = createLaplaceState();
  Object.values(LAPLACE_VIEWS).forEach((view, step) => {
    const model = laplaceViewModel(state);
    assert.equal(model.view, view);
    assert.equal(model.showCount, step >= 1);
    assert.equal(model.showAreas, step >= 2);
    assert.equal(model.showProbability, step >= 3);
    assert.equal(model.showExplore, step >= 4);
    assert.equal(model.showConclusion, step >= 4);
    state = finishLaplaceReveal(nextLaplaceState(state));
  });
});

test("vor dem Flächengate verraten zugängliche Namen keine ungleichen Chancen", () => {
  let state = createLaplaceState();
  for (let step = 0; step < 2; step += 1) {
    const model = laplaceViewModel(state);
    assert.doesNotMatch(`${model.equalAriaLabel} ${model.unequalAriaLabel}`, /180|90|60|30|Hälfte|1\/2/);
    state = finishLaplaceReveal(nextLaplaceState(state));
  }
});

test("Wahrscheinlichkeitsgate trennt ein Viertel von einer Hälfte", () => {
  let state = createLaplaceState();
  for (let step = 0; step < 3; step += 1) state = finishLaplaceReveal(nextLaplaceState(state));
  const model = laplaceViewModel(state);
  assert.equal(model.selectedResult, 1);
  assert.equal(model.equalProbability, "1/4");
  assert.equal(model.unequalProbability, "1/2");
  assert.match(model.unequalAriaLabel, /Ergebnis 1.*180 Grad.*1\/2/);
});

test("Erkundung synchronisiert alle vier Ergebnisse und hält unbekannte Zustände fern", () => {
  let state = createLaplaceState();
  for (let step = 0; step < 4; step += 1) state = finishLaplaceReveal(nextLaplaceState(state));
  const fractions = ["1/2", "1/5", "1/6", "2/15"];
  for (const result of [1, 2, 3, 4]) {
    const model = laplaceViewModel(setLaplaceResult(state, result));
    assert.equal(model.selectedResult, result);
    assert.equal(model.equalProbability, "1/4");
    assert.equal(model.unequalProbability, fractions[result - 1]);
    assert.match(model.sliderValueText, new RegExp(`Ergebnis ${result} von 4`));
  }
  assert.throws(() => setLaplaceResult(state, 5), /Ergebnis/);
});

test("gesperrte Übergänge und Reset bleiben deterministisch", () => {
  const start = createLaplaceState();
  const locked = nextLaplaceState(start);
  assert.equal(nextLaplaceState(locked), locked);
  assert.equal(setLaplaceResult(locked, 2), locked);
  assert.deepEqual(resetLaplaceState(), start);
});
