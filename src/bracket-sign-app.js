import { BRACKET_SIGN_ACTION_DURATION, bracketSignActionFrame } from "./bracket-sign-animation.js";
import {
  BRACKET_SIGN_VIEWS, bracketSignViewModel, createBracketSignState,
  finishBracketSignAction, nextBracketSignState, resetBracketSignState, setBracketOuterFactor,
} from "./bracket-sign-state.js";

const $ = (selector) => document.querySelector(selector);
const board = $("#bracket-sign-board");
const irritation = $("#bracket-sign-irritation");
const packagePanel = $("#bracket-sign-package");
const comparison = $("#bracket-sign-comparison");
const explore = $("#bracket-sign-explore");
const conclusion = $("#bracket-sign-conclusion");
const factorToken = $("#outer-factor-token");
const variable = $("#package-variable");
const constant = $("#package-constant");
const result = $("#package-result");
const acting = $("#acting-overlay");
const arrowVariable = $("#acting-arrow-variable");
const arrowConstant = $("#acting-arrow-constant");
const plusResult = $("#comparison-plus-result");
const minusResult = $("#comparison-minus-result");
const factorControl = $("#factor-control");
const factorValue = $("#factor-value");
const insight = $("#bracket-sign-insight");
const live = $("#bracket-sign-live");
const next = $("#bracket-sign-next");
const reset = $("#bracket-sign-reset");

let current = createBracketSignState();
let frameId = null;
let timerId = null;

function setActionFrame(frame) {
  acting.style.setProperty("--action-reach", frame.reach);
  acting.style.setProperty("--action-flip", frame.flip);
  arrowVariable.style.setProperty("--action-reach", frame.reach);
  arrowConstant.style.setProperty("--action-reach", frame.reach);
}

function render() {
  const model = bracketSignViewModel(current);
  const revealResult = model.showMinus || model.showExplore;
  board.dataset.state = current.view;
  irritation.hidden = !model.showIrritation;
  packagePanel.hidden = !model.showPackage;
  comparison.hidden = !model.showComparison;
  explore.hidden = !model.showExplore;
  conclusion.hidden = !model.showConclusion;
  acting.hidden = !model.showActing;
  factorToken.textContent = model.outerFactor > 0 ? "+1" : "−1";
  variable.textContent = model.showMinus || model.showExplore ? model.resultLabels[0] : "+x";
  constant.textContent = model.showMinus || model.showExplore ? model.resultLabels[1] : "−3";
  result.textContent = model.resultExpression;
  result.hidden = !revealResult;
  plusResult.textContent = model.plusModel.resultExpression;
  minusResult.textContent = model.minusModel.resultExpression;
  factorControl.value = String(model.outerFactor);
  factorControl.disabled = !model.interactive;
  factorValue.textContent = model.outerFactor > 0 ? "+1" : "−1";
  insight.textContent = model.insight;
  live.textContent = model.showConclusion
    ? `${model.ruleExplanation} Dabei werden beide Vorzeichen vom äußeren Faktor bestimmt.` : "";
  next.hidden = !model.showNext;
  next.disabled = model.controlsLocked;
  reset.disabled = false;
  if (!model.showActing) setActionFrame(bracketSignActionFrame(0));
}

function clearAnimation() {
  if (frameId !== null) cancelAnimationFrame(frameId);
  if (timerId !== null) clearTimeout(timerId);
  frameId = null; timerId = null;
}

function finishAction() {
  if (current.view !== BRACKET_SIGN_VIEWS.acting) return;
  clearAnimation();
  current = finishBracketSignAction(current);
  render();
}

function animateAction() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setActionFrame(bracketSignActionFrame(BRACKET_SIGN_ACTION_DURATION));
    finishAction();
    return;
  }
  setActionFrame(bracketSignActionFrame(0));
  timerId = setTimeout(finishAction, BRACKET_SIGN_ACTION_DURATION + 120);
  let started = null;
  function animate(time) {
    if (current.view !== BRACKET_SIGN_VIEWS.acting) return;
    if (started === null) started = time;
    const frame = bracketSignActionFrame(time - started);
    setActionFrame(frame);
    if (frame.complete) finishAction();
    else frameId = requestAnimationFrame(animate);
  }
  frameId = requestAnimationFrame(animate);
}

next.addEventListener("click", () => {
  if (current.locked) return;
  current = nextBracketSignState(current);
  render();
  if (current.view === BRACKET_SIGN_VIEWS.acting) animateAction();
});
reset.addEventListener("click", () => { clearAnimation(); current = resetBracketSignState(); render(); });
factorControl.addEventListener("input", (event) => { current = setBracketOuterFactor(current, event.currentTarget.value); render(); });

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" }).catch(() => {});
  });
}
render();
