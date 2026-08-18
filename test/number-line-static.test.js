import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  html: await readFile(new URL("../zahlengerade.html", import.meta.url), "utf8"),
  css: await readFile(new URL("../number-line.css", import.meta.url), "utf8"),
  app: await readFile(new URL("../src/number-line-app.js", import.meta.url), "utf8"),
  geometry: await readFile(
    new URL("../src/number-line-geometry.js", import.meta.url),
    "utf8",
  ),
  animation: await readFile(
    new URL("../src/number-line-animation.js", import.meta.url),
    "utf8",
  ),
  state: await readFile(new URL("../src/number-line-state.js", import.meta.url), "utf8"),
  worker: await readFile(new URL("../sw.js", import.meta.url), "utf8"),
};

test("Modul zeigt ausschließlich Leitfrage, Untertitel und die dominante Zahlengerade", () => {
  assert.match(files.html, /Warum liegen negative Zahlen links von der Null\?/);
  assert.match(files.html, /<p class="subtitle">Zahlengerade<\/p>/);
  assert.match(files.html, /id="number-axis"/);
  assert.match(files.html, /viewBox="0 0 1200 520"/);
  assert.equal((files.html.match(/<svg/g) ?? []).length, 1);
});

test("Ausgangsmarkup zeigt nur null bis drei und verbirgt negative Markierungen", () => {
  assert.match(files.html, /id="negative-ticks" visibility="hidden"/);
  for (const value of [0, 1, 2, 3]) {
    assert.match(files.html, new RegExp(`class="number-tick[^\"]*" data-value="${value}"`));
  }
  assert.match(files.html, /transform="translate\(600 270\)"/);
  assert.match(files.html, /aria-valuenow="0"/);
});

test("nur Weiter, Zurücksetzen und der Rücklink sind bedienbar", () => {
  assert.equal((files.html.match(/<button/g) ?? []).length, 2);
  assert.match(files.html, /id="number-next"[^>]*>Weiter<\/button>/);
  assert.match(files.html, /id="number-reset"[^>]*>Zurücksetzen<\/button>/);
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
  assert.match(files.app, /xToValue\(x\)/);
  assert.doesNotMatch(files.app, /touchstart|mousedown/);
  assert.match(files.css, /\.number-board[\s\S]*touch-action: none/);
  assert.match(files.css, /\.number-point-handle[\s\S]*touch-action: none/);
});

test("Geometrie, Zustandsfolge, Animation und Darstellung bleiben getrennt", () => {
  assert.doesNotMatch(files.geometry, /document|querySelector|requestAnimationFrame/);
  assert.doesNotMatch(files.animation, /document|querySelector/);
  assert.doesNotMatch(files.state, /document|querySelector|requestAnimationFrame/);
  assert.match(files.app, /requestAnimationFrame/);
  assert.match(files.app, /finishNumberLineMotion/);
  assert.match(files.app, /renderPointAtValue/);
});

test("Erkenntnissätze folgen der vereinbarten Richtungserfahrung", () => {
  assert.match(files.state, /Nach rechts werden Zahlen größer\./);
  assert.match(files.state, /Die Zahlengerade verläuft in beide Richtungen\./);
  assert.match(
    files.state,
    /Positive und negative Zahlen beschreiben zwei entgegengesetzte Richtungen\./,
  );
  assert.doesNotMatch(files.state, /Links sind die negativen Zahlen/);
});

test("Hochformat, Querformat, kleine Breite und Klassenraumbildschirm besitzen Regeln", () => {
  assert.match(files.css, /@media \(max-width: 760px\)/);
  assert.match(files.css, /@media \(max-width: 520px\)/);
  assert.match(files.css, /@media \(orientation: landscape\)/);
  assert.match(files.css, /@media \(min-width: 1500px\)/);
  assert.match(files.css, /env\(safe-area-inset-top\)/);
  assert.doesNotMatch(files.css, /overflow:\s*visible/);
});

test("Offline-Cache enthält das vollständige Zahlengeradenmodul", () => {
  for (const file of [
    "zahlengerade.html",
    "number-line.css",
    "src/number-line-app.js",
    "src/number-line-animation.js",
    "src/number-line-geometry.js",
    "src/number-line-state.js",
  ]) {
    assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  }
  assert.match(files.worker, /mathe-unterrichts-app-v28/);
  assert.match(files.app, /serviceWorker\.register/);
});

test("Modul enthält keine Folgefunktion, Speicherung oder externen Laufzeitaufruf", () => {
  const runtime = Object.values(files).join("\n");
  assert.doesNotMatch(
    files.html,
    /Addition|Subtraktion|Betrag|Temperatur|Schulden|Aufzug|Koordinatensystem|Dezimal|Bruch|Quiz|Bewertung/,
  );
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.doesNotMatch(runtime, /analytics|telemetry|track\(/i);
  assert.doesNotMatch(
    runtime,
    /(?:src|href)=["']https?:\/\/|fetch\(\s*["'`]https?:\/\//,
  );
});
