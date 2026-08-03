import {
  ORDER_NUMBER_LINE_LIMITS,
  formatOrderCurrentValue,
  orderValueToPoint,
  orderValueToX,
  orderXToValue,
} from "./order-number-line-geometry.js";
import {
  orderTransitionDuration,
  orderTransitionFrame,
} from "./order-number-line-animation.js";
import {
  ORDER_NUMBER_LINE_VIEWS,
  createOrderNumberLineState,
  finishOrderNumberLineTransition,
  moveOrderNumberLinePoint,
  orderNumberLineViewModel,
  resetOrderNumberLineState,
  startNextOrderNumberLineStep,
  transitionKindForOrderView,
} from "./order-number-line-state.js";

const board = document.querySelector("#order-board");
const prompt = document.querySelector("#order-prompt");
const axisLayer = document.querySelector("#order-axis-layer");
const axis = document.querySelector("#order-axis");
const markerEight = document.querySelector("#order-marker-eight");
const markerThree = document.querySelector("#order-marker-three");
const comparison = document.querySelector("#order-comparison");
const direction = document.querySelector("#order-direction");
const pointControl = document.querySelector("#order-point-control");
const pointHandle = document.querySelector("#order-point-handle");
const currentValueText = document.querySelector("#order-current-value-text");
const insight = document.querySelector("#order-insight");
const liveValue = document.querySelector("#order-live-value");
const nextButton = document.querySelector("#order-next");
const resetButton = document.querySelector("#order-reset");
const tickElements = [...document.querySelectorAll("[data-order-value]")];

let state = createOrderNumberLineState();
let activePointer = null;
let animationFrame = null;
let animationTimer = null;

function setVisibility(element, visible) {
  element.setAttribute("visibility", visible ? "visible" : "hidden");
  element.setAttribute("aria-hidden", String(!visible));
}

function setOpacity(element, opacity) {
  element.style.opacity = String(Math.max(0, Math.min(1, opacity)));
}

function signForValue(value) {
  if (value < 0) return "negative";
  if (value > 0) return "positive";
  return "zero";
}

function positionMarker(element, value, offsetY = 0) {
  const point = orderValueToPoint(value);
  element.setAttribute(
    "transform",
    `translate(${point.x} ${point.y + offsetY})`,
  );
}

function renderPointAtValue(value) {
  const point = orderValueToPoint(value);
  pointControl.setAttribute("transform", `translate(${point.x} ${point.y})`);
  board.dataset.valueSign = signForValue(value);
}

function renderStaticGeometry() {
  axis.setAttribute("x1", ORDER_NUMBER_LINE_LIMITS.lineStart);
  axis.setAttribute("x2", ORDER_NUMBER_LINE_LIMITS.lineEnd);
  axis.setAttribute("y1", ORDER_NUMBER_LINE_LIMITS.y);
  axis.setAttribute("y2", ORDER_NUMBER_LINE_LIMITS.y);

  for (const tick of tickElements) {
    const value = Number(tick.dataset.orderValue);
    const x = orderValueToX(value);
    const line = tick.querySelector("line");
    const text = tick.querySelector("text");
    line?.setAttribute("x1", x);
    line?.setAttribute("x2", x);
    if (text) text.setAttribute("x", x);
  }

  direction.setAttribute("x1", orderValueToX(-8) + 20);
  direction.setAttribute("x2", orderValueToX(-3) - 20);
  positionMarker(markerEight, -8);
  positionMarker(markerThree, -3);
}

function render() {
  const model = orderNumberLineViewModel(state);
  const transitionKind = transitionKindForOrderView(state.view);
  const formattedValue = formatOrderCurrentValue(state.value);

  prompt.hidden = !model.showPrompt;
  setVisibility(axisLayer, model.showAxis);
  setVisibility(markerEight, model.showReferenceMarkers);
  setVisibility(markerThree, model.showReferenceMarkers);
  setVisibility(comparison, model.showComparison);
  setVisibility(pointControl, model.showDraggablePoint);
  renderPointAtValue(state.value);

  board.dataset.state = state.view;
  board.dataset.referenceMode = model.referenceMarkersMuted ? "muted" : "strong";
  insight.textContent = model.insight;
  currentValueText.textContent = formattedValue;
  liveValue.textContent = formattedValue;
  pointHandle.setAttribute("aria-valuenow", state.value);
  pointHandle.setAttribute("aria-valuetext", formattedValue);
  pointHandle.setAttribute("aria-disabled", String(!model.interactive));
  nextButton.hidden = !model.showNextButton;
  nextButton.disabled = model.controlsLocked;
  resetButton.disabled = model.controlsLocked;

  setOpacity(axisLayer, transitionKind === "introduction" ? 0 : 1);
  const referenceOpacity = model.referenceMarkersMuted ? 0.34 : 1;
  setOpacity(markerEight, transitionKind === "introduction" ? 0 : referenceOpacity);
  setOpacity(markerThree, transitionKind === "introduction" ? 0 : referenceOpacity);
  setOpacity(comparison, transitionKind === "comparison" ? 0 : 1);
  setOpacity(pointControl, transitionKind === "free" ? 0 : 1);
  positionMarker(markerEight, -8);
  positionMarker(markerThree, -3);
}

