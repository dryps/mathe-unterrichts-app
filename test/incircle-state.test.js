import assert from "node:assert/strict";
import test from "node:test";

import { INITIAL_VERTICES, nearlyEqual } from "../src/incircle-geometry.js";
import {
  INCIRCLE_INSIGHTS,
  INCIRCLE_VIEWS,
  advanceIncircle,
  createIncircleState,
  incircleViewModel,
  moveIncircleVertex,
  moveTestPoint,
  resetIncircleState,
} from "../src/incircle-state.js";

test("Ausgangszustand zeigt nur erste Winkelhalbierende, P und seine beiden Lote", () => {
  const model = incircleViewModel(createIncircleState());
  assert.equal(model.state.view, INCIRCLE_VIEWS.first);
  assert.equal(model.bisectorCount, 1);
  assert.equal(model.showTestPoint, true);
  assert.equal(model.showCenter, false);
  assert.equal(model.showCircle, false);
  assert.equal(model.verticesMovable, false);
  assert.equal(model.insight, INCIRCLE_INSIGHTS[INCIRCLE_VIEWS.first]);
});

test("P bleibt beim Ziehen auf der Winkelhalbierenden und gleich weit von AB und AC", () => {
  const moved = moveTestPoint(createIncircleState(), { x: 1050, y: 120 });
  const model = incircleViewModel(moved);
  assert.ok(
    nearlyEqual(model.geometry.testDistances.AB, model.geometry.testDistances.AC),
  );
  assert.notDeepEqual(model.geometry.testPoint, { x: 1050, y: 120 });
});

test("zweiter Zustand zeigt alle Winkelhalbierenden, I und r = r = r", () => {
  const state = advanceIncircle(createIncircleState());
  const model = incircleViewModel(state);
  assert.equal(state.view, INCIRCLE_VIEWS.allBisectors);
  assert.equal(model.bisectorCount, 3);
  assert.equal(model.showTestPoint, false);
  assert.equal(model.showCenter, true);
  assert.equal(model.showCircle, false);
  assert.equal(model.verticesMovable, false);
  assert.equal(model.primaryButtonLabel, "Inkreis zeigen");
  assert.equal(model.insight, INCIRCLE_INSIGHTS[INCIRCLE_VIEWS.allBisectors]);
});

test("letzter Zustand zeigt den Inkreis und schaltet nur die Eckpunkte frei", () => {
  const state = advanceIncircle(advanceIncircle(createIncircleState()));
  const model = incircleViewModel(state);
  assert.equal(state.view, INCIRCLE_VIEWS.incircle);
  assert.equal(model.showCircle, true);
  assert.equal(model.showPrimaryButton, false);
  assert.equal(model.verticesMovable, true);
  assert.equal(model.insight, INCIRCLE_INSIGHTS[INCIRCLE_VIEWS.incircle]);
});

test("zusätzliche Zustandsaufrufe erzeugen keinen Zustand nach dem Inkreis", () => {
  let state = createIncircleState();
  for (let index = 0; index < 8; index += 1) {
    state = advanceIncircle(state);
  }
  assert.equal(state.view, INCIRCLE_VIEWS.incircle);
  assert.strictEqual(advanceIncircle(state), state);
});

test("P ist nach dem ersten Zustand nicht mehr beweglich", () => {
  const state = advanceIncircle(createIncircleState());
  assert.strictEqual(moveTestPoint(state, { x: 700, y: 260 }), state);
});

test("Eckpunkte bleiben vor dem vollständigen Endzustand gesperrt", () => {
  for (const state of [
    createIncircleState(),
    advanceIncircle(createIncircleState()),
  ]) {
    assert.strictEqual(moveIncircleVertex(state, "C", { x: 720, y: 150 }), state);
  }
});

test("Eckpunktbewegung im Endzustand aktualisiert I, Berührpunkte und Inkreis", () => {
  let state = advanceIncircle(advanceIncircle(createIncircleState()));
  const before = incircleViewModel(state).geometry;
  state = moveIncircleVertex(state, "C", { x: 720, y: 150 });
  const after = incircleViewModel(state).geometry;
  assert.notDeepEqual(after.vertices.C, before.vertices.C);
  assert.notDeepEqual(after.center, before.center);
  assert.notDeepEqual(after.touches.BC.foot, before.touches.BC.foot);
  assert.ok(nearlyEqual(after.centerDistances.AB, after.centerDistances.BC));
  assert.ok(nearlyEqual(after.centerDistances.BC, after.centerDistances.CA));
});

test("unzulässige Bewegung zeigt Rückmeldung und bewahrt die letzte Lage", () => {
  const state = advanceIncircle(advanceIncircle(createIncircleState()));
  const rejected = moveIncircleVertex(state, "C", { x: 600, y: 550 });
  assert.deepEqual(rejected.vertices, state.vertices);
  assert.ok(rejected.feedback);
});

test("Zurücksetzen funktioniert aus jedem Zustand", () => {
  let state = createIncircleState();
  for (let step = 0; step < 3; step += 1) {
    const reset = resetIncircleState(state);
    const model = incircleViewModel(reset);
    assert.equal(reset.view, INCIRCLE_VIEWS.first);
    assert.deepEqual(reset.vertices, INITIAL_VERTICES);
    assert.equal(model.bisectorCount, 1);
    assert.equal(model.showCenter, false);
    assert.equal(model.showCircle, false);
    state = advanceIncircle(state);
  }
});

test("nach dem Zurücksetzen ist der vollständige Aufbau erneut möglich", () => {
  let state = resetIncircleState();
  state = advanceIncircle(advanceIncircle(state));
  assert.equal(incircleViewModel(state).showCircle, true);
});
