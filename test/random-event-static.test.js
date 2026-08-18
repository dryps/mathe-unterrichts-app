import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [html, css, app] = await Promise.all([
  read("../ergebnis-und-ereignis.html").catch(() => ""),
  read("../random-event.css").catch(() => ""),
  read("../src/random-event-app.js").catch(() => ""),
]);

test("Frage, Untertitel, Beispiel und Aha sind wortgetreu", () => {
  for (const text of [
    "Warum ist 4 ein Ergebnis, aber „gerade Zahl“ ein Ereignis?",
    "Ergebnis und Ereignis",
    "Ereignis = Menge aus Ergebnissen.",
    "Ein Ergebnis ist ein einzelner möglicher Ausgang.",
    "Ein Ereignis ist eine Menge aus einem oder mehreren Ergebnissen.",
  ]) assert.ok(html.includes(text), text);
});

test("Ergebnis, Ergebnisraum, Ereignis, Erkundung und Schluss sind initial echt hidden", () => {
  for (const id of ["rl-result", "rl-room", "rl-event", "rl-explore", "rl-conclusion"]) {
    assert.match(html, new RegExp(`id="${id}"[^>]*hidden`));
  }
  assert.match(css, /\[hidden\]\s*\{[^}]*display:\s*none\s*!important/);
});

test("Controller koppelt Karten, Mengenschreibweise und zugängliche Namen", () => {
  assert.match(app, /lab\.setAttribute\("aria-label", model\.labAriaLabel\)/);
  assert.match(app, /card\.classList\.toggle\("is-member", model\.eventResults\.includes\(value\)\)/);
  assert.match(app, /card\.setAttribute\("aria-label", model\.outcomeAriaLabels\[index\]\)/);
  assert.match(app, /eventSet\.textContent=model\.eventSetText/);
});

test("Modul bleibt lokal, responsiv, offline und im vereinbarten Scope", () => {
  assert.match(html, /lokal · ohne Speicherung/);
  assert.match(html, /href="\.\/#wahrscheinlichkeit"/);
  assert.doesNotMatch(html + app, /(localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|https?:\/\/)/);
  assert.doesNotMatch(html + app, /Baumdiagramm|zweistufig|Login|Punkte|Aufgabe lösen/);
  assert.match(css, /@media\s*\(max-width:\s*720px\)/);
  assert.match(css, /@media\s*\(min-width:\s*721px\)\s*and\s*\(max-width:\s*1040px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(app, /serviceWorker\.register\("\.\/sw\.js", \{ scope: "\.\/", updateViaCache: "none" \}\)/);
});
