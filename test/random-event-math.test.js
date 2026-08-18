import assert from "node:assert/strict";
import test from "node:test";

import {
  DIE_RESULTS,
  RANDOM_EVENTS,
  eventById,
  eventContains,
} from "../src/random-event-math.js";

test("der Ergebnisraum enthält genau die sechs elementaren Würfelergebnisse", () => {
  assert.deepEqual(DIE_RESULTS, [1, 2, 3, 4, 5, 6]);
});

test("gerade Zahl ist exakt die Ereignismenge zwei, vier und sechs", () => {
  assert.deepEqual(eventById("even"), {
    id: "even",
    label: "gerade Zahl",
    results: [2, 4, 6],
  });
});

test("jedes Ereignis ist eine nichtleere Teilmenge des Ergebnisraums", () => {
  for (const event of RANDOM_EVENTS) {
    assert.ok(event.results.length >= 1);
    assert.ok(event.results.every((value) => DIE_RESULTS.includes(value)));
  }
  assert.deepEqual(eventById("one").results, [1]);
});

test("Zugehörigkeit und unbekannte Ereignisse werden eindeutig behandelt", () => {
  assert.equal(eventContains("even", 4), true);
  assert.equal(eventContains("even", 5), false);
  assert.throws(() => eventById("unknown"), /Unbekanntes Ereignis/);
});
