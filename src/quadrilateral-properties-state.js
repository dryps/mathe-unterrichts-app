import { PROPERTIES_TARGET_CONFIG } from "./quadrilateral-properties-animation.js";
import { createParallelogram, normalizeParallelogramConfig } from "./quadrilateral-properties-geometry.js";

export const PROPERTIES_VIEWS = Object.freeze({ irritation: "irritation", properties: "properties", transforming: "transforming", transformed: "transformed", explore: "explore", conclusion: "conclusion" });
const CONCLUSION = "Viereckstypen werden über Eigenschaften definiert, nicht über typische Bilder.";
const make = (view, config, locked = false) => Object.freeze({ view, config: normalizeParallelogramConfig(config), locked });

export function createPropertiesState() { return make(PROPERTIES_VIEWS.irritation, {}); }
export function nextPropertiesState(current) {
  if (current.locked) return current;
  const next = { irritation: PROPERTIES_VIEWS.properties, properties: PROPERTIES_VIEWS.transforming, transformed: PROPERTIES_VIEWS.explore }[current.view];
  return next ? make(next, current.config, next === PROPERTIES_VIEWS.transforming) : current;
}
export function finishPropertiesTransform(current) { return current.view === PROPERTIES_VIEWS.transforming ? make(PROPERTIES_VIEWS.transformed, PROPERTIES_TARGET_CONFIG) : current; }
export function setPropertiesControl(current, control, value) {
  if (current.locked || ![PROPERTIES_VIEWS.explore, PROPERTIES_VIEWS.conclusion].includes(current.view) || !["rotation", "shiftX", "slant"].includes(control)) return current;
  return make(PROPERTIES_VIEWS.conclusion, { ...current.config, [control]: value });
}
export function resetPropertiesState() { return createPropertiesState(); }
export function propertiesViewModel(current) {
  const geometry = createParallelogram(current.config);
  const showMarkers = current.view !== PROPERTIES_VIEWS.irritation;
  const showExplore = [PROPERTIES_VIEWS.explore, PROPERTIES_VIEWS.conclusion].includes(current.view);
  const showConclusion = current.view === PROPERTIES_VIEWS.conclusion;
  const insights = {
    irritation: "Sieht ein Parallelogramm nur in dieser typischen Lage wie ein Parallelogramm aus?",
    properties: "Diese Eigenschaften zählen: Gegenüberliegende Seiten sind parallel und gleich lang.",
    transforming: "Drehung, Verschiebung und Verformung ändern das Bild – beobachte die Marker.",
    transformed: "Die Figur sieht anders aus. Beide markierten Seitenpaare behalten ihre Eigenschaften.",
    explore: "Verändere Lage und Form selbst. Die Eigenschaftsmarker bleiben gültig.",
    conclusion: CONCLUSION,
  };
  return Object.freeze({
    ...geometry,
    showMarkers,
    showExplore,
    showConclusion,
    showNext: [PROPERTIES_VIEWS.irritation, PROPERTIES_VIEWS.properties, PROPERTIES_VIEWS.transformed].includes(current.view),
    controlsLocked: current.locked,
    controlsInteractive: showExplore && !current.locked,
    transforming: current.view === PROPERTIES_VIEWS.transforming,
    insight: insights[current.view],
    conclusion: CONCLUSION,
  });
}
