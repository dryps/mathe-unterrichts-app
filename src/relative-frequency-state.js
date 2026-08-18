import { RELATIVE_FREQUENCY_CHECKPOINTS, chartPoint, formatGermanInteger, formatRelativeFrequency, relativeFrequency } from "./relative-frequency-math.js";

export const RELATIVE_FREQUENCY_VIEWS = Object.freeze({
  irritation: "irritation",
  ten: "ten",
  hundred: "hundred",
  thousand: "thousand",
  tenThousand: "ten-thousand",
  explore: "explore",
});

const ORDER = Object.freeze(Object.values(RELATIVE_FREQUENCY_VIEWS));
const CONCLUSION = "Wahrscheinlichkeit beschreibt langfristiges Verhalten, keinen festen Einzelrhythmus.";
const EXPLANATION = "Die relative Häufigkeit schwankt in einer Versuchsreihe. Bei vielen Würfen kann sie nahe bei 1/6 liegen, ohne einen festen Sechser-Rhythmus zu bilden.";

function validateCheckpoint(index) {
  if (!Number.isInteger(index) || index < 0 || index >= RELATIVE_FREQUENCY_CHECKPOINTS.length) throw new RangeError("Checkpoint muss zwischen null und drei liegen.");
}

function make(view, locked = false, selectedIndex = 0) {
  validateCheckpoint(selectedIndex);
  return Object.freeze({ view, locked: Boolean(locked), selectedIndex });
}

export function createRelativeFrequencyState() {
  return make(RELATIVE_FREQUENCY_VIEWS.irritation);
}

export function nextRelativeFrequencyState(current) {
  if (current.locked) return current;
  const index = ORDER.indexOf(current.view);
  if (index < 0 || index >= ORDER.length - 1) return current;
  const nextIndex = index + 1;
  return make(ORDER[nextIndex], true, Math.min(3, Math.max(0, nextIndex - 1)));
}

export function finishRelativeFrequencyReveal(current) {
  return current.locked ? make(current.view, false, current.selectedIndex) : current;
}

export function setRelativeFrequencyCheckpoint(current, index) {
  validateCheckpoint(index);
  if (current.locked || current.view !== RELATIVE_FREQUENCY_VIEWS.explore) return current;
  return make(current.view, false, index);
}

export function resetRelativeFrequencyState() {
  return createRelativeFrequencyState();
}

export function relativeFrequencyViewModel(current) {
  const rank = ORDER.indexOf(current.view);
  if (rank < 0) throw new RangeError("Unbekannter Lernzustand.");
  const visibleCheckpointCount = Math.min(4, rank);
  const checkpoints = RELATIVE_FREQUENCY_CHECKPOINTS.map((checkpoint, index) => {
    const frequency = relativeFrequency(checkpoint);
    const frequencyText = formatRelativeFrequency(frequency);
    return Object.freeze({
      index,
      throws: checkpoint.throws,
      sixes: checkpoint.sixes,
      throwCountText: formatGermanInteger(checkpoint.throws),
      sixCountText: formatGermanInteger(checkpoint.sixes),
      fractionText: `${formatGermanInteger(checkpoint.sixes)} / ${formatGermanInteger(checkpoint.throws)}`,
      frequency,
      frequencyText,
      frequencyAriaText: frequencyText.replace(" %", " Prozent"),
      point: chartPoint(index, frequency),
      visible: index < visibleCheckpointCount,
      selected: index === current.selectedIndex,
    });
  });
  const selected = checkpoints[current.selectedIndex];
  const visibleDescriptions = checkpoints.slice(0, visibleCheckpointCount).map((checkpoint) => `${checkpoint.throwCountText} Würfe: ${checkpoint.frequencyAriaText}`);
  const chartHeadings = [
    "Ein Checkpoint wird sichtbar",
    "Erster Checkpoint",
    "Zwei Checkpoints im Vergleich",
    "Drei Checkpoints: Der Wert wechselt die Richtung",
    "Vier Checkpoints: Die relative Häufigkeit schwankt",
  ];
  const stageSummary = visibleCheckpointCount === 0
    ? ""
    : `${checkpoints.slice(0, visibleCheckpointCount).map((checkpoint) => checkpoint.throwCountText).join(" → ")} Würfe`;
  const insights = {
    irritation: "Wenn genau jeder sechste Wurf eine Sechs sein müsste: Was dürfte dann in zehn Würfen passieren?",
    ten: "2 Sechsen in 10 Würfen: Die relative Häufigkeit beträgt 20,0 %.",
    hundred: "15 Sechsen in 100 Würfen: 15,0 %. Der Wert liegt jetzt unter 1/6.",
    thousand: "174 Sechsen in 1.000 Würfen: 17,4 %. Der Wert liegt wieder über 1/6.",
    "ten-thousand": "1.630 Sechsen in 10.000 Würfen: 16,3 %. Auch viele Würfe ergeben hier nicht exakt 1/6.",
    explore: CONCLUSION,
  };
  const showExplore = rank >= 5;
  return Object.freeze({
    view: current.view,
    selectedIndex: current.selectedIndex,
    checkpoints,
    visibleCheckpointCount,
    chartHeading: chartHeadings[visibleCheckpointCount],
    stageSummary,
    showScrollHint: visibleCheckpointCount >= 3,
    showChart: rank >= 1,
    showExplore,
    showConclusion: showExplore,
    showNext: rank < 5,
    controlsInteractive: showExplore && !current.locked,
    throwCountText: selected.throwCountText,
    sixCountText: selected.sixCountText,
    fractionText: selected.fractionText,
    frequencyText: selected.frequencyText,
    selectedSummary: `${selected.throwCountText} Würfe, ${selected.sixCountText} Sechsen, relative Häufigkeit ${selected.frequencyAriaText}.`,
    sliderValueText: `${selected.throwCountText} Würfe, ${selected.sixCountText} Sechsen, relative Häufigkeit ${selected.frequencyAriaText}`,
    chartAriaLabel: visibleCheckpointCount === 0
      ? "Diagramm der relativen Häufigkeit; noch keine Simulation sichtbar."
      : `Diagramm der relativen Häufigkeit der Sechs. Sichtbar: ${visibleDescriptions.join("; ")}. Referenz: Wahrscheinlichkeit ein Sechstel, etwa 16,7 Prozent.`,
    insight: insights[current.view],
    liveText: showExplore ? `${insights[current.view]} ${EXPLANATION}` : insights[current.view],
    conclusion: CONCLUSION,
    explanation: EXPLANATION,
  });
}
