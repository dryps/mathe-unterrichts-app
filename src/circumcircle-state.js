import {
  INITIAL_TEST_TARGET,
  INITIAL_VERTICES,
  attemptVertexMove,
  buildCircumcircleGeometry,
  copyVertices,
} from "./circumcircle-geometry.js";

export const CIRCUMCIRCLE_VIEWS = Object.freeze({
  first: "first",
  second: "second",
  intersection: "intersection",
  circle: "circle",
});

export const CIRCUMCIRCLE_INSIGHTS = Object.freeze({
  first:
    "Jeder Punkt auf der Mittelsenkrechten ist von beiden Endpunkten gleich weit entfernt.",
  intersection: "Der Schnittpunkt ist von allen drei Eckpunkten gleich weit entfernt.",
  circle: "Deshalb ist M der Mittelpunkt des Umkreises.",
});

export function createCircumcircleState() {
  return {
    view: CIRCUMCIRCLE_VIEWS.first,
    vertices: copyVertices(INITIAL_VERTICES),
    testTarget: { ...INITIAL_TEST_TARGET },
    feedback: "",
  };
}

export function advanceCircumcircle(state) {
  const nextView = {
    [CIRCUMCIRCLE_VIEWS.first]: CIRCUMCIRCLE_VIEWS.second,
    [CIRCUMCIRCLE_VIEWS.second]: CIRCUMCIRCLE_VIEWS.intersection,
    [CIRCUMCIRCLE_VIEWS.intersection]: CIRCUMCIRCLE_VIEWS.circle,
  }[state.view];
  if (!nextView) return state;
  return { ...state, view: nextView, feedback: "" };
}

export function moveTestPoint(state, target) {
  if (state.view !== CIRCUMCIRCLE_VIEWS.first) return state;
  const geometry = buildCircumcircleGeometry(state.vertices, target);
  return { ...state, testTarget: geometry.testPoint, feedback: "" };
}

export function moveCircumcircleVertex(state, key, target) {
  if (state.view !== CIRCUMCIRCLE_VIEWS.circle) return state;
  const result = attemptVertexMove(state.vertices, key, target);
  if (!result.accepted) {
    return { ...state, feedback: result.reason };
  }
  return { ...state, vertices: result.vertices, feedback: "" };
}

export function resetCircumcircleState() {
  return createCircumcircleState();
}

export function circumcircleViewModel(state) {
  const geometry = buildCircumcircleGeometry(state.vertices, state.testTarget);
  const bisectorCount = {
    [CIRCUMCIRCLE_VIEWS.first]: 1,
    [CIRCUMCIRCLE_VIEWS.second]: 2,
    [CIRCUMCIRCLE_VIEWS.intersection]: 3,
    [CIRCUMCIRCLE_VIEWS.circle]: 3,
  }[state.view];
  const showIntersection =
    state.view === CIRCUMCIRCLE_VIEWS.intersection ||
    state.view === CIRCUMCIRCLE_VIEWS.circle;
  const showCircle = state.view === CIRCUMCIRCLE_VIEWS.circle;

  return {
    state,
    geometry,
    bisectorCount,
    showTestPoint: state.view === CIRCUMCIRCLE_VIEWS.first,
    showIntersection,
    showCircle,
    verticesMovable: showCircle,
    showPrimaryButton: !showCircle,
    primaryButtonLabel:
      state.view === CIRCUMCIRCLE_VIEWS.intersection
        ? "Umkreis zeigen"
        : "Nächste Mittelsenkrechte",
    insight: showCircle
      ? CIRCUMCIRCLE_INSIGHTS.circle
      : showIntersection
        ? CIRCUMCIRCLE_INSIGHTS.intersection
        : CIRCUMCIRCLE_INSIGHTS.first,
  };
}
