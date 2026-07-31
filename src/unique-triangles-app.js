import {
  midpoint,
  pointsAttribute,
  buildUniqueTriangleGeometry,
} from "./unique-triangles-geometry.js";
import {
  SUMMARY_REVEAL_DURATION_MS,
  TRIANGLE_COMPARE_DURATION_MS,
  comparisonAnimationFrame,
} from "./unique-triangles-animation.js";
import {
  UNIQUE_VIEWS,
  createUniqueTrianglesState,
  finishSummaryReveal,
  finishTriangleComparison,
  resetUniqueTrianglesState,
  showAmbiguousCase,
  startTriangleComparison,
  uniqueTrianglesViewModel,
} from "./unique-triangles-state.js";

const board = document.querySelector("#unique-board");
const sssCase = document.querySelector("#sss-case");
const ambiguityCase = document.querySelector("#ambiguity-case");
const summaryGroup = document.querySelector("#summary-group");
const insight = document.querySelector("#unique-insight");
const nextButton = document.querySelector("#unique-next");
const resetButton = document.querySelector("#unique-reset");

const sssElements = {
  arcA: document.querySelector("#sss-arc-a"),
  arcB: document.querySelector("#sss-arc-b"),
  base: document.querySelector("#sss-base"),
  upper: document.querySelector("#sss-upper-triangle"),
  lower: document.querySelector("#sss-lower-triangle"),
  upperPoint: document.querySelector("#sss-upper-point"),
  lowerPoint: document.querySelector("#sss-lower-point"),
  aPoint: document.querySelector("#sss-a-point"),
  bPoint: document.querySelector("#sss-b-point"),
  aLabel: document.querySelector("#sss-a-label"),
  bLabel: document.querySelector("#sss-b-label"),
  upperLabel: document.querySelector("#sss-upper-label"),
  lowerLabel: document.querySelector("#sss-lower-label"),
  caseLabel: document.querySelector("#sss-label"),
  marks: {
    base: [
      document.querySelector("#sss-base-mark-1"),
      document.querySelector("#sss-base-mark-2"),
    ],
    upperAC: [document.querySelector("#sss-upper-ac-mark")],
    upperBC: [document.querySelector("#sss-upper-bc-mark")],
    lowerAC: [document.querySelector("#sss-lower-ac-mark")],
    lowerBC: [document.querySelector("#sss-lower-bc-mark")],
  },
};

const ambiguityElements = {
  circle: document.querySelector("#ambiguity-circle"),
  ray: document.querySelector("#ambiguity-ray"),
  angleArc: document.querySelector("#ambiguity-angle-arc"),
  base: document.querySelector("#ambiguity-base"),
  nearTriangle: document.querySelector("#ambiguity-near-triangle"),
  farTriangle: document.querySelector("#ambiguity-far-triangle"),
  nearPoint: document.querySelector("#ambiguity-near-point"),
  farPoint: document.querySelector("#ambiguity-far-point"),
  aPoint: document.querySelector("#ambiguity-a-point"),
  bPoint: document.querySelector("#ambiguity-b-point"),
  aLabel: document.querySelector("#ambiguity-a-label"),
  bLabel: document.querySelector("#ambiguity-b-label"),
  nearLabel: document.querySelector("#ambiguity-near-label"),
  farLabel: document.querySelector("#ambiguity-far-label"),
  marks: {
    base: [
      document.querySelector("#ambiguity-base-mark-1"),
      document.querySelector("#ambiguity-base-mark-2"),
    ],
    near: [document.querySelector("#ambiguity-near-mark")],
    far: [document.querySelector("#ambiguity-far-mark")],
  },
};

const geometry = buildUniqueTriangleGeometry();
let state = createUniqueTrianglesState();
let comparisonFrameId = null;
let comparisonTimer = null;
let summaryTimer = null;

function setLine(element, first, second) {
  element.setAttribute("x1", first.x);
  element.setAttribute("y1", first.y);
  element.setAttribute("x2", second.x);
  element.setAttribute("y2", second.y);
}

function setPoint(element, point) {
  element.setAttribute("cx", point.x);
  element.setAttribute("cy", point.y);
}

function setTextPosition(element, point, offsetX, offsetY) {
  element.setAttribute("x", point.x + offsetX);
  element.setAttribute("y", point.y + offsetY);
}

