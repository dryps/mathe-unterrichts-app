import assert from "node:assert/strict";
import test from "node:test";

import {
  LIKE_TERM_VIEWS,
  createLikeTermsState,
  finishLikeTermsMerge,
  likeTermsViewModel,
  nextLikeTermsState,
  resetLikeTermsState,
  setGroupCoefficient,
} from "../src/like-terms-state.js";

test("sechs didaktische Zustände bleiben trotz internem Animationszustand getrennt", () => {
  let state = createLikeTermsState();
  assert.equal(state.view, LIKE_TERM_VIEWS.irritation);

  state = nextLikeTermsState(state);
  assert.equal(state.view, LIKE_TERM_VIEWS.groups);

  state = nextLikeTermsState(state);
  assert.equal(state.view, LIKE_TERM_VIEWS.merging);
  assert.equal(state.locked, true);

  state = finishLikeTermsMerge(state);
  assert.equal(state.view, LIKE_TERM_VIEWS.combined);
  assert.equal(state.locked, false);

  state = nextLikeTermsState(state);
  assert.equal(state.view, LIKE_TERM_VIEWS.counterexample);

  state = nextLikeTermsState(state);
  assert.equal(state.view, LIKE_TERM_VIEWS.comparison);

  state = nextLikeTermsState(state);
  assert.equal(state.view, LIKE_TERM_VIEWS.explore);
  assert.equal(likeTermsViewModel(state).showNext, false);
});

test("Mehrfachtipps und Regler können die Zusammenführungsanimation nicht überspringen", () => {
  const merging = {
    view: LIKE_TERM_VIEWS.merging,
    first: 3,
    second: 2,
    locked: true,
  };

  assert.strictEqual(nextLikeTermsState(merging), merging);
  assert.strictEqual(setGroupCoefficient(merging, "first", 4), merging);
  const initial = createLikeTermsState();
  assert.strictEqual(finishLikeTermsMerge(initial), initial);
});

test("jede Ansicht zeigt nur ihre eigene mathematische Aussage", () => {
  const states = {
    irritation: createLikeTermsState(),
    groups: { view: LIKE_TERM_VIEWS.groups, first: 3, second: 2, locked: false },
    combined: { view: LIKE_TERM_VIEWS.combined, first: 3, second: 2, locked: false },
    counterexample: { view: LIKE_TERM_VIEWS.counterexample, first: 3, second: 2, locked: false },
    comparison: { view: LIKE_TERM_VIEWS.comparison, first: 3, second: 2, locked: false },
    explore: { view: LIKE_TERM_VIEWS.explore, first: 3, second: 2, locked: false },
  };

  assert.equal(likeTermsViewModel(states.irritation).showIrritation, true);
  assert.equal(likeTermsViewModel(states.irritation).showBlocks, false);
  assert.equal(likeTermsViewModel(states.groups).showLikeGroups, true);
  assert.equal(likeTermsViewModel(states.combined).showCombined, true);
  assert.equal(likeTermsViewModel(states.counterexample).showCounterexample, true);
  assert.equal(likeTermsViewModel(states.comparison).showComparison, true);
  assert.equal(likeTermsViewModel(states.explore).showExplore, true);
  assert.equal(likeTermsViewModel(states.explore).showConclusion, false);
});

test("freie Erkundung begrenzt beide Koeffizienten auf eins bis vier", () => {
  const explore = {
    view: LIKE_TERM_VIEWS.explore,
    first: 3,
    second: 2,
    locked: false,
  };

  const first = setGroupCoefficient(explore, "first", -99);
  assert.deepEqual(first, {
    view: LIKE_TERM_VIEWS.conclusion,
    first: 1,
    second: 2,
    locked: false,
  });

  const second = setGroupCoefficient(first, "second", 99);
  assert.deepEqual(second, {
    view: LIKE_TERM_VIEWS.conclusion,
    first: 1,
    second: 4,
    locked: false,
  });
  assert.equal(likeTermsViewModel(second).formula, "1x + 4x = 5x");
  assert.equal(likeTermsViewModel(second).showConclusion, true);
  assert.throws(() => setGroupCoefficient(explore, "third", 2), TypeError);
});

test("eine wirkungslose Reglereingabe blendet die Schlussaussage nicht verfrüht ein", () => {
  const explore = {
    view: LIKE_TERM_VIEWS.explore,
    first: 3,
    second: 2,
    locked: false,
  };
  assert.strictEqual(setGroupCoefficient(explore, "first", 3), explore);
  assert.equal(likeTermsViewModel(explore).showConclusion, false);
});

test("Reset stellt aus jedem stabilen Zustand exakt die Irritation wieder her", () => {
  for (const view of [
    LIKE_TERM_VIEWS.groups,
    LIKE_TERM_VIEWS.combined,
    LIKE_TERM_VIEWS.counterexample,
    LIKE_TERM_VIEWS.comparison,
    LIKE_TERM_VIEWS.explore,
    LIKE_TERM_VIEWS.conclusion,
  ]) {
    assert.deepEqual(
      resetLikeTermsState({ view, first: 4, second: 4, locked: false }),
      createLikeTermsState(),
    );
  }
});
