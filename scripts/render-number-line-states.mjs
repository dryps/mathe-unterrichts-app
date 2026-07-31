import assert from "node:assert/strict";

import {
  formatCurrentValue,
  formatTickValue,
  numberLineTicks,
  valueToPoint,
} from "../src/number-line-geometry.js";

const states = [
  { name: "initial", value: 0, includeNegative: false, showValue: false },
  { name: "right", value: 3, includeNegative: false, showValue: false },
  { name: "home", value: 0, includeNegative: false, showValue: false },
  { name: "negative", value: -3, includeNegative: true, showValue: false },
  { name: "free-negative", value: -2, includeNegative: true, showValue: true },
  { name: "free-positive", value: 2, includeNegative: true, showValue: true },
];

let rendered = 0;

for (const state of states) {
  const point = valueToPoint(state.value);
  const ticks = numberLineTicks(state.includeNegative)
    .map(
      (tick) =>
        `<g data-value="${tick.value}"><line x1="${tick.x}" y1="236" x2="${tick.x}" y2="304" /><text x="${tick.x}" y="370">${formatTickValue(tick.value)}</text></g>`,
    )
    .join("");
  const value = state.showValue
    ? `<text id="current-value" x="${point.x}" y="158">${formatCurrentValue(state.value)}</text>`
    : "";
  const svg = `
    <svg viewBox="0 0 1200 520" data-state="${state.name}">
      <line id="number-axis" x1="84" y1="270" x2="1116" y2="270" />
      ${ticks}
      <circle id="number-point" cx="${point.x}" cy="${point.y}" r="25" />
      ${value}
    </svg>
  `;

  assert.doesNotMatch(svg, /NaN|undefined/);
  assert.match(svg, /id="number-axis"/);
  assert.match(svg, /id="number-point"/);
  assert.match(svg, new RegExp(`cx="${point.x}" cy="270"`));
  assert.equal(svg.includes("data-value=\"-1\""), state.includeNegative);
  assert.equal(svg.includes("id=\"current-value\""), state.showValue);
  rendered += 1;
}

console.log(`${rendered}/${rendered} Zahlengeraden-Zustände als SVG gerendert`);
