import assert from "node:assert/strict";
import test from "node:test";

import {
  ORDER_NUMBER_LINE_VIEWS,
  createOrderNumberLineState,
  finishOrderNumberLineTransition,
  moveOrderNumberLinePoint,
  orderNumberLineViewModel,
  resetOrderNumberLineState,
  startNextOrderNumberLineStep,
  transitionKindForOrderView,
} from "../src/order-number-line-state.js";

function advance(state) {
  return finishOrderNumberLineTransition(startNextOrderNumberLineStep(state));
}

test("Ausgang zeigt ausschließlich Denkimpuls ohne Zahlengerade", () => {
  const state = createOrderNumberLineState();
  const model = orderNumberLineViewModel(state);
  assert.deepEqual(state, {
    view: ORDER_NUMBER_LINE_VIEWS.prompt,
    value: 0,
    locked: false,
  });
  assert.equal(model.showPrompt, true);
  assert.equal(model.showAxis, false);
  assert.equal(model.showComparison, false);
  assert.equal(model.showDraggablePoint, false);
  assert.match(model.insight, /nicht nur auf 8 und 3/i);
});

test("Einführung sperrt Eingaben und endet deterministisch auf der Zahlengerade", () => {
  const initial = createOrderNumberLineState();
  const moving = startNextOrderNumberLineStep(initial);
  assert.equal(moving.view, ORDER_NUMBER_LINE_VIEWS.introducing);
  assert.equal(moving.locked, true);
  assert.equal(transitionKindForOrderView(moving.view), "introduction");
  assert.strictEqual(startNextOrderNumberLineStep(moving), moving);
  assert.strictEqual(moveOrderNumberLinePoint(moving, -8), moving);

  const line = finishOrderNumberLineTransition(moving);
  assert.equal(line.view, ORDER_NUMBER_LINE_VIEWS.line);
  assert.equal(line.locked, false);
  assert.match(orderNumberLineViewModel(line).insight, /größere Zahlen weiter rechts/i);
});

test("Vergleich erscheint nicht vor seinem eigenen gesperrten Übergang", () => {
  const line = advance(createOrderNumberLineState());
  assert.equal(orderNumberLineViewModel(line).showComparison, false);
  const revealing = startNextOrderNumberLineStep(line);
  assert.equal(revealing.view, ORDER_NUMBER_LINE_VIEWS.revealingComparison);
  assert.equal(revealing.locked, true);
  assert.equal(orderNumberLineViewModel(revealing).showComparison, true);
  assert.equal(orderNumberLineViewModel(revealing).showDraggablePoint, false);
  assert.equal(transitionKindForOrderView(revealing.view), "comparison");

  const comparison = finishOrderNumberLineTransition(revealing);
  assert.equal(comparison.view, ORDER_NUMBER_LINE_VIEWS.comparison);
  assert.match(orderNumberLineViewModel(comparison).insight, /−3.*weiter rechts/i);
});

test("freier Punkt erscheint erst nach dem Vergleich", () => {
  const line = advance(createOrderNumberLineState());
  const comparison = advance(line);
  const revealing = startNextOrderNumberLineStep(comparison);
  assert.equal(revealing.view, ORDER_NUMBER_LINE_VIEWS.revealingFree);
  assert.equal(revealing.locked, true);
  assert.equal(transitionKindForOrderView(revealing.view), "free");

  const free = finishOrderNumberLineTransition(revealing);
  const model = orderNumberLineViewModel(free);
  assert.equal(free.view, ORDER_NUMBER_LINE_VIEWS.free);
  assert.equal(model.interactive, true);
  assert.equal(model.showNextButton, false);
  assert.equal(model.referenceMarkersMuted, true);
});

test("erste echte Bewegung führt in die Abschlusserkenntnis", () => {
  const free = advance(advance(advance(createOrderNumberLineState())));
  assert.equal(free.view, ORDER_NUMBER_LINE_VIEWS.free);
  assert.strictEqual(moveOrderNumberLinePoint(free, 0), free);

  const moved = moveOrderNumberLinePoint(free, -8);
  assert.equal(moved.view, ORDER_NUMBER_LINE_VIEWS.conclusion);
  assert.equal(moved.value, -8);
  assert.match(
    orderNumberLineViewModel(moved).insight,
    /Position auf der Zahlengeraden entscheidet/i,
  );
  assert.match(orderNumberLineViewModel(moved).insight, /Weiter rechts bedeutet größer/i);
});

test("freier Zustand rastet und hält die Schutzgrenzen", () => {
  const free = advance(advance(advance(createOrderNumberLineState())));
  const values = [
    [-999, -10],
    [-8.49, -8],
    [-2.51, -3],
    [2.7, 3],
    [999, 3],
  ];
  for (const [input, expected] of values) {
    const moved = moveOrderNumberLinePoint(free, input);
    assert.equal(moved.value, expected);
    assert.equal(Number.isInteger(moved.value), true);
  }
});

test("schnelle Mehrfachtipps überspringen keinen Zustand", () => {
  let state = createOrderNumberLineState();
  const introducing = startNextOrderNumberLineStep(state);
  assert.strictEqual(startNextOrderNumberLineStep(introducing), introducing);
  state = finishOrderNumberLineTransition(introducing);

  const revealingComparison = startNextOrderNumberLineStep(state);
  assert.strictEqual(
    startNextOrderNumberLineStep(revealingComparison),
    revealingComparison,
  );
  state = finishOrderNumberLineTransition(revealingComparison);

  const revealingFree = startNextOrderNumberLineStep(state);
  assert.strictEqual(startNextOrderNumberLineStep(revealingFree), revealingFree);
  state = finishOrderNumberLineTransition(revealingFree);
  assert.equal(state.view, ORDER_NUMBER_LINE_VIEWS.free);
});

test("Reset stellt aus jedem stabilen Zustand exakt den Ausgang wieder her", () => {
  const initial = createOrderNumberLineState();
  const line = advance(initial);
  const comparison = advance(line);
  const free = advance(comparison);
  const conclusion = moveOrderNumberLinePoint(free, -3);
  for (const state of [initial, line, comparison, free, conclusion]) {
    assert.deepEqual(resetOrderNumberLineState(state), createOrderNumberLineState());
  }
});
