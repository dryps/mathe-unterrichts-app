import assert from "node:assert/strict";
import test from "node:test";

import {
  RANDOM_EVENT_VIEWS,
  createRandomEventState,
  finishRandomEventReveal,
  nextRandomEventState,
  randomEventViewModel,
  resetRandomEventState,
  setRandomEvent,
} from "../src/random-event-state.js";

test("der Lernweg öffnet Ergebnis, Ergebnisraum, Ereignis und Erkundung seriell", () => {
  let state = createRandomEventState();
  const views = [];
  for (let step = 0; step < 5; step += 1) {
    const model = randomEventViewModel(state);
    views.push(model.view);
    assert.equal(model.showResult, step >= 1);
    assert.equal(model.showRoom, step >= 2);
    assert.equal(model.showEvent, step >= 3);
    assert.equal(model.showExplore, step >= 4);
    assert.equal(model.showConclusion, step >= 4);
    state = finishRandomEventReveal(nextRandomEventState(state));
  }
  assert.deepEqual(views, Object.values(RANDOM_EVENT_VIEWS));
});

test("zugängliche Namen verraten die Ereignismenge nicht vor ihrem Gate", () => {
  let state = createRandomEventState();
  for (let step = 0; step < 3; step += 1) {
    const model = randomEventViewModel(state);
    assert.doesNotMatch(model.labAriaLabel, /gerade Zahl|2, 4, 6/);
    state = finishRandomEventReveal(nextRandomEventState(state));
  }
  assert.match(randomEventViewModel(state).labAriaLabel, /gerade Zahl/);
  assert.match(randomEventViewModel(state).labAriaLabel, /2, 4, 6/);
});

test("Erkundung synchronisiert Regel, Menge und Kartenbeschreibungen", () => {
  const explore = { view: RANDOM_EVENT_VIEWS.explore, locked: false, eventId: "even" };
  const model = randomEventViewModel(setRandomEvent(explore, "greater-four"));
  assert.equal(model.eventLabel, "größer als 4");
  assert.equal(model.eventSetText, "{5, 6}");
  assert.deepEqual(model.eventResults, [5, 6]);
  assert.match(model.outcomeAriaLabels[4], /gehört zum Ereignis/);
  assert.match(model.outcomeAriaLabels[3], /gehört nicht/);
});

test("gesperrte Zustände ignorieren Eingaben und Reset stellt die Irritation her", () => {
  const locked = { view: RANDOM_EVENT_VIEWS.event, locked: true, eventId: "even" };
  assert.equal(setRandomEvent(locked, "one"), locked);
  assert.deepEqual(resetRandomEventState(), createRandomEventState());
});
