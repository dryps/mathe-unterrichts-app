import assert from "node:assert/strict";
import test from "node:test";

import { INITIAL_VERTICES, nearlyEqual } from "../src/circumcircle-geometry.js";
import {
  CIRCUMCIRCLE_INSIGHTS,
  CIRCUMCIRCLE_VIEWS,
  advanceCircumcircle,
  circumcircleViewModel,
  createCircumcircleState,
  moveCircumcircleVertex,
  moveTestPoint,
  resetCircumcircleState,
} from "../src/circumcircle-state.js";

test("Ausgangszustand zeigt nur erste Mittelsenkrechte, P und PA = PB", () => {
  const model = circumcircleViewModel(createCircumcircleState());
  assert.equal(model.state.view, CIRCUMCIRCLE_VIEWS.first);
  assert.equal(model.bisectorCount, 1);
  assert.equal(model.showTestPoint, true);
  assert.equal(model.showIntersection, false);
  assert.equal(model.showCircle, false);
  assert.equal(model.verticesMovable, false);
  assert.equal(model.insight, CIRCUMCIRCLE_INSIGHTS.first);
});

test("P bleibt beim Ziehen auf der ersten Mittelsenkrechten und PA gleich PB", () => {
  const moved = moveTestPoint(createCircumcircleState(), { x: 940, y: 640 });
  const model = circumcircleViewModel(moved);
  assert.ok(nearlyEqual(model.geometry.testDistances.A, model.geometry.testDistances.B));
  assert.notDeepEqual(model.geometry.testPoint, { x: 940, y: 640 });
});

test("zweiter Schritt zeigt genau zwei Mittelsenkrechten ohne M oder Umkreis", () => {
  const state = advanceCircumcircle(createCircumcircleState());
  const model = circumcircleViewModel(state);
  assert.equal(state.view, CIRCUMCIRCLE_VIEWS.second);
  assert.equal(model.bisectorCount, 2);
  assert.equal(model.showTestPoint, false);
  assert.equal(model.showIntersection, false);
  assert.equal(model.showCircle, false);
  assert.equal(model.insight, CIRCUMCIRCLE_INSIGHTS.first);
});

test("dritter Schritt zeigt alle Mittelsenkrechten, M und drei Radiusstrecken", () => {
  let state = createCircumcircleState();
  state = advanceCircumcircle(state);
  state = advanceCircumcircle(state);
  const model = circumcircleViewModel(state);
  assert.equal(state.view, CIRCUMCIRCLE_VIEWS.intersection);
  assert.equal(model.bisectorCount, 3);
  assert.equal(model.showIntersection, true);
  assert.equal(model.showCircle, false);
  assert.equal(model.primaryButtonLabel, "Umkreis zeigen");
  assert.equal(model.insight, CIRCUMCIRCLE_INSIGHTS.intersection);
});

test("letzter Schritt zeigt den Umkreis und schaltet die Eckpunkte frei", () => {
  let state = createCircumcircleState();
  state = advanceCircumcircle(advanceCircumcircle(advanceCircumcircle(state)));
  const model = circumcircleViewModel(state);
  assert.equal(state.view, CIRCUMCIRCLE_VIEWS.circle);
  assert.equal(model.showCircle, true);
  assert.equal(model.showPrimaryButton, false);
  assert.equal(model.verticesMovable, true);
  assert.equal(model.insight, CIRCUMCIRCLE_INSIGHTS.circle);
});

test("schnelle zusätzliche Zustandsaufrufe erzeugen keinen Zustand nach dem Umkreis", () => {
  let state = createCircumcircleState();
  for (let index = 0; index < 8; index += 1) {
    state = advanceCircumcircle(state);
  }
  assert.equal(state.view, CIRCUMCIRCLE_VIEWS.circle);
  assert.strictEqual(advanceCircumcircle(state), state);
});

test("P ist nach dem ersten Zustand nicht mehr beweglich", () => {
  const second = advanceCircumcircle(createCircumcircleState());
  assert.strictEqual(moveTestPoint(second, { x: 700, y: 200 }), second);
});

test("Eckpunkte bleiben vor dem vollständigen Endzustand gesperrt", () => {
  for (const state of [
    createCircumcircleState(),
    advanceCircumcircle(createCircumcircleState()),
    advanceCircumcircle(advanceCircumcircle(createCircumcircleState())),
  ]) {
    assert.strictEqual(moveCircumcircleVertex(state, "C", { x: 650, y: 210 }), state);
  }
});

test("Eckpunktbewegung im Endzustand aktualisiert Mittelpunkte, M und Kreis dynamisch", () => {
  let state = createCircumcircleState();
  state = advanceCircumcircle(advanceCircumcircle(advanceCircumcircle(state)));
  const before = circumcircleViewModel(state).geometry;
  state = moveCircumcircleVertex(state, "C", { x: 650, y: 130 });
  const after = circumcircleViewModel(state).geometry;
  assert.notDeepEqual(after.vertices.C, before.vertices.C);
  assert.notDeepEqual(after.center, before.center);
  assert.ok(nearlyEqual(after.radii.A, after.radii.B));
  assert.ok(nearlyEqual(after.radii.B, after.radii.C));
});

test("unzulässige Eckpunktbewegung zeigt Rückmeldung und bewahrt die letzte Lage", () => {
  let state = createCircumcircleState();
  state = advanceCircumcircle(advanceCircumcircle(advanceCircumcircle(state)));
  const before = state.vertices;
  const rejected = moveCircumcircleVertex(state, "C", { x: 600, y: 539 });
  assert.deepEqual(rejected.vertices, before);
  assert.ok(rejected.feedback);
});

test("Zurücksetzen funktioniert aus jedem Zustand und entfernt spätere Elemente", () => {
  let state = createCircumcircleState();
  for (let step = 0; step < 4; step += 1) {
    const reset = resetCircumcircleState(state);
    const model = circumcircleViewModel(reset);
    assert.equal(reset.view, CIRCUMCIRCLE_VIEWS.first);
    assert.deepEqual(reset.vertices, INITIAL_VERTICES);
    assert.equal(model.bisectorCount, 1);
    assert.equal(model.showIntersection, false);
    assert.equal(model.showCircle, false);
    state = advanceCircumcircle(state);
  }
});

test("nach dem Zurücksetzen ist der vollständige Aufbau erneut möglich", () => {
  let state = resetCircumcircleState();
  state = advanceCircumcircle(advanceCircumcircle(advanceCircumcircle(state)));
  assert.equal(circumcircleViewModel(state).showCircle, true);
});
