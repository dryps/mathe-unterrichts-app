import { createHouseQuadrilateral } from "./quadrilateral-house-math.js";

export const HOUSE_VIEWS = Object.freeze({ irritation: "irritation", parallelogram: "parallelogram", rectangle: "rectangle", rhombus: "rhombus", square: "square", explore: "explore", conclusion: "conclusion" });
const ORDER = Object.freeze([HOUSE_VIEWS.irritation, HOUSE_VIEWS.parallelogram, HOUSE_VIEWS.rectangle, HOUSE_VIEWS.rhombus, HOUSE_VIEWS.square]);
const CONCLUSION = "Spezielle Figuren behalten die Eigenschaften ihrer Oberbegriffe.";
const make = (view, locked = false, rightAngles = false, equalSides = false) => Object.freeze({ view, locked, rightAngles: Boolean(rightAngles), equalSides: Boolean(equalSides) });

export function createHouseState() { return make(HOUSE_VIEWS.irritation); }
export function nextHouseState(current) {
  if (current.locked) return current;
  const index = ORDER.indexOf(current.view);
  if (index >= 0 && index < ORDER.length - 1) return make(ORDER[index + 1], true);
  if (current.view === HOUSE_VIEWS.square) return make(HOUSE_VIEWS.explore);
  return current;
}
export function finishHouseReveal(current) { return current.locked ? make(current.view, false, current.rightAngles, current.equalSides) : current; }
export function setHouseProperty(current, property, value) {
  if (current.locked || ![HOUSE_VIEWS.explore, HOUSE_VIEWS.conclusion].includes(current.view) || !["rightAngles", "equalSides"].includes(property)) return current;
  const rightAngles = property === "rightAngles" ? Boolean(value) : current.rightAngles;
  const equalSides = property === "equalSides" ? Boolean(value) : current.equalSides;
  return make(rightAngles && equalSides ? HOUSE_VIEWS.conclusion : HOUSE_VIEWS.explore, false, rightAngles, equalSides);
}
export function resetHouseState() { return createHouseState(); }

export function houseViewModel(current) {
  const rank = ORDER.indexOf(current.view);
  const controlled = {
    irritation: [false, false], parallelogram: [false, false], rectangle: [true, false], rhombus: [false, true], square: [true, true],
  }[current.view];
  const [rightAngles, equalSides] = controlled ?? [current.rightAngles, current.equalSides];
  const geometry = createHouseQuadrilateral({ rightAngles, equalSides });
  const insights = {
    irritation: "Welche Eigenschaften hat ein Quadrat mit Rechteck und Raute gemeinsam?",
    parallelogram: "Ausgangspunkt: Gegenüberliegende Seiten sind parallel.",
    rectangle: "Parallelogramm + rechte Winkel → Rechteck.",
    rhombus: "Parallelogramm + vier gleiche Seiten → Raute.",
    square: "Beides → Quadrat.",
    explore: "Ergänze die Eigenschaften selbst und beobachte die Einordnung.",
    conclusion: CONCLUSION,
  };
  return Object.freeze({
    ...geometry,
    showParallelogram: rank >= 1 || [HOUSE_VIEWS.explore, HOUSE_VIEWS.conclusion].includes(current.view),
    showRectangle: rank >= 2 || [HOUSE_VIEWS.explore, HOUSE_VIEWS.conclusion].includes(current.view),
    showRhombus: rank >= 3 || [HOUSE_VIEWS.explore, HOUSE_VIEWS.conclusion].includes(current.view),
    showSquare: rank >= 4 || [HOUSE_VIEWS.explore, HOUSE_VIEWS.conclusion].includes(current.view),
    showExplore: [HOUSE_VIEWS.explore, HOUSE_VIEWS.conclusion].includes(current.view),
    showConclusion: current.view === HOUSE_VIEWS.conclusion,
    showNext: ORDER.includes(current.view),
    controlsInteractive: [HOUSE_VIEWS.explore, HOUSE_VIEWS.conclusion].includes(current.view) && !current.locked,
    rightAngles, equalSides, insight: insights[current.view], conclusion: CONCLUSION,
  });
}
