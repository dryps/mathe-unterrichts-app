import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  html: await readFile(new URL("../subtraktion-negativ.html", import.meta.url), "utf8"),
  css: await readFile(new URL("../subtraction-negative.css", import.meta.url), "utf8"),
  app: await readFile(new URL("../src/subtraction-negative-app.js", import.meta.url), "utf8"),
  geometry: await readFile(new URL("../src/subtraction-negative-geometry.js", import.meta.url), "utf8"),
  state: await readFile(new URL("../src/subtraction-negative-state.js", import.meta.url), "utf8"),
  animation: await readFile(new URL("../src/subtraction-negative-animation.js", import.meta.url), "utf8"),
  worker: await readFile(new URL("../sw.js", import.meta.url), "utf8"),
  workflow: await readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8"),
  package: JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")),
};

test("Irritation enthält nur offene Frage und noch keine Zahlengerade", () => {
  assert.match(files.html, /4 − \(−2\) = \?/);
  assert.match(files.html, /Warum führen zwei Minuszeichen hier nach rechts\?/);
  assert.match(files.html, /id="subtraction-axis-layer" visibility="hidden"/);
  assert.doesNotMatch(files.html, /Richtig|Falsch|Antwort auswählen/);
});

test("äußeres Rechenzeichen und inneres Vorzeichen sind getrennte Elemente", () => {
  assert.match(files.html, /id="subtraction-operator"> − <\/tspan>/);
  assert.match(files.html, /id="subtraction-sign">−<\/tspan>/);
  assert.match(files.html, /id="subtraction-magnitude">2<\/tspan>/);
  assert.match(files.css, /#subtraction-operator\.is-highlighted/);
  assert.match(files.css, /#subtraction-sign\.is-highlighted/);
  assert.match(files.css, /#subtraction-magnitude\.is-highlighted/);
});

test("Originalrichtung, Umkehrung und tatsächliche Bewegung sind getrennte Ebenen", () => {
  for (const id of [
    "subtraction-original-vector",
    "subtraction-reversal-vector",
    "subtraction-effective-vector",
    "subtraction-moving-point",
    "subtraction-result-point",
  ]) {
    assert.match(files.html, new RegExp(`id="${id}"`));
  }
  assert.match(files.html, /id="subtraction-original-arrowhead"/);
  assert.match(files.html, /id="subtraction-reversal-arrowhead"/);
  assert.match(files.html, /id="subtraction-effective-arrowhead"/);
});

test("Zahlengerade enthält Start vier und alle zulässigen Original- und Endwerte", () => {
  for (let value = 0; value <= 8; value += 1) {
    assert.match(files.html, new RegExp(`data-subtraction-value="${value}"`));
  }
  assert.match(files.html, /id="subtraction-start-point"/);
  assert.match(files.html, /id="subtraction-end-handle"/);
  assert.match(files.html, /aria-valuemin="-4" aria-valuemax="-1" aria-valuenow="-2"/);
});

test("Ergebnisfolge und Abschlusserkenntnis sind vorhanden aber anfangs verborgen", () => {
  assert.match(files.html, /id="subtraction-equation-one"/);
  assert.match(files.html, /id="subtraction-equation-two"/);
  assert.match(files.html, /id="subtraction-equation-three"/);
  assert.match(files.html, /Subtrahieren kehrt die Richtung um\./);
  assert.match(files.html, /Darum wird aus „minus negativ“ eine Bewegung nach rechts\./);
});

test("Bedienung bleibt auf Weiter, Zurücksetzen, Rücklink und Pfeilende begrenzt", () => {
  assert.equal((files.html.match(/<button/g) ?? []).length, 2);
  assert.match(files.html, /← Rationale Zahlen/);
  assert.doesNotMatch(files.html, /<input|type="range"|Quiz|Aufgabe|Bewertung|Menü/);
});

test("Pointer Events schützen Touch, Maus, vertikale Bewegung und Browser-Scrollen", () => {
  assert.match(files.app, /pointerdown/);
  assert.match(files.app, /pointermove/);
  assert.match(files.app, /setPointerCapture/);
  assert.match(files.app, /xToNegativeSubtrahend\(x\)/);
  assert.doesNotMatch(files.app, /xToNegativeSubtrahend\([^x]/);
  assert.match(files.css, /\.subtraction-board[\s\S]*touch-action:\s*none/);
});

test("Pfeilflächen schließen an gerade Linienenden ohne Achse im Pfeil an", () => {
  assert.match(files.css, /\.vector-line[\s\S]*stroke-linecap:\s*butt/);
  assert.match(files.css, /\.vector-arrowhead[\s\S]*fill:/);
  assert.match(files.html, /<path[^>]+class="vector-arrowhead/);
});

test("Mathematik, Zustand und Animation bleiben frei von DOM und SVG", () => {
  assert.doesNotMatch(files.geometry, /document|querySelector|requestAnimationFrame/);
  assert.doesNotMatch(files.state, /document|querySelector|requestAnimationFrame/);
  assert.doesNotMatch(files.animation, /document|querySelector/);
});

test("Modul enthält keine Speicherung, Fremdaufrufe oder ausgeschlossenen Modelle", () => {
  const runtime = Object.values(files).join("\n");
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.doesNotMatch(runtime, /analytics|telemetry|track\(/i);
  assert.doesNotMatch(runtime, /(?:src|href)=["'`]https?:\/\/|fetch\(\s*["'`]https?:\/\//);
  assert.doesNotMatch(files.html, /Temperatur|Schulden|Aufzug|Koordinatensystem|Multiplikation|Division/);
});

test("Responsive Regeln schützen Hochformat, Querformat, kleine Breite und Klassenraum", () => {
  assert.match(files.css, /@media \(max-width:\s*760px\)/);
  assert.match(files.css, /@media \(max-width:\s*520px\)/);
  assert.match(files.css, /@media \(orientation:\s*landscape\)/);
  assert.match(files.css, /@media \(min-width:\s*1500px\)/);
  assert.doesNotMatch(files.css, /overflow:\s*visible/);
});

test("Offline-Cache und Pages-Gate enthalten Modul und Zustandsrenderer auf Version 21", () => {
  for (const file of [
    "subtraktion-negativ.html",
    "subtraction-negative.css",
    "src/subtraction-negative-app.js",
    "src/subtraction-negative-animation.js",
    "src/subtraction-negative-geometry.js",
    "src/subtraction-negative-state.js",
  ]) {
    assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  }
  assert.match(files.worker, /mathe-unterrichts-app-v36/);
  assert.equal(
    files.package.scripts["test:subtraction-visual"],
    "node scripts/render-subtraction-negative-states.mjs",
  );
  assert.match(files.workflow, /npm run test:subtraction-visual/);
});
