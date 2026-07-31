import assert from "node:assert/strict";
import test from "node:test";

import {
  NUMBER_LINE_INSIGHTS,
  NUMBER_LINE_VIEWS,
  createNumberLineState,
  finishNumberLineMotion,
  motionPathForView,
  moveNumberLinePoint,
  numberLineViewModel,
  resetNumberLineState,
  startNextNumberLineStep,
} from "../src/number-line-state.js";

function finishNext(state) {
  return finishNumberLineMotion(startNextNumberLineStep(state));
}

test("Ausgangszustand zeigt nur null bis drei und startet exakt bei null", () => {
  const state = createNumberLineState();
  const model = numberLineViewModel(state);
  assert.deepEqual(state, { view: NUMBER_LINE_VIEWS.initial, value: 0, locked: false });
  assert.deepEqual(model.ticks.map(({ value }) => value), [0, 1, 2, 3]);
  assert.equal(model.showNegative, false);
  assert.equal(model.interactive, false);
});

test("erster Schritt läuft gesperrt nach rechts und endet bei drei", () => {
  const moving = startNextNumberLineStep(createNumberLineState());
  assert.equal(moving.view, NUMBER_LINE_VIEWS.movingRight);
  assert.equal(moving.locked, true);
  assert.deepEqual(motionPathForView(moving.view), [0, 1, 2, 3]);
  const right = finishNumberLineMotion(moving);
  assert.deepEqual(right, { view: NUMBER_LINE_VIEWS.right, value: 3, locked: false });
  assert.equal(numberLineViewModel(right).insight, "Nach rechts werden Zahlen größer.");
});

test("zweiter Schritt kehrt ohne Überraschung exakt zur null zurück", () => {
  const right = finishNext(createNumberLineState());
  const moving = startNextNumberLineStep(right);
  assert.deepEqual(motionPathForView(moving.view), [3, 2, 1, 0]);
  const home = finishNumberLineMotion(moving);
  assert.deepEqual(home, { view: NUMBER_LINE_VIEWS.home, value: 0, locked: false });
});

test("dritter Schritt geht über null hinaus bis minus drei", () => {
  let state = createNumberLineState();
  state = finishNext(state);
  state = finishNext(state);
  const moving = startNextNumberLineStep(state);
  const movingModel = numberLineViewModel(moving);
  assert.deepEqual(motionPathForView(moving.view), [0, -1, -2, -3]);
  assert.equal(movingModel.showNegative, true);
  state = finishNumberLineMotion(moving);
  assert.equal(state.view, NUMBER_LINE_VIEWS.negative);
  assert.equal(state.value, -3);
  assert.equal(
    numberLineViewModel(state).insight,
    "Die Zahlengerade verläuft in beide Richtungen.",
  );
});

test("schnelle Mehrfachtipps und Punktbewegungen werden während jeder Bewegung ignoriert", () => {
  const moving = startNextNumberLineStep(createNumberLineState());
  assert.strictEqual(startNextNumberLineStep(moving), moving);
  assert.strictEqual(moveNumberLinePoint(moving, -3), moving);
  assert.equal(numberLineViewModel(moving).controlsLocked, true);
});

test("erst der vierte Schritt schaltet die freie Punktbewegung frei", () => {
  let state = createNumberLineState();
  state = finishNext(state);
  state = finishNext(state);
  state = finishNext(state);
  assert.equal(numberLineViewModel(state).interactive, false);
  state = startNextNumberLineStep(state);
  const model = numberLineViewModel(state);
  assert.equal(state.view, NUMBER_LINE_VIEWS.free);
  assert.equal(model.interactive, true);
  assert.equal(model.showCurrentValue, true);
  assert.equal(model.showNextButton, false);
  assert.equal(model.insight, NUMBER_LINE_INSIGHTS[NUMBER_LINE_VIEWS.free]);
});

test("freie Bewegung rastet und klemmt zuverlässig auf minus drei bis plus drei", () => {
  const free = { view: NUMBER_LINE_VIEWS.free, value: 0, locked: false };
  assert.equal(moveNumberLinePoint(free, -1.6).value, -2);
  assert.equal(moveNumberLinePoint(free, 1.6).value, 2);
  assert.equal(moveNumberLinePoint(free, -99).value, -3);
  assert.equal(moveNumberLinePoint(free, 99).value, 3);
});

test("Reset stellt aus dem Endzustand die vollständige Ausgangsansicht wieder her", () => {
  const moved = moveNumberLinePoint(
    { view: NUMBER_LINE_VIEWS.free, value: -3, locked: false },
    2,
  );
  const reset = resetNumberLineState(moved);
  assert.deepEqual(reset, createNumberLineState());
  assert.equal(numberLineViewModel(reset).showNegative, false);
});

test("nach Reset lässt sich der vollständige Aufbau erneut beginnen", () => {
  const reset = resetNumberLineState();
  assert.equal(startNextNumberLineStep(reset).view, NUMBER_LINE_VIEWS.movingRight);
});
