import assert from "node:assert/strict";

import {
  INITIAL_VERTICES,
  PROTECTION_LIMITS,
  buildIncircleGeometry,
  pointsAttribute,
} from "../src/incircle-geometry.js";

const cases = [
  ["first-near-a", INITIAL_VERTICES, { x: 330, y: 530 }, "first"],
  ["first-far", INITIAL_VERTICES, { x: 700, y: 250 }, "first"],
  ["all-bisectors", INITIAL_VERTICES, { x: 480, y: 450 }, "all-bisectors"],
  ["incircle-acute", INITIAL_VERTICES, { x: 480, y: 450 }, "incircle"],
  [
    "incircle-right",
    { A: { x: 300, y: 580 }, B: { x: 900, y: 580 }, C: { x: 300, y: 180 } },
    { x: 450, y: 470 },
    "incircle",
  ],
  [
    "incircle-obtuse",
    { A: { x: 230, y: 560 }, B: { x: 970, y: 560 }, C: { x: 430, y: 280 } },
    { x: 460, y: 470 },
    "incircle",
  ],
  [
    "incircle-moved",
    { A: { x: 180, y: 500 }, B: { x: 950, y: 580 }, C: { x: 620, y: 130 } },
    { x: 450, y: 390 },
    "incircle",
  ],
];

let rendered = 0;

for (const [name, vertices, target, state] of cases) {
  const geometry = buildIncircleGeometry(vertices, target);
  const bisectorCount = state === "first" ? 1 : 3;
  const lines = geometry.bisectors
    .slice(0, bisectorCount)
    .map(
      (bisector, index) =>
        `<line id="bisector-${index + 1}" x1="${bisector.start.x}" y1="${bisector.start.y}" x2="${bisector.end.x}" y2="${bisector.end.y}" />`,
    )
    .join("");
  const test =
    state === "first"
      ? `<circle id="P" cx="${geometry.testPoint.x}" cy="${geometry.testPoint.y}" />
         <line id="P-AB" x1="${geometry.testPoint.x}" y1="${geometry.testPoint.y}" x2="${geometry.testProjections.AB.foot.x}" y2="${geometry.testProjections.AB.foot.y}" />
         <line id="P-AC" x1="${geometry.testPoint.x}" y1="${geometry.testPoint.y}" x2="${geometry.testProjections.AC.foot.x}" y2="${geometry.testProjections.AC.foot.y}" />`
      : "";
  const center =
    state === "all-bisectors" || state === "incircle"
      ? `<circle id="I" cx="${geometry.center.x}" cy="${geometry.center.y}" />
         ${Object.entries(geometry.touches)
           .map(
             ([key, touch]) =>
               `<line id="r-${key}" x1="${geometry.center.x}" y1="${geometry.center.y}" x2="${touch.foot.x}" y2="${touch.foot.y}" />`,
           )
           .join("")}`
      : "";
  const circle =
    state === "incircle"
      ? `<circle id="circle" cx="${geometry.center.x}" cy="${geometry.center.y}" r="${geometry.radius}" />`
      : "";
  const svg = `<svg viewBox="0 0 1200 760" data-name="${name}" data-state="${state}">
    <polygon id="triangle" points="${pointsAttribute(geometry.triangle)}" />
    ${lines}${test}${center}${circle}
  </svg>`;

  assert.doesNotMatch(svg, /NaN|undefined/);
  assert.equal((svg.match(/id="bisector-/g) ?? []).length, bisectorCount);
  assert.equal(svg.includes('id="P"'), state === "first");
  assert.equal(
    svg.includes('id="I"'),
    state === "all-bisectors" || state === "incircle",
  );
  assert.equal(svg.includes('id="circle"'), state === "incircle");
  if (state === "incircle") {
    assert.ok(
      geometry.center.x - geometry.radius >= PROTECTION_LIMITS.minimumCircleInset,
    );
    assert.ok(
      geometry.center.x + geometry.radius <=
        geometry.board.width - PROTECTION_LIMITS.minimumCircleInset,
    );
    assert.ok(
      geometry.center.y - geometry.radius >= PROTECTION_LIMITS.minimumCircleInset,
    );
    assert.ok(
      geometry.center.y + geometry.radius <=
        geometry.board.height - PROTECTION_LIMITS.minimumCircleInset,
    );
  }
  rendered += 1;
}

console.log(`${rendered}/${rendered} Winkelhalbierendenzustände als SVG gerendert`);
