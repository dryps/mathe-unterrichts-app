import {
  calculateQuadrilateralAngles,
  createAngleSumQuadrilateral,
  roundAnglesTo360,
  splitByDiagonal,
} from "./quadrilateral-angle-sum-math.js";

export const ANGLE_SUM_VIEWS = Object.freeze({
  irritation: "irritation",
  diagonal: "diagonal",
  triangles: "triangles",
  equation: "equation",
  explore: "explore",
});

const ORDER = Object.freeze(Object.values(ANGLE_SUM_VIEWS));
const CONCLUSION = "Zwei Dreiecke erklären die 360° im Viereck.";
const make = (view, locked = false, position = 0) =>
  Object.freeze({ view, locked: Boolean(locked), position: Number(position) });

export function createAngleSumState() {
  return make(ANGLE_SUM_VIEWS.irritation);
}

export function nextAngleSumState(current) {
  if (current.locked) return current;
  const index = ORDER.indexOf(current.view);
  if (index < 0 || index >= ORDER.length - 1) return current;
  return make(ORDER[index + 1], true, current.position);
}

export function finishAngleSumReveal(current) {
  return current.locked ? make(current.view, false, current.position) : current;
}

export function setAngleSumPosition(current, position) {
  if (current.locked || current.view !== ANGLE_SUM_VIEWS.explore) return current;
  createAngleSumQuadrilateral(Number(position));
  return make(current.view, false, position);
}

export function resetAngleSumState() {
  return createAngleSumState();
}

export function angleSumViewModel(current) {
  const rank = ORDER.indexOf(current.view);
  if (rank < 0) throw new RangeError("Unbekannter Lernzustand.");
  const points = createAngleSumQuadrilateral(current.position);
  const exactAngles = calculateQuadrilateralAngles(points);
  const visibleAngles = roundAnglesTo360(exactAngles);
  const split = splitByDiagonal(points);
  const showDiagonal = rank >= 1;
  const showTriangles = rank >= 2;
  const showEquation = rank >= 3;
  const showAngles = rank >= 4;
  const insights = {
    irritation: "Wie kann man die vier Winkel mit etwas Bekanntem erklären?",
    diagonal: "Eine Diagonale teilt das Viereck in zwei Teile.",
    triangles: "Es entstehen zwei Dreiecke – jedes mit 180°.",
    equation: "180° + 180° = 360°",
    explore: "Einzelwinkel ändern sich, Summe bleibt.",
  };
  const angleText = visibleAngles.map((angle, index) => `${String.fromCharCode(945 + index)} = ${angle}°`).join(", ");
  const boardDescription = !showDiagonal
    ? "Konvexes Viereck ohne Hilfslinie."
    : !showTriangles
      ? "Konvexes Viereck mit der Diagonale von A nach C."
      : !showAngles
        ? "Die Diagonale zerlegt das Viereck sichtbar in zwei Dreiecke."
        : `Dynamisches konvexes Viereck. ${angleText}. Zusammen 360 Grad.`;
  return Object.freeze({
    view: current.view,
    points,
    split,
    visibleAngles,
    showDiagonal,
    showTriangles,
    showEquation,
    showAngles,
    showExplore: rank >= 4,
    showConclusion: rank >= 4,
    showNext: rank < ORDER.length - 1,
    controlsInteractive: rank >= 4 && !current.locked,
    equation: "180° + 180° = 360°",
    angleEquation: `${visibleAngles.join("° + ")}° = 360°`,
    insight: insights[current.view],
    conclusion: CONCLUSION,
    boardDescription,
    liveText: rank >= 4 ? `${angleText}. Summe 360 Grad.` : insights[current.view],
  });
}
