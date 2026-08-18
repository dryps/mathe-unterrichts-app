import { DIE_RESULTS, eventById } from "./random-event-math.js";

export const RANDOM_EVENT_VIEWS = Object.freeze({
  irritation: "irritation",
  result: "result",
  room: "room",
  event: "event",
  explore: "explore",
});

const ORDER = Object.freeze(Object.values(RANDOM_EVENT_VIEWS));
const DEFAULT_EVENT = "even";
const CONCLUSION = "Ereignis = Menge aus Ergebnissen.";
const EXPLANATION = "Ein Ergebnis ist ein einzelner möglicher Ausgang. Ein Ereignis ist eine Menge aus einem oder mehreren Ergebnissen.";

function make(view, locked = false, eventId = DEFAULT_EVENT) {
  eventById(eventId);
  return Object.freeze({ view, locked: Boolean(locked), eventId });
}

export function createRandomEventState() {
  return make(RANDOM_EVENT_VIEWS.irritation);
}

export function nextRandomEventState(current) {
  if (current.locked) return current;
  const index = ORDER.indexOf(current.view);
  if (index < 0 || index >= ORDER.length - 1) return current;
  return make(ORDER[index + 1], true, current.eventId);
}

export function finishRandomEventReveal(current) {
  return current.locked ? make(current.view, false, current.eventId) : current;
}

export function setRandomEvent(current, eventId) {
  if (current.locked || current.view !== RANDOM_EVENT_VIEWS.explore) return current;
  return make(current.view, false, eventId);
}

export function resetRandomEventState() {
  return createRandomEventState();
}

export function randomEventViewModel(current) {
  const rank = ORDER.indexOf(current.view);
  if (rank < 0) throw new RangeError("Unbekannter Lernzustand.");
  const event = eventById(current.eventId);
  const showEvent = rank >= 3;
  const eventResults = showEvent ? [...event.results] : [];
  const eventSetText = `{${event.results.join(", ")}}`;
  const labNames = [
    "Zufallslabor: Ein Würfel zeigt die 4. Noch ist offen, wie dieser Ausgang eingeordnet wird.",
    "Zufallslabor: Die 4 ist ein einzelnes Ergebnis des Würfelwurfs.",
    "Zufallslabor: Der vollständige Ergebnisraum enthält 1, 2, 3, 4, 5 und 6.",
    `Zufallslabor: Das Ereignis ${event.label} besteht aus den Ergebnissen ${event.results.join(", ")}.`,
  ];
  const outcomeAriaLabels = DIE_RESULTS.map((value) => {
    if (!showEvent) return `Ergebnis ${value}`;
    return event.results.includes(value)
      ? `Ergebnis ${value} gehört zum Ereignis ${event.label}`
      : `Ergebnis ${value} gehört nicht zum Ereignis ${event.label}`;
  });
  const insights = {
    irritation: "Der Würfel zeigt 4. Ist das schon dasselbe wie „gerade Zahl“?",
    result: "Die 4 ist genau ein möglicher Ausgang – ein Ergebnis.",
    room: "Der Ergebnisraum sammelt alle sechs möglichen Würfelergebnisse.",
    event: `„${event.label}“ fasst die Ergebnisse ${eventSetText} zusammen.`,
    explore: CONCLUSION,
  };
  return Object.freeze({
    view: current.view,
    eventId: current.eventId,
    eventLabel: event.label,
    eventSetText,
    eventResults: Object.freeze(eventResults),
    outcomeAriaLabels: Object.freeze(outcomeAriaLabels),
    labAriaLabel: labNames[Math.min(rank, 3)],
    showResult: rank >= 1,
    showRoom: rank >= 2,
    showEvent,
    showExplore: rank >= 4,
    showConclusion: rank >= 4,
    showNext: rank < 4,
    controlsInteractive: rank >= 4 && !current.locked,
    insight: insights[current.view],
    liveText: rank >= 4 ? `${insights[current.view]} ${EXPLANATION}` : insights[current.view],
    conclusion: CONCLUSION,
    explanation: EXPLANATION,
  });
}
