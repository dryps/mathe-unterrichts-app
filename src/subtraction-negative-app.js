import {
  SUBTRACTION_LIMITS,
  SUBTRACTION_START,
  formatSubtraction,
  subtractionMovement,
  subtractionValueToX,
  xToNegativeSubtrahend,
} from "./subtraction-negative-geometry.js";
import {
  DIRECTION_REVERSAL_DURATION_MS,
  SUBTRACTION_MOVEMENT_DURATION_MS,
  directionReversalFrame,
  subtractionMovementFrame,
} from "./subtraction-negative-animation.js";
import {
  SUBTRACTION_VIEWS,
  createSubtractionState,
  finishDirectionReversal,
  finishSubtractionMovement,
  moveSubtrahend,
  nextSubtractionState,
  resetSubtractionState,
  subtractionViewModel,
} from "./subtraction-negative-state.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const $ = (selector) => document.querySelector(selector);
const board = $("#subtraction-board");
const prompt = $("#subtraction-prompt");
const axisLayer = $("#subtraction-axis-layer");
const axis = $("#subtraction-axis");
const startPoint = $("#subtraction-start-point");
const originalVector = $("#subtraction-original-vector");
const originalLine = $("#subtraction-original-line");
const originalBoundaries = $("#subtraction-original-boundaries");
const originalArrowhead = $("#subtraction-original-arrowhead");
const originalLabel = $("#subtraction-original-label");
const reversalVector = $("#subtraction-reversal-vector");
const reversalLine = $("#subtraction-reversal-line");
const reversalBoundaries = $("#subtraction-reversal-boundaries");
const reversalArrowhead = $("#subtraction-reversal-arrowhead");
const effectiveVector = $("#subtraction-effective-vector");
const effectiveLine = $("#subtraction-effective-line");
const effectiveBoundaries = $("#subtraction-effective-boundaries");
const effectiveArrowhead = $("#subtraction-effective-arrowhead");
const effectiveLabel = $("#subtraction-effective-label");
const movingPoint = $("#subtraction-moving-point");
const resultPoint = $("#subtraction-result-point");
const endHandle = $("#subtraction-end-handle");
const formula = $("#subtraction-formula");
const startTerm = $("#subtraction-start-term");
const operatorTerm = $("#subtraction-operator");
const signTerm = $("#subtraction-sign");
const magnitudeTerm = $("#subtraction-magnitude");
const resultTerm = $("#subtraction-result-term");
const equations = $("#subtraction-equations");
const equationOne = $("#subtraction-equation-one");
const equationTwo = $("#subtraction-equation-two");
const equationThree = $("#subtraction-equation-three");
const insight = $("#subtraction-insight");
const conclusionDetail = $("#subtraction-conclusion-detail");
const live = $("#subtraction-live-value");
const nextButton = $("#subtraction-next");
const resetButton = $("#subtraction-reset");
const ticks = [...document.querySelectorAll("[data-subtraction-value]")];

let state = createSubtractionState();
let activePointer = null;
let frameId = null;
let timerId = null;

function visible(element, show) {
  element.setAttribute("visibility", show ? "visible" : "hidden");
  element.setAttribute("aria-hidden", String(!show));
}

function translate(element, x, y = SUBTRACTION_LIMITS.y) {
  element.setAttribute("transform", `translate(${x} ${y})`);
}

function renderBoundaries(container, positions, y, count) {
  const nodes = positions.slice(0, count + 1).map((x) => {
    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", x);
    line.setAttribute("x2", x);
    line.setAttribute("y1", y - 19);
    line.setAttribute("y2", y + 19);
    return line;
  });
  container.replaceChildren(...nodes);
}

function renderOriginal(movement) {
  originalLine.setAttribute("x1", movement.startX);
  originalLine.setAttribute("x2", movement.originalEndX + 36);
  originalLine.setAttribute("y1", movement.originalY);
  originalLine.setAttribute("y2", movement.originalY);
  originalArrowhead.setAttribute("transform", `translate(${movement.originalEndX} 0)`);
  originalLabel.setAttribute("x", (movement.startX + movement.originalEndX) / 2);
  originalLabel.textContent = `−${movement.magnitude}: ${movement.magnitude === 1 ? "eine Einheit" : `${movement.magnitude} Einheiten`} nach links`;
  renderBoundaries(
    originalBoundaries,
    movement.originalBoundaries,
    movement.originalY,
    movement.originalStepCount,
  );
}

