import { OUTCOME_SPACE_REVEAL_DURATION, outcomeSpaceRevealFrame } from "./outcome-space-animation.js";
import { createOutcomeSpaceState, finishOutcomeSpaceReveal, nextOutcomeSpaceState, outcomeSpaceViewModel, resetOutcomeSpaceState } from "./outcome-space-state.js";

const $ = (selector) => document.querySelector(selector);
const workspace = $("#os-workspace");
const lab = $("#os-lab");
const placeholder = $("#os-placeholder");
const six = $("#os-six");
const wrong = $("#os-wrong");
const missing = $("#os-missing");
const correct = $("#os-correct");
const conclusion = $("#os-conclusion");
const insight = $("#os-insight");
const live = $("#os-live");
const next = $("#os-next");
const reset = $("#os-reset");
const cards = [...document.querySelectorAll(".os-outcome")];

let current = createOutcomeSpaceState();
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

function render() {
  const model = outcomeSpaceViewModel(current);
  workspace.dataset.state = model.view;
  lab.setAttribute("aria-label", model.labAriaLabel);
  placeholder.hidden=model.showSix;
  six.hidden=!model.showSix;
  wrong.hidden = !model.showWrong;
  missing.hidden = !model.showMissing;
  correct.hidden = !model.showComplete;
  conclusion.hidden = !model.showConclusion;
  cards.forEach((card) => {
    const value = Number(card.dataset.value);
    card.classList.toggle("is-favorable", model.favorableResults.includes(value));
    card.setAttribute("aria-label", model.favorableResults.includes(value) ? `Ergebnis ${value}, günstig für gerade Zahl` : `Ergebnis ${value}`);
  });
  insight.textContent = model.insight;
  live.textContent = model.liveText;
  next.hidden = !model.showNext;
  next.disabled = current.locked;
}

function finish(revealToken) {
  if (revealToken !== token || !current.locked) return;
  clearAnimation();
  current = finishOutcomeSpaceReveal(current);
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
  timerId = setTimeout(() => finish(revealToken), OUTCOME_SPACE_REVEAL_DURATION + 120);
  function frame(time) {
    if (revealToken !== token || !current.locked) return;
    if (started === null) started = time;
    const model = outcomeSpaceRevealFrame(time - started);
    workspace.style.opacity = String(model.opacity);
    if (model.complete) finish(revealToken);
    else frameId = requestAnimationFrame(frame);
  }
  frameId = requestAnimationFrame(frame);
}

next.addEventListener("click", () => {
  if (current.locked) return;
  current = nextOutcomeSpaceState(current);
  render();
  if (current.locked) animate();
});
reset.addEventListener("click", () => {
  clearAnimation();
  current = resetOutcomeSpaceState();
  render();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" }).catch(() => {}));
}
render();
