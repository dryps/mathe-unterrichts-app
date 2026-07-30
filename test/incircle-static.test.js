import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  html: await readFile(new URL("../winkelhalbierende.html", import.meta.url), "utf8"),
  css: await readFile(new URL("../incircle.css", import.meta.url), "utf8"),
  app: await readFile(new URL("../src/incircle-app.js", import.meta.url), "utf8"),
  geometry: await readFile(
    new URL("../src/incircle-geometry.js", import.meta.url),
    "utf8",
  ),
  state: await readFile(new URL("../src/incircle-state.js", import.meta.url), "utf8"),
  worker: await readFile(new URL("../sw.js", import.meta.url), "utf8"),
};

test("Modul zeigt Leitfrage, Untertitel und die fünf eindeutigen Punktnamen", () => {
  assert.match(files.html, /Warum treffen sich die Winkelhalbierenden genau dort\?/);
  assert.match(files.html, /<p class="subtitle">Winkelhalbierende und Inkreis<\/p>/);
  for (const label of ["A", "B", "C", "P", "I"]) {
    assert.match(files.html, new RegExp(`>${label}<\\/text>`));
  }
});

test("Ausgangselemente enthalten Winkel bei A, P, Lotfüße und rechte Winkel", () => {
  assert.match(files.html, /id="angle-a-first"/);
  assert.match(files.html, /id="angle-a-second"/);
  assert.match(files.html, /id="angle-a-mark-first"/);
  assert.match(files.html, /id="angle-a-mark-second"/);
  assert.match(files.html, /id="test-point-handle"/);
  assert.match(files.html, /id="test-lot-ab"/);
  assert.match(files.html, /id="test-lot-ac"/);
  assert.match(files.html, /id="test-foot-ab"/);
  assert.match(files.html, /id="test-foot-ac"/);
  assert.match(files.html, /id="test-right-ab"/);
  assert.match(files.html, /id="test-right-ac"/);
  assert.match(files.html, /id="test-mark-ab"/);
  assert.match(files.html, /id="test-mark-ac"/);
});

test("I, weitere Winkelhalbierende und Inkreis sind vorhanden, aber anfangs verborgen", () => {
  assert.match(files.html, /id="bisector-2" visibility="hidden"/);
  assert.match(files.html, /id="bisector-3" visibility="hidden"/);
  assert.match(files.html, /id="center-group" visibility="hidden"/);
  assert.match(files.html, /id="incircle" class="incircle" visibility="hidden"/);
  assert.match(files.html, /r = r = r/);
});

test("drei Radien besitzen Lotfüße, rechte Winkel, identische Marken und r", () => {
  for (const side of ["ab", "bc", "ca"]) {
    assert.match(files.html, new RegExp(`id="radius-${side}"`));
    assert.match(files.html, new RegExp(`id="touch-${side}"`));
    assert.match(files.html, new RegExp(`id="center-right-${side}"`));
    assert.match(files.html, new RegExp(`id="radius-mark-${side}"`));
    assert.match(files.html, new RegExp(`id="radius-label-${side}"`));
  }
});

test("nur die vereinbarten Navigationselemente und drei Schaltflächenzustände existieren", () => {
  assert.equal((files.html.match(/<button/g) ?? []).length, 2);
  assert.match(files.html, />\s*Alle Winkelhalbierenden zeigen\s*<\/button>/);
  assert.match(files.state, /"Inkreis zeigen"/);
  assert.match(files.html, />\s*Zurücksetzen\s*<\/button>/);
  assert.match(files.html, /href="\.\/#dreiecke">← Dreiecke<\/a>/);
  assert.doesNotMatch(files.html, /<input|<select|Quiz|Aufgabe|Menü|Regler/);
});

test("je Zustand wird genau der passende Erkenntnissatz ausgewählt", () => {
  assert.match(
    files.state,
    /Jeder Punkt auf der Winkelhalbierenden ist von beiden Schenkeln gleich weit entfernt\./,
  );
  assert.match(files.state, /I ist von allen drei Seiten gleich weit entfernt\./);
  assert.match(files.state, /Deshalb ist I der Mittelpunkt des Inkreises\./);
  assert.equal((files.html.match(/class="insight-text"/g) ?? []).length, 1);
});

test("ruhige Abfolge ist rein visuell und sperrt Eingaben währenddessen", () => {
  assert.match(files.css, /reveal-bisector/);
  assert.match(files.css, /#bisector-3[\s\S]*230ms/);
  assert.match(files.app, /stepLocked/);
  assert.match(files.app, /previousView === INCIRCLE_VIEWS\.first \? 820 : 300/);
  assert.match(files.app, /nextButton\.disabled = stepLocked/);
  assert.doesNotMatch(files.geometry, /setTimeout|animation|document/);
});

test("Touch und Maus verwenden Pointer Events ohne Scrollen beim Ziehen", () => {
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
  assert.match(files.app, /incircleViewModel/);
  assert.match(files.state, /buildIncircleGeometry/);
  assert.match(files.geometry, /incenter/);
  assert.match(files.geometry, /projectPointToLine/);
});

test("Hochformat, Querformat, kleine Breite und Klassenraumbildschirm besitzen Regeln", () => {
  assert.match(files.html, /viewBox="0 0 1200 760"/);
  assert.match(files.css, /@media \(max-width: 760px\)/);
  assert.match(files.css, /@media \(max-width: 520px\)/);
  assert.match(files.css, /@media \(orientation: landscape\)/);
  assert.match(files.css, /@media \(min-width: 1500px\)/);
  assert.match(files.css, /\.incircle-board[\s\S]*touch-action: none/);
});

test("Offline-Cache enthält das vollständige fünfte Modul auf Version 8", () => {
  for (const file of [
    "winkelhalbierende.html",
    "incircle.css",
    "src/incircle-app.js",
    "src/incircle-geometry.js",
    "src/incircle-state.js",
  ]) {
    assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  }
  assert.match(files.worker, /mathe-unterrichts-app-v8/);
  assert.match(files.app, /serviceWorker\.register/);
});

test("Modul enthält keine Zahlenwerte, Aufgaben, Speicherung oder externen Aufrufe", () => {
  const runtime = Object.values(files).join("\n");
  assert.doesNotMatch(
    files.html,
    /Koordinate|Seitenlänge|Radius =|Winkel =|Berechne|Aufgabe|Quiz/,
  );
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.doesNotMatch(runtime, /analytics|telemetry|track\(/i);
  assert.doesNotMatch(
    runtime,
    /(?:src|href)=["']https?:\/\/|fetch\(\s*["'`]https?:\/\//,
  );
});