function renderReversal(movement, angle = 0) {
  reversalLine.setAttribute("x1", movement.startX);
  reversalLine.setAttribute("x2", movement.originalEndX + 36);
  reversalLine.setAttribute("y1", movement.originalY);
  reversalLine.setAttribute("y2", movement.originalY);
  reversalArrowhead.setAttribute("transform", `translate(${movement.originalEndX} 0)`);
  renderBoundaries(
    reversalBoundaries,
    movement.originalBoundaries,
    movement.originalY,
    movement.originalStepCount,
  );
  reversalVector.setAttribute(
    "transform",
    `rotate(${angle} ${movement.startX} ${movement.originalY})`,
  );
}

function renderEffective(movement, endX = movement.effectiveEndX, visibleSteps = movement.effectiveStepCount) {
  effectiveLine.setAttribute("x1", movement.startX);
  effectiveLine.setAttribute("x2", endX === movement.startX ? movement.startX : endX - 36);
  effectiveLine.setAttribute("y1", movement.effectiveY);
  effectiveLine.setAttribute("y2", movement.effectiveY);
  effectiveArrowhead.setAttribute("transform", `translate(${endX} 0)`);
  effectiveLabel.setAttribute("x", (movement.startX + movement.effectiveEndX) / 2);
  effectiveLabel.textContent = `subtrahiert: ${movement.magnitude === 1 ? "eine Einheit" : `${movement.magnitude} Einheiten`} nach rechts`;
  renderBoundaries(
    effectiveBoundaries,
    movement.effectiveBoundaries,
    movement.effectiveY,
    visibleSteps,
  );
}

function renderFormula(movement, showResult) {
  magnitudeTerm.textContent = String(movement.magnitude);
  resultTerm.textContent = showResult ? ` = ${movement.result}` : "";
  const formatted = formatSubtraction(movement.subtrahend);
  equationOne.textContent = formatted.subtraction;
  equationTwo.textContent = formatted.addition;
  equationThree.textContent = formatted.equivalence;
}

function render() {
  const model = subtractionViewModel(state);
  const movement = subtractionMovement(state.subtrahend);
  prompt.hidden = !model.showPrompt;
  visible(axisLayer, model.showAxis);
  visible(startPoint, model.showStart);
  visible(formula, model.showFormula);
  visible(originalVector, model.showOriginalVector);
  visible(reversalVector, model.showReversalVector);
  visible(effectiveVector, model.showEffectiveVector);
  visible(movingPoint, model.showMovingPoint);
  visible(resultPoint, model.showEnd);
  visible(endHandle, model.showEnd);
  visible(equations, model.showEquations);

  translate(startPoint, subtractionValueToX(SUBTRACTION_START));
  translate(movingPoint, movement.startX);
  translate(resultPoint, movement.effectiveEndX);
  translate(endHandle, movement.originalEndX, movement.originalY);
  renderOriginal(movement);
  renderReversal(movement);
  renderEffective(
    movement,
    state.view === SUBTRACTION_VIEWS.moving ? movement.startX : movement.effectiveEndX,
    state.view === SUBTRACTION_VIEWS.moving ? 0 : movement.effectiveStepCount,
  );
  if (!model.showOriginalVector) originalBoundaries.replaceChildren();
  if (!model.showReversalVector) reversalBoundaries.replaceChildren();
  if (!model.showEffectiveVector) effectiveBoundaries.replaceChildren();
  renderFormula(movement, model.showEnd);

  startTerm.classList.toggle("is-highlighted", model.highlightStart);
  operatorTerm.classList.toggle("is-highlighted", model.highlightOperator);
  signTerm.classList.toggle("is-highlighted", model.highlightSubtrahend);
  magnitudeTerm.classList.toggle("is-highlighted", model.highlightSubtrahend);
  board.dataset.state = state.view;
  insight.textContent = model.insight;
  conclusionDetail.hidden = !model.showConclusion;
  live.textContent = model.showEnd ? formatSubtraction(state.subtrahend).subtraction : "";
  endHandle.setAttribute("aria-valuenow", state.subtrahend);
  endHandle.setAttribute(
    "aria-valuetext",
    `Minus ${movement.magnitude}, Ergebnis ${movement.result}`,
  );
  endHandle.setAttribute("aria-disabled", String(!model.interactive));
  nextButton.hidden = !model.showNext;
  nextButton.disabled = model.controlsLocked;
  resetButton.disabled = model.controlsLocked;
}