function clearAnimation() {
  if (animationFrame !== null) cancelAnimationFrame(animationFrame);
  clearTimeout(animationTimer);
  animationFrame = null;
  animationTimer = null;
}

function finishTransitionImmediately() {
  clearAnimation();
  state = finishOrderNumberLineTransition(state);
  render();
}

function applyTransitionFrame(frame) {
  if (frame.kind === "introduction") {
    setOpacity(axisLayer, frame.axisOpacity);
    setOpacity(markerEight, frame.markerEightOpacity);
    setOpacity(markerThree, frame.markerThreeOpacity);
    positionMarker(markerEight, -8, frame.markerEightOffsetY);
    positionMarker(markerThree, -3, frame.markerThreeOffsetY);
    return;
  }
  if (frame.kind === "comparison") {
    setOpacity(comparison, frame.revealOpacity);
    return;
  }
  setOpacity(pointControl, frame.revealOpacity);
}

function runNextStep() {
  const next = startNextOrderNumberLineStep(state);
  if (next === state) return;

  state = next;
  activePointer = null;
  render();
  const kind = transitionKindForOrderView(state.view);
  if (!kind) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishTransitionImmediately();
    return;
  }

  const duration = orderTransitionDuration(kind);
  animationTimer = setTimeout(finishTransitionImmediately, duration + 120);
  let startedAt = null;

  function animate(timestamp) {
    if (!state.locked || transitionKindForOrderView(state.view) !== kind) return;
    if (startedAt === null) startedAt = timestamp;
    const frame = orderTransitionFrame(timestamp - startedAt, kind);
    applyTransitionFrame(frame);
    if (frame.complete) {
      finishTransitionImmediately();
      return;
    }
    animationFrame = requestAnimationFrame(animate);
  }

  animationFrame = requestAnimationFrame(animate);
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

function attemptMove(x) {
  const next = moveOrderNumberLinePoint(state, orderXToValue(x));
  if (next === state) return;
  state = next;
  render();
}

function startDrag(event) {
  if (
    ![ORDER_NUMBER_LINE_VIEWS.free, ORDER_NUMBER_LINE_VIEWS.conclusion].includes(
      state.view,
    ) ||
    !event.target.closest("#order-point-handle")
  ) {
    return;
  }
  event.preventDefault();
  activePointer = event.pointerId;
  pointHandle.setPointerCapture(event.pointerId);
  const point = toSvgPoint(event);
  if (point) attemptMove(point.x);
}

function continueDrag(event) {
  if (
    activePointer !== event.pointerId ||
    ![ORDER_NUMBER_LINE_VIEWS.free, ORDER_NUMBER_LINE_VIEWS.conclusion].includes(
      state.view,
    )
  ) {
    return;
  }
  event.preventDefault();
  const point = toSvgPoint(event);
  if (point) attemptMove(point.x);
}

function endDrag(event) {
  if (activePointer !== event.pointerId) return;
  if (pointHandle.hasPointerCapture(event.pointerId)) {
    pointHandle.releasePointerCapture(event.pointerId);
  }
  activePointer = null;
}

function moveWithKeyboard(event) {
  if (
    ![ORDER_NUMBER_LINE_VIEWS.free, ORDER_NUMBER_LINE_VIEWS.conclusion].includes(
      state.view,
    )
  ) {
    return;
  }
  const directionByKey = {
    ArrowLeft: -1,
    ArrowRight: 1,
    Home: -Infinity,
    End: Infinity,
  };
  const direction = directionByKey[event.key];
  if (direction === undefined) return;
  event.preventDefault();
  const value =
    event.key === "Home"
      ? ORDER_NUMBER_LINE_LIMITS.min
      : event.key === "End"
        ? ORDER_NUMBER_LINE_LIMITS.max
        : state.value + direction;
  state = moveOrderNumberLinePoint(state, value);
  render();
}

board.addEventListener("pointerdown", startDrag);
board.addEventListener("pointermove", continueDrag);
board.addEventListener("pointerup", endDrag);
board.addEventListener("pointercancel", endDrag);
pointHandle.addEventListener("keydown", moveWithKeyboard);
nextButton.addEventListener("click", runNextStep);
resetButton.addEventListener("click", () => {
  if (state.locked) return;
  clearAnimation();
  activePointer = null;
  state = resetOrderNumberLineState();
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

renderStaticGeometry();
render();
