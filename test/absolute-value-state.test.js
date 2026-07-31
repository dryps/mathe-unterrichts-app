import assert from "node:assert/strict";
import test from "node:test";

import {
  ABSOLUTE_VALUE_VIEWS,
  absoluteValueViewModel,
  createAbsoluteValueState,
  finishAbsoluteValueTransition,
  moveAbsoluteValuePoint,
  resetAbsoluteValueState,
  startNextAbsoluteValueStep,
  transitionKindForAbsoluteView,
} from "../src/absolute-value-state.js";

function advance(state) {
  return finishAbsoluteValueTransition(startNextAbsoluteValueStep(state));
}

test("Ausgang zeigt ausschließlich Irritation ohne Zahlengerade", () => {
  const state = createAbsoluteValueState();
  const model = absoluteValueViewModel(state);
  assert.deepEqual(state, { view: ABSOLUTE_VALUE_VIEWS.prompt, value: -4, locked: false });
  assert.equal(model.showPrompt, true);
  assert.equal(model.showAxis, false);
  assert.equal(model.showNegativeFormula, false);
  assert.equal(model.showDraggablePoint, false);
  assert.match(model.insight, /Was misst der Betrag/i);
});

test("Richtungsübergang sperrt Eingaben und endet deterministisch", () => {
  const revealing = startNextAbsoluteValueStep(createAbsoluteValueState());
  assert.equal(revealing.view, ABSOLUTE_VALUE_VIEWS.revealingDirection);
  assert.equal(revealing.locked, true);
  assert.equal(transitionKindForAbsoluteView(revealing.view), "direction");
  assert.strictEqual(startNextAbsoluteValueStep(revealing), revealing);
  assert.strictEqual(moveAbsoluteValuePoint(revealing, 2), revealing);
  const direction = finishAbsoluteValueTransition(revealing);
  assert.equal(direction.view, ABSOLUTE_VALUE_VIEWS.direction);
  assert.match(absoluteValueViewModel(direction).insight, /Vorzeichen.*Richtung/i);
});

test("Abstand und Formel erscheinen erst im eigenen Schritt", () => {
  const direction = advance(createAbsoluteValueState());
  assert.equal(absoluteValueViewModel(direction).showNegativeDistance, false);
  const distance = advance(direction);
  const model = absoluteValueViewModel(distance);
  assert.equal(model.showDirection, false);
  assert.equal(model.showNegativeDistance, true);
  assert.equal(model.showNegativeFormula, true);
  assert.equal(model.showPositiveDistance, false);
  assert.match(model.insight, /Abstand zur Null/i);
});

test("Gegenüberstellung zeigt beide gleichen Abstände und erst dann die Gleichheit", () => {
  const opposite = advance(advance(advance(createAbsoluteValueState())));
  const model = absoluteValueViewModel(opposite);
  assert.equal(opposite.view, ABSOLUTE_VALUE_VIEWS.opposite);
  assert.equal(model.showPositiveReference, true);
  assert.equal(model.showPositiveDistance, true);
  assert.equal(model.showEqualityFormula, true);
  assert.equal(model.showDraggablePoint, false);
  assert.match(model.insight, /denselben Abstand/i);
});

test("freier Punkt erscheint erst nach vier kontrollierten Schritten", () => {
  const free = advance(advance(advance(advance(createAbsoluteValueState()))));
  const model = absoluteValueViewModel(free);
  assert.equal(free.view, ABSOLUTE_VALUE_VIEWS.free);
  assert.equal(model.showDraggablePoint, true);
  assert.equal(model.showDynamicFormula, true);
  assert.equal(model.interactive, true);
  assert.equal(model.showNextButton, false);
});

test("erste echte Bewegung führt zur Abschlusserkenntnis", () => {
  const free = advance(advance(advance(advance(createAbsoluteValueState()))));
  assert.strictEqual(moveAbsoluteValuePoint(free, -4), free);
  const moved = moveAbsoluteValuePoint(free, 3);
  assert.equal(moved.view, ABSOLUTE_VALUE_VIEWS.conclusion);
  assert.equal(moved.value, 3);
  assert.match(absoluteValueViewModel(moved).insight, /wie weit.*Null entfernt/i);
  assert.match(absoluteValueViewModel(moved).insight, /nicht auf welcher Seite/i);
});

test("freier Zustand rastet an allen Ganzzahlen und schützt Grenzen", () => {
  const free = advance(advance(advance(advance(createAbsoluteValueState()))));
  for (const [input, expected] of [[-999, -6], [-5.51, -6], [-2.4, -2], [0.49, 0], [5.6, 6], [999, 6]]) {
    const moved = moveAbsoluteValuePoint(free, input);
    assert.equal(moved.value, expected);
    assert.equal(Number.isInteger(moved.value), true);
  }
});

test("schnelle Mehrfachtipps überspringen keinen Zustand", () => {
  let state = createAbsoluteValueState();
  for (const stableView of [
    ABSOLUTE_VALUE_VIEWS.direction,
    ABSOLUTE_VALUE_VIEWS.distance,
    ABSOLUTE_VALUE_VIEWS.opposite,
    ABSOLUTE_VALUE_VIEWS.free,
  ]) {
    const moving = startNextAbsoluteValueStep(state);
    assert.equal(moving.locked, true);
    assert.strictEqual(startNextAbsoluteValueStep(moving), moving);
    state = finishAbsoluteValueTransition(moving);
    assert.equal(state.view, stableView);
  }
});

test("Reset stellt aus jedem stabilen Zustand exakt den Anfang wieder her", () => {
  const prompt = createAbsoluteValueState();
  const direction = advance(prompt);
  const distance = advance(direction);
  const opposite = advance(distance);
  const free = advance(opposite);
  const conclusion = moveAbsoluteValuePoint(free, 6);
  for (const state of [prompt, direction, distance, opposite, free, conclusion]) {
    assert.deepEqual(resetAbsoluteValueState(state), createAbsoluteValueState());
  }
});
