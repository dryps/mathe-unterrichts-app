import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  html: await readFile(new URL("../mittelsenkrechten.html", import.meta.url), "utf8"),
  css: await readFile(new URL("../circumcircle.css", import.meta.url), "utf8"),
  app: await readFile(new URL("../src/circumcircle-app.js", import.meta.url), "utf8"),
  geometry: await readFile(
    new URL("../src/circumcircle-geometry.js", import.meta.url),
    "utf8",
  ),
  state: await readFile(new URL("../src/circumcircle-state.js", import.meta.url), "utf8"),
  worker: await readFile(new URL("../sw.js", import.meta.url), "utf8"),
};

test("Modul zeigt Leitfrage, Untertitel und die fünf eindeutigen Punktnamen", () => {
  assert.match(files.html, /Warum treffen sich die Mittelsenkrechten genau dort\?/);
  assert.match(files.html, /<p class="subtitle">Mittelsenkrechten und Umkreis<\/p>/);
  for (const label of ["A", "B", "C", "P", "M"]) {
    assert.match(files.html, new RegExp(`>${label}<\\/text>`));
  }
});

test("Ausgangselemente enthalten AB, Mittelpunkt, Mittelsenkrechte, P und PA = PB", () => {
  assert.match(files.html, /id="side-ab"/);
  assert.match(files.html, /id="midpoint-1"/);
  assert.match(files.html, /id="bisector-line-1"/);
  assert.match(files.html, /id="test-point-handle"/);
  assert.match(files.html, /id="distance-pa"/);
  assert.match(files.html, /id="distance-pb"/);
  assert.match(files.html, />PA = PB<\/text>/);
});

test("Schnittpunkt und Umkreis sind vorhanden, aber anfangs verborgen", () => {
  assert.match(files.html, /id="bisector-2" visibility="hidden"/);
  assert.match(files.html, /id="bisector-3" visibility="hidden"/);
  assert.match(files.html, /id="center-group" visibility="hidden"/);
  assert.match(files.html, /id="circumcircle" class="circumcircle" visibility="hidden"/);
  assert.match(files.html, /MA = MB = MC/);
});

test("nur die vereinbarten Navigationselemente und zwei Schaltflächen sind vorhanden", () => {
  assert.equal((files.html.match(/<button/g) ?? []).length, 2);
  assert.match(files.html, />\s*Nächste Mittelsenkrechte\s*<\/button>/);
  assert.match(files.state, /"Umkreis zeigen"/);
  assert.match(files.html, />\s*Zurücksetzen\s*<\/button>/);
  assert.match(files.html, /href="\.\/#dreiecke">← Dreiecke<\/a>/);
  assert.doesNotMatch(files.html, /<input|<select|Quiz|Aufgabe|Menü/);
});

test("je Zustand wird genau der passende Erkenntnissatz ausgewählt", () => {
  assert.match(
    files.state,
    /Jeder Punkt auf der Mittelsenkrechten ist von beiden Endpunkten gleich weit entfernt\./,
  );
  assert.match(
    files.state,
    /Der Schnittpunkt ist von allen drei Eckpunkten gleich weit entfernt\./,
  );
  assert.match(files.state, /Deshalb ist M der Mittelpunkt des Umkreises\./);
  assert.equal((files.html.match(/class="insight-text"/g) ?? []).length, 1);
});

test("Touch und Maus verwenden denselben Pointer-Event-Pfad ohne Scrollen beim Ziehen", () => {
  assert.match(files.app, /pointerdown/);
  assert.match(files.app, /pointermove/);
  assert.match(files.app, /pointerup/);
  assert.match(files.app, /pointercancel/);
  assert.match(files.app, /setPointerCapture/);
  assert.doesNotMatch(files.app, /touchstart|mousedown/);
  assert.match(files.css, /touch-action: none/);
  assert.match(files.css, /overscroll-behavior: none/);
});

test("Geometrie, Zustand und Darstellung bleiben getrennt", () => {
  assert.doesNotMatch(files.geometry, /document|querySelector|requestAnimationFrame/);
  assert.doesNotMatch(files.state, /document|querySelector|setAttribute/);
  assert.match(files.app, /circumcircleViewModel/);
  assert.match(files.state, /buildCircumcircleGeometry/);
  assert.match(files.geometry, /circumcenter/);
});

test("Hochformat, Querformat, kleine Breite und Klassenraumbildschirm besitzen Regeln", () => {
  assert.match(files.html, /viewBox="0 0 1200 760"/);
  assert.match(files.css, /@media \(max-width: 760px\)/);
  assert.match(files.css, /@media \(max-width: 520px\)/);
  assert.match(files.css, /@media \(orientation: landscape\)/);
  assert.match(files.css, /@media \(min-width: 1500px\)/);
  assert.match(files.css, /\.circumcircle-board[\s\S]*touch-action: none/);
});

test("Offline-Cache enthält das vollständige vierte Modul im gemeinsamen Cache", () => {
  for (const file of [
    "mittelsenkrechten.html",
    "circumcircle.css",
    "src/circumcircle-app.js",
    "src/circumcircle-geometry.js",
    "src/circumcircle-state.js",
  ]) {
    assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  }
  assert.match(files.worker, /mathe-unterrichts-app-v21/);
  assert.match(files.app, /serviceWorker\.register/);
});

test("Modul enthält keine Zahlenanzeigen, Aufgaben, Speicherung oder externen Aufrufe", () => {
  const runtime = Object.values(files).join("\n");
  assert.doesNotMatch(files.html, /Koordinate|Seitenlänge|Radius =|Berechne|Aufgabe|Quiz/);
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.doesNotMatch(runtime, /analytics|telemetry|track\(/i);
  assert.doesNotMatch(
    runtime,
    /(?:src|href)=["']https?:\/\/|fetch\(\s*["'`]https?:\/\//,
  );
});
