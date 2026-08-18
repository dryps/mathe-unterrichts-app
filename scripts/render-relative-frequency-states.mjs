import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { RELATIVE_FREQUENCY_REVEAL_DURATION, relativeFrequencyRevealFrame } from "../src/relative-frequency-animation.js";
import { RELATIVE_FREQUENCY_VIEWS, createRelativeFrequencyState, finishRelativeFrequencyReveal, nextRelativeFrequencyState, relativeFrequencyViewModel, setRelativeFrequencyCheckpoint } from "../src/relative-frequency-state.js";

const html = await readFile(new URL("../relative-haeufigkeit.html", import.meta.url), "utf8");
const css = await readFile(new URL("../relative-frequency.css", import.meta.url), "utf8");
let state = createRelativeFrequencyState();
let count = 0;
for (let step = 0; step < Object.values(RELATIVE_FREQUENCY_VIEWS).length; step += 1) {
  const model = relativeFrequencyViewModel(state);
  assert.doesNotMatch(JSON.stringify(model), /undefined|NaN|Infinity/);
  assert.equal(model.visibleCheckpointCount, Math.min(4, step));
  assert.equal(model.checkpoints.filter((checkpoint) => checkpoint.visible).length, model.visibleCheckpointCount);
  assert.equal(model.showScrollHint, model.visibleCheckpointCount >= 3);
  const hiddenThrowCounts = model.checkpoints.slice(model.visibleCheckpointCount).map((checkpoint) => checkpoint.throwCountText);
  for (const throwCount of hiddenThrowCounts) assert.doesNotMatch(model.stageSummary, new RegExp(`(^|\\D)${throwCount.replace(".", "\\.")}($|\\D)`));
  count += 1;
  state = finishRelativeFrequencyReveal(nextRelativeFrequencyState(state));
}
for (const index of [0, 1, 2, 3]) {
  const model = relativeFrequencyViewModel(setRelativeFrequencyCheckpoint(state, index));
  assert.equal(model.selectedIndex, index);
  assert.ok(["20,0 %", "15,0 %", "17,4 %", "16,3 %"].includes(model.frequencyText));
  count += 1;
}
let previous = -1;
for (const time of [0, 130, 260, 390, 520, RELATIVE_FREQUENCY_REVEAL_DURATION]) {
  const frame = relativeFrequencyRevealFrame(time);
  assert.ok(frame.opacity >= previous);
  previous = frame.opacity;
  count += 1;
}
assert.match(html, /Relative Häufigkeit/);
assert.match(css, /@media \(max-width: 720px\)/);
console.log(`${count}/${count} Relative-Häufigkeit-Zustände gerendert`);
