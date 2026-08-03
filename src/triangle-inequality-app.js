import {
  INITIAL_SIDES,
  SIDE_LIMITS,
  buildConstruction,
  updateSide,
} from "./triangle-inequality-geometry.js";

const STATUS_COPY = {
  possible: {
    title: "Dreieck möglich",
    detail: "Die Zirkelbögen schneiden sich.",
  },
  degenerate: {
    title: "Kein echtes Dreieck",
    detail: "Die drei Punkte liegen auf einer Geraden.",
  },
  impossible: {
    title: "Kein Dreieck möglich",
    detail: "Die beiden kürzeren Seiten sind zusammen zu kurz.",
  },
};

const sideValues = [...document.querySelectorAll("[data-side-value]")];
const sideControls = [...document.querySelectorAll("[data-side-control]")];
const leftArc = document.querySelector("#left-arc");
const rightArc = document.querySelector("#right-arc");
const upperTriangle = document.querySelector("#possible-triangle");
const mirrorTriangle = document.querySelector("#mirror-triangle");
const degenerateLine = document.querySelector("#degenerate-line");
const intersectionMarkers = [
  document.querySelector("#intersection-upper"),
  document.querySelector("#intersection-lower"),
];
const tangentMarker = document.querySelector("#tangent-point");
const baseLabel = document.querySelector("#base-label");
const leftRadiusLabel = document.querySelector("#left-radius-label");
const rightRadiusLabel = document.querySelector("#right-radius-label");
const equation = document.querySelector("#inequality-equation");
const statusPanel = document.querySelector("#triangle-status");
const statusTitle = document.querySelector("#status-title");
const statusDetail = document.querySelector("#status-detail");
const resetButton = document.querySelector("#inequality-reset");

let sides = [...INITIAL_SIDES];

function setSvgVisibility(element, isVisible) {
  element.removeAttribute("hidden");
  element.setAttribute("visibility", isVisible ? "visible" : "hidden");
  element.setAttribute("aria-hidden", String(!isVisible));
}

function setPoint(element, point) {
  if (!point) {
    setSvgVisibility(element, false);
    element.setAttribute("cx", "");
    element.setAttribute("cy", "");
    return;
  }
  setSvgVisibility(element, true);
  element.setAttribute("cx", point.x.toFixed(2));
  element.setAttribute("cy", point.y.toFixed(2));
}

function renderControls() {
  sideValues.forEach((element, index) => {
    element.textContent = sides[index];
  });

  sideControls.forEach((button) => {
    const index = Number(button.dataset.index);
    const direction = Number(button.dataset.delta);
    const atBoundary =
      (direction < 0 && sides[index] === SIDE_LIMITS.min) ||
      (direction > 0 && sides[index] === SIDE_LIMITS.max);
    button.disabled = atBoundary;
    button.setAttribute("aria-disabled", String(atBoundary));
  });
}

function renderConstruction() {
  const construction = buildConstruction(sides);
  const { analysis } = construction;

  leftArc.setAttribute("d", construction.arcs.left);
  rightArc.setAttribute("d", construction.arcs.right);
  upperTriangle.setAttribute("d", construction.upperTriangle);
  mirrorTriangle.setAttribute("d", construction.mirrorTriangle);
  setSvgVisibility(upperTriangle, Boolean(construction.upperTriangle));
  setSvgVisibility(mirrorTriangle, Boolean(construction.mirrorTriangle));

  const isDegenerate = analysis.state === "degenerate" && construction.tangentPoint;
  setSvgVisibility(degenerateLine, Boolean(isDegenerate));
  degenerateLine.setAttribute("points", "");
  if (isDegenerate) {
    degenerateLine.setAttribute(
      "points",
      [
        `${construction.base.left.x},${construction.base.left.y}`,
        `${construction.tangentPoint.x},${construction.tangentPoint.y}`,
        `${construction.base.right.x},${construction.base.right.y}`,
      ].join(" "),
    );
  }

  setPoint(
    intersectionMarkers[0],
    analysis.state === "possible" ? construction.intersections.points[0] : null,
  );
  setPoint(
    intersectionMarkers[1],
    analysis.state === "possible" ? construction.intersections.points[1] : null,
  );
  setPoint(tangentMarker, isDegenerate ? construction.tangentPoint : null);

  const [leftSide, rightSide] = analysis.shorter;
  baseLabel.textContent = `${analysis.longest.name} = ${analysis.longest.value}`;
  leftRadiusLabel.textContent = `${leftSide.name} = ${leftSide.value}`;
  rightRadiusLabel.textContent = `${rightSide.name} = ${rightSide.value}`;

  equation.textContent = analysis.equation;
  equation.setAttribute(
    "aria-label",
    `${analysis.shorter[0].value} plus ${analysis.shorter[1].value} ${
      analysis.operator === ">" ? "ist größer als" : analysis.operator === "=" ? "ist gleich" : "ist kleiner als"
    } ${analysis.longest.value}`,
  );

  const copy = STATUS_COPY[analysis.state];
  statusPanel.dataset.state = analysis.state;
  statusTitle.textContent = copy.title;
  statusDetail.textContent = copy.detail;
}

function render() {
  renderControls();
  renderConstruction();
}

document.querySelector(".side-inputs").addEventListener("click", (event) => {
  const button = event.target.closest("[data-side-control]");
  if (!button || button.disabled) return;
  sides = updateSide(sides, Number(button.dataset.index), Number(button.dataset.delta));
  render();
});

resetButton.addEventListener("click", () => {
  sides = [...INITIAL_SIDES];
  render();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" })
      .catch(() => {
      // Das Modul bleibt nutzbar; nur der Offline-Cache fehlt in diesem Fall.
    });
  });
}

render();
