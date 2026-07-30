import assert from "node:assert/strict";
import test from "node:test";

import { INITIAL_APEX } from "../src/triangle-area-geometry.js";
import {
  AREA_VIEWS,
  createTriangleAreaState,
  finishSupplement,
  moveApex,
  resetTriangleAreaState,
  startSupplement,
  triangleAreaViewModel,
} from "../src/triangle-area-state.js";

test("Ausgangszustand zeigt nur Dreieck und Frage", () => {
  const model = triangleAreaViewModel(createTriangleAreaState());
  assert.equal(model.state.view, AREA_VIEWS.initial);
  assert.equal(model.showQuestion, true);
  assert.equal(model.showAnimatedCopy, false);
  assert.equal(model.showCompletedCopy, false);
  assert.equal(model.showFormulas, false);
  assert.equal(model.inputLocked, false);
});

test("Ergänzen wechselt genau einmal in den gesperrten Animationszustand", () => {
  const initial = createTriangleAreaState();
  const animating = startSupplement(initial);
  assert.equal(animating.view, AREA_VIEWS.animating);
  assert.equal(triangleAreaViewModel(animating).inputLocked, true);
  assert.strictEqual(startSupplement(animating), animating);
});

test("schnelle Mehrfachtipps starten keine zweite Animation", () => {
  let state = createTriangleAreaState();
  state = startSupplement(state);
  const afterSecondTap = startSupplement(state);
  const afterThirdTap = startSupplement(afterSecondTap);
  assert.strictEqual(afterSecondTap, state);
  assert.strictEqual(afterThirdTap, state);
});

test("Spitzenbewegung und Reset werden während der Animation ignoriert", () => {
  const animating = startSupplement(createTriangleAreaState());
  assert.strictEqual(moveApex(animating, { x: 500, y: 300 }), animating);
  assert.strictEqual(resetTriangleAreaState(animating), animating);
});

test("Endzustand zeigt deterministische Kopie, Erkenntnis und Formeln", () => {
  const completed = finishSupplement(startSupplement(createTriangleAreaState()));
  const model = triangleAreaViewModel(completed);
  assert.equal(completed.view, AREA_VIEWS.completed);
  assert.equal(model.showCompletedCopy, true);
  assert.equal(model.showAnimatedCopy, false);
  assert.equal(model.showQuestion, false);
  assert.equal(model.showFormulas, true);
});

test("Spitze bleibt nach der Ergänzung beweglich und hält beide Dreiecke kongruent", () => {
  const completed = finishSupplement(startSupplement(createTriangleAreaState()));
  const moved = moveApex(completed, { x: 530, y: 350 });
  const model = triangleAreaViewModel(moved);
  assert.deepEqual(moved.apex, { x: 530, y: 350 });
  assert.equal(model.geometry.parallelogramArea, 2 * model.geometry.triangleArea);
});

test("Zurücksetzen entfernt Kopie und Formeln und stellt die Ausgangsspitze wieder her", () => {
  let state = finishSupplement(startSupplement(createTriangleAreaState()));
  state = moveApex(state, { x: 530, y: 350 });
  state = resetTriangleAreaState(state);
  const model = triangleAreaViewModel(state);
  assert.equal(state.view, AREA_VIEWS.initial);
  assert.deepEqual(state.apex, INITIAL_APEX);
  assert.equal(model.showCompletedCopy, false);
  assert.equal(model.showFormulas, false);
});

test("nach dem Zurücksetzen ist eine erneute Ergänzung möglich", () => {
  let state = finishSupplement(startSupplement(createTriangleAreaState()));
  state = resetTriangleAreaState(state);
  state = startSupplement(state);
  assert.equal(state.view, AREA_VIEWS.animating);
});
