import { buildUniqueTriangleGeometry } from "./unique-triangles-geometry.js";

export const UNIQUE_VIEWS = Object.freeze({
  sss: "sss",
  comparing: "comparing",
  overlay: "overlay",
  ambiguity: "ambiguity",
  summary: "summary",
});

export const UNIQUE_INSIGHTS = Object.freeze({
  [UNIQUE_VIEWS.sss]: "Drei Seitenlängen bestimmen die Dreiecksform eindeutig.",
  [UNIQUE_VIEWS.comparing]:
    "Drei Seitenlängen bestimmen die Dreiecksform eindeutig.",
  [UNIQUE_VIEWS.overlay]: "Zwei mögliche Lagen, aber nur eine Dreiecksform.",
  [UNIQUE_VIEWS.ambiguity]:
    "Dieselben Angaben können zwei verschiedene Dreiecke erlauben.",
  [UNIQUE_VIEWS.summary]:
    "Entscheidend ist nicht nur die Anzahl der Angaben, sondern wie sie zusammenliegen.",
});

export function createUniqueTrianglesState() {
  return {
    view: UNIQUE_VIEWS.sss,
    locked: false,
  };
}

export function startTriangleComparison(state) {
  if (state.locked || state.view !== UNIQUE_VIEWS.sss) return state;
  return { view: UNIQUE_VIEWS.comparing, locked: true };
}

export function finishTriangleComparison(state) {
  if (state.view !== UNIQUE_VIEWS.comparing) return state;
  return { view: UNIQUE_VIEWS.overlay, locked: false };
}

export function showAmbiguousCase(state) {
  if (state.locked || state.view !== UNIQUE_VIEWS.overlay) return state;
  return { view: UNIQUE_VIEWS.ambiguity, locked: false };
}

export function finishSummaryReveal(state) {
  if (state.view !== UNIQUE_VIEWS.ambiguity) return state;
  return { view: UNIQUE_VIEWS.summary, locked: false };
}

export function resetUniqueTrianglesState() {
  return createUniqueTrianglesState();
}

export function uniqueTrianglesViewModel(
  state,
  geometry = buildUniqueTriangleGeometry(),
) {
  const sssVisible = [
    UNIQUE_VIEWS.sss,
    UNIQUE_VIEWS.comparing,
    UNIQUE_VIEWS.overlay,
  ].includes(state.view);
  const ambiguityVisible = [
    UNIQUE_VIEWS.ambiguity,
    UNIQUE_VIEWS.summary,
  ].includes(state.view);

  return {
    state,
    geometry,
    sssVisible,
    ambiguityVisible,
    showSummary: state.view === UNIQUE_VIEWS.summary,
    showLowerIntersection:
      state.view === UNIQUE_VIEWS.sss || state.view === UNIQUE_VIEWS.comparing,
    overlayComplete: state.view === UNIQUE_VIEWS.overlay,
    showPrimaryButton: [
      UNIQUE_VIEWS.sss,
      UNIQUE_VIEWS.comparing,
      UNIQUE_VIEWS.overlay,
    ].includes(state.view),
    primaryButtonLabel:
      state.view === UNIQUE_VIEWS.sss || state.view === UNIQUE_VIEWS.comparing
        ? "Dreiecke vergleichen"
        : "Anderen Fall vergleichen",
    controlsLocked: state.locked,
    insight: UNIQUE_INSIGHTS[state.view],
  };
}
