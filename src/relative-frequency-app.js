import { RELATIVE_FREQUENCY_REVEAL_DURATION, relativeFrequencyRevealFrame } from "./relative-frequency-animation.js";
import { createRelativeFrequencyState, finishRelativeFrequencyReveal, nextRelativeFrequencyState, relativeFrequencyViewModel, resetRelativeFrequencyState, setRelativeFrequencyCheckpoint } from "./relative-frequency-state.js";

const $ = (selector) => document.querySelector(selector);
const workspace = $("#rh-workspace");
const chartCard = $("#rh-chart-card");
const chart = $("#rh-chart");
const line = $("#rh-line");
const explore = $("#rh-explore");
const conclusion = $("#rh-conclusion");
const throwsValue = $("#rh-throws");
const sixesValue = $("#rh-sixes");
const fractionValue = $("#rh-fraction");
const frequencyValue = $("#rh-frequency");
const slider = $("#rh-checkpoint-slider");
const output = $("#rh-checkpoint-output");
const insight = $("#rh-insight");
const live = $("#rh-live");
const next = $("#rh-next");
const reset = $("#rh-reset");
const rows = [...document.querySelectorAll(".rh-row")];
const points = [...document.querySelectorAll(".rh-point")];

let current = createRelativeFrequencyState();
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

function renderCheckpoints(model) {
  rows.forEach((row) => {
    const checkpoint = model.checkpoints[Number(row.dataset.index)];
    row.hidden = !checkpoint.visible;
    row.classList.toggle("is-selected", checkpoint.selected);
    row.toggleAttribute?.("aria-current", checkpoint.selected && checkpoint.visible);
    if (checkpoint.selected && checkpoint.visible) row.setAttribute("aria-current", "true");
  });
  points.forEach((point) => {
    const checkpoint = model.checkpoints[Number(point.dataset.index)];
    point.toggleAttribute("hidden", !checkpoint.visible);
    point.setAttribute("cx", checkpoint.point.x);
    point.setAttribute("cy", checkpoint.point.y);
    point.classList.toggle("is-selected", checkpoint.selected);
  });
  line.setAttribute("points", model.checkpoints.filter((checkpoint) => checkpoint.visible).map((checkpoint) => `${checkpoint.point.x},${checkpoint.point.y}`).join(" "));
}

function render() {
  const model = relativeFrequencyViewModel(current);
  workspace.dataset.state = model.view;
  chartCard.hidden = !model.showChart;
  explore.hidden = !model.showExplore;
  conclusion.hidden = !model.showConclusion;
  chart.setAttribute("aria-label", model.chartAriaLabel);
  throwsValue.textContent = model.throwCountText;
  sixesValue.textContent = model.sixCountText;
  fractionValue.textContent = model.fractionText;
  frequencyValue.textContent = model.frequencyText;
  slider.value = String(model.selectedIndex);
  slider.disabled = !model.controlsInteractive;
  slider.setAttribute("aria-valuetext", model.sliderValueText);
  slider.setAttribute("aria-label", `Versuchsreihe erkunden: ${model.sliderValueText}`);
  output.textContent = model.throwCountText === "1" ? "1 Wurf" : `${model.throwCountText} Würfe`;
  renderCheckpoints(model);
  insight.textContent = model.insight;
  live.textContent = model.liveText;
  next.hidden = !model.showNext;
  next.disabled = current.locked;
}

function finish(revealToken) {
  if (revealToken !== token || !current.locked) return;
  clearAnimation();
  current = finishRelativeFrequencyReveal(current);
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
  timerId = setTimeout(() => finish(revealToken), RELATIVE_FREQUENCY_REVEAL_DURATION + 120);
  function frame(time) {
    if (revealToken !== token || !current.locked) return;
    if (started === null) started = time;
    const model = relativeFrequencyRevealFrame(time - started);
    workspace.style.opacity = String(model.opacity);
    if (model.complete) finish(revealToken);
    else frameId = requestAnimationFrame(frame);
  }
  frameId = requestAnimationFrame(frame);
}

next.addEventListener("click", () => {
  if (current.locked) return;
  current = nextRelativeFrequencyState(current);
  render();
  if (current.locked) animate();
});
reset.addEventListener("click", () => {
  clearAnimation();
  current = resetRelativeFrequencyState();
  render();
});
slider.addEventListener("input", (event) => {
  current = setRelativeFrequencyCheckpoint(current, Number(event.currentTarget.value));
  render();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" }).catch(() => {}));
}
render();
