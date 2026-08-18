import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { RANDOM_EVENT_REVEAL_DURATION, randomEventRevealFrame } from "../src/random-event-animation.js";
import { DIE_RESULTS, RANDOM_EVENTS } from "../src/random-event-math.js";
import { RANDOM_EVENT_VIEWS, createRandomEventState, finishRandomEventReveal, nextRandomEventState, randomEventViewModel, setRandomEvent } from "../src/random-event-state.js";

const html = await readFile(new URL("../ergebnis-und-ereignis.html", import.meta.url), "utf8");
const css = await readFile(new URL("../random-event.css", import.meta.url), "utf8");
let state = createRandomEventState();
let count = 0;
for (let step = 0; step < Object.values(RANDOM_EVENT_VIEWS).length; step += 1) {
  const model = randomEventViewModel(state);
  assert.doesNotMatch(JSON.stringify(model), /undefined|NaN|Infinity/);
  count += 1;
  state = finishRandomEventReveal(nextRandomEventState(state));
}
const explore = { view: RANDOM_EVENT_VIEWS.explore, locked: false, eventId: "even" };
for (const event of RANDOM_EVENTS) {
  const model = randomEventViewModel(setRandomEvent(explore, event.id));
  assert.deepEqual(model.eventResults, event.results);
  assert.ok(model.eventResults.every((value) => DIE_RESULTS.includes(value)));
  count += 1;
}
let previous = -1;
for (const time of [0, 130, 260, 390, 520, RANDOM_EVENT_REVEAL_DURATION]) {
  const frame = randomEventRevealFrame(time);
  assert.ok(frame.opacity >= previous);
  previous = frame.opacity;
  count += 1;
}
assert.match(html, /Zufallslabor/);
assert.match(css, /@media \(max-width: 720px\)/);
console.log(`${count}/${count} Ergebnis-und-Ereignis-Zustände gerendert`);
