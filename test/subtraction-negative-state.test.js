import assert from "node:assert/strict";
import test from "node:test";

import {
  SUBTRACTION_VIEWS,
  createSubtractionState,
  finishDirectionReversal,
  finishSubtractionMovement,
  moveSubtrahend,
  nextSubtractionState,
  resetSubtractionState,
  subtractionViewModel,
} from "../src/subtraction-negative-state.js";

test("Aufbau trennt Irritation, Start, negative Richtung, Umkehrung, Bewegung und Ergebnis", () => {
  let state = createSubtractionState();
  assert.equal(state.view, "prompt");

  state = nextSubtractionState(state);
  assert.equal(state.view, "start");
  assert.equal(state.locked, false);

  state = nextSubtractionState(state);
  assert.equal(state.view, "negative");
  assert.equal(state.locked, false);

  state = nextSubtractionState(state);
  assert.equal(state.view, "reversing");
  assert.equal(state.locked, true);
  assert.strictEqual(nextSubtractionState(state), state);

  state = finishDirectionReversal(state);
  assert.equal(state.view, "moving");
  assert.equal(state.locked, true);
  assert.strictEqual(nextSubtractionState(state), state);

  state = finishSubtractionMovement(state);
  assert.equal(state.view, "result");
  assert.equal(state.locked, false);

  state = nextSubtractionState(state);
  assert.equal(state.view, "free");
});

test("Ansichtsmodell zeigt beide Minuszeichen getrennt und nichts verfrüht", () => {
  const prompt = subtractionViewModel(createSubtractionState());
  assert.equal(prompt.showAxis, false);
  assert.equal(prompt.showFormula, false);
  assert.equal(prompt.showOriginalVector, false);

  const start = subtractionViewModel({ view: SUBTRACTION_VIEWS.start, subtrahend: -2, locked: false });
  assert.equal(start.showAxis, true);
  assert.equal(start.highlightStart, true);
  assert.equal(start.showOriginalVector, false);

  const negative = subtractionViewModel({ view: SUBTRACTION_VIEWS.negative, subtrahend: -2, locked: false });
  assert.equal(negative.highlightSubtrahend, true);
  assert.equal(negative.highlightOperator, false);
  assert.equal(negative.showOriginalVector, true);

  const reversing = subtractionViewModel({ view: SUBTRACTION_VIEWS.reversing, subtrahend: -2, locked: true });
  assert.equal(reversing.highlightSubtrahend, true);
  assert.equal(reversing.highlightOperator, true);
  assert.equal(reversing.showReversalVector, true);
  assert.equal(reversing.controlsLocked, true);
});

test("freie Erkundung zeigt beide Richtungen, Bewegung und Ergebnis gemeinsam", () => {
  const free = subtractionViewModel({ view: SUBTRACTION_VIEWS.free, subtrahend: -2, locked: false });
  assert.equal(free.showOriginalVector, true);
  assert.equal(free.showEffectiveVector, true);
  assert.equal(free.showEnd, true);
  assert.equal(free.interactive, true);
  assert.equal(free.showNext, false);
});

test("nur freie stabile Zustände erlauben die eine Größe zu verändern", () => {
  const prompt = createSubtractionState();
  assert.strictEqual(moveSubtrahend(prompt, -4), prompt);

  const free = { view: SUBTRACTION_VIEWS.free, subtrahend: -2, locked: false };
  assert.deepEqual(moveSubtrahend(free, -4), {
    view: SUBTRACTION_VIEWS.conclusion,
    subtrahend: -4,
    locked: false,
  });
  assert.equal(moveSubtrahend(free, -99).subtrahend, -4);
  assert.equal(moveSubtrahend(free, 99).subtrahend, -1);
});

test("schnelle Mehrfachtipps überspringen weder Umkehrung noch Bewegung", () => {
  const reversing = { view: SUBTRACTION_VIEWS.reversing, subtrahend: -2, locked: true };
  assert.strictEqual(nextSubtractionState(reversing), reversing);
  assert.strictEqual(moveSubtrahend(reversing, -4), reversing);
  const moving = finishDirectionReversal(reversing);
  assert.strictEqual(nextSubtractionState(moving), moving);
  assert.strictEqual(moveSubtrahend(moving, -4), moving);
});

test("Reset stellt aus jedem stabilen Zustand exakt die Irritation wieder her", () => {
  for (const view of ["prompt", "start", "negative", "result", "free", "conclusion"]) {
    assert.deepEqual(
      resetSubtractionState({ view, subtrahend: -4, locked: false }),
      createSubtractionState(),
    );
  }
});
