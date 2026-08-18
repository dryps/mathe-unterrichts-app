import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const files = {
  html: await read("terme-dividieren.html"),
  css: await read("term-division.css"),
  app: await read("src/term-division-app.js"),
  math: await read("src/term-division-math.js"),
  state: await read("src/term-division-state.js"),
  animation: await read("src/term-division-animation.js"),
  home: await read("index.html"),
  worker: await read("sw.js"),
};

test("Leitfrage, Untertitel und Kernerkenntnis sind wortgetreu vorhanden", () => {
  assert.match(
    files.html,
    /Warum bleibt beim Teilen eines Terms genau das übrig, was nicht weggeteilt wurde\?/,
  );
  assert.match(files.html, /<p class="subtitle">Terme dividieren<\/p>/);
  assert.match(files.html, /Division macht einen vorhandenen Faktor rückgängig\./);
});

test("Kernbeispiel zerlegt das Produkt in drei sichtbare Pakete zu je vier x", () => {
  assert.match(files.html, /\(3 · 4 · x\) : 3/);
  assert.match(files.html, /3 · \(4x\)/);
  assert.equal((files.html.match(/class="division-package"/g) ?? []).length, 5);
  assert.equal((files.html.match(/class="x-unit"/g) ?? []).length, 20);
  assert.match(files.html, /3 gleiche Gruppen mit je 4x/);
});

test("Division wird als Inhalt einer Gruppe und nicht als magisches Wegstreichen erklärt", () => {
  assert.match(files.html, /Inhalt einer von drei gleichen Gruppen/);
  assert.doesNotMatch(files.html, /wegstreichen|durchkürzen|<s>|<del>/i);
  assert.doesNotMatch(files.css, /line-through/);
  assert.doesNotMatch(files.html, /:\s*x|x\s*≠|Definitionsbereich/);
});

test("Bedienung bleibt auf Weiter, Zurücksetzen, Regler und Rücklink begrenzt", () => {
  assert.equal((files.html.match(/<button\b/g) ?? []).length, 2);
  assert.equal((files.html.match(/type="range"/g) ?? []).length, 1);
  assert.match(files.html, /id="group-control"[^>]*min="2"[^>]*max="5"[^>]*step="1"/);
  assert.equal((files.html.match(/<a\b/g) ?? []).length, 1);
});

test("Controller-Selektoren sind vollständig mit dem HTML verbunden", () => {
  const selectors = [...files.app.matchAll(/\$\("#([^"\n]+)"\)/g)].map((match) => match[1]);
  assert.ok(selectors.length >= 20);
  for (const id of selectors) assert.match(files.html, new RegExp(`id="${id}"`));
});

test("Mathematik, Zustand und Animation bleiben rein und lokal", () => {
  for (const source of [files.math, files.state, files.animation]) {
    assert.doesNotMatch(source, /document|window|navigator|fetch\(|localStorage|sessionStorage/);
  }
  for (const source of [files.html, files.css, files.app, files.math, files.state, files.animation]) {
    assert.doesNotMatch(source, /https?:\/\//);
  }
});

test("Responsive Regeln schützen kleine Breite, Telefon, iPad und Klassenraum", () => {
  assert.match(files.css, /@media \(max-width: 360px\)/);
  assert.match(files.css, /@media \(max-width: 640px\)/);
  assert.match(files.css, /@media \(orientation: landscape\) and \(max-height: 820px\)/);
  assert.match(files.css, /@media \(min-width: 1500px\)/);
  assert.match(files.css, /overflow-x:\s*hidden/);
});

test("Produktintegration enthält Startseitenkarte und vollständige Offline-Ressourcen", () => {
  assert.match(files.home, /terme-dividieren\.html/);
  for (const file of [
    "terme-dividieren.html",
    "term-division.css",
    "src/term-division-app.js",
    "src/term-division-math.js",
    "src/term-division-state.js",
    "src/term-division-animation.js",
  ]) {
    assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  }
  assert.match(files.worker, /mathe-unterrichts-app-v43/);
});

test("Modul enthält keine Speicherung, Fremdaufrufe oder ausgeschlossenen Produktfunktionen", () => {
  const combined = [files.html, files.css, files.app, files.math, files.state, files.animation].join("\n");
  assert.doesNotMatch(combined, /localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest/);
  assert.doesNotMatch(combined, /login|account|tracking|analytics|werbung|punkte|highscore/i);
});
