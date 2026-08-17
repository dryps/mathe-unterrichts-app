import assert from "node:assert/strict";
import test from "node:test";

import {
  MULTIPLICATION_VIEWS,
  createMultiplicationState,
  finishMultiplicationTransition,
  moveFirstFactor,
  multiplicationViewModel,
  nextMultiplicationState,
  resetMultiplicationState,
} from "../src/multiplication-negative-state.js";

function advance(state) {
  return finishMultiplicationTransition(nextMultiplicationState(state));
}

test("Aufbau folgt ausschließlich Irritation, Muster, Plus-zwei-Folge, Nullübergang, Bestätigung und Erkundung", () => {
  let state = createMultiplicationState();
  assert.deepEqual(state, { view: MULTIPLICATION_VIEWS.prompt, firstFactor: -1, locked: false });
  const expected = [
    MULTIPLICATION_VIEWS.known,
    MULTIPLICATION_VIEWS.pattern,
    MULTIPLICATION_VIEWS.crossing,
    MULTIPLICATION_VIEWS.confirmation,
    MULTIPLICATION_VIEWS.free,
  ];
  for (const view of expected) {
    state = advance(state);
    assert.equal(state.view, view);
    assert.equal(state.locked, false);
  }
  assert.equal(nextMultiplicationState(state), state);
});

test("Ansichtsmodell enthüllt Produkte, Plus-zwei-Muster und Regel nie verfrüht", () => {
  let state = createMultiplicationState();
  let model = multiplicationViewModel(state);
  assert.equal(model.showPrompt, true);
  assert.equal(model.showKnown, false);
  assert.equal(model.showPattern, false);
  assert.equal(model.showCrossing, false);
  assert.equal(model.showConfirmation, false);
  assert.equal(model.showExplorer, false);
  assert.equal(model.showConclusion, false);

  state = advance(state);
  model = multiplicationViewModel(state);
  assert.equal(model.showKnown, true);
  assert.equal(model.showPattern, false);

  state = advance(state);
  model = multiplicationViewModel(state);
  assert.equal(model.showPattern, true);
  assert.equal(model.showCrossing, false);

  state = advance(state);
  model = multiplicationViewModel(state);
  assert.equal(model.showCrossing, true);
  assert.equal(model.showConfirmation, false);

  state = advance(state);
  model = multiplicationViewModel(state);
  assert.equal(model.showConfirmation, true);
  assert.equal(model.showExplorer, false);

  state = advance(state);
  model = multiplicationViewModel(state);
  assert.equal(model.showExplorer, true);
  assert.equal(model.showConclusion, false);
  assert.equal(model.interactive, true);
});

test("jeder animierte Übergang sperrt Mehrfachtipps, Reset und Faktorbewegung", () => {
  const start = createMultiplicationState();
  const locked = nextMultiplicationState(start);
  assert.equal(locked.view, MULTIPLICATION_VIEWS.known);
  assert.equal(locked.locked, true);
  assert.equal(nextMultiplicationState(locked), locked);
  assert.equal(moveFirstFactor(locked, -4), locked);
  assert.equal(resetMultiplicationState(locked), locked);
  assert.equal(multiplicationViewModel(locked).controlsLocked, true);
  assert.equal(finishMultiplicationTransition(locked).locked, false);
});

test("nur freie stabile Zustände erlauben den ersten Faktor von minus vier bis plus vier", () => {
  let state = createMultiplicationState();
  for (let index = 0; index < 5; index += 1) state = advance(state);
  assert.equal(state.view, MULTIPLICATION_VIEWS.free);
  assert.equal(moveFirstFactor(state, -1), state);

  state = moveFirstFactor(state, -99);
  assert.deepEqual(state, { view: MULTIPLICATION_VIEWS.conclusion, firstFactor: -4, locked: false });
  state = moveFirstFactor(state, 2.7);
  assert.equal(state.firstFactor, 3);
  state = moveFirstFactor(state, 99);
  assert.equal(state.firstFactor, 4);
  assert.equal(multiplicationViewModel(state).showConclusion, true);
  assert.equal(multiplicationViewModel(state).interactive, true);
});

test("Reset stellt aus jedem stabilen Zustand exakt die Irritation wieder her", () => {
  const initial = createMultiplicationState();
  let state = initial;
  for (let index = 0; index < 5; index += 1) {
    state = advance(state);
    assert.deepEqual(resetMultiplicationState(state), initial);
  }
  state = moveFirstFactor(state, -4);
  assert.deepEqual(resetMultiplicationState(state), initial);
});
