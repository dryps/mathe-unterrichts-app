import assert from "node:assert/strict";

import {
  DIRECTION_REVERSAL_DURATION_MS,
  directionReversalFrame,
} from "../src/subtraction-negative-animation.js";
import {
  formatSubtraction,
  subtractionMovement,
  subtractionNumberLineTicks,
} from "../src/subtraction-negative-geometry.js";

const states = [
  "prompt",
  "start",
  "negative",
  "reversing",
  "moving",
  "result",
  "free",
  "conclusion",
];

for (const subtrahend of [-1, -2, -3, -4]) {
  const movement = subtractionMovement(subtrahend);
  const reversal = directionReversalFrame(DIRECTION_REVERSAL_DURATION_MS / 2, movement);
  assert.equal(movement.originalStepCount, movement.effectiveStepCount);
  assert.equal(reversal.vectorLength, movement.vectorLength);
  assert.equal(reversal.stepCount, movement.originalStepCount);
  for (const value of [
    movement.startX,
    movement.originalEndX,
    movement.effectiveEndX,
    movement.result,
    reversal.angle,
  ]) {
    assert.equal(Number.isFinite(value), true);
  }
}

let rendered = 0;
for (const state of states) {
  const movement = subtractionMovement(-2);
  const showAxis = state !== "prompt";
  const showOriginal = ["negative", "moving", "result", "free", "conclusion"].includes(state);
  const showReversal = state === "reversing";
  const showEffective = ["moving", "result", "free", "conclusion"].includes(state);
  const showResult = ["result", "free", "conclusion"].includes(state);
  const equations = formatSubtraction(-2);
  const svg = `<svg viewBox="0 0 1400 560" data-state="${state}">
    ${showAxis ? `<line id="axis" x1="132" x2="1268"/>${subtractionNumberLineTicks().map((tick) => `<g transform="translate(${tick.x} 310)"></g>`).join("")}` : ""}
    ${showOriginal ? `<line id="original" x1="${movement.startX}" x2="${movement.originalEndX}"/>` : ""}
    ${showReversal ? `<line id="reversal" transform="rotate(90 ${movement.startX} ${movement.originalY})" x1="${movement.startX}" x2="${movement.originalEndX}"/>` : ""}
    ${showEffective ? `<line id="effective" x1="${movement.startX}" x2="${movement.effectiveEndX}"/>` : ""}
    ${showResult ? `<g id="result"><text>${equations.subtraction}</text><text>${equations.addition}</text><text>${equations.equivalence}</text></g>` : ""}
  </svg>`;
  assert.doesNotMatch(svg, /NaN|undefined/);
  assert.equal(svg.includes('id="axis"'), showAxis);
  assert.equal(svg.includes('id="original"'), showOriginal);
  assert.equal(svg.includes('id="reversal"'), showReversal);
  assert.equal(svg.includes('id="effective"'), showEffective);
  assert.equal(svg.includes('id="result"'), showResult);
  rendered += 1;
}

console.log(`${rendered}/${rendered} Subtraktions-Zustände als SVG gerendert`);
