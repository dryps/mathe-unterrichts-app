import assert from "node:assert/strict";
import test from "node:test";

import {
  ANGLE_SUM_VIEWS,
  createAngleSumState,
  finishAngleSumReveal,
  angleSumViewModel,
  nextAngleSumState,
  resetAngleSumState,
  setAngleSumPosition,
} from "../src/quadrilateral-angle-sum-state.js";

test("der Startzustand verrät weder Diagonale noch Rechnung oder Winkel", () => {
  const model = angleSumViewModel(createAngleSumState());
  assert.equal(model.view, ANGLE_SUM_VIEWS.irritation);
  assert.equal(model.showDiagonal, false);
  assert.equal(model.showTriangles, false);
  assert.equal(model.showEquation, false);
  assert.equal(model.showAngles, false);
  assert.equal(model.showExplore, false);
  assert.equal(model.showConclusion, false);
});

test("die kontrollierte Lernfolge gibt genau einen Schritt nach dem anderen frei", () => {
  let state = createAngleSumState();
  const expected = [
    ANGLE_SUM_VIEWS.diagonal,
    ANGLE_SUM_VIEWS.triangles,
    ANGLE_SUM_VIEWS.equation,
    ANGLE_SUM_VIEWS.explore,
  ];
  for (const view of expected) {
    state = nextAngleSumState(state);
    assert.equal(state.view, view);
    assert.equal(state.locked, true);
    assert.equal(nextAngleSumState(state), state);
    state = finishAngleSumReveal(state);
    assert.equal(state.locked, false);
  }
  assert.equal(angleSumViewModel(state).showNext, false);
});

test("erst die Erkundung zeigt Winkel, Regler und den Aha-Satz", () => {
  const hidden = angleSumViewModel({ view: ANGLE_SUM_VIEWS.equation, locked: false, position: 0 });
  const visible = angleSumViewModel({ view: ANGLE_SUM_VIEWS.explore, locked: false, position: 0 });
  assert.equal(hidden.showAngles, false);
  assert.equal(hidden.showExplore, false);
  assert.equal(hidden.showConclusion, false);
  assert.equal(visible.showAngles, true);
  assert.equal(visible.showExplore, true);
  assert.equal(visible.showConclusion, true);
  assert.equal(visible.equation, "180° + 180° = 360°");
  assert.equal(visible.conclusion, "Zwei Dreiecke erklären die 360° im Viereck.");
});

test("der Regler verändert Einzelwinkel, nie aber ihre sichtbare Summe", () => {
  const start = { view: ANGLE_SUM_VIEWS.explore, locked: false, position: 0 };
  const moved = setAngleSumPosition(start, 78);
  assert.notDeepEqual(angleSumViewModel(start).visibleAngles, angleSumViewModel(moved).visibleAngles);
  assert.equal(angleSumViewModel(moved).visibleAngles.reduce((a, b) => a + b, 0), 360);
  assert.equal(setAngleSumPosition({ ...start, locked: true }, 40).position, 0);
});

test("Zurücksetzen stellt den neutralen Startzustand vollständig wieder her", () => {
  assert.deepEqual(resetAngleSumState(), createAngleSumState());
});
