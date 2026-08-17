import assert from "node:assert/strict";
import test from "node:test";

import {
  TERM_MULTIPLICATION_VIEWS,
  createTermMultiplicationState,
  finishTermMultiplicationFill,
  nextTermMultiplicationState,
  resetTermMultiplicationState,
  setTermMultiplicationX,
  termMultiplicationViewModel,
} from "../src/term-multiplication-state.js";

test("sechs didaktische Ansichten bleiben trotz internem Füllzustand getrennt", () => {
  let state = createTermMultiplicationState();
  assert.deepEqual(state, { view: "irritation", x: 3, locked: false });

  state = nextTermMultiplicationState(state);
  assert.equal(state.view, TERM_MULTIPLICATION_VIEWS.addition);

  state = nextTermMultiplicationState(state);
  assert.equal(state.view, TERM_MULTIPLICATION_VIEWS.square);

  state = nextTermMultiplicationState(state);
  assert.equal(state.view, TERM_MULTIPLICATION_VIEWS.filling);
  assert.equal(state.locked, true);

  state = finishTermMultiplicationFill(state);
  assert.equal(state.view, TERM_MULTIPLICATION_VIEWS.area);
  assert.equal(state.locked, false);

  state = nextTermMultiplicationState(state);
  assert.equal(state.view, TERM_MULTIPLICATION_VIEWS.comparison);

  state = nextTermMultiplicationState(state);
  assert.equal(state.view, TERM_MULTIPLICATION_VIEWS.explore);
  assert.equal(termMultiplicationViewModel(state).showNext, false);
});

test("Mehrfachtipps und Reglereingaben überspringen die Füllanimation nicht", () => {
  const filling = {
    view: TERM_MULTIPLICATION_VIEWS.filling,
    x: 3,
    locked: true,
  };

  assert.strictEqual(nextTermMultiplicationState(filling), filling);
  assert.strictEqual(setTermMultiplicationX(filling, 4), filling);
  const initial = createTermMultiplicationState();
  assert.strictEqual(finishTermMultiplicationFill(initial), initial);
});

test("jede Ansicht liefert ausschließlich die benötigten Ebenen", () => {
  const view = (name) => termMultiplicationViewModel({ view: name, x: 3, locked: false });

  assert.equal(view(TERM_MULTIPLICATION_VIEWS.irritation).showIrritation, true);
  assert.equal(view(TERM_MULTIPLICATION_VIEWS.addition).showAddition, true);
  assert.equal(view(TERM_MULTIPLICATION_VIEWS.square).showSquare, true);
  assert.equal(view(TERM_MULTIPLICATION_VIEWS.area).showArea, true);
  assert.equal(view(TERM_MULTIPLICATION_VIEWS.comparison).showComparison, true);
  assert.equal(view(TERM_MULTIPLICATION_VIEWS.explore).showExplore, true);
  assert.equal(view(TERM_MULTIPLICATION_VIEWS.explore).showConclusion, false);
});

test("freie Erkundung begrenzt x und zeigt den Schluss erst nach echter Änderung", () => {
  const explore = {
    view: TERM_MULTIPLICATION_VIEWS.explore,
    x: 3,
    locked: false,
  };

  assert.strictEqual(setTermMultiplicationX(explore, 3), explore);
  assert.equal(termMultiplicationViewModel(explore).showConclusion, false);

  const low = setTermMultiplicationX(explore, -99);
  assert.deepEqual(low, { view: "conclusion", x: 1, locked: false });
  assert.equal(termMultiplicationViewModel(low).showConclusion, true);

  const high = setTermMultiplicationX(low, 99);
  assert.deepEqual(high, { view: "conclusion", x: 5, locked: false });
  assert.equal(termMultiplicationViewModel(high).additionFormula, "x + x = 2x = 10");
  assert.equal(termMultiplicationViewModel(high).multiplicationFormula, "x · x = x² = 25");
});

test("x = 2 zeigt die Wertgleichheit ohne die Strukturen gleichzusetzen", () => {
  const state = setTermMultiplicationX(
    { view: TERM_MULTIPLICATION_VIEWS.explore, x: 3, locked: false },
    2,
  );
  const model = termMultiplicationViewModel(state);

  assert.equal(model.sameNumericValue, true);
  assert.match(model.comparisonNote, /Trotzdem bleibt 2x eine Länge und x² eine Fläche/);
  assert.equal(model.conclusion, "2x und x² sind nicht zwei Schreibweisen für dasselbe.");
});

test("Reset stellt auch aus Animation und Schlussansicht exakt den Anfang her", () => {
  for (const state of [
    { view: TERM_MULTIPLICATION_VIEWS.filling, x: 5, locked: true },
    { view: TERM_MULTIPLICATION_VIEWS.conclusion, x: 2, locked: false },
  ]) {
    assert.deepEqual(resetTermMultiplicationState(state), createTermMultiplicationState());
  }
});
