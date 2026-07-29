import {
  INITIAL_POINTS,
  calculateAngles,
  clonePoints,
  describeInteriorAngle,
  moveVertex,
  roundAnglesTo180,
} from "./geometry.js";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const COLORS = ["#2563eb", "#dc4c64", "#0f9f75"];
const DEFAULT_HINT = "Ziehe an den drei farbigen Eckpunkten.";
const BLOCKED_HINTS = {
  distance: "Dieser Eckpunkt braucht etwas mehr Abstand.",
  area: "So würde das Dreieck fast zu einer Linie werden.",
  angle: "Extrem kleine Winkel bleiben zur besseren Lesbarkeit gesperrt.",
  edge: "Die Eckpunkte bleiben innerhalb der Zeichenfläche.",
};

const board = document.querySelector("#triangle-board");
const triangle = document.querySelector("#triangle-shape");
const angleSectors = document.querySelector("#angle-sectors");
const angleArcs = document.querySelector("#angle-arcs");
const angleLabels = document.querySelector("#angle-labels");
const vertexControls = [...document.querySelectorAll(".vertex-control")];
const equation = document.querySelector("#angle-equation");
const hint = document.querySelector("#interaction-hint");
const resetButton = document.querySelector("#reset-button");

let points = clonePoints(INITIAL_POINTS);
let activeDrag = null;

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NAMESPACE, name);
  for (const [attribute, value] of Object.entries(attributes)) {
    element.setAttribute(attribute, String(value));
  }
  return element;
}

function renderAngle(index, visibleAngle) {
  const vertex = points[index];
  const firstNeighbor = points[(index + 1) % 3];
  const secondNeighbor = points[(index + 2) % 3];
  const description = describeInteriorAngle(vertex, firstNeighbor, secondNeighbor);
  const color = COLORS[index];

  angleSectors.append(
    svgElement("path", {
      class: "angle-sector",
      d: description.sectorPath,
      fill: color,
    }),
  );
  angleArcs.append(
    svgElement("path", {
      class: "angle-arc",
      d: description.arcPath,
      stroke: color,
    }),
  );

  const label = svgElement("text", {
    class: "angle-label",
    x: description.label.x,
    y: description.label.y,
    fill: color,
  });
  label.textContent = `${visibleAngle}°`;
  angleLabels.append(label);
}

function render() {
  const exactAngles = calculateAngles(points);
  const visibleAngles = roundAnglesTo180(exactAngles);

  triangle.setAttribute(
    "points",
    points.map((point) => `${point.x},${point.y}`).join(" "),
  );
  angleSectors.replaceChildren();
  angleArcs.replaceChildren();
  angleLabels.replaceChildren();

  visibleAngles.forEach((angle, index) => renderAngle(index, angle));
  vertexControls.forEach((control, index) => {
    control.setAttribute("transform", `translate(${points[index].x} ${points[index].y})`);
    const accessibleHandle = control.querySelector(".drag-hit");
    accessibleHandle.setAttribute(
      "aria-label",
      `Eckpunkt ${String.fromCharCode(65 + index)} verschieben, Winkel ${visibleAngles[index]} Grad`,
    );
  });

  equation.innerHTML = [
    `<span class="term-a">${visibleAngles[0]}°</span>`,
    `<span aria-hidden="true"> + </span>`,
    `<span class="term-b">${visibleAngles[1]}°</span>`,
    `<span aria-hidden="true"> + </span>`,
    `<span class="term-c">${visibleAngles[2]}°</span>`,
    `<span aria-hidden="true"> = </span>`,
    `<span class="total">180°</span>`,
  ].join("");
  equation.setAttribute(
    "aria-label",
    `${visibleAngles[0]} Grad plus ${visibleAngles[1]} Grad plus ${visibleAngles[2]} Grad gleich 180 Grad`,
  );
}

function toSvgPoint(event) {
  const point = board.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const matrix = board.getScreenCTM();

  if (!matrix) {
    return null;
  }

  const local = point.matrixTransform(matrix.inverse());
  return { x: local.x, y: local.y };
}

function updateHint(reason = null) {
  if (reason) {
    hint.textContent = BLOCKED_HINTS[reason] ?? DEFAULT_HINT;
    hint.classList.add("is-blocked");
  } else {
    hint.textContent = DEFAULT_HINT;
    hint.classList.remove("is-blocked");
  }
}

function attemptMove(index, requestedPoint) {
  const movement = moveVertex(points, index, requestedPoint);
  if (movement.accepted) {
    points = movement.points;
    updateHint();
    render();
  } else {
    updateHint(movement.reason);
  }
}

function startDrag(event) {
  const handle = event.target.closest(".drag-hit");
  if (!handle) return;

  event.preventDefault();
  activeDrag = {
    pointerId: event.pointerId,
    index: Number(handle.dataset.index),
    handle,
  };
  handle.setPointerCapture(event.pointerId);
  const requestedPoint = toSvgPoint(event);
  if (requestedPoint) attemptMove(activeDrag.index, requestedPoint);
}

function continueDrag(event) {
  if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;
  event.preventDefault();
  const requestedPoint = toSvgPoint(event);
  if (requestedPoint) attemptMove(activeDrag.index, requestedPoint);
}

function endDrag(event) {
  if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;
  if (activeDrag.handle.hasPointerCapture(event.pointerId)) {
    activeDrag.handle.releasePointerCapture(event.pointerId);
  }
  activeDrag = null;
}

function moveWithKeyboard(event) {
  const handle = event.target.closest(".drag-hit");
  if (!handle) return;

  const directions = {
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
  };
  const direction = directions[event.key];
  if (!direction) return;

  event.preventDefault();
  const index = Number(handle.dataset.index);
  const distance = event.shiftKey ? 36 : 12;
  attemptMove(index, {
    x: points[index].x + direction.x * distance,
    y: points[index].y + direction.y * distance,
  });
}

board.addEventListener("pointerdown", startDrag);
board.addEventListener("pointermove", continueDrag);
board.addEventListener("pointerup", endDrag);
board.addEventListener("pointercancel", endDrag);
board.addEventListener("keydown", moveWithKeyboard);

resetButton.addEventListener("click", () => {
  points = clonePoints(INITIAL_POINTS);
  activeDrag = null;
  updateHint();
  render();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Die App funktioniert weiterhin lokal; nur der Offline-Cache ist dann nicht verfügbar.
    });
  });
}

render();

