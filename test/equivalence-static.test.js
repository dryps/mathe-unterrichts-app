import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const files = {
  html: await read("aequivalenzumformungen.html"),
  css: await read("equivalence.css"),
  app: await read("src/equivalence-app.js"),
  math: await read("src/equivalence-math.js"),
  state: await read("src/equivalence-state.js"),
  animation: await read("src/equivalence-animation.js"),
};

test("Leitfrage, Untertitel, Beispiel und Aha sind wortgetreu vorhanden", () => {
  assert.match(files.html, /Warum bleibt eine Gleichung wahr, wenn ich auf beiden Seiten dasselbe tue\?/);
  assert.match(files.html, /<p class="subtitle">Äquivalenzumformungen<\/p>/);
  assert.match(files.html, /3x \+ 5/);
  assert.match(files.html, /Zulässige gleiche Operationen auf beiden Seiten erhalten die Lösungsmenge\./);
});

test("digitale Gleichungswaage besitzt genau zwei Seiten und einen sichtbaren Balken", () => {
  assert.equal((files.html.match(/class="scale-pan/g) ?? []).length, 2);
  assert.equal((files.html.match(/class="equation-side/g) ?? []).length, 2);
  assert.match(files.html, /id="equivalence-beam"/);
  assert.match(files.html, /id="equivalence-warning"[^>]*hidden/);
});

test("Subtraktion, Division, Erkundung und Schluss bleiben bis zu ihren Zuständen verborgen", () => {
  for (const id of ["equivalence-subtract-both", "equivalence-divide-both", "equivalence-groups", "equivalence-explore", "equivalence-conclusion"]) {
    assert.match(files.html, new RegExp(`id="${id}"[^>]*hidden`));
  }
  assert.match(files.html, /id="equivalence-delta"[^>]*min="-8"[^>]*max="8"[^>]*step="1"[^>]*value="-5"/);
});

test("Bedienung bleibt auf Weiter, Zurücksetzen, Regler und Rücklink begrenzt", () => {
  assert.equal((files.html.match(/<button\b/g) ?? []).length, 2);
  assert.equal((files.html.match(/type="range"/g) ?? []).length, 1);
  assert.equal((files.html.match(/<a\b/g) ?? []).length, 1);
});

test("Controller-Selektoren sind vollständig mit dem HTML verbunden", () => {
  const selectors = [...files.app.matchAll(/\$\("#([^"\n]+)"\)/g)].map((match) => match[1]);
  assert.ok(selectors.length >= 16);
  for (const id of selectors) assert.match(files.html, new RegExp(`id="${id}"`));
});

test("Mathematik, Zustand und Animation bleiben rein und lokal", () => {
  for (const source of [files.math, files.state, files.animation]) assert.doesNotMatch(source, /document|window|navigator|fetch\(|localStorage|sessionStorage/);
  for (const source of Object.values(files)) assert.doesNotMatch(source, /https?:\/\//);
});

test("Responsive Regeln schützen Telefon, iPad, Querformat und Klassenraum", () => {
  assert.match(files.css, /overflow-x:\s*hidden/);
  assert.match(files.css, /@media \(max-width: 360px\)/);
  assert.match(files.css, /@media \(max-width: 640px\)/);
  assert.match(files.css, /@media \(orientation: landscape\) and \(max-height: 820px\)/);
  assert.match(files.css, /@media \(min-width: 1500px\)/);
  assert.match(files.css, /prefers-reduced-motion: reduce/);
});

test("Modul enthält keine Speicherung, Fremdaufrufe oder ausgeschlossenen Produktfunktionen", () => {
  const combined = Object.values(files).join("\n");
  assert.doesNotMatch(combined, /localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest/);
  assert.doesNotMatch(combined, /login|account|tracking|analytics|werbung|punkte|highscore/i);
});
