import { midpoint, pointsAttribute } from "./incircle-geometry.js";
import {
  INCIRCLE_VIEWS,
  advanceIncircle,
  createIncircleState,
  incircleViewModel,
  moveIncircleVertex,
  moveTestPoint,
  resetIncircleState,
} from "./incircle-state.js";

const board = document.querySelector("#incircle-board");
const triangle = document.querySelector("#incircle-triangle");
const circle = document.querySelector("#incircle");
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
const angleArcs = [
  document.querySelector("#angle-a-first"),
  document.querySelector("#angle-a-second"),
];
const angleMarks = [
  document.querySelector("#angle-a-mark-first"),
  document.querySelector("#angle-a-mark-second"),
];
const testGroup = document.querySelector("#test-point-group");
const testControl = document.querySelector("#test-point-control");
const testHandle = document.querySelector("#test-point-handle");
const testLots = {
  AB: document.querySelector("#test-lot-ab"),
  AC: document.querySelector("#test-lot-ac"),
};
const testFeet = {
  AB: document.querySelector("#test-foot-ab"),
  AC: document.querySelector("#test-foot-ac"),
};
const testRightAngles = {
  AB: document.querySelector("#test-right-ab"),
  AC: document.querySelector("#test-right-ac"),
};
const testMarks = {
  AB: document.querySelector("#test-mark-ab"),
  AC: document.querySelector("#test-mark-ac"),
};
const centerGroup = document.querySelector("#center-group");
const centerControl = document.querySelector("#center-control");
const radiusLines = Object.fromEntries(
  ["AB", "BC", "CA"].map((key) => [
    key,
    document.querySelector(`#radius-${key.toLowerCase()}`),
  ]),
);
const touchDots = Object.fromEntries(
  ["AB", "BC", "CA"].map((key) => [
    key,
    document.querySelector(`#touch-${key.toLowerCase()}`),
  ]),
);
const centerRightAngles = Object.fromEntries(
  ["AB", "BC", "CA"].map((key) => [
    key,
    document.querySelector(`#center-right-${key.toLowerCase()}`),
  ]),
);
const radiusMarks = Object.fromEntries(
  ["AB", "BC", "CA"].map((key) => [
    key,
    document.querySelector(`#radius-mark-${key.toLowerCase()}`),
  ]),
);
const radiusLabels = Object.fromEntries(
  ["AB", "BC", "CA"].map((key) => [
    key,
    document.querySelector(`#radius-label-${key.toLowerCase()}`),
  ]),
);
const vertexControls = Object.fromEntries(
  ["A", "B", "C"].map((key) => [key, document.querySelector(`#vertex-${key}-control`)]),
);
const insight = document.querySelector("#incircle-insight");
const feedback = document.querySelector("#incircle-feedback");
const nextButton = document.querySelector("#incircle-next");
const resetButton = document.querySelector("#incircle-reset");

let state = createIncircleState();
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

function setPoint(element, point) {
  element.setAttribute("cx", point.x);
  element.setAttribute("cy", point.y);
}

function setPolyline(element, points) {
  element.setAttribute("points", pointsAttribute(points));
}

function setRadiusLabel(element, center, foot) {
  const middle = midpoint(center, foot);
  const direction = {
    x: foot.x - center.x,
    y: foot.y - center.y,
  };
  const length = Math.hypot(direction.x, direction.y) || 1;
  element.setAttribute("x", middle.x - (direction.y / length) * 27);
  element.setAttribute("y", middle.y + (direction.x / length) * 27 + 11);
}

function renderProjection(elements, point, projection) {
  setLine(elements.line, point, projection.foot);
  setPoint(elements.foot, projection.foot);
  setPolyline(elements.rightAngle, projection.rightAngle);
  setLine(elements.mark, projection.lengthMark.start, projection.lengthMark.end);
}

