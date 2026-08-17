import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const files = {
  html: await read("ausmultiplizieren.html"), css: await read("distribution.css"), app: await read("src/distribution-app.js"),
  math: await read("src/distribution-math.js"), state: await read("src/distribution-state.js"), animation: await read("src/distribution-animation.js"),
  home: await read("index.html"), worker: await read("sw.js"),
};

test("Leitfrage, Untertitel und Kernerkenntnis sind wortgetreu vorhanden", () => {
  assert.match(files.html, /Warum muss beim Ausmultiplizieren jeder Term in der Klammer getroffen werden\?/);
  assert.match(files.html, /<p class="subtitle">Ausmultiplizieren<\/p>/);
  assert.match(files.html, /Der Faktor 3 vervielfacht das gesamte Paket\./);
});

test("Kernbeispiel enthält fünf vorbereitete vollständige Pakete mit je x plus zwei", () => {
  assert.match(files.html, /3\(x \+ 2\)/);
  assert.match(files.html, /3x \+ 6/);
  assert.equal((files.html.match(/class="distribution-package"/g) ?? []).length, 5);
  assert.equal((files.html.match(/class="package-x"/g) ?? []).length, 5);
  assert.equal((files.html.match(/class="package-one"/g) ?? []).length, 10);
});

test("Ergebnis und Bündelung bleiben bis zu ihren eigenen Zuständen verborgen", () => {
  assert.match(files.html, /id="distribution-regroup"[^>]*hidden/);
  assert.match(files.html, /id="distribution-result"[^>]*hidden/);
  assert.match(files.html, /id="factor-control"[^>]*min="2"[^>]*max="5"[^>]*step="1"/);
});

test("Bedienung bleibt auf Weiter, Zurücksetzen, Regler und Rücklink begrenzt", () => {
  assert.equal((files.html.match(/<button\b/g) ?? []).length, 2);
  assert.equal((files.html.match(/type="range"/g) ?? []).length, 1);
  assert.equal((files.html.match(/<a\b/g) ?? []).length, 1);
});

test("Controller-Selektoren sind vollständig mit dem HTML verbunden", () => {
  const selectors = [...files.app.matchAll(/\$\("#([^"\n]+)"\)/g)].map((match) => match[1]);
  assert.ok(selectors.length >= 18);
  for (const id of selectors) assert.match(files.html, new RegExp(`id="${id}"`));
});

test("Mathematik, Zustand und Animation bleiben rein und lokal", () => {
  for (const source of [files.math, files.state, files.animation]) assert.doesNotMatch(source, /document|window|navigator|fetch\(|localStorage|sessionStorage/);
  for (const source of [files.html, files.css, files.app, files.math, files.state, files.animation]) assert.doesNotMatch(source, /https?:\/\//);
});

test("Responsive Regeln schützen kleine Breite, Telefon, iPad und Klassenraum", () => {
  assert.match(files.css, /@media \(max-width: 360px\)/);
  assert.match(files.css, /@media \(max-width: 640px\)/);
  assert.match(files.css, /@media \(orientation: landscape\) and \(max-height: 820px\)/);
  assert.match(files.css, /@media \(min-width: 1500px\)/);
  assert.match(files.css, /overflow-x:\s*hidden/);
});

test("Produktintegration enthält Startseitenkarte und vollständige Offline-Ressourcen", () => {
  assert.match(files.home, /ausmultiplizieren\.html/);
  for (const file of ["ausmultiplizieren.html", "distribution.css", "src/distribution-app.js", "src/distribution-math.js", "src/distribution-state.js", "src/distribution-animation.js"]) assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  assert.match(files.worker, /mathe-unterrichts-app-v25/);
});

test("Modul enthält keine Speicherung, Fremdaufrufe oder ausgeschlossenen Produktfunktionen", () => {
  const combined = Object.values(files).slice(0, 6).join("\n");
  assert.doesNotMatch(combined, /localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest/);
  assert.doesNotMatch(combined, /login|account|tracking|analytics|werbung|punkte|highscore|binom/i);
});