function setVisibility(element, visible, accessible = visible) {
  element.setAttribute("visibility", visible ? "visible" : "hidden");
  element.setAttribute("aria-hidden", String(!accessible));
}

function arcPath(first, second, radius, sweep) {
  return [
    `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`,
    `A ${radius.toFixed(2)} ${radius.toFixed(2)} 0 0 ${sweep} ${second.x.toFixed(2)} ${second.y.toFixed(2)}`,
  ].join(" ");
}

function tickSegments(first, second, count, spacing = 16, size = 24) {
  const middle = midpoint(first, second);
  const dx = second.x - first.x;
  const dy = second.y - first.y;
  const length = Math.hypot(dx, dy);
  const along = { x: dx / length, y: dy / length };
  const perpendicular = { x: -along.y, y: along.x };
  return Array.from({ length: count }, (_, index) => {
    const centeredIndex = index - (count - 1) / 2;
    const center = {
      x: middle.x + along.x * spacing * centeredIndex,
      y: middle.y + along.y * spacing * centeredIndex,
    };
    return {
      start: {
        x: center.x - perpendicular.x * size * 0.5,
        y: center.y - perpendicular.y * size * 0.5,
      },
      end: {
        x: center.x + perpendicular.x * size * 0.5,
        y: center.y + perpendicular.y * size * 0.5,
      },
    };
  });
}

function renderTicks(elements, first, second) {
  const segments = tickSegments(first, second, elements.length);
  elements.forEach((element, index) => {
    setLine(element, segments[index].start, segments[index].end);
  });
}

function renderSssLower(points) {
  const [A, B, C] = points;
  sssElements.lower.setAttribute("points", pointsAttribute(points));
  setPoint(sssElements.lowerPoint, C);
  setTextPosition(sssElements.lowerLabel, C, 0, 46);
  renderTicks(sssElements.marks.lowerAC, A, C);
  renderTicks(sssElements.marks.lowerBC, B, C);
}

function renderSss(model) {
  const { sss } = model.geometry;
  sssElements.arcA.setAttribute(
    "d",
    arcPath(sss.upper, sss.lower, sss.radii.A, 1),
  );
  sssElements.arcB.setAttribute(
    "d",
    arcPath(sss.upper, sss.lower, sss.radii.B, 0),
  );
  setLine(sssElements.base, sss.A, sss.B);
  sssElements.upper.setAttribute("points", pointsAttribute(sss.upperTriangle));

  const lowerPoints = model.overlayComplete ? sss.reflectedLower : sss.lowerTriangle;
  renderSssLower(lowerPoints);

  setPoint(sssElements.upperPoint, sss.upper);
  setPoint(sssElements.aPoint, sss.A);
  setPoint(sssElements.bPoint, sss.B);
  setTextPosition(sssElements.aLabel, sss.A, -32, 46);
  setTextPosition(sssElements.bLabel, sss.B, 32, 46);
  setTextPosition(sssElements.upperLabel, sss.upper, 0, -27);
  sssElements.caseLabel.setAttribute("x", 1036);
  sssElements.caseLabel.setAttribute("y", 94);

  renderTicks(sssElements.marks.base, sss.A, sss.B);
  renderTicks(sssElements.marks.upperAC, sss.A, sss.upper);
  renderTicks(sssElements.marks.upperBC, sss.B, sss.upper);
  setVisibility(sssElements.lowerPoint, model.showLowerIntersection);
  setVisibility(sssElements.lowerLabel, model.showLowerIntersection);
}

