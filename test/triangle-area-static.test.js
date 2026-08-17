import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  html: await readFile(new URL("../dreiecksflaeche.html", import.meta.url), "utf8"),
  css: await readFile(new URL("../triangle-area.css", import.meta.url), "utf8"),
  app: await readFile(new URL("../src/triangle-area-app.js", import.meta.url), "utf8"),
  geometry: await readFile(
    new URL("../src/triangle-area-geometry.js", import.meta.url),
    "utf8",
  ),
  animation: await readFile(
    new URL("../src/triangle-area-animation.js", import.meta.url),
    "utf8",
  ),
  state: await readFile(new URL("../src/triangle-area-state.js", import.meta.url), "utf8"),
  worker: await readFile(new URL("../sw.js", import.meta.url), "utf8"),
};

test("Modul zeigt Titel, Untertitel, feste Grundseite, Höhe und rechten Winkel", () => {
  assert.match(files.html, /Warum wird bei der Dreiecksfläche durch 2 geteilt\?/);
  assert.match(files.html, /<p class="subtitle">Flächeninhalt<\/p>/);
  assert.match(files.html, /id="original-triangle"/);
  assert.match(files.html, /id="height-line"/);
  assert.match(files.html, /id="height-foot"/);
  assert.match(files.html, /id="right-angle"/);
  assert.match(files.html, />g<\/text>/);
  assert.match(files.html, />h<\/text>/);
});

test("nur die drei verbindlichen Bedienelemente sind vorhanden", () => {
  assert.equal((files.html.match(/<button/g) ?? []).length, 2);
  assert.match(files.html, />\s*Zweites Dreieck ergänzen\s*<\/button>/);
  assert.match(files.html, />\s*Zurücksetzen\s*<\/button>/);
  assert.match(files.html, /class="module-back-link" href="\.\/#dreiecke">← Dreiecke<\/a>/);
  assert.doesNotMatch(files.html, /Wiederholen|type="range"|<input|Drag-and-drop/);
});

test("Erkenntnissatz und Formeln sind vorhanden, aber anfangs verborgen", () => {
  assert.match(
    files.app,
    /Zwei gleiche Dreiecke bilden ein Parallelogramm\. Deshalb ist eines davon halb so groß\./,
  );
  assert.match(files.html, /id="area-formulas" class="area-formulas" hidden/);
  assert.match(files.html, /A<sub>Parallelogramm<\/sub> = g · h/);
  assert.match(files.html, /A<sub>Dreieck<\/sub> = \(g · h\) \/ 2/);
});

test("Pointer Events unterstützen Touch und Maus über denselben Pfad", () => {
  assert.match(files.app, /pointerdown/);
  assert.match(files.app, /pointermove/);
  assert.match(files.app, /pointerup/);
  assert.match(files.app, /setPointerCapture/);
  assert.doesNotMatch(files.app, /touchstart|mousedown/);
  assert.match(files.css, /touch-action: none/);
});

test("Animation und mathematische Enddarstellung sind getrennt", () => {
  assert.match(files.app, /copyAnimationFrame/);
  assert.match(files.app, /finishSupplement/);
  assert.match(files.app, /animatedCopy\.removeAttribute\("transform"\)/);
  assert.match(files.app, /setSvgVisibility\(completedCopy/);
  assert.match(files.state, /buildTriangleAreaGeometry/);
  assert.doesNotMatch(files.geometry, /requestAnimationFrame|document|querySelector/);
  assert.doesNotMatch(files.animation, /document|querySelector/);
});

test("Hochformat, Querformat, kleine Breite und Klassenraumbildschirm besitzen Regeln", () => {
  assert.match(files.html, /viewBox="0 0 1200 760"/);
  assert.match(files.css, /@media \(max-width: 760px\)/);
  assert.match(files.css, /@media \(max-width: 520px\)/);
  assert.match(files.css, /@media \(orientation: landscape\)/);
  assert.match(files.css, /@media \(min-width: 1500px\)/);
  assert.match(files.css, /\.apex-hit[\s\S]*pointer-events: all/);
});

test("Offline-Cache enthält das vollständige dritte Modul", () => {
  for (const file of [
    "dreiecksflaeche.html",
    "triangle-area.css",
    "src/triangle-area-app.js",
    "src/triangle-area-animation.js",
    "src/triangle-area-geometry.js",
    "src/triangle-area-state.js",
  ]) {
    assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  }
  assert.match(files.worker, /mathe-unterrichts-app-v25/);
  assert.match(files.app, /serviceWorker\.register/);
});

test("Modul enthält keine Zahlenaufgabe, Speicherung oder externen Laufzeitaufruf", () => {
  const runtime = Object.values(files).join("\n");
  assert.doesNotMatch(files.html, /Seitenlänge|Einheit|Quiz|Umfang|Berechne|Eingabe/);
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.doesNotMatch(runtime, /analytics|telemetry|track\(/i);
  assert.doesNotMatch(
    runtime,
    /(?:src|href)=["']https?:\/\/|fetch\(\s*["'`]https?:\/\//,
  );
});
