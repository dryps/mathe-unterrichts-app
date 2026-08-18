import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  html: await readFile(new URL("../multiplikation-negativ.html", import.meta.url), "utf8"),
  css: await readFile(new URL("../multiplication-negative.css", import.meta.url), "utf8"),
  app: await readFile(new URL("../src/multiplication-negative-app.js", import.meta.url), "utf8"),
  geometry: await readFile(
    new URL("../src/multiplication-negative-geometry.js", import.meta.url),
    "utf8",
  ),
  state: await readFile(new URL("../src/multiplication-negative-state.js", import.meta.url), "utf8"),
  animation: await readFile(
    new URL("../src/multiplication-negative-animation.js", import.meta.url),
    "utf8",
  ),
  worker: await readFile(new URL("../sw.js", import.meta.url), "utf8"),
  workflow: await readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8"),
  package: JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")),
};
const visibleHtmlText = files.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

test("Irritation zeigt ausschließlich die offene Minus-mal-Minus-Frage", () => {
  assert.match(files.html, /<h1>Warum wird aus Minus mal Minus Plus\?<\/h1>/);
  assert.match(files.html, /<p class="subtitle">Multiplikation negativer Zahlen<\/p>/);
  assert.match(files.html, /\(−1\) · \(−2\) = \?/);
  assert.match(files.html, /Warum sollte das Ergebnis positiv werden\?/);
  assert.match(files.html, /id="multiplication-pattern"[^>]*hidden/);
  assert.match(files.html, /id="multiplication-board"[^>]*hidden/);
  assert.doesNotMatch(files.html, /Richtig|Falsch|Antwort auswählen|Quiz/);
});

test("bekanntes Muster enthält die vier verbindlichen Rechnungen und getrennte Plus-zwei-Schritte", () => {
  for (const equation of [
    "3 · (−2) = −6",
    "2 · (−2) = −4",
    "1 · (−2) = −2",
    "0 · (−2) = 0",
  ]) {
    assert.equal(visibleHtmlText.includes(equation), true, equation);
  }
  assert.equal((files.html.match(/class="pattern-step"/g) ?? []).length, 3);
  assert.equal((files.html.match(/>\+2<\/span>/g) ?? []).length, 4);
  assert.match(files.html, /Der erste Faktor wird jedes Mal um 1 kleiner/);
  assert.match(files.html, /Das Ergebnis wird jedes Mal um 2 größer/);
});

test("Nullübergang, Bestätigung und Merksatz sind vorhanden aber anfangs verborgen", () => {
  assert.match(files.html, /id="multiplication-crossing"[^>]*hidden/);
  assert.match(files.html, /0 → 2/);
  assert.match(files.html, /\(−1\) · \(−2\) = 2/);
  assert.match(files.html, /id="multiplication-confirmation"[^>]*hidden/);
  assert.match(files.html, /\(−2\) · \(−2\) = 4/);
  assert.match(files.html, /\(−3\) · \(−2\) = 6/);
  assert.match(files.html, /id="multiplication-secondary-rule"[^>]*hidden/);
  assert.match(files.html, /negativ · negativ → positiv/);
});

test("freie Erkundung besitzt genau einen horizontalen Ganzzahlregler und festen zweiten Faktor", () => {
  assert.match(files.html, /id="multiplication-factor-layer"[^>]*visibility="hidden"/);
  assert.match(files.html, /id="multiplication-first-factor-handle"/);
  assert.match(files.html, /role="slider"/);
  assert.match(files.html, /aria-valuemin="-4" aria-valuemax="4" aria-valuenow="-1"/);
  assert.match(files.html, /Zweiter Faktor: fest −2/);
  assert.equal((files.html.match(/role="slider"/g) ?? []).length, 1);
  assert.doesNotMatch(files.html, /<input|type="range"/);
});

test("Abschlusserkenntnis priorisiert das fortlaufende Muster vor dem Merksatz", () => {
  assert.match(files.html, /id="multiplication-conclusion"[^>]*hidden/);
  assert.match(files.html, /<strong>Das Muster läuft über die Null weiter\.<\/strong>/);
  assert.match(files.html, /Deshalb wird negativ · negativ positiv\./);
});

test("Bedienung bleibt auf Weiter, Zurücksetzen, Rücklink und ersten Faktor begrenzt", () => {
  assert.equal((files.html.match(/<button/g) ?? []).length, 2);
  assert.match(files.html, /← Rationale Zahlen/);
  assert.doesNotMatch(files.html, /Suche|Einstellungen|Favoriten|Statistik|Anmelden/);
});

test("Pointer Events, Tastatur und CSS schützen horizontales Ziehen ohne Seitenscrollen", () => {
  assert.match(files.app, /pointerdown/);
  assert.match(files.app, /pointermove/);
  assert.match(files.app, /pointercancel/);
  assert.match(files.app, /setPointerCapture/);
  assert.match(files.app, /xToFirstFactor\(x\)/);
  assert.match(files.app, /ArrowLeft/);
  assert.match(files.app, /ArrowRight/);
  assert.doesNotMatch(files.app, /touchstart|mousedown/);
  assert.match(files.css, /\.multiplication-board[\s\S]*touch-action:\s*none/);
  assert.match(files.css, /overflow-x:\s*clip/);
});

test("Mathematik, Zustand und Animation bleiben frei von DOM und SVG", () => {
  assert.doesNotMatch(files.geometry, /document|querySelector|requestAnimationFrame/);
  assert.doesNotMatch(files.state, /document|querySelector|requestAnimationFrame/);
  assert.doesNotMatch(files.animation, /document|querySelector/);
});

test("Responsive Regeln schützen iPad, kleine Breite, Querformat und Klassenraum", () => {
  assert.match(files.css, /@media \(max-width:\s*900px\)/);
  assert.match(files.css, /@media \(max-width:\s*520px\)/);
  assert.match(files.css, /@media \(orientation:\s*landscape\)/);
  assert.match(files.css, /@media \(min-width:\s*1500px\)/);
  assert.doesNotMatch(files.css, /overflow:\s*visible/);
});

test("Modul enthält keine Speicherung, Schülerdaten, Analyse oder externen Laufzeitaufruf", () => {
  const runtime = Object.values(files).join("\n");
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.doesNotMatch(runtime, /analytics|telemetry|track\(/i);
  assert.doesNotMatch(runtime, /Schüler|Name eingeben|Klasse speichern/);
  assert.doesNotMatch(runtime, /(?:src|href)=["'`]https?:\/\/|fetch\(\s*["'`]https?:\/\//);
});

test("Offline-Cache und Pages-Gate enthalten das vollständige Modul auf Version 21", () => {
  for (const file of [
    "multiplikation-negativ.html",
    "multiplication-negative.css",
    "src/multiplication-negative-app.js",
    "src/multiplication-negative-animation.js",
    "src/multiplication-negative-geometry.js",
    "src/multiplication-negative-state.js",
  ]) {
    assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  }
  assert.match(files.worker, /mathe-unterrichts-app-v45/);
  assert.equal(
    files.package.scripts["test:multiplication-visual"],
    "node scripts/render-multiplication-negative-states.mjs",
  );
  assert.match(files.workflow, /npm run test:multiplication-visual/);
});