function renderAmbiguity(model) {
  const { ambiguity } = model.geometry;
  const [near, far] = ambiguity.intersections.map(({ point }) => point);
  ambiguityElements.circle.setAttribute("cx", ambiguity.circle.center.x);
  ambiguityElements.circle.setAttribute("cy", ambiguity.circle.center.y);
  ambiguityElements.circle.setAttribute("r", ambiguity.circle.radius);
  setLine(ambiguityElements.ray, ambiguity.A, ambiguity.rayEnd);
  ambiguityElements.angleArc.setAttribute(
    "points",
    pointsAttribute(ambiguity.angleArc),
  );
  setLine(ambiguityElements.base, ambiguity.A, ambiguity.B);
  ambiguityElements.nearTriangle.setAttribute(
    "points",
    pointsAttribute(ambiguity.triangles[0]),
  );
  ambiguityElements.farTriangle.setAttribute(
    "points",
    pointsAttribute(ambiguity.triangles[1]),
  );
  setPoint(ambiguityElements.nearPoint, near);
  setPoint(ambiguityElements.farPoint, far);
  setPoint(ambiguityElements.aPoint, ambiguity.A);
  setPoint(ambiguityElements.bPoint, ambiguity.B);
  setTextPosition(ambiguityElements.aLabel, ambiguity.A, -30, 48);
  setTextPosition(ambiguityElements.bLabel, ambiguity.B, 30, 48);
  setTextPosition(ambiguityElements.nearLabel, near, -23, -25);
  setTextPosition(ambiguityElements.farLabel, far, 23, -20);
  renderTicks(ambiguityElements.marks.base, ambiguity.A, ambiguity.B);
  renderTicks(ambiguityElements.marks.near, ambiguity.B, near);
  renderTicks(ambiguityElements.marks.far, ambiguity.B, far);
}

function render() {
  const model = uniqueTrianglesViewModel(state, geometry);
  renderSss(model);
  renderAmbiguity(model);
  setVisibility(sssCase, model.sssVisible);
  setVisibility(ambiguityCase, model.ambiguityVisible);
  setVisibility(summaryGroup, model.ambiguityVisible, model.showSummary);

  board.dataset.state = state.view;
  insight.textContent = model.insight;
  nextButton.textContent = model.primaryButtonLabel;
  nextButton.hidden = !model.showPrimaryButton;
  nextButton.disabled = model.controlsLocked;
  resetButton.disabled = model.controlsLocked;
}

function finishComparisonImmediately() {
  clearTimeout(comparisonTimer);
  comparisonTimer = null;
  if (comparisonFrameId !== null) {
    cancelAnimationFrame(comparisonFrameId);
  }
  state = finishTriangleComparison(state);
  comparisonFrameId = null;
  render();
}

function runComparison() {
  if (state.locked || state.view !== UNIQUE_VIEWS.sss) return;
  state = startTriangleComparison(state);
  render();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishComparisonImmediately();
    return;
  }

  comparisonTimer = setTimeout(
    finishComparisonImmediately,
    TRIANGLE_COMPARE_DURATION_MS + 120,
  );
  let startedAt = null;
  function animate(timestamp) {
    if (state.view !== UNIQUE_VIEWS.comparing) return;
    if (startedAt === null) startedAt = timestamp;
    const frame = comparisonAnimationFrame(
      timestamp - startedAt,
      geometry.sss.lowerTriangle,
      geometry.sss.upperTriangle,
      TRIANGLE_COMPARE_DURATION_MS,
    );
    renderSssLower(frame.points);
    if (frame.complete) {
      finishComparisonImmediately();
      return;
    }
    comparisonFrameId = requestAnimationFrame(animate);
  }
  comparisonFrameId = requestAnimationFrame(animate);
}

function showOtherCase() {
  if (state.locked || state.view !== UNIQUE_VIEWS.overlay) return;
  state = showAmbiguousCase(state);
  render();
  clearTimeout(summaryTimer);
  summaryTimer = setTimeout(() => {
    state = finishSummaryReveal(state);
    summaryTimer = null;
    render();
  }, SUMMARY_REVEAL_DURATION_MS);
}

function reset() {
  if (state.locked) return;
  if (comparisonFrameId !== null) cancelAnimationFrame(comparisonFrameId);
  clearTimeout(comparisonTimer);
  clearTimeout(summaryTimer);
  comparisonFrameId = null;
  comparisonTimer = null;
  summaryTimer = null;
  state = resetUniqueTrianglesState();
  board.classList.remove("is-building");
  void board.getBoundingClientRect();
  board.classList.add("is-building");
  render();
}

nextButton.addEventListener("click", () => {
  if (state.view === UNIQUE_VIEWS.sss) {
    runComparison();
  } else if (state.view === UNIQUE_VIEWS.overlay) {
    showOtherCase();
  }
});
resetButton.addEventListener("click", reset);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Das Modul bleibt nutzbar; nur der Offline-Cache fehlt in diesem Fall.
    });
  });
}

render();
