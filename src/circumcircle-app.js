import { pointsAttribute } from "./circumcircle-geometry.js";
import {
  CIRCUMCIRCLE_VIEWS,
  advanceCircumcircle,
  circumcircleViewModel,
  createCircumcircleState,
  moveCircumcircleVertex,
  moveTestPoint,
  resetCircumcircleState,
} from "./circumcircle-state.js";

const board = document.querySelector("#circumcircle-board");
const triangle = document.querySelector("#circumcircle-triangle");
const circle = document.querySelector("#circumcircle");
const sideElements = [
  document.querySelector("#side-ab"),
  document.querySelector("#side-bc"),
  document.querySelector("#side-ca"),
];
const bisectorGroups = [1, 2, 3].map((index) =>
  document.querySelector(`#bisector-${index}`),
);
const bisectorLines = [1, 2, 3].map((index) =>
  document.querySelector(`#bisector-line-${index}`),
);
const bisectorAngles = [1, 2, 3].map((index) =>
  document.querySelector(`#bisector-angle-${index}`),
);
const midpointDots = [1, 2, 3].map((index) =>
  document.querySelector(`#midpoint-${index}`),
);
const testGroup = document.querySelector("#test-point-group");
const testControl = document.querySelector("#test-point-control");
const testHandle = document.querySelector("#test-point-handle");
const distancePA = document.querySelector("#distance-pa");
const distancePB = document.querySelector("#distance-pb");
const centerGroup = document.querySelector("#center-group");
const centerControl = document.querySelector("#center-control");
const radiusLines = ["a", "b", "c"].map((key) =>
  document.querySelector(`#radius-m${key}`),
);
const vertexControls = Object.fromEntries(
  ["A", "B", "C"].map((key) => [key, document.querySelector(`#vertex-${key}-control`)]),
);
const insight = document.querySelector("#circumcircle-insight");
const feedback = document.querySelector("#circumcircle-feedback");
const nextButton = document.querySelector("#circumcircle-next");
const resetButton = document.querySelector("#circumcircle-reset");

let state = createCircumcircleState();
let activeDrag = null;
let stepLocked = false;
let stepTimer = null;

function setVisibility(element, visible) {
  element.setAttribute("visibility", visible ? "visible" : "hidden");
  element.setAttribute("aria-hidden", String(!visible));
}

function setLine(element, first, second) {
  element.setAttribute("x1", first.x);
  element.setAttribute("y1", first.y);
  element.setAttribute("x2", second.x);
  element.setAttribute("y2", second.y);
}

function render() {
  const model = circumcircleViewModel(state);
  const { geometry } = model;
  const { A, B, C } = geometry.vertices;

  triangle.setAttribute("points", pointsAttribute(geometry.triangle));
  for (const [element, first, second] of [
    [sideElements[0], A, B],
    [sideElements[1], B, C],
    [sideElements[2], C, A],
  ]) {
    setLine(element, first, second);
  }
  sideElements[0].classList.toggle("is-highlighted", model.showTestPoint);

  geometry.bisectors.forEach((bisector, index) => {
    setLine(bisectorLines[index], bisector.line.start, bisector.line.end);
    bisectorAngles[index].setAttribute(
      "points",
      pointsAttribute(bisector.rightAngle),
    );
    midpointDots[index].setAttribute("cx", bisector.middle.x);
    midpointDots[index].setAttribute("cy", bisector.middle.y);
    setVisibility(bisectorGroups[index], index < model.bisectorCount);
  });

  setLine(distancePA, geometry.testPoint, A);
  setLine(distancePB, geometry.testPoint, B);
  testControl.setAttribute(
    "transform",
    `translate(${geometry.testPoint.x} ${geometry.testPoint.y})`,
  );
  testHandle.setAttribute(
    "aria-label",
    "Testpunkt P auf der ersten Mittelsenkrechten bewegen; PA ist gleich PB",
  );
  setVisibility(testGroup, model.showTestPoint);

  circle.setAttribute("cx", geometry.center.x);
  circle.setAttribute("cy", geometry.center.y);
  circle.setAttribute("r", geometry.radius);
  setVisibility(circle, model.showCircle);

  for (const [line, vertex] of [
    [radiusLines[0], A],
    [radiusLines[1], B],
    [radiusLines[2], C],
  ]) {
    setLine(line, geometry.center, vertex);
  }
  centerControl.setAttribute(
    "transform",
    `translate(${geometry.center.x} ${geometry.center.y})`,
  );
  setVisibility(centerGroup, model.showIntersection);

  for (const [key, control] of Object.entries(vertexControls)) {
    const point = geometry.vertices[key];
    control.setAttribute("transform", `translate(${point.x} ${point.y})`);
    control.setAttribute("aria-disabled", String(!model.verticesMovable));
  }

  board.dataset.state = state.view;
  insight.textContent = model.insight;
  feedback.textContent = state.feedback;
  feedback.hidden = !state.feedback;
  nextButton.textContent = model.primaryButtonLabel;
  nextButton.hidden = !model.showPrimaryButton;
  nextButton.disabled = stepLocked;
}