function staticGeometry() {
  axis.setAttribute("x1", SUBTRACTION_LIMITS.lineStart);
  axis.setAttribute("x2", SUBTRACTION_LIMITS.lineEnd);
  axis.setAttribute("y1", SUBTRACTION_LIMITS.y);
  axis.setAttribute("y2", SUBTRACTION_LIMITS.y);
  for (const tick of ticks) {
    const x = subtractionValueToX(Number(tick.dataset.subtractionValue));
    tick.querySelector("line")?.setAttribute("x1", x);
    tick.querySelector("line")?.setAttribute("x2", x);
    tick.querySelector("text")?.setAttribute("x", x);
  }
}

function clearAnimation() {
  if (frameId !== null) cancelAnimationFrame(frameId);
  clearTimeout(timerId);
  frameId = null;
  timerId = null;
}

function finishMovement() {
  clearAnimation();
  state = finishSubtractionMovement(state);
  render();
}

function animateMovement() {
  const movement = subtractionMovement(state.subtrahend);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishMovement();
    return;
  }
  let started = null;
  timerId = setTimeout(finishMovement, SUBTRACTION_MOVEMENT_DURATION_MS + 160);
  function animate(time) {
    if (state.view !== SUBTRACTION_VIEWS.moving) return;
    if (started === null) started = time;
    const frame = subtractionMovementFrame(time - started, movement);
    translate(movingPoint, frame.x);
    renderEffective(movement, frame.x, frame.visibleSteps);
    if (frame.complete) {
      finishMovement();
      return;
    }
    frameId = requestAnimationFrame(animate);
  }
  frameId = requestAnimationFrame(animate);
}

function startMovement() {
  clearAnimation();
  state = finishDirectionReversal(state);
  render();
  animateMovement();
}

function animateDirectionReversal() {
  const movement = subtractionMovement(state.subtrahend);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    renderReversal(movement, 180);
    startMovement();
    return;
  }
  let started = null;
  timerId = setTimeout(startMovement, DIRECTION_REVERSAL_DURATION_MS + 160);
  function animate(time) {
    if (state.view !== SUBTRACTION_VIEWS.reversing) return;
    if (started === null) started = time;
    const frame = directionReversalFrame(time - started, movement);
    renderReversal(movement, frame.angle);
    if (frame.complete) {
      startMovement();
      return;
    }
    frameId = requestAnimationFrame(animate);
  }
  frameId = requestAnimationFrame(animate);
}

function runNext() {
  const next = nextSubtractionState(state);
  if (next === state) return;
  state = next;
  activePointer = null;
  render();
  if (state.view === SUBTRACTION_VIEWS.reversing) animateDirectionReversal();
}

function svgPoint(event) {
  const point = board.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const matrix = board.getScreenCTM();
  if (!matrix) return null;
  const local = point.matrixTransform(matrix.inverse());
  return { x: local.x, y: local.y };
}

function attemptMove(x) {
  const next = moveSubtrahend(state, xToNegativeSubtrahend(x));
  if (next !== state) {
    state = next;
    render();
  }
}

function startDrag(event) {
  if (
    ![SUBTRACTION_VIEWS.free, SUBTRACTION_VIEWS.conclusion].includes(state.view) ||
    !event.target.closest("#subtraction-end-handle")
  ) return;
  event.preventDefault();
  activePointer = event.pointerId;
  endHandle.setPointerCapture(event.pointerId);
  const point = svgPoint(event);
  if (point) attemptMove(point.x);
}

function drag(event) {
  if (
    activePointer !== event.pointerId ||
    ![SUBTRACTION_VIEWS.free, SUBTRACTION_VIEWS.conclusion].includes(state.view)
  ) return;
  event.preventDefault();
  const point = svgPoint(event);
  if (point) attemptMove(point.x);
}

function endDrag(event) {
  if (activePointer !== event.pointerId) return;
  if (endHandle.hasPointerCapture(event.pointerId)) {
    endHandle.releasePointerCapture(event.pointerId);
  }
  activePointer = null;
}

function keyboard(event) {
  if (![SUBTRACTION_VIEWS.free, SUBTRACTION_VIEWS.conclusion].includes(state.view)) return;
  const delta = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
  if (delta === undefined) return;
  event.preventDefault();
  state = moveSubtrahend(state, state.subtrahend + delta);
  render();
}

board.addEventListener("pointerdown", startDrag);
board.addEventListener("pointermove", drag);
board.addEventListener("pointerup", endDrag);
board.addEventListener("pointercancel", endDrag);
endHandle.addEventListener("keydown", keyboard);
nextButton.addEventListener("click", runNext);
resetButton.addEventListener("click", () => {
  if (state.locked) return;
  clearAnimation();
  activePointer = null;
  state = resetSubtractionState();
  render();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js", { scope: "./", updateViaCache: "none" })
      .catch(() => {});
  });
}

staticGeometry();
render();
