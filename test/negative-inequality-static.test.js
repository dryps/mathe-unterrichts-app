import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const files = {
  html: await read("ungleichungen-negativ.html"), css: await read("negative-inequality.css"), app: await read("src/negative-inequality-app.js"),
  math: await read("src/negative-inequality-math.js"), state: await read("src/negative-inequality-state.js"), animation: await read("src/negative-inequality-animation.js"),
};

test("Leitfrage, Untertitel, Beispiel und Aha sind wortgetreu vorhanden", () => {
  assert.match(files.html, /Warum dreht sich bei einer negativen Zahl das Ungleichheitszeichen um\?/);
  assert.match(files.html, /<p class="subtitle">Ungleichungen mit negativen Zahlen<\/p>/);
  assert.match(files.html, /2 &lt; 5/);
  assert.match(files.html, /−2 &gt; −5/);
  assert.match(files.html, /Negative Skalierung kehrt die Ordnung um\./);
});

test("eine einzige Zahlengerade besitzt Nullachse und zwei getrennte Punkte", () => {
  assert.equal((files.html.match(/class="reflection-line"/g) ?? []).length, 1);
  assert.equal((files.html.match(/class="number-point/g) ?? []).length, 2);
  assert.match(files.html, /id="negative-zero-axis"/);
  assert.match(files.html, /aria-label="Zahlengerade von minus acht bis acht"/);
});

test("Zahlengerade, Ergebnis, Erkundung und Schluss sind anfangs verborgen", () => {
  for (const id of ["negative-operation", "negative-line-stage", "negative-result", "negative-explore", "negative-conclusion"]) {
    assert.match(files.html, new RegExp(`id="${id}"[^>]*hidden`));
  }
  assert.match(files.html, /id="negative-base-control"[^>]*min="1"[^>]*max="4"[^>]*step="1"[^>]*value="2"/);
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
