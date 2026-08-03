import {
  ABSOLUTE_VALUE_LIMITS,
  absoluteValueToPoint,
  absoluteValueToX,
  absoluteXToValue,
  distanceSegmentToZero,
  formatAbsoluteCurrentValue,
  formatAbsoluteFormula,
} from "./absolute-value-geometry.js";
import {
  absoluteTransitionDuration,
  absoluteTransitionFrame,
} from "./absolute-value-animation.js";
import {
  ABSOLUTE_VALUE_VIEWS,
  absoluteValueViewModel,
  createAbsoluteValueState,
  finishAbsoluteValueTransition,
  moveAbsoluteValuePoint,
  resetAbsoluteValueState,
  startNextAbsoluteValueStep,
  transitionKindForAbsoluteView,
} from "./absolute-value-state.js";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const board = document.querySelector("#absolute-board");
const prompt = document.querySelector("#absolute-prompt");
const axisLayer = document.querySelector("#absolute-axis-layer");
const axis = document.querySelector("#absolute-axis");
const negativeMarker = document.querySelector("#absolute-negative-marker");
const positiveMarker = document.querySelector("#absolute-positive-marker");
const direction = document.querySelector("#absolute-direction");
const directionLine = document.querySelector("#absolute-direction-line");
const negativeDistance = document.querySelector("#absolute-negative-distance");
const positiveDistance = document.querySelector("#absolute-positive-distance");
const negativeDistanceLine = negativeDistance.querySelector(".distance-line");
const positiveDistanceLine = positiveDistance.querySelector(".distance-line");
const negativeBoundaries = negativeDistance.querySelector("[data-distance-boundaries]");
const positiveBoundaries = positiveDistance.querySelector("[data-distance-boundaries]");
const negativeFormula = document.querySelector("#absolute-negative-formula");
const equalityFormula = document.querySelector("#absolute-equality-formula");
const dynamicFormula = document.querySelector("#absolute-dynamic-formula");
const dynamicFormulaText = document.querySelector("#absolute-dynamic-formula-text");
const pointControl = document.querySelector("#absolute-point-control");
const pointHandle = document.querySelector("#absolute-point-handle");
const currentValueText = document.querySelector("#absolute-current-value-text");
const insight = document.querySelector("#absolute-insight");
const liveValue = document.querySelector("#absolute-live-value");
const nextButton = document.querySelector("#absolute-next");
const resetButton = document.querySelector("#absolute-reset");
const tickElements = [...document.querySelectorAll("[data-absolute-value]")];

let state = createAbsoluteValueState();
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

function positionMarker(element, value) {
  const point = absoluteValueToPoint(value);
  element.setAttribute("transform", `translate(${point.x} ${point.y})`);
}

function renderPointAtValue(value) {
  const point = absoluteValueToPoint(value);
  pointControl.setAttribute("transform", `translate(${point.x} ${point.y})`);
  board.dataset.valueSign = signForValue(value);
}

function renderDistance(line, boundaryLayer, value) {
  const segment = distanceSegmentToZero(value);
  line.setAttribute("x1", segment.startX);
  line.setAttribute("x2", segment.endX);
  line.setAttribute("y1", segment.y);
  line.setAttribute("y2", segment.y);
  const boundaries = segment.unitBoundaries.map((x) => {
    const boundary = document.createElementNS(SVG_NAMESPACE, "line");
    boundary.setAttribute("x1", x);
    boundary.setAttribute("x2", x);
    boundary.setAttribute("y1", segment.y - 19);
    boundary.setAttribute("y2", segment.y + 19);
    return boundary;
  });
  boundaryLayer.replaceChildren(...boundaries);
}

function renderStaticGeometry() {
  axis.setAttribute("x1", ABSOLUTE_VALUE_LIMITS.lineStart);
  axis.setAttribute("x2", ABSOLUTE_VALUE_LIMITS.lineEnd);
  axis.setAttribute("y1", ABSOLUTE_VALUE_LIMITS.y);
  axis.setAttribute("y2", ABSOLUTE_VALUE_LIMITS.y);

  for (const tick of tickElements) {
    const value = Number(tick.dataset.absoluteValue);
    const x = absoluteValueToX(value);
    const line = tick.querySelector("line");
    const text = tick.querySelector("text");
    line?.setAttribute("x1", x);
    line?.setAttribute("x2", x);
    if (text) text.setAttribute("x", x);
  }

  positionMarker(negativeMarker, -4);
  positionMarker(positiveMarker, 4);
  renderDistance(negativeDistanceLine, negativeBoundaries, -4);
  renderDistance(positiveDistanceLine, positiveBoundaries, 4);
}

