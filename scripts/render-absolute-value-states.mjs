import assert from "node:assert/strict";

import {
  absoluteNumberLineTicks,
  absoluteValueToPoint,
  distanceSegmentToZero,
  formatAbsoluteFormula,
  formatAbsoluteTickValue,
} from "../src/absolute-value-geometry.js";

const states = [
  { name: "prompt", axis: false, direction: false, negative: false, positive: false, draggable: false, value: -4 },
  { name: "direction", axis: true, direction: true, negative: false, positive: false, draggable: false, value: -4 },
  { name: "distance", axis: true, direction: false, negative: true, positive: false, draggable: false, value: -4 },
  { name: "opposite", axis: true, direction: false, negative: true, positive: true, draggable: false, value: -4 },
  { name: "free-negative", axis: true, direction: false, negative: true, positive: false, draggable: true, value: -5 },
  { name: "free-zero", axis: true, direction: false, negative: true, positive: false, draggable: true, value: 0 },
  { name: "free-positive", axis: true, direction: false, negative: true, positive: false, draggable: true, value: 3 },
  { name: "reset", axis: false, direction: false, negative: false, positive: false, draggable: false, value: -4 },
];

let rendered = 0;
for (const state of states) {
  const ticks = state.axis
    ? absoluteNumberLineTicks().map((tick) => `<g data-value="${tick.value}"><line x1="${tick.x}" y1="238" x2="${tick.x}" y2="302" /><text>${formatAbsoluteTickValue(tick.value)}</text></g>`).join("")
    : "";
  const segment = distanceSegmentToZero(state.value);
  const distance = state.negative
    ? `<line id="distance" x1="${segment.startX}" x2="${segment.endX}" y1="${segment.y}" y2="${segment.y}" />`
    : "";
  const positive = state.positive ? '<line id="positive-distance" x1="700" x2="1090" />' : "";
  const point = state.draggable
    ? `<g id="draggable" transform="translate(${absoluteValueToPoint(state.value).x} 270)"><text>${formatAbsoluteFormula(state.value)}</text></g>`
    : "";
  const svg = `<svg viewBox="0 0 1400 520" data-state="${state.name}">${state.axis ? '<line id="absolute-axis" x1="115" y1="270" x2="1285" y2="270" />' : ""}${ticks}${state.direction ? '<line id="direction" x1="680" x2="330" />' : ""}${distance}${positive}${point}</svg>`;
  assert.doesNotMatch(svg, /NaN|undefined/);
  assert.equal(svg.includes('id="absolute-axis"'), state.axis);
  assert.equal(svg.includes('id="direction"'), state.direction);
  assert.equal(svg.includes('id="distance"'), state.negative);
  assert.equal(svg.includes('id="positive-distance"'), state.positive);
  assert.equal(svg.includes('id="draggable"'), state.draggable);
  rendered += 1;
}

console.log(`${rendered}/${rendered} Betrags-Zustände als SVG gerendert`);
