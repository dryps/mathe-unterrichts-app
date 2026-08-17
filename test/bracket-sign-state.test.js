import assert from "node:assert/strict";
import test from "node:test";

import {
  BRACKET_SIGN_VIEWS,
  bracketSignViewModel,
  createBracketSignState,
  finishBracketSignAction,
  nextBracketSignState,
  resetBracketSignState,
  setBracketOuterFactor,
} from "../src/bracket-sign-state.js";

test("sieben didaktische Ansichten bleiben trotz internem Wirkzustand getrennt", () => {
  let state = createBracketSignState();
  assert.deepEqual(state, { view: "irritation", outerFactor: -1, locked: false });

  state = nextBracketSignState(state);
  assert.equal(state.view, "package");
  state = nextBracketSignState(state);
  assert.equal(state.view, "plus");
  assert.equal(bracketSignViewModel(state).resultExpression, "x − 3");

  state = nextBracketSignState(state);
  assert.deepEqual(state, { view: "acting", outerFactor: -1, locked: true });
  state = finishBracketSignAction(state);
  assert.equal(state.view, "minus");
  assert.equal(bracketSignViewModel(state).resultExpression, "−x + 3");

  state = nextBracketSignState(state);
  assert.equal(state.view, "comparison");
  state = nextBracketSignState(state);
  assert.equal(state.view, "explore");
  assert.equal(bracketSignViewModel(state).showNext, false);
});

test("Mehrfachtipps und Regler überspringen die Minuswirkung nicht", () => {
  const acting = { view: BRACKET_SIGN_VIEWS.acting, outerFactor: -1, locked: true };

  assert.strictEqual(nextBracketSignState(acting), acting);
  assert.strictEqual(setBracketOuterFactor(acting, 1), acting);
  const initial = createBracketSignState();
  assert.strictEqual(finishBracketSignAction(initial), initial);
});

test("jede Ansicht gibt ausschließlich die benötigten Ebenen frei", () => {
  const view = (name) => bracketSignViewModel({ view: name, outerFactor: -1, locked: name === "acting" });

  assert.equal(view("irritation").showIrritation, true);
  assert.equal(view("package").showPackage, true);
  assert.equal(view("plus").showPlus, true);
  assert.equal(view("acting").showActing, true);
  assert.equal(view("minus").showMinus, true);
  assert.equal(view("comparison").showComparison, true);
  assert.equal(view("explore").showExplore, true);
  assert.equal(view("explore").showConclusion, false);
});

test("freie Erkundung reagiert erst auf einen echten Faktorwechsel", () => {
  const explore = { view: BRACKET_SIGN_VIEWS.explore, outerFactor: -1, locked: false };

  assert.strictEqual(setBracketOuterFactor(explore, -1), explore);
  const plus = setBracketOuterFactor(explore, 1);
  assert.deepEqual(plus, { view: "conclusion", outerFactor: 1, locked: false });
  assert.equal(bracketSignViewModel(plus).resultExpression, "x − 3");
  assert.equal(bracketSignViewModel(plus).showConclusion, true);

  const minus = setBracketOuterFactor(plus, -1);
  assert.deepEqual(minus, { view: "conclusion", outerFactor: -1, locked: false });
  assert.equal(bracketSignViewModel(minus).resultExpression, "−x + 3");
});

test("Reset stellt aus Animation und Schlussansicht exakt den Anfang her", () => {
  for (const state of [
    { view: BRACKET_SIGN_VIEWS.acting, outerFactor: -1, locked: true },
    { view: BRACKET_SIGN_VIEWS.conclusion, outerFactor: 1, locked: false },
  ]) {
    assert.deepEqual(resetBracketSignState(state), createBracketSignState());
  }
});

test("Kernerkenntnis bleibt auf die Wirkung auf das gesamte Paket begrenzt", () => {
  for (const view of Object.values(BRACKET_SIGN_VIEWS)) {
    const model = bracketSignViewModel({ view, outerFactor: -1, locked: view === "acting" });
    assert.doesNotMatch(model.insight, /Gleichung|Distributivgesetz|ausmultiplizieren/i);
  }
  assert.equal(
    bracketSignViewModel({ view: "conclusion", outerFactor: 1, locked: false }).conclusion,
    "Das Minus wirkt auf das gesamte Paket.",
  );
});

