import assert from "node:assert/strict";
import test from "node:test";

import {
  TERMS_VARIABLES_INSIGHTS,
  TERMS_VARIABLES_VIEWS,
  advanceChangingValue,
  createTermsVariablesState,
  nextTermsVariablesState,
  resetTermsVariablesState,
  setExplorationX,
  termsVariablesViewModel,
} from "../src/terms-variables-state.js";

test("die Zustandsmaschine durchläuft genau sechs didaktische Ansichten", () => {
  assert.deepEqual(Object.values(TERMS_VARIABLES_VIEWS), [
    "irritation",
    "structure",
    "assigned",
    "changing",
    "comparison",
    "exploration",
  ]);

  let state = createTermsVariablesState();
  assert.deepEqual(state, { view: "irritation", x: null, locked: false });

  state = nextTermsVariablesState(state);
  assert.deepEqual(state, { view: "structure", x: null, locked: false });

  state = nextTermsVariablesState(state);
  assert.deepEqual(state, { view: "assigned", x: 1, locked: false });

  state = nextTermsVariablesState(state);
  assert.deepEqual(state, { view: "changing", x: 1, locked: true });
  assert.strictEqual(nextTermsVariablesState(state), state);

  state = advanceChangingValue(state, 2);
  assert.deepEqual(state, { view: "changing", x: 2, locked: true });
  assert.strictEqual(nextTermsVariablesState(state), state);

  state = advanceChangingValue(state, 3);
  assert.deepEqual(state, { view: "changing", x: 3, locked: false });

  state = nextTermsVariablesState(state);
  assert.deepEqual(state, { view: "comparison", x: 3, locked: false });

  state = nextTermsVariablesState(state);
  assert.deepEqual(state, { view: "exploration", x: 3, locked: false });
  assert.strictEqual(nextTermsVariablesState(state), state);
});

test("nur Zustand vier nimmt die kontrollierten Sequenzwerte zwei und drei an", () => {
  const irritation = createTermsVariablesState();
  assert.strictEqual(advanceChangingValue(irritation, 2), irritation);

  const changing = { view: TERMS_VARIABLES_VIEWS.changing, x: 1, locked: true };
  assert.deepEqual(advanceChangingValue(changing, 2), {
    view: TERMS_VARIABLES_VIEWS.changing,
    x: 2,
    locked: true,
  });
  assert.strictEqual(advanceChangingValue(changing, 3), changing);
  assert.deepEqual(advanceChangingValue({ ...changing, x: 2 }, 3), {
    view: TERMS_VARIABLES_VIEWS.changing,
    x: 3,
    locked: false,
  });
  assert.strictEqual(advanceChangingValue(changing, 0), changing);
  assert.strictEqual(advanceChangingValue(changing, 4), changing);
});

test("freie x-Eingabe ist ausschließlich im letzten Zustand ganzzahlig null bis fünf möglich", () => {
  const comparison = { view: TERMS_VARIABLES_VIEWS.comparison, x: 3, locked: false };
  assert.strictEqual(setExplorationX(comparison, 5), comparison);

  const exploration = { view: TERMS_VARIABLES_VIEWS.exploration, x: 3, locked: false };
  assert.deepEqual(setExplorationX(exploration, -9), { ...exploration, x: 0 });
  assert.deepEqual(setExplorationX(exploration, 2.6), { ...exploration, x: 3 });
  assert.deepEqual(setExplorationX(exploration, 99), { ...exploration, x: 5 });
});

test("Reset stellt auch aus dem laufenden gesperrten Zustand exakt die Irritation her", () => {
  for (const state of [
    { view: "irritation", x: null, locked: false },
    { view: "structure", x: null, locked: false },
    { view: "assigned", x: 1, locked: false },
    { view: "changing", x: 1, locked: true },
    { view: "changing", x: 2, locked: true },
    { view: "changing", x: 3, locked: false },
    { view: "comparison", x: 3, locked: false },
    { view: "exploration", x: 5, locked: false },
  ]) {
    assert.deepEqual(resetTermsVariablesState(state), createTermsVariablesState());
  }
});

test("das Ansichtsmodell zeigt Inhalte nicht verfrüht und sperrt nur Weiter", () => {
  const irritation = termsVariablesViewModel(createTermsVariablesState());
  assert.equal(irritation.showBlocks, false);
  assert.equal(irritation.showAssigned, false);
  assert.equal(irritation.showComparison, false);
  assert.equal(irritation.showExploration, false);
  assert.equal(irritation.showConclusion, false);

  const changing = termsVariablesViewModel({ view: "changing", x: 2, locked: true });
  assert.equal(changing.showBlocks, true);
  assert.equal(changing.showAssigned, true);
  assert.equal(changing.showNext, true);
  assert.equal(changing.nextDisabled, true);
  assert.equal(changing.sliderDisabled, true);
  assert.equal(changing.resetDisabled, false);

  const exploration = termsVariablesViewModel({ view: "exploration", x: 3, locked: false });
  assert.equal(exploration.showComparison, false);
  assert.equal(exploration.showExploration, true);
  assert.equal(exploration.showConclusion, true);
  assert.equal(exploration.showNext, false);
  assert.equal(exploration.sliderDisabled, false);
});

test("Erkenntnissätze führen zur verbindlichen Abschlussbotschaft", () => {
  assert.equal(TERMS_VARIABLES_INSIGHTS.irritation, "Ist das eine Zahl – oder beschreibt der Term etwas?");
  assert.equal(TERMS_VARIABLES_INSIGHTS.structure, "Der Term besteht aus zweimal x und drei Einern.");
  assert.equal(TERMS_VARIABLES_INSIGHTS.assigned, "Wenn x einen Wert bekommt, bekommt auch der Term einen Wert.");
  assert.equal(TERMS_VARIABLES_INSIGHTS.changing, "x verändert sich – der Aufbau des Terms bleibt gleich.");
  assert.equal(TERMS_VARIABLES_INSIGHTS.comparison, "Derselbe Term kann verschiedene Werte haben.");
  assert.equal(
    TERMS_VARIABLES_INSIGHTS.exploration,
    "2x + 3 bleibt derselbe Term. Wenn x sich ändert, ändert sich sein Wert.",
  );
});
