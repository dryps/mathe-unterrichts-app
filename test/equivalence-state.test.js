import assert from "node:assert/strict";
import test from "node:test";

import {
  EQUIVALENCE_VIEWS,
  createEquivalenceState,
  equivalenceViewModel,
  nextEquivalenceState,
  resetEquivalenceState,
  setEquivalenceDelta,
} from "../src/equivalence-state.js";

test("der Lernweg trennt Irritation, Fehler, Reparatur, Subtraktion, Division und Erkundung", () => {
  let state = createEquivalenceState();
  assert.deepEqual(state, { view: "irritation", delta: -5 });
  for (const view of ["oneSided", "restore", "subtractBoth", "divideBoth", "explore"]) {
    state = nextEquivalenceState(state);
    assert.equal(state.view, view);
  }
  assert.equal(equivalenceViewModel(state).showNext, false);
});

test("die einseitige Änderung kippt nur in ihrem eigenen Zustand", () => {
  const oneSided = equivalenceViewModel({ view: EQUIVALENCE_VIEWS.oneSided, delta: -5 });
  assert.equal(oneSided.balanced, false);
  assert.equal(oneSided.leftValue, 15);
  assert.equal(oneSided.rightValue, 20);
  assert.equal(oneSided.showWarning, true);
  for (const view of ["irritation", "restore", "subtractBoth", "divideBoth", "explore", "conclusion"]) {
    assert.equal(equivalenceViewModel({ view, delta: -5 }).balanced, true, view);
  }
});

test("beidseitige Subtraktion und Division zeigen die kanonischen Gleichungen", () => {
  assert.equal(equivalenceViewModel({ view: "subtractBoth", delta: -5 }).equation, "3x = 15");
  assert.equal(equivalenceViewModel({ view: "divideBoth", delta: -5 }).equation, "x = 5");
});

test("Erkundung führt erst nach einer echten Regleränderung zur Schlussansicht", () => {
  const explore = { view: EQUIVALENCE_VIEWS.explore, delta: -5 };
  assert.strictEqual(setEquivalenceDelta(explore, -5), explore);
  const changed = setEquivalenceDelta(explore, 4);
  assert.deepEqual(changed, { view: "conclusion", delta: 4 });
  const model = equivalenceViewModel(changed);
  assert.equal(model.equation, "3x + 9 = 24");
  assert.equal(model.leftValue, 24);
  assert.equal(model.rightValue, 24);
  assert.equal(model.conclusion, "Zulässige gleiche Operationen auf beiden Seiten erhalten die Lösungsmenge.");
});

test("Regler außerhalb der Erkundung bleibt wirkungslos und Reset ist vollständig", () => {
  const initial = createEquivalenceState();
  assert.strictEqual(setEquivalenceDelta(initial, 4), initial);
  assert.deepEqual(resetEquivalenceState(), initial);
});
