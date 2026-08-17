import { termSnapshot } from "./terms-variables-math.js";
import {
  TERMS_VARIABLES_VIEWS,
  advanceChangingValue,
  createTermsVariablesState,
  nextTermsVariablesState,
  resetTermsVariablesState,
  setExplorationX,
  termsVariablesViewModel,
} from "./terms-variables-state.js";

const CONCLUSION = "2x + 3 bleibt derselbe Term. Wenn x sich ändert, ändert sich sein Wert.";
const $ = (selector) => document.querySelector(selector);
const board = $("#terms-board");
const blocks = $("#terms-blocks");
const prompt = $("#terms-prompt");
const assigned = $("#terms-assigned");
const xLabel = $("#terms-x-label");
const xBlockValueA = $("#terms-x-block-value-a");
const xBlockValueB = $("#terms-x-block-value-b");
const substituted = $("#terms-substituted");
const expanded = $("#terms-expanded");
const value = $("#terms-value");
const comparison = $("#terms-comparison");
const exploration = $("#terms-exploration");
const slider = $("#terms-x-slider");
const sliderOutput = $("#terms-slider-output");
const insight = $("#terms-insight");
const conclusion = $("#terms-conclusion");
const live = $("#terms-live");
const nextButton = $("#terms-next");
const resetButton = $("#terms-reset");
const blockSymbols = [...document.querySelectorAll(".terms-block-symbol")];

let state = createTermsVariablesState();
let sequenceGeneration = 0;
const sequenceTimers = new Set();

function cancelChangingSequence() {
  sequenceGeneration += 1;
  for (const timer of sequenceTimers) clearTimeout(timer);
  sequenceTimers.clear();
}

function renderSnapshot(snapshot, showCurrentValues) {
  xLabel.textContent = snapshot ? `x = ${snapshot.x}` : "";
  xBlockValueA.textContent = snapshot ? String(snapshot.xBlockValues[0]) : "";
  xBlockValueB.textContent = snapshot ? String(snapshot.xBlockValues[1]) : "";
  xBlockValueA.hidden = !showCurrentValues;
  xBlockValueB.hidden = !showCurrentValues;
  for (const symbol of blockSymbols) symbol.hidden = showCurrentValues;

  substituted.textContent = snapshot?.substituted ?? "";
  expanded.textContent = snapshot?.expanded ?? "";
  value.textContent = snapshot ? String(snapshot.value) : "";

  const sliderSnapshot = snapshot ?? termSnapshot(3);
  slider.value = String(sliderSnapshot.x);
  sliderOutput.textContent = `x = ${sliderSnapshot.x}`;
  slider.setAttribute(
    "aria-valuetext",
    `x ist ${sliderSnapshot.x}, Termwert ${sliderSnapshot.value}`,
  );
  live.textContent = snapshot
    ? `x ist ${snapshot.x}. Der Term 2x + 3 hat den Termwert ${snapshot.value}.`
    : "";
}

function render() {
  const model = termsVariablesViewModel(state);
  const snapshot = state.x === null ? null : termSnapshot(state.x);

  board.dataset.state = state.view;
  prompt.hidden = state.view !== TERMS_VARIABLES_VIEWS.irritation;
  blocks.hidden = !model.showBlocks;
  assigned.hidden = !model.showAssigned;
  comparison.hidden = !model.showComparison;
  exploration.hidden = !model.showExploration;
  conclusion.hidden = !model.showConclusion;
  conclusion.textContent = CONCLUSION;
  insight.textContent = model.insight;

  nextButton.hidden = !model.showNext;
  nextButton.disabled = model.nextDisabled;
  nextButton.setAttribute("aria-disabled", String(model.nextDisabled));
  resetButton.disabled = false;
  slider.disabled = model.sliderDisabled;
  slider.setAttribute("aria-disabled", String(model.sliderDisabled));

  renderSnapshot(snapshot, model.showAssigned);
}

function scheduleChangingValue(generation, x, delay) {
  const timer = setTimeout(() => {
    sequenceTimers.delete(timer);
    if (generation !== sequenceGeneration || state.view !== TERMS_VARIABLES_VIEWS.changing) {
      return;
    }
    const next = advanceChangingValue(state, x);
    if (next === state) return;
    state = next;
    render();
  }, delay);
  sequenceTimers.add(timer);
}

function startChangingSequence() {
  cancelChangingSequence();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    state = advanceChangingValue(state, 2);
    state = advanceChangingValue(state, 3);
    render();
    return;
  }

  const generation = sequenceGeneration;
  scheduleChangingValue(generation, 2, 700);
  scheduleChangingValue(generation, 3, 1400);
}

function runNext() {
  const previous = state;
  const next = nextTermsVariablesState(state);
  if (next === state) return;
  state = next;
  render();
  if (
    previous.view === TERMS_VARIABLES_VIEWS.assigned &&
    state.view === TERMS_VARIABLES_VIEWS.changing
  ) {
    startChangingSequence();
  }
}

nextButton.addEventListener("click", runNext);
resetButton.addEventListener("click", () => {
  cancelChangingSequence();
  state = resetTermsVariablesState();
  render();
});
slider.addEventListener("input", () => {
  const next = setExplorationX(state, slider.value);
  if (next !== state) state = next;
  render();
});

render();
