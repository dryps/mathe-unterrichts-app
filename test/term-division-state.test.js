import assert from "node:assert/strict";
import test from "node:test";

import {
  TERM_DIVISION_VIEWS,
  createTermDivisionState,
  finishTermDivisionBuild,
  nextTermDivisionState,
  resetTermDivisionState,
  setTermDivisionGroups,
  termDivisionViewModel,
} from "../src/term-division-state.js";

test("sieben didaktische Ansichten bleiben trotz internem Aufbauzustand getrennt", () => {
  let state = createTermDivisionState();
  assert.deepEqual(state, { view: "irritation", groups: 3, locked: false });

  state = nextTermDivisionState(state);
  assert.equal(state.view, TERM_DIVISION_VIEWS.factors);

  state = nextTermDivisionState(state);
  assert.deepEqual(state, { view: "building", groups: 3, locked: true });

  state = finishTermDivisionBuild(state);
  assert.equal(state.view, TERM_DIVISION_VIEWS.groups);

  for (const expected of ["division", "result", "explore"]) {
    state = nextTermDivisionState(state);
    assert.equal(state.view, expected);
  }

  assert.equal(termDivisionViewModel(state).showNext, false);
});

test("Mehrfachtipps und Reglereingaben überspringen den Gruppenaufbau nicht", () => {
  const building = { view: TERM_DIVISION_VIEWS.building, groups: 3, locked: true };

  assert.strictEqual(nextTermDivisionState(building), building);
  assert.strictEqual(setTermDivisionGroups(building, 5), building);
  const initial = createTermDivisionState();
  assert.strictEqual(finishTermDivisionBuild(initial), initial);
});

test("jede Ansicht legt nur die benötigten Bedeutungsebenen frei", () => {
  const view = (name) => termDivisionViewModel({ view: name, groups: 3, locked: false });

  assert.equal(view("irritation").showIrritation, true);
  assert.equal(view("factors").showFactors, true);
  assert.equal(view("building").showBuilding, true);
  assert.equal(view("groups").showGroups, true);
  assert.equal(view("groups").showDivision, false);
  assert.equal(view("division").showDivision, true);
  assert.equal(view("division").showResult, false);
  assert.equal(view("result").showResult, true);
  assert.equal(view("explore").showExplore, true);
  assert.equal(view("explore").showConclusion, false);
});

test("freie Erkundung begrenzt Gruppen und zeigt den Schluss erst nach echter Änderung", () => {
  const explore = { view: TERM_DIVISION_VIEWS.explore, groups: 3, locked: false };

  assert.strictEqual(setTermDivisionGroups(explore, 3), explore);
  assert.equal(termDivisionViewModel(explore).showConclusion, false);

  const low = setTermDivisionGroups(explore, -20);
  assert.deepEqual(low, { view: "conclusion", groups: 2, locked: false });
  assert.equal(termDivisionViewModel(low).equation, "(2 · 4 · x) : 2 = 4x");

  const high = setTermDivisionGroups(low, 99);
  assert.deepEqual(high, { view: "conclusion", groups: 5, locked: false });
  assert.equal(termDivisionViewModel(high).packages.length, 5);
});

test("Reset stellt aus Animation und Schlussansicht exakt den Anfang wieder her", () => {
  for (const state of [
    { view: TERM_DIVISION_VIEWS.building, groups: 5, locked: true },
    { view: TERM_DIVISION_VIEWS.conclusion, groups: 2, locked: false },
  ]) {
    assert.deepEqual(resetTermDivisionState(state), createTermDivisionState());
  }
});

test("Erkenntnisse beschreiben Gruppen statt magischem Wegstreichen", () => {
  const states = Object.values(TERM_DIVISION_VIEWS).map((view) =>
    termDivisionViewModel({ view, groups: 3, locked: view === "building" }),
  );

  for (const model of states) assert.doesNotMatch(model.insight, /wegstreichen|kürzen/i);
  assert.equal(states.at(-1).conclusion, "Division macht einen vorhandenen Faktor rückgängig.");
});
