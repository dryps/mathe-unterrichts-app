import assert from "node:assert/strict";
import test from "node:test";

import {
  BOTH_SIDES_VIEWS,
  createBothSidesState,
  bothSidesViewModel,
  finishBothSidesRemoval,
  nextBothSidesState,
  resetBothSidesState,
  setSharedCoefficient,
} from "../src/both-sides-state.js";

test("Lernweg trennt Ausgang, Zerlegung, Entfernung, Ergebnis und Erkundung", () => {
  let state = createBothSidesState();
  assert.deepEqual(state, { view: "irritation", shared: 2, locked: false });
  state = nextBothSidesState(state); assert.equal(state.view, "decompose");
  state = nextBothSidesState(state); assert.deepEqual(state, { view: "removing", shared: 2, locked: true });
  state = finishBothSidesRemoval(state); assert.equal(state.view, "reduced");
  state = nextBothSidesState(state); assert.equal(state.view, "explore");
  assert.equal(bothSidesViewModel(state).showNext, false);
});

test("Mehrfachtipps und Regler überholen die Entfernung nicht", () => {
  const removing = { view: BOTH_SIDES_VIEWS.removing, shared: 2, locked: true };
  assert.strictEqual(nextBothSidesState(removing), removing);
  assert.strictEqual(setSharedCoefficient(removing, 4), removing);
});

test("reduzierter Zustand zeigt 3x + 3 = 18 ohne springenden Term", () => {
  const model = bothSidesViewModel({ view: "reduced", shared: 2, locked: false });
  assert.equal(model.equation, "3x + 3 = 18");
  assert.equal(model.showRemoved, false);
  assert.equal(model.showReduced, true);
  assert.doesNotMatch(model.insight, /spring/i);
});

test("echte Erkundungsänderung öffnet den Schluss mit unverändertem Ergebnis", () => {
  const explore = { view: BOTH_SIDES_VIEWS.explore, shared: 2, locked: false };
  assert.strictEqual(setSharedCoefficient(explore, 2), explore);
  const changed = setSharedCoefficient(explore, 4);
  assert.deepEqual(changed, { view: "conclusion", shared: 4, locked: false });
  const model = bothSidesViewModel(changed);
  assert.equal(model.sourceEquation, "7x + 3 = 4x + 18");
  assert.equal(model.equation, "3x + 3 = 18");
  assert.equal(model.conclusion, "„Rüberbringen“ ist verkürzte Schreibweise einer Äquivalenzumformung.");
});

test("Reset stellt auch aus Entfernung und Schluss exakt den Anfang her", () => {
  assert.deepEqual(resetBothSidesState(), createBothSidesState());
});
