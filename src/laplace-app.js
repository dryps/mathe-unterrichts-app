import { LAPLACE_REVEAL_DURATION, laplaceRevealFrame } from "./laplace-animation.js";
import { createLaplaceState, finishLaplaceReveal, laplaceViewModel, nextLaplaceState, resetLaplaceState, setLaplaceResult } from "./laplace-state.js";

const $ = (selector) => document.querySelector(selector);
const workspace = $("#lp-workspace");
const equalWheel = $("#lp-equal-wheel");
const unequalWheel = $("#lp-unequal-wheel");
const count = $("#lp-count");
const areas = $("#lp-areas");
const probability = $("#lp-probability");
const explore = $("#lp-explore");
const conclusion = $("#lp-conclusion");
const selectedLabels = [...document.querySelectorAll(".lp-selected-result")];
const equalAngle = $("#lp-equal-angle");
const unequalAngle = $("#lp-unequal-angle");
const equalProbability = $("#lp-equal-probability");
const unequalProbability = $("#lp-unequal-probability");
const slider = $("#lp-result-slider");
const output = $("#lp-result-output");
const insight = $("#lp-insight");
const live = $("#lp-live");
const next = $("#lp-next");
const reset = $("#lp-reset");
const segments = [...document.querySelectorAll(".lp-segment")];
const segmentLabels = [...document.querySelectorAll(".lp-segment-label")];

let current = createLaplaceState();
let frameId = null;
let timerId = null;
let token = 0;

function clearAnimation() {
  token += 1;
  if (frameId !== null) cancelAnimationFrame(frameId);
  if (timerId !== null) clearTimeout(timerId);
  frameId = null;
  timerId = null;
  workspace.style.opacity = "1";
  workspace.setAttribute("aria-busy", "false");
  next.disabled = false;
}

function renderSegments(model) {
  for (const wheel of ["equal", "unequal"]) {
    const geometry = wheel === "equal" ? model.equalSegments : model.unequalSegments;
    segments.filter((segment) => segment.dataset.wheel === wheel).forEach((segment, index) => {
      segment.setAttribute("d", geometry[index].path);
      segment.classList.toggle("is-selected", Number(segment.dataset.result) === model.selectedResult);
    });
    segmentLabels.filter((label) => label.dataset.wheel === wheel).forEach((label, index) => {
      label.setAttribute("x", geometry[index].label.x);
      label.setAttribute("y", geometry[index].label.y);
    });
  }
}

function render() {
  const model = laplaceViewModel(current);
  workspace.dataset.state = model.view;
  equalWheel.setAttribute("aria-label", model.equalAriaLabel);
  unequalWheel.setAttribute("aria-label", model.unequalAriaLabel);
  count.hidden = !model.showCount;
  areas.hidden = !model.showAreas;
  probability.hidden = !model.showProbability;
  explore.hidden = !model.showExplore;
  conclusion.hidden = !model.showConclusion;
  selectedLabels.forEach((label) => { label.textContent = String(model.selectedResult); });
  equalAngle.textContent = `${model.equalAngle}°`;
  unequalAngle.textContent = `${model.unequalAngle}°`;
  equalProbability.textContent = model.equalProbability;
  unequalProbability.textContent = model.unequalProbability;
  slider.value = String(model.selectedResult);
  slider.disabled = !model.controlsInteractive;
  slider.setAttribute("aria-valuetext", model.sliderValueText);
  slider.setAttribute("aria-label", `Ergebnis vergleichen: ${model.sliderValueText}`);
  output.textContent = `Ergebnis ${model.selectedResult}`;
  renderSegments(model);
  insight.textContent = model.insight;
  live.textContent = model.liveText;
  next.hidden = !model.showNext;
  next.disabled = current.locked;
}

function finish(revealToken) {
  if (revealToken !== token || !current.locked) return;
  clearAnimation();
  current = finishLaplaceReveal(current);
  render();
}

function animate() {
  clearAnimation();
  const revealToken = token;
  workspace.style.opacity = "0";
  workspace.setAttribute("aria-busy", "true");
  next.disabled = true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finish(revealToken);
    return;
  }
  let started = null;
  timerId = setTimeout(() => finish(revealToken), LAPLACE_REVEAL_DURATION + 120);
  function frame(time) {
    if (revealToken !== token || !current.locked) return;
    if (started === null) started = time;
    const model = laplaceRevealFrame(time - started);
    workspace.style.opacity = String(model.opacity);
    if (model.complete) finish(revealToken);
    else frameId = requestAnimationFrame(frame);
  }
  frameId = requestAnimationFrame(frame);
}

next.addEventListener("click", () => {
  if (current.locked) return;
  current = nextLaplaceState(current);
  render();
  if (current.locked) animate();
});
reset.addEventListener("click", () => {
  clearAnimation();
  current = resetLaplaceState();
  render();
});
slider.addEventListener("input", (event) => {
  current = setLaplaceResult(current, Number(event.currentTarget.value));
  render();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" }).catch(() => {}));
}
render();
