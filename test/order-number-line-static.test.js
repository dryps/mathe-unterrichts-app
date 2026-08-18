import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  html: await readFile(new URL("../ordnung.html", import.meta.url), "utf8"),
  css: await readFile(new URL("../order-number-line.css", import.meta.url), "utf8"),
  app: await readFile(
    new URL("../src/order-number-line-app.js", import.meta.url),
    "utf8",
  ),
  geometry: await readFile(
    new URL("../src/order-number-line-geometry.js", import.meta.url),
    "utf8",
  ),
  sharedGeometry: await readFile(
    new URL("../src/number-line-geometry.js", import.meta.url),
    "utf8",
  ),
  animation: await readFile(
    new URL("../src/order-number-line-animation.js", import.meta.url),
    "utf8",
  ),
  state: await readFile(
    new URL("../src/order-number-line-state.js", import.meta.url),
    "utf8",
  ),
  worker: await readFile(new URL("../sw.js", import.meta.url), "utf8"),
};

test("Irritationszustand enthält ausschließlich Frage und neutrale Zahlen", () => {
  assert.match(files.html, /Welche Zahl ist größer\?/);
  assert.match(files.html, /<strong>−8<\/strong>/);
  assert.match(files.html, /<span>oder<\/span>/);
  assert.match(files.html, /<strong>−3<\/strong>/);
  assert.match(files.html, /id="order-axis-layer"[^>]*visibility="hidden"/);
  assert.match(files.html, /data-state="prompt"/);
  assert.doesNotMatch(files.html, /Richtig|Falsch|Antwort auswählen/);
});

test("Modul zeigt Leitfrage, Untertitel und genau eine dominante Zahlengerade", () => {
  assert.match(files.html, /Warum ist −8 kleiner als −3\?/);
  assert.match(files.html, /<p class="subtitle">Ordnung<\/p>/);
  assert.match(files.html, /id="order-axis"/);
  assert.match(files.html, /viewBox="0 0 1400 520"/);
  assert.equal((files.html.match(/<svg/g) ?? []).length, 1);
});

test("alle Ganzzahlmarken liegen im Markup und nur Schlüsselwerte sind beschriftet", () => {
  for (let value = -10; value <= 3; value += 1) {
    assert.match(files.html, new RegExp('data-order-value="' + value + '"'));
  }
  assert.equal((files.html.match(/data-order-value=/g) ?? []).length, 14);
  for (const label of ["−10", "−8", "−3", ">0<", "+3"]) {
    assert.ok(files.html.includes(label), label);
  }
});

test("Vergleich und freier Punkt sind im Ausgang verborgen", () => {
  assert.match(files.html, /id="order-comparison"[^>]*visibility="hidden"/);
  assert.match(files.html, /−8 &lt; −3/);
  assert.match(files.html, /id="order-point-control"[\s\S]*visibility="hidden"/);
  assert.match(files.html, /aria-valuemin="-10"/);
  assert.match(files.html, /aria-valuemax="3"/);
});

test("nur Weiter, Zurücksetzen und Rücklink sind bedienbar", () => {
  assert.equal((files.html.match(/<button/g) ?? []).length, 2);
  assert.match(files.html, /id="order-next"[^>]*>Weiter<\/button>/);
  assert.match(files.html, /id="order-reset"[^>]*>Zurücksetzen<\/button>/);
  assert.match(
    files.html,
    /class="module-back-link" href="\.\/#rationale-zahlen">← Rationale Zahlen<\/a>/,
  );
  assert.doesNotMatch(files.html, /<input|type="range"|Regler|Quiz|Aufgabe/);
});

test("Pointer Events verbinden Touch und Maus mit demselben Einrastpfad", () => {
  assert.match(files.app, /pointerdown/);
  assert.match(files.app, /pointermove/);
  assert.match(files.app, /pointerup/);
  assert.match(files.app, /setPointerCapture/);
  assert.match(files.app, /orderXToValue\(x\)/);
  assert.doesNotMatch(files.app, /touchstart|mousedown/);
  assert.match(files.css, /\.order-board[\s\S]*touch-action: none/);
  assert.match(files.css, /\.order-point-handle[\s\S]*touch-action: none/);
});

test("gemeinsame Komponente wird wiederverwendet und Modulzustand bleibt getrennt", () => {
  assert.match(files.sharedGeometry, /createIntegerNumberLineScale/);
  assert.match(files.geometry, /createIntegerNumberLineScale/);
  assert.doesNotMatch(files.geometry, /document|querySelector|requestAnimationFrame/);
  assert.doesNotMatch(files.animation, /document|querySelector/);
  assert.doesNotMatch(files.state, /document|querySelector|requestAnimationFrame/);
  assert.match(files.app, /requestAnimationFrame/);
  assert.match(files.app, /finishOrderNumberLineTransition/);
  assert.match(files.app, /renderPointAtValue/);
});

test("Erkenntnissätze tragen Position statt Zifferngröße als Erklärung", () => {
  assert.match(
    files.state,
    /Auf der Zahlengeraden liegen größere Zahlen weiter rechts\./,
  );
  assert.match(files.state, /−3 liegt weiter rechts und ist deshalb größer\./);
  assert.match(files.state, /Die Position auf der Zahlengeraden entscheidet\./);
  assert.match(files.state, /Weiter rechts bedeutet größer\./);
  assert.doesNotMatch(files.state, /8 ist größer als 3, also/);
});

test("Hochformat, Querformat, kleine Breite und Klassenraum besitzen Regeln", () => {
  assert.match(files.css, /@media \(max-width: 760px\)/);
  assert.match(files.css, /@media \(max-width: 520px\)/);
  assert.match(files.css, /@media \(orientation: landscape\)/);
  assert.match(files.css, /@media \(min-width: 1500px\)/);
  assert.match(files.css, /env\(safe-area-inset-top\)/);
  assert.doesNotMatch(files.css, /overflow:\s*visible/);
});

test("Offline-Cache enthält das vollständige Ordnungsmodul", () => {
  for (const file of [
    "ordnung.html",
    "order-number-line.css",
    "src/order-number-line-app.js",
    "src/order-number-line-animation.js",
    "src/order-number-line-geometry.js",
    "src/order-number-line-state.js",
  ]) {
    assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  }
  assert.match(files.worker, /mathe-unterrichts-app-v28/);
  assert.match(files.app, /serviceWorker\.register/);
});

test("Modul enthält keine ausgeschlossenen Funktionen oder externen Aufrufe", () => {
  const runtime = Object.values(files).join("\n");
  assert.doesNotMatch(
    files.html,
    /Addition|Subtraktion|Betrag|Temperatur|Schulden|Aufzug|Koordinatensystem|Dezimal|Bruch|Quiz|Bewertung|Punkte|Statistik/,
  );
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.doesNotMatch(runtime, /analytics|telemetry|track\(/i);
  assert.doesNotMatch(
    runtime,
    /(?:src|href)=["'\x60]https?:\/\/|fetch\(\s*["'\x60]https?:\/\//,
  );
});
