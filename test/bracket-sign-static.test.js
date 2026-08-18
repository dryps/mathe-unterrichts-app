import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const files = {
  html: await read("plus-minus-klammern.html"),
  css: await read("bracket-sign.css"),
  app: await read("src/bracket-sign-app.js"),
  math: await read("src/bracket-sign-math.js"),
  state: await read("src/bracket-sign-state.js"),
  animation: await read("src/bracket-sign-animation.js"),
  home: await read("index.html"),
  worker: await read("sw.js"),
};

test("Leitfrage, Untertitel und Kernerkenntnis sind wortgetreu vorhanden", () => {
  assert.match(files.html, /Warum ändern sich bei einer Minusklammer alle Vorzeichen\?/);
  assert.match(files.html, /<p class="subtitle">Plus- und Minusklammern<\/p>/);
  assert.match(files.html, /Das Minus wirkt auf das gesamte Paket\./);
});

test("Kernbeispiel zeigt ein Paket und die Wirkung desselben äußeren Faktors auf beide Terme", () => {
  assert.match(files.html, /−\(x − 3\)/);
  assert.match(files.html, /−1 · \(x − 3\)/);
  assert.match(files.html, /−x \+ 3/);
  assert.match(files.html, /id="package-variable"/);
  assert.match(files.html, /id="package-constant"/);
  assert.match(files.html, /id="acting-arrow-variable"/);
  assert.match(files.html, /id="acting-arrow-constant"/);
});

test("Ergebnis bleibt bis nach der Minuswirkung verborgen und Vergleich bleibt auf plus/minus eins begrenzt", () => {
  assert.match(files.html, /id="package-result"[^>]*hidden/);
  assert.match(files.html, /id="factor-control"[^>]*min="-1"[^>]*max="1"[^>]*step="2"/);
  assert.doesNotMatch(files.html, /ausmultiplizieren|Distributivgesetz|binomische Formel/i);
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
  assert.match(files.home, /plus-minus-klammern\.html/);
  for (const file of ["plus-minus-klammern.html", "bracket-sign.css", "src/bracket-sign-app.js", "src/bracket-sign-math.js", "src/bracket-sign-state.js", "src/bracket-sign-animation.js"]) {
    assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  }
  assert.match(files.worker, /mathe-unterrichts-app-v43/);
});

test("Modul enthält keine Speicherung, Fremdaufrufe oder ausgeschlossenen Produktfunktionen", () => {
  const combined = [files.html, files.css, files.app, files.math, files.state, files.animation].join("\n");
  assert.doesNotMatch(combined, /localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest/);
  assert.doesNotMatch(combined, /login|account|tracking|analytics|werbung|punkte|highscore/i);
});