function render() {
  const model = incircleViewModel(state);
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

  geometry.bisectors.forEach((bisector, index) => {
    setLine(bisectorLines[index], bisector.start, bisector.end);
    setVisibility(bisectorGroups[index], index < model.bisectorCount);
  });
  geometry.angleMarks.forEach((mark, index) => {
    setPolyline(angleArcs[index], mark.arc);
    setPoint(angleMarks[index], mark.dot);
  });

  for (const key of ["AB", "AC"]) {
    renderProjection(
      {
        line: testLots[key],
        foot: testFeet[key],
        rightAngle: testRightAngles[key],
        mark: testMarks[key],
      },
      geometry.testPoint,
      geometry.testProjections[key],
    );
  }
  testControl.setAttribute(
    "transform",
    `translate(${geometry.testPoint.x} ${geometry.testPoint.y})`,
  );
  testHandle.setAttribute(
    "aria-label",
    "Testpunkt P auf der ersten Winkelhalbierenden bewegen; beide Lotstrecken sind gleich lang",
  );
  setVisibility(testGroup, model.showTestPoint);

  circle.setAttribute("cx", geometry.center.x);
  circle.setAttribute("cy", geometry.center.y);
  circle.setAttribute("r", geometry.radius);
  setVisibility(circle, model.showCircle);

  for (const key of ["AB", "BC", "CA"]) {
    const touch = geometry.touches[key];
    renderProjection(
      {
        line: radiusLines[key],
        foot: touchDots[key],
        rightAngle: centerRightAngles[key],
        mark: radiusMarks[key],
      },
      geometry.center,
      touch,
    );
    setRadiusLabel(radiusLabels[key], geometry.center, touch.foot);
  }
  centerControl.setAttribute(
    "transform",
    `translate(${geometry.center.x} ${geometry.center.y})`,
  );
  setVisibility(centerGroup, model.showCenter);

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
  if (kind === "test" && state.view === INCIRCLE_VIEWS.first) {
    return { kind, key: null, handle };
  }
  if (kind === "vertex" && state.view === INCIRCLE_VIEWS.incircle) {
    return { kind, key: handle.dataset.key, handle };
  }
  return null;
}

function applyDrag(point) {
  if (!activeDrag || stepLocked) return;
  state =
    activeDrag.kind === "test"
      ? moveTestPoint(state, point)
      : moveIncircleVertex(state, activeDrag.key, point);
  render();
}

function startDrag(event) {
  if (stepLocked) return;
  const descriptor = dragDescriptor(event.target);
  if (!descriptor) return;
  event.preventDefault();
  activeDrag = { ...descriptor, pointerId: event.pointerId };
  descriptor.handle.setPointerCapture(event.pointerId);
  const point = toSvgPoint(event);
  if (point) applyDrag(point);
}

function continueDrag(event) {
  if (!activeDrag || activeDrag.pointerId !== event.pointerId || stepLocked) return;
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
  if (stepLocked) return;
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
  const amount = event.shiftKey ? 30 : 12;
  const model = incircleViewModel(state);
  const origin =
    descriptor.kind === "test"
      ? model.geometry.testPoint
      : model.geometry.vertices[descriptor.key];
  const target = {
    x: origin.x + direction.x * amount,
    y: origin.y + direction.y * amount,
  };
  state =
    descriptor.kind === "test"
      ? moveTestPoint(state, target)
      : moveIncircleVertex(state, descriptor.key, target);
  render();
}

function advance() {
  if (stepLocked || state.view === INCIRCLE_VIEWS.incircle) return;
  const previousView = state.view;
  state = advanceIncircle(state);
  stepLocked = true;
  activeDrag = null;
  board.classList.toggle(
    "is-revealing",
    previousView === INCIRCLE_VIEWS.first,
  );
  render();
  clearTimeout(stepTimer);
  stepTimer = setTimeout(
    () => {
      stepLocked = false;
      board.classList.toggle("is-revealing", false);
      render();
    },
    previousView === INCIRCLE_VIEWS.first ? 820 : 300,
  );
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
  board.classList.toggle("is-revealing", false);
  state = resetIncircleState();
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
