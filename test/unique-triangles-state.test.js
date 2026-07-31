import assert from "node:assert/strict";
import test from "node:test";

import {
  UNIQUE_INSIGHTS,
  UNIQUE_VIEWS,
  createUniqueTrianglesState,
  finishSummaryReveal,
  finishTriangleComparison,
  resetUniqueTrianglesState,
  showAmbiguousCase,
  startTriangleComparison,
  uniqueTrianglesViewModel,
} from "../src/unique-triangles-state.js";

test("Ausgangszustand zeigt SSS mit beiden Lagen und dem ersten Button", () => {
  const state = createUniqueTrianglesState();
  const model = uniqueTrianglesViewModel(state);
  assert.equal(state.view, UNIQUE_VIEWS.sss);
  assert.equal(state.locked, false);
  assert.equal(model.sssVisible, true);
  assert.equal(model.ambiguityVisible, false);
  assert.equal(model.showLowerIntersection, true);
  assert.equal(model.primaryButtonLabel, "Dreiecke vergleichen");
  assert.equal(model.insight, UNIQUE_INSIGHTS[UNIQUE_VIEWS.sss]);
});

test("Vergleich sperrt Eingaben und schnelle Mehrfachtipps ändern nichts", () => {
  const comparing = startTriangleComparison(createUniqueTrianglesState());
  const repeated = startTriangleComparison(comparing);
  assert.equal(comparing.view, UNIQUE_VIEWS.comparing);
  assert.equal(comparing.locked, true);
  assert.deepEqual(repeated, comparing);
  assert.equal(uniqueTrianglesViewModel(comparing).controlsLocked, true);
});

test("deterministischer Endzustand zeigt die Deckungsgleichheit", () => {
  const comparing = startTriangleComparison(createUniqueTrianglesState());
  const overlay = finishTriangleComparison(comparing);
  const model = uniqueTrianglesViewModel(overlay);
  assert.equal(overlay.view, UNIQUE_VIEWS.overlay);
  assert.equal(overlay.locked, false);
  assert.equal(model.overlayComplete, true);
  assert.equal(model.showLowerIntersection, false);
  assert.equal(model.primaryButtonLabel, "Anderen Fall vergleichen");
  assert.equal(model.insight, UNIQUE_INSIGHTS[UNIQUE_VIEWS.overlay]);
});

test("der andere Fall zeigt zunächst beide Formen ohne verfrühte Zusammenfassung", () => {
  const overlay = finishTriangleComparison(
    startTriangleComparison(createUniqueTrianglesState()),
  );
  const ambiguity = showAmbiguousCase(overlay);
  const model = uniqueTrianglesViewModel(ambiguity);
  assert.equal(ambiguity.view, UNIQUE_VIEWS.ambiguity);
  assert.equal(ambiguity.locked, false);
  assert.equal(model.sssVisible, false);
  assert.equal(model.ambiguityVisible, true);
  assert.equal(model.showSummary, false);
  assert.equal(model.showPrimaryButton, false);
  assert.equal(model.controlsLocked, false);
  assert.equal(model.insight, UNIQUE_INSIGHTS[UNIQUE_VIEWS.ambiguity]);
});

test("Abschlusszustand zeigt den kompakten Vergleich und die Abschlusserkenntnis", () => {
  const overlay = finishTriangleComparison(
    startTriangleComparison(createUniqueTrianglesState()),
  );
  const summary = finishSummaryReveal(showAmbiguousCase(overlay));
  const model = uniqueTrianglesViewModel(summary);
  assert.equal(summary.view, UNIQUE_VIEWS.summary);
  assert.equal(summary.locked, false);
  assert.equal(model.showSummary, true);
  assert.equal(model.showPrimaryButton, false);
  assert.equal(model.insight, UNIQUE_INSIGHTS[UNIQUE_VIEWS.summary]);
});

test("Zustandswechsel außerhalb der vorgesehenen Reihenfolge bleiben wirkungslos", () => {
  const initial = createUniqueTrianglesState();
  assert.deepEqual(finishTriangleComparison(initial), initial);
  assert.deepEqual(showAmbiguousCase(initial), initial);
  assert.deepEqual(finishSummaryReveal(initial), initial);
});

test("Zurücksetzen stellt aus jedem Zustand exakt den Ausgang wieder her", () => {
  const initial = createUniqueTrianglesState();
  const comparing = startTriangleComparison(initial);
  const overlay = finishTriangleComparison(comparing);
  const ambiguity = showAmbiguousCase(overlay);
  const summary = finishSummaryReveal(ambiguity);
  for (const state of [initial, comparing, overlay, ambiguity, summary]) {
    assert.deepEqual(resetUniqueTrianglesState(state), initial);
  }
});

test("erneuter vollständiger Aufbau bleibt deterministisch", () => {
  function complete() {
    let state = createUniqueTrianglesState();
    state = startTriangleComparison(state);
    state = finishTriangleComparison(state);
    state = showAmbiguousCase(state);
    return finishSummaryReveal(state);
  }
  assert.deepEqual(complete(), complete());
  assert.deepEqual(
    uniqueTrianglesViewModel(complete()).geometry,
    uniqueTrianglesViewModel(complete()).geometry,
  );
});
