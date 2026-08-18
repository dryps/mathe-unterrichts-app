import assert from "node:assert/strict";
import test from "node:test";

import { RELATIVE_FREQUENCY_VIEWS, createRelativeFrequencyState, finishRelativeFrequencyReveal, nextRelativeFrequencyState, relativeFrequencyViewModel, resetRelativeFrequencyState, setRelativeFrequencyCheckpoint } from "../src/relative-frequency-state.js";

test("10, 100, 1.000, 10.000 und Erkundung öffnen seriell", () => {
  let state = createRelativeFrequencyState();
  Object.values(RELATIVE_FREQUENCY_VIEWS).forEach((view, step) => {
    const model = relativeFrequencyViewModel(state);
    assert.equal(model.view, view);
    assert.equal(model.visibleCheckpointCount, Math.min(4, step));
    assert.equal(model.showChart, step >= 1);
    assert.equal(model.showExplore, step >= 5);
    assert.equal(model.showConclusion, step >= 5);
    state = finishRelativeFrequencyReveal(nextRelativeFrequencyState(state));
  });
});

test("jeder Reveal wählt den gerade sichtbaren Checkpoint und hält alle Texte synchron", () => {
  let state = createRelativeFrequencyState();
  for (let step = 1; step <= 4; step += 1) {
    state = finishRelativeFrequencyReveal(nextRelativeFrequencyState(state));
    const model = relativeFrequencyViewModel(state);
    assert.equal(model.selectedIndex, step - 1);
    assert.match(model.selectedSummary, new RegExp(model.throwCountText.replace(".", "\\.")));
    assert.match(model.chartAriaLabel, new RegExp(model.frequencyText.replace("%", "Prozent")));
  }
});

test("Erkundung synchronisiert alle vier nicht monotonen Checkpoints", () => {
  let state = createRelativeFrequencyState();
  for (let step = 0; step < 5; step += 1) state = finishRelativeFrequencyReveal(nextRelativeFrequencyState(state));
  for (const index of [0, 1, 2, 3]) {
    const model = relativeFrequencyViewModel(setRelativeFrequencyCheckpoint(state, index));
    assert.equal(model.selectedIndex, index);
    assert.match(model.sliderValueText, /Würfe.*Sechsen.*Prozent/);
  }
  assert.throws(() => setRelativeFrequencyCheckpoint(state, 4), /Checkpoint/);
});

test("Aha bleibt exakt und Reset sowie Sperre sind deterministisch", () => {
  const start = createRelativeFrequencyState();
  const locked = nextRelativeFrequencyState(start);
  assert.equal(nextRelativeFrequencyState(locked), locked);
  assert.equal(setRelativeFrequencyCheckpoint(locked, 2), locked);
  let state = start;
  for (let step = 0; step < 5; step += 1) state = finishRelativeFrequencyReveal(nextRelativeFrequencyState(state));
  assert.equal(relativeFrequencyViewModel(state).conclusion, "Wahrscheinlichkeit beschreibt langfristiges Verhalten, keinen festen Einzelrhythmus.");
  assert.deepEqual(resetRelativeFrequencyState(), start);
});
