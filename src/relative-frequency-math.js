export const RELATIVE_FREQUENCY_CHECKPOINTS = Object.freeze([
  Object.freeze({ throws: 10, sixes: 2 }),
  Object.freeze({ throws: 100, sixes: 15 }),
  Object.freeze({ throws: 1_000, sixes: 174 }),
  Object.freeze({ throws: 10_000, sixes: 1_630 }),
]);

const X_POSITIONS = Object.freeze([80, 250, 420, 590]);

export function relativeFrequency({ throws, sixes }) {
  if (!Number.isInteger(throws) || throws <= 0) throw new RangeError("Würfe müssen eine positive ganze Zahl sein.");
  if (!Number.isInteger(sixes) || sixes < 0 || sixes > throws) throw new RangeError("Sechsen müssen zwischen null und der Wurfzahl liegen.");
  return sixes / throws;
}

export function chartPoint(index, frequency) {
  if (!Number.isInteger(index) || index < 0 || index >= X_POSITIONS.length) throw new RangeError("Index muss einen vorhandenen Checkpoint bezeichnen.");
  if (!Number.isFinite(frequency) || frequency < 0 || frequency > 1) throw new RangeError("Häufigkeit muss endlich zwischen null und eins liegen.");
  return Object.freeze({
    x: X_POSITIONS[index],
    y: 320 - (frequency * 100 - 12) * 27,
  });
}

export function formatGermanInteger(value) {
  if (!Number.isInteger(value) || value < 0) throw new RangeError("Ganzzahl erwartet.");
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatRelativeFrequency(frequency) {
  if (!Number.isFinite(frequency) || frequency < 0 || frequency > 1) throw new RangeError("Häufigkeit muss endlich zwischen null und eins liegen.");
  return `${(frequency * 100).toFixed(1).replace(".", ",")} %`;
}
