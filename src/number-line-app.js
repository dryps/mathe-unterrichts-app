import {
  formatCurrentValue,
  valueToPoint,
  xToValue,
} from "./number-line-geometry.js";
import {
  AUTOMATIC_STEP_DURATION_MS,
  automaticMotionDuration,
  automaticMotionFrame,
} from "./number-line-animation.js";
import {
  NUMBER_LINE_VIEWS,
  createNumberLineState,
  finishNumberLineMotion,
  motionPathForView,
  moveNumberLinePoint,
  numberLineViewModel,
  resetNumberLineState,
  startNextNumberLineStep,
} from "./number-line-state.js";

const board = document.querySelector("#number-board");
const pointControl = document.querySelector("#number-point-control");
const pointHandle = document.querySelector("#number-point-handle");
const currentValue = document.querySelector("#current-value");
const currentValueText = document.querySelector("#current-value-text");
const negativeTicks = document.querySelector("#negative-ticks");
const negativeTickElements = [
  document.querySelector("#negative-tick-1"),
  document.querySelector("#negative-tick-2"),
  document.querySelector("#negative-tick-3"),
];
const insight = document.querySelector("#number-insight");
const liveValue = document.querySelector("#number-live-value");
const nextButton = document.querySelector("#number-next");
const resetButton = document.querySelector("#number-reset");

let state = createNumberLineState();
let activePointer = null;
let animationFrame = null;
let animationTimer = null;

function setVisibility(element, visible) {
  element.setAttribute("visibility", visible ? "visible" : "hidden");
  element.setAttribute("aria-hidden", String(!visible));
}

function signForValue(value) {
  if (value < 0) return "negative";
  if (value > 0) return "positive";
  return "zero";
}

function renderPointAtValue(value) {
  const point = valueToPoint(value);
  pointControl.setAttribute("transform", `translate(${point.x} ${point.y})`);
  board.dataset.valueSign = signForValue(value);
}

function revealNegativeTicks(count) {
  const bounded = Math.max(0, Math.min(3, count));
  negativeTickElements.forEach((element, index) => {
    setVisibility(element, index < bounded);
  });
}

function render() {
  const model = numberLineViewModel(state);
  const formattedValue = formatCurrentValue(state.value);
  renderPointAtValue(state.value);
  setVisibility(negativeTicks, model.showNegative);
  revealNegativeTicks(model.showNegative ? 3 : 0);
  setVisibility(currentValue, model.showCurrentValue);

  currentValueText.textContent = formattedValue;
  liveValue.textContent = formattedValue;
  pointHandle.setAttribute("aria-valuenow", state.value);
  pointHandle.setAttribute("aria-valuetext", formattedValue);
  pointHandle.setAttribute("aria-disabled", String(!model.interactive));
  board.dataset.state = state.view;
  insight.textContent = model.insight;
  nextButton.hidden = !model.showNextButton;
  nextButton.disabled = model.controlsLocked;
  resetButton.disabled = model.controlsLocked;
}

function clearAnimation() {
  if (animationFrame !== null) cancelAnimationFrame(animationFrame);
  clearTimeout(animationTimer);
  animationFrame = null;
  animationTimer = null;
}

function finishMotionImmediately() {
  clearAnimation();
  state = finishNumberLineMotion(state);
  render();
}

function runAutomaticMotion() {
  const next = startNextNumberLineStep(state);
  if (next === state || !next.locked) {
    state = next;
    render();
    return;
  }

  state = next;
  activePointer = null;
  const path = motionPathForView(state.view);
  render();
  if (state.view === NUMBER_LINE_VIEWS.movingNegative) {
    revealNegativeTicks(0);
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishMotionImmediately();
    return;
  }

  const duration = automaticMotionDuration(path, AUTOMATIC_STEP_DURATION_MS);
  animationTimer = setTimeout(finishMotionImmediately, duration + 120);
  let startedAt = null;

  function animate(timestamp) {
    if (!state.locked || motionPathForView(state.view) !== path) return;
    if (startedAt === null) startedAt = timestamp;
    const frame = automaticMotionFrame(
      timestamp - startedAt,
      path,
      AUTOMATIC_STEP_DURATION_MS,
    );
    renderPointAtValue(frame.value);
    if (state.view === NUMBER_LINE_VIEWS.movingNegative) {
      const revealed =
        frame.segmentIndex + (frame.segmentProgress >= 0.72 ? 1 : 0);
      revealNegativeTicks(revealed);
    }
    if (frame.complete) {
      finishMotionImmediately();
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
  const next = moveNumberLinePoint(state, xToValue(x));
  if (next === state) return;
  state = next;
  render();
}

function startDrag(event) {
  if (
    state.view !== NUMBER_LINE_VIEWS.free ||
    !event.target.closest("#number-point-handle")
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
  if (activePointer !== event.pointerId || state.view !== NUMBER_LINE_VIEWS.free) {
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
  if (state.view !== NUMBER_LINE_VIEWS.free) return;
  const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
  if (!direction) return;
  event.preventDefault();
  state = moveNumberLinePoint(state, state.value + direction);
  render();
}

board.addEventListener("pointerdown", startDrag);
board.addEventListener("pointermove", continueDrag);
board.addEventListener("pointerup", endDrag);
board.addEventListener("pointercancel", endDrag);
pointHandle.addEventListener("keydown", moveWithKeyboard);
nextButton.addEventListener("click", runAutomaticMotion);
resetButton.addEventListener("click", () => {
  if (state.locked) return;
  clearAnimation();
  activePointer = null;
  state = resetNumberLineState();
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
