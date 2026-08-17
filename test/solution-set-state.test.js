import assert from "node:assert/strict";
import test from "node:test";

import {
  SOLUTION_SET_VIEWS,
  createSolutionSetState,
  finishSolutionReveal,
  nextSolutionSetState,
  setSolutionTestValue,
  solutionSetViewModel,
} from "../src/solution-set-state.js";

test("der Bereich bleibt bis nach Einzeltest und Grenzschritt verborgen", () => {
  let state = createSolutionSetState();
  assert.equal(state.view, SOLUTION_SET_VIEWS.irritation);
  assert.equal(solutionSetViewModel(state).showSolutionLine, false);
  state = nextSolutionSetState(state);
  assert.equal(state.view, SOLUTION_SET_VIEWS.testing);
  assert.equal(nextSolutionSetState(state), state);
  state = setSolutionTestValue(state, 2);
  assert.equal(state.hasTested, true);
  state = nextSolutionSetState(state);
  assert.equal(state.view, SOLUTION_SET_VIEWS.boundary);
  assert.equal(solutionSetViewModel(state).solutionInequality, "x < 3");
  assert.equal(solutionSetViewModel(state).showSolutionRange, false);
});

test("die kontrollierte Bereichsmarkierung sperrt Weiter bis zum Abschluss", () => {
  let state = createSolutionSetState();
  state = nextSolutionSetState(state);
  state = setSolutionTestValue(state, 2);
  state = nextSolutionSetState(state);
  state = nextSolutionSetState(state);
  assert.equal(state.view, SOLUTION_SET_VIEWS.revealing);
  assert.equal(state.locked, true);
  assert.equal(nextSolutionSetState(state), state);
  state = finishSolutionReveal(state);
  assert.equal(state.view, SOLUTION_SET_VIEWS.solution);
  assert.equal(solutionSetViewModel(state).showSolutionRange, true);
});

test("freie Erkundung führt erst nach einer Eingabe zum exakten Aha-Satz", () => {
  const solution = { view: SOLUTION_SET_VIEWS.solution, x: 2, locked: false, hasTested: true };
  let state = nextSolutionSetState(solution);
  assert.equal(state.view, SOLUTION_SET_VIEWS.explore);
  assert.equal(solutionSetViewModel(state).showConclusion, false);
  state = setSolutionTestValue(state, 5);
  const model = solutionSetViewModel(state);
  assert.equal(state.view, SOLUTION_SET_VIEWS.conclusion);
  assert.equal(model.testedComparison, "10 < 6");
  assert.equal(model.truthText, "falsch");
  assert.equal(model.conclusion, "Ungleichungen beschreiben häufig Mengen von Lösungen.");
});
