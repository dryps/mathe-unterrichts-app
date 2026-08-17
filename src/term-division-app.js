import {
  TERM_DIVISION_BUILD_DURATION,
  termDivisionBuildFrame,
} from "./term-division-animation.js";
import {
  TERM_DIVISION_VIEWS,
  createTermDivisionState,
  finishTermDivisionBuild,
  nextTermDivisionState,
  resetTermDivisionState,
  setTermDivisionGroups,
  termDivisionViewModel,
} from "./term-division-state.js";

const $ = (selector) => document.querySelector(selector);

const board = $("#term-division-board");
const irritationPanel = $("#term-division-irritation");
const factorsPanel = $("#term-division-factors");
const packagesPanel = $("#term-division-packages");
const divisionPanel = $("#term-division-division");
const resultPanel = $("#term-division-result");
const explorePanel = $("#term-division-explore");
const conclusion = $("#term-division-conclusion");
const factorFormula = $("#factor-formula");
const packageEquation = $("#package-equation");
const groupCaption = $("#group-caption");
const divisionFormula = $("#division-formula");
const divisionQuestion = $("#division-question");
const resultEquation = $("#result-equation");
const groupControl = $("#group-control");
const groupValue = $("#group-value");
const insight = $("#term-division-insight");
const live = $("#term-division-live");
const nextButton = $("#term-division-next");
const resetButton = $("#term-division-reset");
const packages = Array.from({ length: 5 }, (_, index) =>
  $(`#division-package-${index + 1}`),
);

let current = createTermDivisionState();
let frameId = null;
let timerId = null;

function setPackageProgress(values) {
  for (let index = 0; index < packages.length; index += 1) {
    const progress = Array.isArray(values) ? (values[index] ?? 0) : values;
    packages[index].style.setProperty("--package-progress", progress);
  }
}

function render() {
  const model = termDivisionViewModel(current);
  const chooseOne = model.showDivision || model.showResult;

  board.dataset.state = current.view;
  irritationPanel.hidden = !model.showIrritation;
  factorsPanel.hidden = !model.showFactors;
  packagesPanel.hidden = !model.showPackages;
  divisionPanel.hidden = !model.showDivision;
  resultPanel.hidden = !model.showResult;
  explorePanel.hidden = !model.showExplore;
  conclusion.hidden = !model.showConclusion;

  factorFormula.textContent = `${model.groups} · (4x)`;
  packageEquation.textContent = `${model.groups} · (4x)`;
  groupCaption.textContent = `${model.groups} gleiche Gruppen mit je 4x`;
  divisionFormula.textContent = model.divisionExpression;
  divisionQuestion.textContent =
    `Durch ${model.groups} teilen heißt: den Inhalt einer von ${model.groups} gleichen Gruppen bestimmen.`;
  resultEquation.textContent = model.equation;
  groupControl.value = String(model.groups);
  groupControl.disabled = !model.interactive;
  groupValue.textContent = `${model.groups} gleiche Gruppen`;
  insight.textContent = model.insight;
  live.textContent = model.showExplore
    ? `${model.groups} gleiche Pakete, geteilt durch ${model.groups}: In einer Gruppe bleiben 4x.`
    : "";
  nextButton.hidden = !model.showNext;
  nextButton.disabled = model.controlsLocked;
  resetButton.disabled = false;

  for (let index = 0; index < packages.length; index += 1) {
    const packageElement = packages[index];
    const visible = index < model.groups;
    const chosen = chooseOne && index === 0;
    packageElement.hidden = !visible;
    packageElement.classList.toggle("is-chosen", chosen);
    packageElement.classList.toggle("is-muted", chooseOne && index > 0 && visible);
    packageElement.setAttribute(
      "aria-label",
      chosen
        ? `Gruppe ${index + 1} von ${model.groups} mit vier x-Bausteinen; ihr Inhalt wird bestimmt`
        : `Gruppe ${index + 1} von ${model.groups} mit vier x-Bausteinen`,
    );
  }

  if (!model.showBuilding) setPackageProgress(model.showPackages ? 1 : 0);
}

function clearAnimation() {
  if (frameId !== null) cancelAnimationFrame(frameId);
  if (timerId !== null) clearTimeout(timerId);
  frameId = null;
  timerId = null;
}

function finishBuild() {
  if (current.view !== TERM_DIVISION_VIEWS.building) return;
  clearAnimation();
  current = finishTermDivisionBuild(current);
  render();
}

function animateBuild() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setPackageProgress(termDivisionBuildFrame(TERM_DIVISION_BUILD_DURATION, current.groups).packageProgress);
    finishBuild();
    return;
  }

  setPackageProgress(0);
  timerId = setTimeout(finishBuild, TERM_DIVISION_BUILD_DURATION + 120);
  let started = null;

  function animate(time) {
    if (current.view !== TERM_DIVISION_VIEWS.building) return;
    if (started === null) started = time;
    const frame = termDivisionBuildFrame(time - started, current.groups);
    setPackageProgress(frame.packageProgress);
    if (frame.complete) {
      finishBuild();
      return;
    }
    frameId = requestAnimationFrame(animate);
  }

  frameId = requestAnimationFrame(animate);
}

nextButton.addEventListener("click", () => {
  if (current.locked) return;
  current = nextTermDivisionState(current);
  render();
  if (current.view === TERM_DIVISION_VIEWS.building) animateBuild();
});

resetButton.addEventListener("click", () => {
  clearAnimation();
  current = resetTermDivisionState();
  render();
});

groupControl.addEventListener("input", (event) => {
  current = setTermDivisionGroups(current, event.currentTarget.value);
  render();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" })
      .catch(() => {});
  });
}

render();
