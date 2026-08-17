import {
  TERM_DIVISION_DEFAULT_GROUPS,
  createTermDivisionModel,
  normalizeTermDivisionGroups,
} from "./term-division-math.js";

export const TERM_DIVISION_VIEWS = Object.freeze({
  irritation: "irritation",
  factors: "factors",
  building: "building",
  groups: "groups",
  division: "division",
  result: "result",
  explore: "explore",
  conclusion: "conclusion",
});

const INSIGHTS = Object.freeze({
  irritation: "Welche Wirkung hat der Divisor 3 auf das ganze Produkt?",
  factors: "Der Faktor 3 bedeutet: Das Paket 4x ist dreimal vorhanden.",
  building: "Aus dem Faktor 3 entstehen drei gleiche Pakete.",
  groups: "Das Produkt besteht jetzt sichtbar aus drei gleichen Gruppen mit je 4x.",
  division: "Durch 3 teilen fragt nach dem Inhalt einer von drei gleichen Gruppen.",
  result: "In einer Gruppe stecken vier x-Bausteine: 4x.",
  explore: "Verändere die Zahl gleicher Gruppen und beobachte, was übrig bleibt.",
  conclusion: "Division macht einen vorhandenen Faktor rückgängig.",
});

function state(view, groups, locked) {
  return Object.freeze({ view, groups, locked });
}

export function createTermDivisionState() {
  return state(TERM_DIVISION_VIEWS.irritation, TERM_DIVISION_DEFAULT_GROUPS, false);
}

export function nextTermDivisionState(current) {
  if (current.locked) return current;

  const nextView = {
    [TERM_DIVISION_VIEWS.irritation]: TERM_DIVISION_VIEWS.factors,
    [TERM_DIVISION_VIEWS.factors]: TERM_DIVISION_VIEWS.building,
    [TERM_DIVISION_VIEWS.groups]: TERM_DIVISION_VIEWS.division,
    [TERM_DIVISION_VIEWS.division]: TERM_DIVISION_VIEWS.result,
    [TERM_DIVISION_VIEWS.result]: TERM_DIVISION_VIEWS.explore,
  }[current.view];

  if (!nextView) return current;
  return state(nextView, current.groups, nextView === TERM_DIVISION_VIEWS.building);
}

export function finishTermDivisionBuild(current) {
  if (current.view !== TERM_DIVISION_VIEWS.building) return current;
  return state(TERM_DIVISION_VIEWS.groups, current.groups, false);
}

export function setTermDivisionGroups(current, value) {
  const interactiveViews = [TERM_DIVISION_VIEWS.explore, TERM_DIVISION_VIEWS.conclusion];
  if (!interactiveViews.includes(current.view) || current.locked) return current;

  const groups = normalizeTermDivisionGroups(value);
  if (groups === current.groups) return current;
  return state(TERM_DIVISION_VIEWS.conclusion, groups, false);
}

export function resetTermDivisionState() {
  return createTermDivisionState();
}

export function termDivisionViewModel(current) {
  const math = createTermDivisionModel(current.groups);
  const showPackages = [
    TERM_DIVISION_VIEWS.building,
    TERM_DIVISION_VIEWS.groups,
    TERM_DIVISION_VIEWS.division,
    TERM_DIVISION_VIEWS.result,
    TERM_DIVISION_VIEWS.explore,
    TERM_DIVISION_VIEWS.conclusion,
  ].includes(current.view);
  const showExplore = [TERM_DIVISION_VIEWS.explore, TERM_DIVISION_VIEWS.conclusion].includes(
    current.view,
  );

  return Object.freeze({
    ...math,
    showIrritation: current.view === TERM_DIVISION_VIEWS.irritation,
    showFactors: current.view === TERM_DIVISION_VIEWS.factors,
    showPackages,
    showBuilding: current.view === TERM_DIVISION_VIEWS.building,
    showGroups: current.view === TERM_DIVISION_VIEWS.groups,
    showDivision: current.view === TERM_DIVISION_VIEWS.division,
    showResult: [
      TERM_DIVISION_VIEWS.result,
      TERM_DIVISION_VIEWS.explore,
      TERM_DIVISION_VIEWS.conclusion,
    ].includes(current.view),
    showExplore,
    showConclusion: current.view === TERM_DIVISION_VIEWS.conclusion,
    showNext: !showExplore,
    interactive: showExplore && !current.locked,
    controlsLocked: current.locked,
    insight: INSIGHTS[current.view],
    conclusion: "Division macht einen vorhandenen Faktor rückgängig.",
  });
}
