import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  html: await readFile(new URL("../betrag.html", import.meta.url), "utf8"),
  css: await readFile(new URL("../absolute-value.css", import.meta.url), "utf8"),
  app: await readFile(new URL("../src/absolute-value-app.js", import.meta.url), "utf8"),
  geometry: await readFile(new URL("../src/absolute-value-geometry.js", import.meta.url), "utf8"),
  sharedGeometry: await readFile(new URL("../src/number-line-geometry.js", import.meta.url), "utf8"),
  animation: await readFile(new URL("../src/absolute-value-animation.js", import.meta.url), "utf8"),
  state: await readFile(new URL("../src/absolute-value-state.js", import.meta.url), "utf8"),
  worker: await readFile(new URL("../sw.js", import.meta.url), "utf8"),
};

test("Irritation enthält ausschließlich offene Betragsfrage ohne Zahlengerade", () => {
  assert.match(files.html, /\|−4\| = \?/);
  assert.match(files.html, /Was misst der Betrag eigentlich\?/);
  assert.match(files.html, /id="absolute-axis-layer" visibility="hidden"/);
  assert.match(files.html, /data-state="prompt"/);
  assert.doesNotMatch(files.html, /Richtig|Falsch|Antwort auswählen/);
});

test("Leitfrage, Untertitel und genau eine dominante Zahlengerade sind vorhanden", () => {
  assert.match(files.html, /Warum wird beim Betrag das Vorzeichen unwichtig\?/);
  assert.match(files.html, /<p class="subtitle">Abstand zur Null<\/p>/);
  assert.match(files.html, /id="absolute-axis"/);
  assert.match(files.html, /viewBox="0 0 1400 520"/);
  assert.equal((files.html.match(/<svg/g) ?? []).length, 1);
});

test("alle ganzen Werte liegen im Markup und Schlüsselwerte sind beschriftet", () => {
  for (let value = -6; value <= 6; value += 1) {
    assert.match(files.html, new RegExp('data-absolute-value="' + value + '"'));
  }
  assert.equal((files.html.match(/data-absolute-value=/g) ?? []).length, 13);
  for (const label of ["−6", "−4", ">0<", ">4<", "+6"]) {
    assert.ok(files.html.includes(label), label);
  }
});

test("Richtung, vier Abstandseinheiten und Gegenüberstellung sind getrennte Ebenen", () => {
  assert.match(files.html, /id="absolute-direction"[^>]*visibility="hidden"/);
  assert.match(files.html, /id="absolute-negative-distance"[^>]*visibility="hidden"/);
  assert.match(files.html, /id="absolute-positive-distance"[^>]*visibility="hidden"/);
  assert.match(files.html, /\|−4\| = 4/);
  assert.match(files.html, /\|−4\| = \|4\| = 4/);
  assert.match(files.app, /renderDistance\(negativeDistanceLine, negativeBoundaries, -4\)/);
});

test("freier Punkt besitzt exakte Grenzen und dynamische Betragsschreibweise", () => {
  assert.match(files.html, /aria-valuemin="-6"/);
  assert.match(files.html, /aria-valuemax="6"/);
  assert.match(files.html, /id="absolute-dynamic-formula-text"/);
  assert.match(files.app, /formatAbsoluteFormula\(state\.value\)/);
  assert.match(files.app, /distanceSegmentToZero\(value\)/);
});

test("nur Weiter, Zurücksetzen und Rücklink sind bedienbar", () => {
  assert.equal((files.html.match(/<button/g) ?? []).length, 2);
  assert.match(files.html, /id="absolute-next"[^>]*>Weiter<\/button>/);
  assert.match(files.html, /id="absolute-reset"[^>]*>Zurücksetzen<\/button>/);
  assert.match(files.html, /href="\.\/#rationale-zahlen">← Rationale Zahlen<\/a>/);
  assert.doesNotMatch(files.html, /<input|type="range"|Regler|Quiz|Aufgabe/);
});

test("Pointer Events verbinden Touch und Maus mit demselben Einrastpfad", () => {
  assert.match(files.app, /pointerdown/);
  assert.match(files.app, /pointermove/);
  assert.match(files.app, /setPointerCapture/);
  assert.match(files.app, /absoluteXToValue\(x\)/);
  assert.doesNotMatch(files.app, /touchstart|mousedown/);
  assert.match(files.css, /\.absolute-board[\s\S]*touch-action: none/);
  assert.match(files.css, /\.absolute-point-handle[\s\S]*touch-action: none/);
});

test("gemeinsame Skala wird wiederverwendet und Betragslogik bleibt rein", () => {
  assert.match(files.sharedGeometry, /createIntegerNumberLineScale/);
  assert.match(files.geometry, /createIntegerNumberLineScale/);
  assert.match(files.geometry, /export function absoluteValue/);
  assert.match(files.geometry, /export function distanceSegmentToZero/);
  assert.doesNotMatch(files.geometry, /document|querySelector|requestAnimationFrame/);
  assert.doesNotMatch(files.animation, /document|querySelector/);
  assert.doesNotMatch(files.state, /document|querySelector|requestAnimationFrame/);
});

test("Erkenntnissätze erklären Betrag ausschließlich als Abstand", () => {
  assert.match(files.state, /Das Vorzeichen zeigt die Richtung\./);
  assert.match(files.state, /Der Betrag misst den Abstand zur Null\./);
  assert.match(files.state, /Verschiedene Richtungen können denselben Abstand haben\./);
  assert.match(files.state, /wie weit eine Zahl von der Null entfernt ist/);
  assert.doesNotMatch(files.state, /Minus.*(?:streichen|weg)|Vorzeichen.*(?:streichen|weg)/i);
});

test("Responsive Regeln schützen Hochformat, Querformat, kleine Breite und Klassenraum", () => {
  assert.match(files.css, /@media \(max-width: 760px\)/);
  assert.match(files.css, /@media \(max-width: 520px\)/);
  assert.match(files.css, /@media \(orientation: landscape\)/);
  assert.match(files.css, /@media \(min-width: 1500px\)/);
  assert.match(files.css, /env\(safe-area-inset-top\)/);
  assert.doesNotMatch(files.css, /overflow:\s*visible/);
});

test("Offline-Cache enthält das vollständige Betragsmodul auf Version zwölf", () => {
  for (const file of [
    "betrag.html",
    "absolute-value.css",
    "src/absolute-value-app.js",
    "src/absolute-value-animation.js",
    "src/absolute-value-geometry.js",
    "src/absolute-value-state.js",
  ]) {
    assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  }
  assert.match(files.worker, /mathe-unterrichts-app-v21/);
  assert.match(files.app, /serviceWorker\.register/);
});

test("Modul enthält keine Speicherung, Fremdaufrufe oder ausgeschlossenen Funktionen", () => {
  const runtime = Object.values(files).join("\n");
  assert.doesNotMatch(files.html, /Addition|Subtraktion|Multiplikation|Temperatur|Schulden|Aufzug|Koordinatensystem|Dezimal|Bruch|Quiz|Bewertung/);
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.doesNotMatch(runtime, /analytics|telemetry|track\(/i);
  assert.doesNotMatch(runtime, /(?:src|href)=["'\x60]https?:\/\/|fetch\(\s*["'\x60]https?:\/\//);
});
