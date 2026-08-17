import {
  MULTIPLICATION_LIMITS,
  factorValueToX,
  formatFactor,
  formatMultiplication,
  formatSigned,
  multiplicationProduct,
  productValueToX,
  xToFirstFactor,
} from "./multiplication-negative-geometry.js";
import {
  MULTIPLICATION_REVEAL_DURATION_MS,
  multiplicationRevealFrame,
} from "./multiplication-negative-animation.js";
import {
  MULTIPLICATION_VIEWS,
  createMultiplicationState,
  finishMultiplicationTransition,
  moveFirstFactor,
  multiplicationViewModel,
  nextMultiplicationState,
  resetMultiplicationState,
} from "./multiplication-negative-state.js";

const $ = (selector) => document.querySelector(selector);
const stage = $("#multiplication-stage");
const prompt = $("#multiplication-prompt");
const pattern = $("#multiplication-pattern");
const patternSteps = $("#multiplication-pattern-steps");
const crossing = $("#multiplication-crossing");
const confirmation = $("#multiplication-confirmation");
const secondaryRule = $("#multiplication-secondary-rule");
const board = $("#multiplication-board");
const productAxis = $("#multiplication-product-axis");
const factorAxis = $("#multiplication-factor-axis");
const factorLayer = $("#multiplication-factor-layer");
const productPoint = $("#multiplication-product-point");
const firstFactorHandle = $("#multiplication-first-factor-handle");
const explorerFormula = $("#multiplication-explorer-formula");
const explorerFirstFactor = $("#multiplication-explorer-first-factor");
const explorerProduct = $("#multiplication-explorer-product");
const insight = $("#multiplication-insight");
const conclusion = $("#multiplication-conclusion");
const live = $("#multiplication-live-value");
const nextButton = $("#multiplication-next");
const resetButton = $("#multiplication-reset");
const productTicks = [...document.querySelectorAll("[data-multiplication-product]")];
const factorTicks = [...document.querySelectorAll("[data-multiplication-factor]")];
const patternPoints = [...document.querySelectorAll("[data-pattern-product]")];

let state = createMultiplicationState();
let activePointer = null;
let frameId = null;
let timerId = null;

function visibleSvg(element, show) {
  element.setAttribute("visibility", show ? "visible" : "hidden");
  element.setAttribute("aria-hidden", String(!show));
}

function translate(element, x, y) {
  element.setAttribute("transform", `translate(${x} ${y})`);
}

function patternPointIsVisible(point, model) {
  return {
    known: model.showKnown,
    crossing: model.showCrossing,
    confirmation: model.showConfirmation,
  }[point.dataset.patternGroup];
}

function renderExplorer(model) {
  const product = multiplicationProduct(state.firstFactor);
  visibleSvg(factorLayer, model.showExplorer);
  translate(
    firstFactorHandle,
    factorValueToX(state.firstFactor),
    MULTIPLICATION_LIMITS.factor.y,
  );
  translate(productPoint, productValueToX(product), MULTIPLICATION_LIMITS.product.y);
  explorerFormula.textContent = formatMultiplication(state.firstFactor);
  explorerFirstFactor.textContent = formatSigned(state.firstFactor);
  explorerProduct.textContent = formatSigned(product);
  firstFactorHandle.setAttribute("aria-valuenow", state.firstFactor);
  firstFactorHandle.setAttribute(
    "aria-valuetext",
    `${formatFactor(state.firstFactor)} als erster Faktor, Produkt ${formatSigned(product)}`,
  );
  firstFactorHandle.setAttribute("aria-disabled", String(!model.interactive));
  live.textContent = model.showExplorer ? formatMultiplication(state.firstFactor) : "";
}

function render() {
  const model = multiplicationViewModel(state);
  prompt.hidden = !model.showPrompt;
  pattern.hidden = !model.showKnown;
  patternSteps.hidden = !model.showPattern;
  crossing.hidden = !model.showCrossing;
  confirmation.hidden = !model.showConfirmation;
  secondaryRule.hidden = !model.showConfirmation;
  board.hidden = !model.showKnown;
  for (const point of patternPoints) {
    visibleSvg(point, patternPointIsVisible(point, model));
  }
  renderExplorer(model);
  stage.dataset.state = state.view;
  board.dataset.state = state.view;
  insight.textContent = model.insight;
  conclusion.hidden = !model.showConclusion;
  nextButton.hidden = !model.showNext;
  nextButton.disabled = model.controlsLocked;
  resetButton.disabled = model.controlsLocked;
}

