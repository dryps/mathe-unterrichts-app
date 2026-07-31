import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

import {
  comparisonAnimationFrame,
  TRIANGLE_COMPARE_DURATION_MS,
} from "../src/unique-triangles-animation.js";
import {
  buildUniqueTriangleGeometry,
  pointsAttribute,
} from "../src/unique-triangles-geometry.js";

const geometry = buildUniqueTriangleGeometry();
const comparisonMid = comparisonAnimationFrame(
  TRIANGLE_COMPARE_DURATION_MS / 2,
  geometry.sss.lowerTriangle,
  geometry.sss.upperTriangle,
);

const states = [
  ["sss", geometry.sss.lowerTriangle, false, false],
  ["comparing", comparisonMid.points, false, false],
  ["overlay", geometry.sss.reflectedLower, false, false],
  ["ambiguity", null, true, false],
  ["summary", null, true, true],
];

function triangle(points, className) {
  return `<polygon class="${className}" points="${pointsAttribute(points)}" />`;
}

const panels = states
  .map(([name, lower, ambiguityVisible, summaryVisible], index) => {
    const x = index * 620;
    const content = ambiguityVisible
      ? [
          `<circle cx="${geometry.ambiguity.circle.center.x}" cy="${geometry.ambiguity.circle.center.y}" r="${geometry.ambiguity.circle.radius}" class="circle" />`,
          triangle(geometry.ambiguity.triangles[0], "near"),
          triangle(geometry.ambiguity.triangles[1], "far"),
          summaryVisible
            ? '<text x="55" y="95" class="summary">eine Form · zwei Formen</text>'
            : "",
        ].join("")
      : [
          triangle(geometry.sss.upperTriangle, "upper"),
          triangle(lower, "lower"),
        ].join("");
    return `<g transform="translate(${x} 0) scale(.5)">
      <rect width="1200" height="760" rx="28" class="board" />
      ${content}
      <text x="48" y="720" class="label">${name}</text>
    </g>`;
  })
  .join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="3100" height="390" viewBox="0 0 3100 390">
  <style>
    .board{fill:#f8fafc;stroke:#cbd5e1;stroke-width:4}
    .upper,.near{fill:#2563eb22;stroke:#2563eb;stroke-width:8}
    .lower{fill:#d9770618;stroke:#d97706;stroke-width:8;stroke-dasharray:16 10}
    .far{fill:#7c3aed18;stroke:#7c3aed;stroke-width:8;stroke-dasharray:16 10}
    .circle{fill:none;stroke:#0f8a8a;stroke-width:7;stroke-dasharray:12 9}
    .label,.summary{font:900 34px system-ui;fill:#172033}
  </style>
  ${panels}
</svg>`;

assert.doesNotMatch(svg, /NaN|Infinity|undefined/);
assert.equal((svg.match(/class="board"/g) ?? []).length, states.length);
assert.equal((svg.match(/class="upper"/g) ?? []).length, 3);
assert.equal((svg.match(/class="near"/g) ?? []).length, 2);

await mkdir(new URL("../test-results/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../test-results/unique-triangle-states.svg", import.meta.url),
  svg,
);
console.log(`${states.length}/${states.length} eindeutige-Dreiecke-Zustände gerendert`);