function render() {
  const model = absoluteValueViewModel(state);
  const transitionKind = transitionKindForAbsoluteView(state.view);
  const currentValue = formatAbsoluteCurrentValue(state.value);
  const formula = formatAbsoluteFormula(state.value);

  prompt.hidden = !model.showPrompt;
  setVisibility(axisLayer, model.showAxis);
  setVisibility(negativeMarker, model.showNegativeReference);
  setVisibility(positiveMarker, model.showPositiveReference);
  setVisibility(direction, model.showDirection);
  setVisibility(negativeDistance, model.showNegativeDistance);
  setVisibility(positiveDistance, model.showPositiveDistance);
  setVisibility(negativeFormula, model.showNegativeFormula && !model.showEqualityFormula);
  setVisibility(equalityFormula, model.showEqualityFormula);
  setVisibility(pointControl, model.showDraggablePoint);
  setVisibility(dynamicFormula, model.showDynamicFormula);

  renderPointAtValue(state.value);
  renderDistance(
    negativeDistanceLine,
    negativeBoundaries,
    model.showDraggablePoint ? state.value : -4,
  );

  board.dataset.state = state.view;
  insight.textContent = model.insight;
  currentValueText.textContent = currentValue;
  dynamicFormulaText.textContent = formula;
  liveValue.textContent = formula;
  pointHandle.setAttribute("aria-valuenow", state.value);
  pointHandle.setAttribute("aria-valuetext", `${currentValue}, Betrag ${Math.abs(state.value)}`);
  pointHandle.setAttribute("aria-disabled", String(!model.interactive));
  nextButton.hidden = !model.showNextButton;
  nextButton.disabled = model.controlsLocked;
  resetButton.disabled = model.controlsLocked;

  setOpacity(direction, transitionKind === "direction" ? 0 : 1);
  setOpacity(negativeDistance, transitionKind === "distance" ? 0 : 1);
  setOpacity(negativeFormula, transitionKind === "distance" ? 0 : 1);
  setOpacity(positiveMarker, transitionKind === "opposite" ? 0 : 1);
  setOpacity(positiveDistance, transitionKind === "opposite" ? 0 : 1);
  setOpacity(equalityFormula, transitionKind === "opposite" ? 0 : 1);
  setOpacity(pointControl, transitionKind === "free" ? 0 : 1);
  setOpacity(dynamicFormula, transitionKind === "free" ? 0 : 1);
  directionLine.setAttribute("x1", absoluteValueToX(0) - 20);
  directionLine.setAttribute("x2", absoluteValueToX(-4) + 20);
}

function clearAnimation() {
  if (animationFrame !== null) cancelAnimationFrame(animationFrame);
  clearTimeout(animationTimer);
  animationFrame = null;
  animationTimer = null;
}

function finishTransitionImmediately() {
  clearAnimation();
  state = finishAbsoluteValueTransition(state);
  render();
}

function applyTransitionFrame(frame) {
  if (frame.kind === "direction") {
    setOpacity(direction, frame.revealOpacity);
    const zeroX = absoluteValueToX(0) - 20;
    const targetX = absoluteValueToX(-4) + 20;
    directionLine.setAttribute(
      "x2",
      zeroX + (targetX - zeroX) * frame.directionProgress,
    );
    return;
  }
  if (frame.kind === "distance") {
    setOpacity(negativeDistance, frame.revealOpacity);
    setOpacity(negativeFormula, frame.revealOpacity);
    return;
  }
  if (frame.kind === "opposite") {
    setOpacity(positiveMarker, frame.revealOpacity);
    setOpacity(positiveDistance, frame.revealOpacity);
    setOpacity(equalityFormula, frame.revealOpacity);
    return;
  }
  setOpacity(pointControl, frame.revealOpacity);
  setOpacity(dynamicFormula, frame.revealOpacity);
}

function runNextStep() {
  const next = startNextAbsoluteValueStep(state);
  if (next === state) return;

  state = next;
  activePointer = null;
  render();
  const kind = transitionKindForAbsoluteView(state.view);
  if (!kind) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishTransitionImmediately();
    return;
  }

  const duration = absoluteTransitionDuration(kind);
  animationTimer = setTimeout(finishTransitionImmediately, duration + 120);
  let startedAt = null;

  function animate(timestamp) {
    if (!state.locked || transitionKindForAbsoluteView(state.view) !== kind) return;
    if (startedAt === null) startedAt = timestamp;
    const frame = absoluteTransitionFrame(timestamp - startedAt, kind);
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
  const next = moveAbsoluteValuePoint(state, absoluteXToValue(x));
  if (next === state) return;
  state = next;
  render();
}

function startDrag(event) {
  if (
    ![ABSOLUTE_VALUE_VIEWS.free, ABSOLUTE_VALUE_VIEWS.conclusion].includes(
      state.view,
    ) ||
    !event.target.closest("#absolute-point-handle")
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
    ![ABSOLUTE_VALUE_VIEWS.free, ABSOLUTE_VALUE_VIEWS.conclusion].includes(
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
    ![ABSOLUTE_VALUE_VIEWS.free, ABSOLUTE_VALUE_VIEWS.conclusion].includes(
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
      ? ABSOLUTE_VALUE_LIMITS.min
      : event.key === "End"
        ? ABSOLUTE_VALUE_LIMITS.max
        : state.value + direction;
  state = moveAbsoluteValuePoint(state, value);
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
  state = resetAbsoluteValueState();
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