function staticGeometry() {
  productAxis.setAttribute("x1", MULTIPLICATION_LIMITS.product.lineStart);
  productAxis.setAttribute("x2", MULTIPLICATION_LIMITS.product.lineEnd);
  productAxis.setAttribute("y1", MULTIPLICATION_LIMITS.product.y);
  productAxis.setAttribute("y2", MULTIPLICATION_LIMITS.product.y);
  factorAxis.setAttribute("x1", MULTIPLICATION_LIMITS.factor.lineStart);
  factorAxis.setAttribute("x2", MULTIPLICATION_LIMITS.factor.lineEnd);
  factorAxis.setAttribute("y1", MULTIPLICATION_LIMITS.factor.y);
  factorAxis.setAttribute("y2", MULTIPLICATION_LIMITS.factor.y);

  for (const tick of productTicks) {
    const x = productValueToX(Number(tick.dataset.multiplicationProduct));
    tick.querySelector("line")?.setAttribute("x1", x);
    tick.querySelector("line")?.setAttribute("x2", x);
    tick.querySelector("text")?.setAttribute("x", x);
  }
  for (const tick of factorTicks) {
    const x = factorValueToX(Number(tick.dataset.multiplicationFactor));
    tick.querySelector("line")?.setAttribute("x1", x);
    tick.querySelector("line")?.setAttribute("x2", x);
    tick.querySelector("text")?.setAttribute("x", x);
  }
  for (const point of patternPoints) {
    translate(
      point,
      productValueToX(Number(point.dataset.patternProduct)),
      MULTIPLICATION_LIMITS.product.y,
    );
  }
}

function clearAnimation() {
  if (frameId !== null) cancelAnimationFrame(frameId);
  if (timerId !== null) clearTimeout(timerId);
  frameId = null;
  timerId = null;
}

function revealTarget() {
  return {
    [MULTIPLICATION_VIEWS.known]: pattern,
    [MULTIPLICATION_VIEWS.pattern]: patternSteps,
    [MULTIPLICATION_VIEWS.crossing]: crossing,
    [MULTIPLICATION_VIEWS.confirmation]: confirmation,
  }[state.view] ?? null;
}

function finishReveal(target) {
  clearAnimation();
  if (target) {
    target.style.opacity = "";
    target.style.transform = "";
  }
  state = finishMultiplicationTransition(state);
  render();
}

function animateReveal() {
  const target = revealTarget();
  if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishReveal(target);
    return;
  }
  let started = null;
  timerId = setTimeout(() => finishReveal(target), MULTIPLICATION_REVEAL_DURATION_MS + 180);
  function animate(time) {
    if (!state.locked) return;
    if (started === null) started = time;
    const frame = multiplicationRevealFrame(time - started);
    target.style.opacity = String(frame.opacity);
    target.style.transform = `translateY(${frame.translateY}px)`;
    if (frame.complete) {
      finishReveal(target);
      return;
    }
    frameId = requestAnimationFrame(animate);
  }
  frameId = requestAnimationFrame(animate);
}

function runNext() {
  const next = nextMultiplicationState(state);
  if (next === state) return;
  state = next;
  activePointer = null;
  render();
  if (state.locked) animateReveal();
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
  const next = moveFirstFactor(state, xToFirstFactor(x));
  if (next === state) return;
  state = next;
  render();
}

function startDrag(event) {
  if (
    ![MULTIPLICATION_VIEWS.free, MULTIPLICATION_VIEWS.conclusion].includes(state.view) ||
    !event.target.closest("#multiplication-first-factor-handle")
  ) {
    return;
  }
  event.preventDefault();
  activePointer = event.pointerId;
  firstFactorHandle.setPointerCapture(event.pointerId);
  const point = svgPoint(event);
  if (point) attemptMove(point.x);
}

function drag(event) {
  if (
    activePointer !== event.pointerId ||
    ![MULTIPLICATION_VIEWS.free, MULTIPLICATION_VIEWS.conclusion].includes(state.view)
  ) {
    return;
  }
  event.preventDefault();
  const point = svgPoint(event);
  if (point) attemptMove(point.x);
}

function endDrag(event) {
  if (activePointer !== event.pointerId) return;
  if (firstFactorHandle.hasPointerCapture(event.pointerId)) {
    firstFactorHandle.releasePointerCapture(event.pointerId);
  }
  activePointer = null;
}

function keyboard(event) {
  if (![MULTIPLICATION_VIEWS.free, MULTIPLICATION_VIEWS.conclusion].includes(state.view)) {
    return;
  }
  const delta = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
  if (delta === undefined) return;
  event.preventDefault();
  state = moveFirstFactor(state, state.firstFactor + delta);
  render();
}

board.addEventListener("pointerdown", startDrag);
board.addEventListener("pointermove", drag);
board.addEventListener("pointerup", endDrag);
board.addEventListener("pointercancel", endDrag);
firstFactorHandle.addEventListener("keydown", keyboard);
nextButton.addEventListener("click", runNext);
resetButton.addEventListener("click", () => {
  const next = resetMultiplicationState(state);
  if (next === state) return;
  clearAnimation();
  activePointer = null;
  state = next;
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
