import {
  TERM_MULTIPLICATION_FILL_DURATION_MS,
  termMultiplicationFillFrame,
} from "./term-multiplication-animation.js";
import {
  TERM_MULTIPLICATION_VIEWS,
  createTermMultiplicationState,
  finishTermMultiplicationFill,
  nextTermMultiplicationState,
  resetTermMultiplicationState,
  setTermMultiplicationX,
  termMultiplicationViewModel,
} from "./term-multiplication-state.js";

const $ = (selector) => document.querySelector(selector);
const board = $("#term-multiplication-board");
const irritationPanel = $("#term-multiplication-irritation");
const additionPanel = $("#term-multiplication-addition");
const squarePanel = $("#term-multiplication-square");
const comparisonPanel = $("#term-multiplication-comparison");
const explorePanel = $("#term-multiplication-explore");
const conclusion = $("#term-multiplication-conclusion");
const additionTotal = $("#addition-total");
const squareFormula = $("#square-formula");
const squareShape = $("#square-shape");
const squareAreaLabel = $("#square-area-label");
const exploreAdditionFormula = $("#explore-addition-formula");
const exploreMultiplicationFormula = $("#explore-multiplication-formula");
const comparisonNote = $("#term-multiplication-comparison-note");
const xControl = $("#x-control");
const xValue = $("#x-value");
const insight = $("#term-multiplication-insight");
const live = $("#term-multiplication-live");
const nextButton = $("#term-multiplication-next");
const resetButton = $("#term-multiplication-reset");

let current = createTermMultiplicationState();
let frameId = null;
let timerId = null;

function setFillFrame(fillScale, fillOpacity) {
  board.style.setProperty("--fill-scale", String(fillScale));
  board.style.setProperty("--fill-opacity", String(fillOpacity));
}

function setVisualScale(x) {
  const segmentSize = 3.3 + x * 0.72;
  const squareSize = 6.5 + x * 1.14;
  board.style.setProperty("--segment-size", `${segmentSize.toFixed(2)}rem`);
  board.style.setProperty("--square-size", `${squareSize.toFixed(2)}rem`);
}

function render() {
  const model = termMultiplicationViewModel(current);
  const squareVisible = model.showSquare || model.showFilling || model.showArea;

  board.dataset.state = current.view;
  irritationPanel.hidden = !model.showIrritation;
  additionPanel.hidden = !model.showAddition;
  squarePanel.hidden = !squareVisible;
  comparisonPanel.hidden = !model.showComparison;
  explorePanel.hidden = !model.showExplore;
  conclusion.hidden = !model.showConclusion;
  squarePanel.classList.toggle("is-filling", model.showFilling);
  squarePanel.classList.toggle("is-filled", model.showArea);

  additionTotal.textContent = "Gesamtlänge 2x";
  squareFormula.textContent = model.showArea ? "x · x = x²" : "x · x";
  squareShape.setAttribute(
    "aria-label",
    model.showArea
      ? "Quadrat mit Seitenlänge x und Fläche x Quadrat"
      : "Quadrat mit zwei Seitenlängen x",
  );
  squareAreaLabel.textContent = "Fläche x²";
  squareAreaLabel.hidden = !model.showArea;
  exploreAdditionFormula.textContent = model.additionFormula;
  exploreMultiplicationFormula.textContent = model.multiplicationFormula;
  comparisonNote.textContent = model.comparisonNote;
  xControl.value = String(model.x);
  xControl.disabled = !model.interactive;
  xValue.textContent = `x = ${model.x}`;
  insight.textContent = model.insight;
  live.textContent = model.showExplore
    ? `Länge ${model.additiveLength}, Fläche ${model.squareArea}. ${model.comparisonNote}`
    : "";
  nextButton.hidden = !model.showNext;
  nextButton.disabled = model.controlsLocked;
  resetButton.disabled = false;
  setVisualScale(model.x);

  if (!model.showFilling) {
    const filled = model.showArea || model.showComparison || model.showExplore;
    setFillFrame(filled ? 1 : 0, filled ? 1 : 0.18);
  }
}

function clearAnimation() {
  if (frameId !== null) cancelAnimationFrame(frameId);
  if (timerId !== null) clearTimeout(timerId);
  frameId = null;
  timerId = null;
}

function finishFill() {
  clearAnimation();
  current = finishTermMultiplicationFill(current);
  render();
}

function animateFill() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setFillFrame(1, 1);
    finishFill();
    return;
  }

  let started = null;
  timerId = setTimeout(finishFill, TERM_MULTIPLICATION_FILL_DURATION_MS + 160);
  function animate(time) {
    if (current.view !== TERM_MULTIPLICATION_VIEWS.filling) return;
    if (started === null) started = time;
    const frame = termMultiplicationFillFrame(time - started);
    setFillFrame(frame.fillScale, frame.fillOpacity);
    if (frame.complete) {
      finishFill();
      return;
    }
    frameId = requestAnimationFrame(animate);
  }
  frameId = requestAnimationFrame(animate);
}

nextButton.addEventListener("click", () => {
  if (current.locked) return;
  current = nextTermMultiplicationState(current);
  render();
  if (current.view === TERM_MULTIPLICATION_VIEWS.filling) animateFill();
});

resetButton.addEventListener("click", () => {
  clearAnimation();
  current = resetTermMultiplicationState();
  render();
});

xControl.addEventListener("input", (event) => {
  current = setTermMultiplicationX(current, event.currentTarget.value);
  render();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" })
      .catch(() => {});
  });
}

render();
