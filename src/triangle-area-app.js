import {
  COPY_ANIMATION_DURATION_MS,
  PARALLELOGRAM_HIGHLIGHT_MS,
  copyAnimationFrame,
} from "./triangle-area-animation.js";
import {
  pointsAttribute,
} from "./triangle-area-geometry.js";
import {
  AREA_VIEWS,
  createTriangleAreaState,
  finishSupplement,
  moveApex,
  resetTriangleAreaState,
  startSupplement,
  triangleAreaViewModel,
} from "./triangle-area-state.js";

const board = document.querySelector("#area-board");
const originalTriangle = document.querySelector("#original-triangle");
const completedCopy = document.querySelector("#completed-copy");
const animatedCopy = document.querySelector("#animated-copy");
const parallelogramOutline = document.querySelector("#parallelogram-outline");
const parallelogramHighlight = document.querySelector("#parallelogram-highlight");
const heightLine = document.querySelector("#height-line");
const heightFoot = document.querySelector("#height-foot");
const rightAngle = document.querySelector("#right-angle");
const baseLabel = document.querySelector("#area-base-label");
const heightLabel = document.querySelector("#area-height-label");
const apexControl = document.querySelector("#area-apex-control");
const apexHandle = document.querySelector("#area-apex-handle");
const prompt = document.querySelector("#area-prompt");
const formulas = document.querySelector("#area-formulas");
const supplementButton = document.querySelector("#supplement-button");
const resetButton = document.querySelector("#area-reset");

let state = createTriangleAreaState();
let activePointer = null;
let animationRequest = null;
let highlightRequest = null;
let highlightTimer = null;

function setSvgVisibility(element, visible) {
  element.setAttribute("visibility", visible ? "visible" : "hidden");
  element.setAttribute("aria-hidden", String(!visible));
}

function render() {
  const model = triangleAreaViewModel(state);
  const { geometry } = model;

  originalTriangle.setAttribute("points", pointsAttribute(geometry.original));
  completedCopy.setAttribute("points", pointsAttribute(geometry.copy));
  animatedCopy.setAttribute("points", pointsAttribute(geometry.original));
  parallelogramOutline.setAttribute("points", pointsAttribute(geometry.parallelogram));
  parallelogramHighlight.setAttribute("points", pointsAttribute(geometry.parallelogram));

  heightLine.setAttribute("x1", geometry.apex.x);
  heightLine.setAttribute("y1", geometry.apex.y);
  heightLine.setAttribute("x2", geometry.heightFoot.x);
  heightLine.setAttribute("y2", geometry.heightFoot.y);
  heightFoot.setAttribute("cx", geometry.heightFoot.x);
  heightFoot.setAttribute("cy", geometry.heightFoot.y);
  rightAngle.setAttribute("points", pointsAttribute(geometry.rightAngle));
  baseLabel.setAttribute("x", (geometry.left.x + geometry.right.x) / 2);
  baseLabel.setAttribute("y", geometry.left.y + 58);
  heightLabel.setAttribute("x", geometry.heightFoot.x - 30);
  heightLabel.setAttribute("y", (geometry.apex.y + geometry.heightFoot.y) / 2);
  apexControl.setAttribute("transform", `translate(${geometry.apex.x} ${geometry.apex.y})`);

  setSvgVisibility(completedCopy, model.showCompletedCopy);
  setSvgVisibility(animatedCopy, model.showAnimatedCopy);
  setSvgVisibility(parallelogramOutline, model.showCompletedCopy);
  setSvgVisibility(parallelogramHighlight, model.showCompletedCopy);

  apexHandle.setAttribute("aria-disabled", String(model.inputLocked));
  apexHandle.setAttribute(
    "aria-label",
    `Obere Dreiecksspitze verschieben, Position ${Math.round(geometry.apex.x)} zu ${Math.round(geometry.apex.y)}`,
  );
  board.dataset.state = state.view;
  supplementButton.disabled = model.inputLocked;
  resetButton.disabled = model.inputLocked;
  supplementButton.hidden = state.view === AREA_VIEWS.completed;
  prompt.textContent = model.showQuestion
    ? "Wie können wir das Dreieck zu einer bekannten Figur ergänzen?"
    : "Zwei gleiche Dreiecke bilden ein Parallelogramm. Deshalb ist eines davon halb so groß.";
  formulas.hidden = !model.showFormulas;
}

