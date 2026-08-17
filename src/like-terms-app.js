import {
  LIKE_TERMS_MERGE_DURATION_MS,
  likeTermsMergeFrame,
} from "./like-terms-animation.js";
import {
  LIKE_TERM_VIEWS,
  createLikeTermsState,
  finishLikeTermsMerge,
  likeTermsViewModel,
  nextLikeTermsState,
  resetLikeTermsState,
  setGroupCoefficient,
} from "./like-terms-state.js";

const $ = (selector) => document.querySelector(selector);
const board = $("#like-terms-board");
const irritationPanel = $("#like-terms-irritation");
const groupsPanel = $("#like-terms-groups");
const combinedPanel = $("#like-terms-combined");
const counterexamplePanel = $("#like-terms-counterexample");
const comparisonPanel = $("#like-terms-comparison");
const explorePanel = $("#like-terms-explore");
const conclusion = $("#like-terms-conclusion");
const likeGroupFirst = $("#like-group-first");
const likeGroupSecond = $("#like-group-second");
const combinedBlocks = $("#combined-blocks");
const counterXBlocks = $("#counter-x-blocks");
const counterOneBlocks = $("#counter-one-blocks");
const compareLikeBlocks = $("#compare-like-blocks");
const compareXBlocks = $("#compare-x-blocks");
const compareOneBlocks = $("#compare-one-blocks");
const exploreFirstBlocks = $("#explore-first-blocks");
const exploreSecondBlocks = $("#explore-second-blocks");
const exploreResultBlocks = $("#explore-result-blocks");
const exploreFormula = $("#explore-formula");
const firstCoefficient = $("#first-coefficient");
const secondCoefficient = $("#second-coefficient");
const firstValue = $("#first-value");
const secondValue = $("#second-value");
const insight = $("#like-terms-insight");
const live = $("#like-terms-live");
const nextButton = $("#like-terms-next");
const resetButton = $("#like-terms-reset");

let current = createLikeTermsState();
let frameId = null;
let timerId = null;
let mergeDistance = 0;

function createBlock(kind) {
  const block = document.createElement("span");
  block.className = `algebra-block ${kind === "x" ? "x-block" : "unit-block"}`;
  block.textContent = kind === "x" ? "x" : "1";
  block.setAttribute("aria-hidden", "true");
  return block;
}

function renderBlocks(container, kind, count) {
  container.replaceChildren(
    ...Array.from({ length: count }, () => createBlock(kind)),
  );
}

function setMergeFrame(progress = 0, gap = 1) {
  board.style.setProperty(
    "--merge-shift",
    `${(-mergeDistance * progress).toFixed(3)}px`,
  );
  board.style.setProperty("--merge-gap", String(gap));
}

function measureMergeDistance() {
  const firstRect = likeGroupFirst.getBoundingClientRect();
  const secondRect = likeGroupSecond.getBoundingClientRect();
  const blockGap = Number.parseFloat(getComputedStyle(likeGroupFirst).columnGap) || 0;
  return Math.max(0, secondRect.left - firstRect.right - blockGap);
}

function render() {
  const model = likeTermsViewModel(current);
  const groupsVisible = model.showLikeGroups || model.showMerging;

  board.dataset.state = current.view;
  irritationPanel.hidden = !model.showIrritation;
  groupsPanel.hidden = !groupsVisible;
  combinedPanel.hidden = !model.showCombined;
  counterexamplePanel.hidden = !model.showCounterexample;
  comparisonPanel.hidden = !model.showComparison;
  explorePanel.hidden = !model.showExplore;
  conclusion.hidden = !model.showConclusion;
  groupsPanel.classList.toggle("is-merging", model.showMerging);

  renderBlocks(likeGroupFirst, "x", 3);
  renderBlocks(likeGroupSecond, "x", 2);
  renderBlocks(combinedBlocks, "x", 5);
  renderBlocks(counterXBlocks, "x", 3);
  renderBlocks(counterOneBlocks, "one", 2);
  renderBlocks(compareLikeBlocks, "x", 5);
  renderBlocks(compareXBlocks, "x", 3);
  renderBlocks(compareOneBlocks, "one", 2);
  renderBlocks(exploreFirstBlocks, "x", current.first);
  renderBlocks(exploreSecondBlocks, "x", current.second);
  renderBlocks(exploreResultBlocks, "x", current.first + current.second);

  firstCoefficient.value = String(current.first);
  secondCoefficient.value = String(current.second);
  firstCoefficient.disabled = !model.interactive;
  secondCoefficient.disabled = !model.interactive;
  firstValue.textContent = `${current.first}x`;
  secondValue.textContent = `${current.second}x`;
  exploreFormula.textContent = model.formula;
  insight.textContent = model.insight;
  live.textContent = model.showExplore ? model.formula : "";
  nextButton.hidden = !model.showNext;
  nextButton.disabled = model.controlsLocked;
  resetButton.disabled = model.controlsLocked;

  if (!model.showMerging) setMergeFrame();
}

function clearAnimation() {
  if (frameId !== null) cancelAnimationFrame(frameId);
  if (timerId !== null) clearTimeout(timerId);
  frameId = null;
  timerId = null;
}

function finishMerge() {
  clearAnimation();
  current = finishLikeTermsMerge(current);
  render();
}

function animateMerge() {
  mergeDistance = measureMergeDistance();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setMergeFrame(1, 0);
    finishMerge();
    return;
  }

  let started = null;
  timerId = setTimeout(finishMerge, LIKE_TERMS_MERGE_DURATION_MS + 160);
  function animate(time) {
    if (current.view !== LIKE_TERM_VIEWS.merging) return;
    if (started === null) started = time;
    const frame = likeTermsMergeFrame(time - started);
    setMergeFrame(frame.shift, frame.gap);
    if (frame.complete) {
      finishMerge();
      return;
    }
    frameId = requestAnimationFrame(animate);
  }
  frameId = requestAnimationFrame(animate);
}

nextButton.addEventListener("click", () => {
  if (current.locked) return;
  current = nextLikeTermsState(current);
  render();
  if (current.view === LIKE_TERM_VIEWS.merging) animateMerge();
});

resetButton.addEventListener("click", () => {
  if (current.locked) return;
  clearAnimation();
  mergeDistance = 0;
  current = resetLikeTermsState();
  render();
});

firstCoefficient.addEventListener("input", (event) => {
  current = setGroupCoefficient(current, "first", event.currentTarget.value);
  render();
});

secondCoefficient.addEventListener("input", (event) => {
  current = setGroupCoefficient(current, "second", event.currentTarget.value);
  render();
});

render();
