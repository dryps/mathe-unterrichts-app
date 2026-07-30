import assert from "node:assert/strict";

import {
  INITIAL_APEX,
  buildTriangleAreaGeometry,
  pointsAttribute,
} from "../src/triangle-area-geometry.js";

const apexes = [
  INITIAL_APEX,
  { x: 290, y: 410 },
  { x: 570, y: 150 },
];

let rendered = 0;

for (const apex of apexes) {
  const geometry = buildTriangleAreaGeometry(apex);
  const original = pointsAttribute(geometry.original);
  const copy = pointsAttribute(geometry.copy);
  const parallelogram = pointsAttribute(geometry.parallelogram);
  const rightAngle = pointsAttribute(geometry.rightAngle);

  const initialSvg = `
    <svg viewBox="0 0 1200 760" data-state="initial">
      <polygon id="original-triangle" points="${original}" />
      <line id="height-line" x1="${geometry.apex.x}" y1="${geometry.apex.y}"
        x2="${geometry.heightFoot.x}" y2="${geometry.heightFoot.y}" />
      <polyline id="right-angle" points="${rightAngle}" />
      <text>g</text><text>h</text>
    </svg>
  `;
  const completedSvg = `
    <svg viewBox="0 0 1200 760" data-state="completed">
      <polygon id="original-triangle" points="${original}" />
      <polygon id="completed-copy" points="${copy}" />
      <polygon id="parallelogram-outline" points="${parallelogram}" />
      <line id="height-line" x1="${geometry.apex.x}" y1="${geometry.apex.y}"
        x2="${geometry.heightFoot.x}" y2="${geometry.heightFoot.y}" />
      <polyline id="right-angle" points="${rightAngle}" />
      <text>g</text><text>h</text>
    </svg>
  `;

  for (const svg of [initialSvg, completedSvg]) {
    assert.doesNotMatch(svg, /NaN|undefined|transform=/);
    assert.match(svg, /id="original-triangle"/);
    assert.match(svg, /id="height-line"/);
    assert.match(svg, /id="right-angle"/);
    rendered += 1;
  }

  assert.doesNotMatch(initialSvg, /completed-copy|parallelogram-outline/);
  assert.match(completedSvg, /id="completed-copy"/);
  assert.match(completedSvg, /id="parallelogram-outline"/);
}

console.log(`${rendered}/${rendered} Dreiecksflächenzustände als SVG gerendert`);