function toSvgPoint(event) {
  const point = board.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const matrix = board.getScreenCTM();
  if (!matrix) return null;
  const local = point.matrixTransform(matrix.inverse());
  return { x: local.x, y: local.y };
}

function attemptMove(point) {
  const next = moveApex(state, point);
  if (next === state) return;
  state = next;
  render();
}

function startDrag(event) {
  if (state.view === AREA_VIEWS.animating || !event.target.closest("#area-apex-handle")) return;
  event.preventDefault();
  activePointer = event.pointerId;
  apexHandle.setPointerCapture(event.pointerId);
  const point = toSvgPoint(event);
  if (point) attemptMove(point);
}

function continueDrag(event) {
  if (activePointer !== event.pointerId || state.view === AREA_VIEWS.animating) return;
  event.preventDefault();
  const point = toSvgPoint(event);
  if (point) attemptMove(point);
}

function endDrag(event) {
  if (activePointer !== event.pointerId) return;
  if (apexHandle.hasPointerCapture(event.pointerId)) {
    apexHandle.releasePointerCapture(event.pointerId);
  }
  activePointer = null;
}

function moveWithKeyboard(event) {
  if (state.view === AREA_VIEWS.animating || !event.target.closest("#area-apex-handle")) return;
  const directions = {
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
  };
  const direction = directions[event.key];
  if (!direction) return;
  event.preventDefault();
  const distance = event.shiftKey ? 30 : 12;
  attemptMove({
    x: state.apex.x + direction.x * distance,
    y: state.apex.y + direction.y * distance,
  });
}

function emphasizeParallelogram() {
  parallelogramHighlight.classList.remove("is-emphasized");
  highlightRequest = requestAnimationFrame(() => {
    highlightRequest = null;
    parallelogramHighlight.classList.add("is-emphasized");
  });
  clearTimeout(highlightTimer);
  highlightTimer = setTimeout(() => {
    parallelogramHighlight.classList.remove("is-emphasized");
  }, PARALLELOGRAM_HIGHLIGHT_MS);
}

function runSupplementAnimation() {
  if (state.view !== AREA_VIEWS.initial) return;
  state = startSupplement(state);
  activePointer = null;
  render();

  const { geometry } = triangleAreaViewModel(state);
  const startedAt = performance.now();

  function step(now) {
    const frame = copyAnimationFrame(
      now - startedAt,
      geometry.rotationCenter,
      COPY_ANIMATION_DURATION_MS,
    );
    animatedCopy.setAttribute("transform", frame.transform);
    animatedCopy.style.opacity = String(frame.opacity);

    if (!frame.complete) {
      animationRequest = requestAnimationFrame(step);
      return;
    }

    animationRequest = null;
    animatedCopy.removeAttribute("transform");
    animatedCopy.style.removeProperty("opacity");
    state = finishSupplement(state);
    render();
    emphasizeParallelogram();
  }

  animationRequest = requestAnimationFrame(step);
}

board.addEventListener("pointerdown", startDrag);
board.addEventListener("pointermove", continueDrag);
board.addEventListener("pointerup", endDrag);
board.addEventListener("pointercancel", endDrag);
board.addEventListener("keydown", moveWithKeyboard);
supplementButton.addEventListener("click", runSupplementAnimation);
resetButton.addEventListener("click", () => {
  if (state.view === AREA_VIEWS.animating) return;
  if (animationRequest !== null) cancelAnimationFrame(animationRequest);
  if (highlightRequest !== null) cancelAnimationFrame(highlightRequest);
  clearTimeout(highlightTimer);
  highlightRequest = null;
  parallelogramHighlight.classList.remove("is-emphasized");
  activePointer = null;
  state = resetTriangleAreaState(state);
  render();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Das Modul bleibt nutzbar; nur der Offline-Cache fehlt in diesem Fall.
    });
  });
}

render();
