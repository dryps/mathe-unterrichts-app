import assert from "node:assert/strict";
import test from "node:test";
import { createNegativeInequalityState, finishReflection, negativeInequalityViewModel, nextNegativeInequalityState, resetNegativeInequalityState, setReflectionBase } from "../src/negative-inequality-state.js";

test("Lernweg trennt Irritation, Ordnung, Spiegelung, Ergebnis und Erkundung", () => {
  let state = createNegativeInequalityState();
  assert.equal(state.view, "irritation");
  state = nextNegativeInequalityState(state); assert.equal(state.view, "ordered");
  state = nextNegativeInequalityState(state); assert.equal(state.view, "reflecting"); assert.equal(state.locked, true);
  state = finishReflection(state); assert.equal(state.view, "reflected"); assert.equal(state.locked, false);
  state = nextNegativeInequalityState(state); assert.equal(state.view, "explore");
});

test("gesperrte Spiegelung kann weder überholt noch erkundet werden", () => {
  let state = nextNegativeInequalityState(nextNegativeInequalityState(createNegativeInequalityState()));
  assert.equal(nextNegativeInequalityState(state), state);
  assert.equal(setReflectionBase(state, 4), state);
});

test("erste echte Erkundung öffnet den Schluss", () => {
  let state = createNegativeInequalityState();
  state = nextNegativeInequalityState(state); state = nextNegativeInequalityState(state); state = finishReflection(state); state = nextNegativeInequalityState(state);
  assert.equal(setReflectionBase(state, 2), state);
  state = setReflectionBase(state, 4);
  assert.equal(state.view, "conclusion");
  const model = negativeInequalityViewModel(state);
  assert.equal(model.resultEquation, "−4 > −7");
  assert.equal(model.conclusion, "Negative Skalierung kehrt die Ordnung um.");
});

test("Ansichtsmodell verrät Ergebnis und Aha nicht vorzeitig", () => {
  const initial = negativeInequalityViewModel(createNegativeInequalityState());
  assert.equal(initial.showLine, false);
  assert.equal(initial.showResult, false);
  assert.equal(initial.showConclusion, false);
  const ordered = negativeInequalityViewModel(nextNegativeInequalityState(createNegativeInequalityState()));
  assert.equal(ordered.showLine, true);
  assert.equal(ordered.showResult, false);
});

test("Reset stellt aus jedem stabilen Zustand exakt den Anfang her", () => {
  assert.deepEqual(resetNegativeInequalityState(), createNegativeInequalityState());
});