function toSvgPoint(event) {
  const point = board.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const matrix = board.getScreenCTM();
  if (!matrix) return null;
  const local = point.matrixTransform(matrix.inverse());
  return { x: local.x, y: local.y };
}

function dragDescriptor(target) {
  const handle = target.closest("[data-drag-kind]");
  if (!handle) return null;
  const kind = handle.dataset.dragKind;
  if (kind === "test" && state.view === CIRCUMCIRCLE_VIEWS.first) {
    return { kind, key: null, handle };
  }
  if (kind === "vertex" && state.view === CIRCUMCIRCLE_VIEWS.circle) {
    return { kind, key: handle.dataset.key, handle };
  }
  return null;
}

function applyDrag(point) {
  if (!activeDrag) return;
  state =
    activeDrag.kind === "test"
      ? moveTestPoint(state, point)
      : moveCircumcircleVertex(state, activeDrag.key, point);
  render();
}

function startDrag(event) {
  const descriptor = dragDescriptor(event.target);
  if (!descriptor) return;
  event.preventDefault();
  activeDrag = { ...descriptor, pointerId: event.pointerId };
  descriptor.handle.setPointerCapture(event.pointerId);
  const point = toSvgPoint(event);
  if (point) applyDrag(point);
}

function continueDrag(event) {
  if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
  event.preventDefault();
  const point = toSvgPoint(event);
  if (point) applyDrag(point);
}

function endDrag(event) {
  if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
  if (activeDrag.handle.hasPointerCapture(event.pointerId)) {
    activeDrag.handle.releasePointerCapture(event.pointerId);
  }
  activeDrag = null;
}

function moveWithKeyboard(event) {
  const descriptor = dragDescriptor(event.target);
  if (!descriptor) return;
  const direction = {
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
  }[event.key];
  if (!direction) return;
  event.preventDefault();
  const distance = event.shiftKey ? 30 : 12;
  const model = circumcircleViewModel(state);
  const origin =
    descriptor.kind === "test"
      ? model.geometry.testPoint
      : model.geometry.vertices[descriptor.key];
  state =
    descriptor.kind === "test"
      ? moveTestPoint(state, {
          x: origin.x + direction.x * distance,
          y: origin.y + direction.y * distance,
        })
      : moveCircumcircleVertex(state, descriptor.key, {
          x: origin.x + direction.x * distance,
          y: origin.y + direction.y * distance,
        });
  render();
}

function advance() {
  if (stepLocked || state.view === CIRCUMCIRCLE_VIEWS.circle) return;
  state = advanceCircumcircle(state);
  stepLocked = true;
  activeDrag = null;
  render();
  clearTimeout(stepTimer);
  stepTimer = setTimeout(() => {
    stepLocked = false;
    render();
  }, 280);
}

board.addEventListener("pointerdown", startDrag);
board.addEventListener("pointermove", continueDrag);
board.addEventListener("pointerup", endDrag);
board.addEventListener("pointercancel", endDrag);
board.addEventListener("keydown", moveWithKeyboard);
nextButton.addEventListener("click", advance);
resetButton.addEventListener("click", () => {
  clearTimeout(stepTimer);
  stepTimer = null;
  stepLocked = false;
  activeDrag = null;
  state = resetCircumcircleState();
  render();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" })
      .catch(() => {
      // Das Modul bleibt nutzbar; nur der Offline-Cache fehlt in diesem Fall.
    });
  });
}

render();
