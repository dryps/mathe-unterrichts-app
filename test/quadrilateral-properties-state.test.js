import assert from "node:assert/strict";
import test from "node:test";

import { PROPERTIES_TARGET_CONFIG } from "../src/quadrilateral-properties-animation.js";
import { PROPERTIES_VIEWS, createPropertiesState, finishPropertiesTransform, nextPropertiesState, propertiesViewModel, setPropertiesControl } from "../src/quadrilateral-properties-state.js";

test("Marker erscheinen vor der Veränderung und bleiben danach erhalten", () => {
  let state = createPropertiesState();
  assert.equal(propertiesViewModel(state).showMarkers, false);
  state = nextPropertiesState(state);
  assert.equal(state.view, PROPERTIES_VIEWS.properties);
  assert.equal(propertiesViewModel(state).showMarkers, true);
  state = nextPropertiesState(state);
  assert.equal(state.view, PROPERTIES_VIEWS.transforming);
  assert.equal(state.locked, true);
  assert.equal(propertiesViewModel(state).showMarkers, true);
  state = finishPropertiesTransform(state);
  assert.equal(state.view, PROPERTIES_VIEWS.transformed);
  assert.deepEqual(state.config, PROPERTIES_TARGET_CONFIG);
});

test("gesperrte Bewegung lässt sich nicht überholen", () => {
  const transforming = nextPropertiesState(nextPropertiesState(createPropertiesState()));
  assert.equal(nextPropertiesState(transforming), transforming);
  assert.equal(setPropertiesControl(transforming, "rotation", 10), transforming);
});

test("erst eine eigene Veränderung öffnet den exakten Aha-Satz", () => {
  const transformed = { view: PROPERTIES_VIEWS.transformed, config: PROPERTIES_TARGET_CONFIG, locked: false };
  let state = nextPropertiesState(transformed);
  assert.equal(state.view, PROPERTIES_VIEWS.explore);
  assert.equal(propertiesViewModel(state).showConclusion, false);
  state = setPropertiesControl(state, "rotation", 10);
  const model = propertiesViewModel(state);
  assert.equal(state.view, PROPERTIES_VIEWS.conclusion);
  assert.equal(model.config.rotation, 10);
  assert.equal(model.conclusion, "Viereckstypen werden über Eigenschaften definiert, nicht über typische Bilder.");
});
