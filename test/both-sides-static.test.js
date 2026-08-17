import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const files = {
  html: await read("terme-beide-seiten.html"), css: await read("both-sides.css"), app: await read("src/both-sides-app.js"),
  math: await read("src/both-sides-math.js"), state: await read("src/both-sides-state.js"), animation: await read("src/both-sides-animation.js"),
};

test("Leitfrage, Untertitel, Beispiel und Aha sind wortgetreu vorhanden", () => {
  assert.match(files.html, /Warum ist „rüberbringen“ eigentlich keine neue Rechenregel\?/);
  assert.match(files.html, /<p class="subtitle">Terme auf beiden Seiten<\/p>/);
  assert.match(files.html, /5x \+ 3 = 2x \+ 18/);
  assert.match(files.html, /„Rüberbringen“ ist verkürzte Schreibweise einer Äquivalenzumformung\./);
});

test("beide Seiten enthalten vorbereitete, gleichwertige gemeinsame x-Gruppen", () => {
  assert.equal((files.html.match(/class="shared-x-group/g) ?? []).length, 2);
  assert.equal((files.html.match(/class="shared-x-tile/g) ?? []).length, 8);
  assert.equal((files.html.match(/class="remaining-x-tile/g) ?? []).length, 3);
  assert.match(files.html, /id="both-sides-left-shared"/);
  assert.match(files.html, /id="both-sides-right-shared"/);
});

test("Ergebnis, Erkundung und Schluss bleiben bis zu ihren Zuständen verborgen", () => {
  for (const id of ["both-sides-reduced", "both-sides-explore", "both-sides-conclusion"]) assert.match(files.html, new RegExp(`id="${id}"[^>]*hidden`));
  assert.match(files.html, /id="both-sides-shared-control"[^>]*min="1"[^>]*max="4"[^>]*step="1"[^>]*value="2"/);
});

test("Bedienung bleibt auf Weiter, Zurücksetzen, Regler und Rücklink begrenzt", () => {
  assert.equal((files.html.match(/<button\b/g) ?? []).length, 2);
  assert.equal((files.html.match(/type="range"/g) ?? []).length, 1);
  assert.equal((files.html.match(/<a\b/g) ?? []).length, 1);
});

test("Controller-Selektoren sind vollständig mit dem HTML verbunden", () => {
  const selectors = [...files.app.matchAll(/\$\("#([^"\n]+)"\)/g)].map((match) => match[1]);
  assert.ok(selectors.length >= 15);
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
