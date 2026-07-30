import assert from "node:assert/strict";

import {
  INITIAL_VERTICES,
  PROTECTION_LIMITS,
  buildCircumcircleGeometry,
  pointsAttribute,
} from "../src/circumcircle-geometry.js";

const cases = [
  ["first-high", INITIAL_VERTICES, { x: 600, y: 120 }, "first"],
  ["first-low", INITIAL_VERTICES, { x: 600, y: 680 }, "first"],
  ["second", INITIAL_VERTICES, { x: 600, y: 300 }, "second"],
  ["intersection", INITIAL_VERTICES, { x: 600, y: 300 }, "intersection"],
  ["circle-acute", INITIAL_VERTICES, { x: 600, y: 300 }, "circle"],
  [
    "circle-right",
    { A: { x: 350, y: 500 }, B: { x: 800, y: 500 }, C: { x: 350, y: 200 } },
    { x: 575, y: 250 },
    "circle",
  ],
  [
    "circle-obtuse",
    { A: { x: 300, y: 290 }, B: { x: 900, y: 290 }, C: { x: 450, y: 110 } },
    { x: 600, y: 250 },
    "circle",
  ],
];

let rendered = 0;

for (const [name, vertices, target, state] of cases) {
  const geometry = buildCircumcircleGeometry(vertices, target);
  const bisectorCount = { first: 1, second: 2, intersection: 3, circle: 3 }[state];
  const lines = geometry.bisectors
    .slice(0, bisectorCount)
    .map(
      ({ line }, index) =>
        `<line id="bisector-${index + 1}" x1="${line.start.x}" y1="${line.start.y}" x2="${line.end.x}" y2="${line.end.y}" />`,
    )
    .join("");
  const test =
    state === "first"
      ? `<circle id="P" cx="${geometry.testPoint.x}" cy="${geometry.testPoint.y}" />
         <line id="PA" x1="${geometry.testPoint.x}" y1="${geometry.testPoint.y}" x2="${vertices.A.x}" y2="${vertices.A.y}" />
         <line id="PB" x1="${geometry.testPoint.x}" y1="${geometry.testPoint.y}" x2="${vertices.B.x}" y2="${vertices.B.y}" />`
      : "";
  const center =
    state === "intersection" || state === "circle"
      ? `<circle id="M" cx="${geometry.center.x}" cy="${geometry.center.y}" />
         <line id="MA" x1="${geometry.center.x}" y1="${geometry.center.y}" x2="${vertices.A.x}" y2="${vertices.A.y}" />
         <line id="MB" x1="${geometry.center.x}" y1="${geometry.center.y}" x2="${vertices.B.x}" y2="${vertices.B.y}" />
         <line id="MC" x1="${geometry.center.x}" y1="${geometry.center.y}" x2="${vertices.C.x}" y2="${vertices.C.y}" />`
      : "";
  const circle =
    state === "circle"
      ? `<circle id="circle" cx="${geometry.center.x}" cy="${geometry.center.y}" r="${geometry.radius}" />`
      : "";
  const svg = `<svg viewBox="0 0 1200 760" data-name="${name}" data-state="${state}">
    <polygon id="triangle" points="${pointsAttribute(geometry.triangle)}" />
    ${lines}${test}${center}${circle}
  </svg>`;

  assert.doesNotMatch(svg, /NaN|undefined/);
  assert.equal((svg.match(/id="bisector-/g) ?? []).length, bisectorCount);
  assert.equal(svg.includes('id="P"'), state === "first");
  assert.equal(svg.includes('id="M"'), state === "intersection" || state === "circle");
  assert.equal(svg.includes('id="circle"'), state === "circle");
  if (state === "circle") {
    assert.ok(geometry.center.x - geometry.radius >= PROTECTION_LIMITS.minimumCircleInset);
    assert.ok(
      geometry.board.width - geometry.center.x - geometry.radius >=
        PROTECTION_LIMITS.minimumCircleInset,
    );
    assert.ok(geometry.center.y - geometry.radius >= PROTECTION_LIMITS.minimumCircleInset);
    assert.ok(
      geometry.board.height - geometry.center.y - geometry.radius >=
        PROTECTION_LIMITS.minimumCircleInset,
    );
  }
  rendered += 1;
}

console.log(`${rendered}/${rendered} Mittelsenkrechtenzustände als SVG gerendert`);
