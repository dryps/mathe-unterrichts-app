import assert from "node:assert/strict";

import {
  formatOrderCurrentValue,
  formatOrderTickValue,
  orderNumberLineTicks,
  orderValueToPoint,
  orderValueToX,
} from "../src/order-number-line-geometry.js";

const states = [
  {
    name: "prompt",
    axis: false,
    markers: false,
    comparison: false,
    draggable: false,
    value: 0,
  },
  {
    name: "line",
    axis: true,
    markers: true,
    comparison: false,
    draggable: false,
    value: 0,
  },
  {
    name: "comparison",
    axis: true,
    markers: true,
    comparison: true,
    draggable: false,
    value: 0,
  },
  {
    name: "free-zero",
    axis: true,
    markers: true,
    comparison: false,
    draggable: true,
    value: 0,
  },
  {
    name: "free-negative",
    axis: true,
    markers: true,
    comparison: false,
    draggable: true,
    value: -8,
  },
  {
    name: "free-positive",
    axis: true,
    markers: true,
    comparison: false,
    draggable: true,
    value: 3,
  },
  {
    name: "reset",
    axis: false,
    markers: false,
    comparison: false,
    draggable: false,
    value: 0,
  },
];

let rendered = 0;

for (const state of states) {
  const ticks = state.axis
    ? orderNumberLineTicks()
        .map(
          (tick) =>
            `<g data-value="${tick.value}"><line x1="${tick.x}" y1="238" x2="${tick.x}" y2="302" /><text x="${tick.x}" y="368">${formatOrderTickValue(tick.value)}</text></g>`,
        )
        .join("")
    : "";
  const markers = state.markers
    ? `<circle id="marker-eight" cx="${orderValueToX(-8)}" cy="270" r="21" /><circle id="marker-three" cx="${orderValueToX(-3)}" cy="270" r="21" />`
    : "";
  const comparison = state.comparison
    ? `<text id="comparison" x="700" y="120">−8 &lt; −3</text>`
    : "";
  const point = state.draggable
    ? `<g id="draggable" transform="translate(${orderValueToPoint(state.value).x} 270)"><circle r="26" /><text y="-72">${formatOrderCurrentValue(state.value)}</text></g>`
    : "";
  const svg = `
    <svg viewBox="0 0 1400 520" data-state="${state.name}">
      ${state.axis ? '<line id="order-axis" x1="115" y1="270" x2="1285" y2="270" />' : ""}
      ${ticks}
      ${markers}
      ${comparison}
      ${point}
    </svg>
  `;

  assert.doesNotMatch(svg, /NaN|undefined/);
  assert.equal(svg.includes('id="order-axis"'), state.axis);
  assert.equal(svg.includes('id="marker-eight"'), state.markers);
  assert.equal(svg.includes('id="comparison"'), state.comparison);
  assert.equal(svg.includes('id="draggable"'), state.draggable);
  if (state.draggable) {
    assert.match(
      svg,
      new RegExp(`translate\\(${orderValueToX(state.value)} 270\\)`),
    );
  }
  rendered += 1;
}

console.log(`${rendered}/${rendered} Ordnungs-Zustände als SVG gerendert`);
