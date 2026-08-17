import { DISTRIBUTION_DEFAULT_FACTOR, createDistributionModel, normalizeDistributionFactor } from "./distribution-math.js";

export const DISTRIBUTION_VIEWS = Object.freeze({
  irritation: "irritation", package: "package", factor: "factor", copying: "copying",
  copies: "copies", regroup: "regroup", result: "result", explore: "explore", conclusion: "conclusion",
});

const INSIGHTS = Object.freeze({
  irritation: "Was vervielfacht die 3: nur x oder das ganze Klammerpaket?",
  package: "Die Klammer hält x und zwei Einer als ein gemeinsames Paket zusammen.",
  factor: "Der Faktor 3 fordert drei vollständige Kopien dieses Pakets.",
  copying: "Jede Kopie erhält wieder x und zwei Einer.",
  copies: "Drei vollständige Pakete enthalten dreimal x und dreimal zwei Einer.",
  regroup: "Gleichartige Bausteine bündeln sich zu 3x und sechs Einern.",
  result: "3(x + 2) wird deshalb zu 3x + 6.",
  explore: "Verändere den Faktor und beobachte, wie oft beide Paketbestandteile erscheinen.",
  conclusion: "Der äußere Faktor vervielfacht jeden Bestandteil des gesamten Pakets.",
});

const make = (view, factor, locked) => Object.freeze({ view, factor, locked });

export function createDistributionState() { return make(DISTRIBUTION_VIEWS.irritation, DISTRIBUTION_DEFAULT_FACTOR, false); }

export function nextDistributionState(current) {
  if (current.locked) return current;
  const next = {
    irritation: "package", package: "factor", factor: "copying", copies: "regroup",
    regroup: "result", result: "explore",
  }[current.view];
  if (!next) return current;
  return make(next, current.factor, next === DISTRIBUTION_VIEWS.copying);
}

export function finishDistributionCopy(current) {
  return current.view === DISTRIBUTION_VIEWS.copying
    ? make(DISTRIBUTION_VIEWS.copies, current.factor, false) : current;
}

export function setDistributionFactor(current, value) {
  if (![DISTRIBUTION_VIEWS.explore, DISTRIBUTION_VIEWS.conclusion].includes(current.view) || current.locked) return current;
  const factor = normalizeDistributionFactor(value);
  return factor === current.factor ? current : make(DISTRIBUTION_VIEWS.conclusion, factor, false);
}

export function resetDistributionState() { return createDistributionState(); }

export function distributionViewModel(current) {
  const math = createDistributionModel(current.factor);
  const showCopies = ["copying", "copies", "regroup", "result", "explore", "conclusion"].includes(current.view);
  const showExplore = ["explore", "conclusion"].includes(current.view);
  return Object.freeze({
    ...math,
    showIrritation: current.view === "irritation",
    showPackage: current.view === "package",
    showFactor: current.view === "factor",
    showCopying: current.view === "copying",
    showCopies,
    showRegroup: ["regroup", "result", "explore", "conclusion"].includes(current.view),
    showResult: ["result", "explore", "conclusion"].includes(current.view),
    showExplore,
    showConclusion: current.view === "conclusion",
    showNext: !showExplore,
    interactive: showExplore && !current.locked,
    controlsLocked: current.locked,
    insight: INSIGHTS[current.view],
    conclusion: "Der Faktor 3 vervielfacht das gesamte Paket.",
  });
}
