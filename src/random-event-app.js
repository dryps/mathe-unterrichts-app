import { RANDOM_EVENT_REVEAL_DURATION, randomEventRevealFrame } from "./random-event-animation.js";
import { createRandomEventState, finishRandomEventReveal, nextRandomEventState, randomEventViewModel, resetRandomEventState, setRandomEvent } from "./random-event-state.js";

const $ = (selector) => document.querySelector(selector);
const workspace = $("#rl-workspace");
const lab = $("#rl-lab");
const result = $("#rl-result");
const room = $("#rl-room");
const eventPanel = $("#rl-event");
const eventLabel = $("#rl-event-label");
const eventSet = $("#rl-event-set");
const explore = $("#rl-explore");
const conclusion = $("#rl-conclusion");
const select = $("#rl-event-select");
const insight = $("#rl-insight");
const live = $("#rl-live");
const next = $("#rl-next");
const reset = $("#rl-reset");
const cards = [...document.querySelectorAll(".rl-outcome")];

let current = createRandomEventState();
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
  const model = randomEventViewModel(current);
  workspace.dataset.state = model.view;
  lab.setAttribute("aria-label", model.labAriaLabel);
  result.hidden = !model.showResult;
  room.hidden = !model.showRoom;
  eventPanel.hidden = !model.showEvent;
  explore.hidden = !model.showExplore;
  conclusion.hidden = !model.showConclusion;
  eventLabel.textContent = model.eventLabel;
  eventSet.textContent=model.eventSetText;
  cards.forEach((card, index) => {
    const value = Number(card.dataset.value);
    card.classList.toggle("is-member", model.eventResults.includes(value));
    card.setAttribute("aria-label", model.outcomeAriaLabels[index]);
  });
  select.value = model.eventId;
  select.disabled = !model.controlsInteractive;
  select.setAttribute("aria-label", `Ereignis auswählen: ${model.eventLabel} mit den Ergebnissen ${model.eventResults.join(", ")}`);
  insight.textContent = model.insight;
  live.textContent = model.liveText;
  next.hidden = !model.showNext;
  next.disabled = current.locked;
}

function finish(revealToken) {
  if (revealToken !== token || !current.locked) return;
  clearAnimation();
  current = finishRandomEventReveal(current);
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
  timerId = setTimeout(() => finish(revealToken), RANDOM_EVENT_REVEAL_DURATION + 120);
  function frame(time) {
    if (revealToken !== token || !current.locked) return;
    if (started === null) started = time;
    const model = randomEventRevealFrame(time - started);
    workspace.style.opacity = String(model.opacity);
    if (model.complete) finish(revealToken);
    else frameId = requestAnimationFrame(frame);
  }
  frameId = requestAnimationFrame(frame);
}

next.addEventListener("click", () => {
  if (current.locked) return;
  current = nextRandomEventState(current);
  render();
  if (current.locked) animate();
});
reset.addEventListener("click", () => {
  clearAnimation();
  current = resetRandomEventState();
  render();
});
select.addEventListener("change", (event) => {
  current = setRandomEvent(current, event.currentTarget.value);
  render();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" }).catch(() => {}));
}
render();
