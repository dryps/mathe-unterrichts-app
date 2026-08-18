export const DIE_RESULTS = Object.freeze([1, 2, 3, 4, 5, 6]);

export const RANDOM_EVENTS = Object.freeze([
  Object.freeze({ id: "even", label: "gerade Zahl", results: Object.freeze([2, 4, 6]) }),
  Object.freeze({ id: "greater-four", label: "größer als 4", results: Object.freeze([5, 6]) }),
  Object.freeze({ id: "one", label: "die Zahl 1", results: Object.freeze([1]) }),
]);

export function eventById(id) {
  const event = RANDOM_EVENTS.find((candidate) => candidate.id === id);
  if (!event) throw new RangeError("Unbekanntes Ereignis.");
  return event;
}

export function eventContains(id, value) {
  return eventById(id).results.includes(value);
}
