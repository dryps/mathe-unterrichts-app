import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  html: await readFile(new URL("../eindeutige-dreiecke.html", import.meta.url), "utf8"),
  css: await readFile(new URL("../unique-triangles.css", import.meta.url), "utf8"),
  app: await readFile(
    new URL("../src/unique-triangles-app.js", import.meta.url),
    "utf8",
  ),
  animation: await readFile(
    new URL("../src/unique-triangles-animation.js", import.meta.url),
    "utf8",
  ),
  geometry: await readFile(
    new URL("../src/unique-triangles-geometry.js", import.meta.url),
    "utf8",
  ),
  state: await readFile(
    new URL("../src/unique-triangles-state.js", import.meta.url),
    "utf8",
  ),
  worker: await readFile(new URL("../sw.js", import.meta.url), "utf8"),
};

test("Modul zeigt Leitfrage, Untertitel und ausschließlich vereinbarte Bedienung", () => {
  assert.match(files.html, /Warum reichen manche Angaben aus – und andere nicht\?/);
  assert.match(files.html, /<p class="subtitle">Eindeutige Dreiecke<\/p>/);
  assert.equal((files.html.match(/<button/g) ?? []).length, 2);
  assert.match(files.html, />\s*Dreiecke vergleichen\s*<\/button>/);
  assert.match(files.state, /"Anderen Fall vergleichen"/);
  assert.match(files.html, />\s*Zurücksetzen\s*<\/button>/);
  assert.match(files.html, /href="\.\/#dreiecke">← Dreiecke<\/a>/);
  assert.doesNotMatch(files.html, /<input|<select|Regler|Quiz|Aufgabe/);
});

test("SSS-Aufbau enthält Bögen, beide Lagen, Schnittpunkte und Seitenmarken", () => {
  assert.match(files.html, /id="sss-arc-a"/);
  assert.match(files.html, /id="sss-arc-b"/);
  assert.match(files.html, /id="sss-upper-triangle"/);
  assert.match(files.html, /id="sss-lower-triangle"/);
  assert.match(files.html, /id="sss-upper-point"/);
  assert.match(files.html, /id="sss-lower-point"/);
  assert.match(files.html, /id="sss-base-mark-1"/);
  assert.match(files.html, /id="sss-upper-ac-mark"/);
  assert.match(files.html, /id="sss-lower-ac-mark"/);
  assert.match(files.html, /id="sss-label"/);
});

test("SSS wird erst nach dem ruhigen Aufbau eingeblendet", () => {
  assert.match(files.css, /\.is-building \.case-label/);
  assert.match(files.css, /reveal-label 360ms 900ms/);
});

test("Spiegelanimation ist ruhig, starr und mathematisch unabhängig", () => {
  assert.match(files.animation, /TRIANGLE_COMPARE_DURATION_MS = 1550/);
  assert.match(files.animation, /rotatePoint/);
  assert.match(files.animation, /animationPreservesSideLengths/);
  assert.match(files.app, /requestAnimationFrame/);
  assert.match(files.app, /finishTriangleComparison/);
  assert.match(
    files.app,
    /TRIANGLE_COMPARE_DURATION_MS \+ 120/,
  );
  assert.doesNotMatch(files.geometry, /requestAnimationFrame|setTimeout|document/);
  assert.doesNotMatch(files.animation, /document|querySelector|perspective|scale/);
});

test("Mehrdeutigkeitsfall enthält Strahl, Kreis, Winkel und beide Dreiecke", () => {
  assert.match(files.html, /id="ambiguity-circle"/);
  assert.match(files.html, /id="ambiguity-ray"/);
  assert.match(files.html, /id="ambiguity-angle-arc"/);
  assert.match(files.html, /id="ambiguity-near-triangle"/);
  assert.match(files.html, /id="ambiguity-far-triangle"/);
  assert.match(files.html, /id="ambiguity-near-point"/);
  assert.match(files.html, /id="ambiguity-far-point"/);
  assert.match(files.html, /id="ambiguity-near-mark"/);
  assert.match(files.html, /id="ambiguity-far-mark"/);
});

test("Abschlussvergleich enthält nur die vereinbarten kompakten Aussagen", () => {
  assert.match(files.html, />Drei Seiten<\/text>/);
  assert.match(files.html, />eine Dreiecksform<\/text>/);
  assert.match(files.html, />Andere Anordnung<\/text>/);
  assert.match(files.html, /zwei mögliche Dreiecksformen/);
  assert.match(
    files.state,
    /Entscheidend ist nicht nur die Anzahl der Angaben, sondern wie sie zusammenliegen\./,
  );
});

test("Erkenntnissätze entsprechen exakt den vier didaktischen Zuständen", () => {
  for (const sentence of [
    "Drei Seitenlängen bestimmen die Dreiecksform eindeutig.",
    "Zwei mögliche Lagen, aber nur eine Dreiecksform.",
    "Dieselben Angaben können zwei verschiedene Dreiecke erlauben.",
    "Entscheidend ist nicht nur die Anzahl der Angaben, sondern wie sie zusammenliegen.",
  ]) {
    assert.match(files.state, new RegExp(sentence.replaceAll(".", "\\.")));
  }
  assert.equal((files.html.match(/class="insight-text"/g) ?? []).length, 1);
});

test("Spiegelanimation ist gesperrt und der zweite Fall bleibt zurücksetzbar", () => {
  assert.match(files.state, /locked: true/);
  assert.match(files.state, /view: UNIQUE_VIEWS\.ambiguity, locked: false/);
  assert.match(files.app, /nextButton\.disabled = model\.controlsLocked/);
  assert.match(files.app, /resetButton\.disabled = model\.controlsLocked/);
  assert.match(files.app, /state\.locked/);
  assert.match(files.app, /clearTimeout\(summaryTimer\)/);
  assert.match(files.app, /cancelAnimationFrame/);
});

test("Geometrie, Zustand, Animation und Darstellung bleiben getrennt", () => {
  assert.doesNotMatch(files.geometry, /document|querySelector|setAttribute/);
  assert.doesNotMatch(files.state, /document|querySelector|setAttribute|setTimeout/);
  assert.doesNotMatch(files.animation, /document|querySelector|setAttribute/);
  assert.match(files.app, /uniqueTrianglesViewModel/);
  assert.match(files.geometry, /circleCircleIntersections/);
  assert.match(files.geometry, /rayCircleIntersections/);
  assert.match(files.geometry, /reflectPointAcrossLine/);
  assert.match(files.geometry, /trianglesCongruent/);
});

test("Darstellung besitzt Regeln für Hochformat, Querformat, kleine Breite und Großbild", () => {
  assert.match(files.html, /viewBox="0 0 1200 760"/);
  assert.match(files.css, /@media \(max-width: 760px\)/);
  assert.match(files.css, /@media \(max-width: 520px\)/);
  assert.match(files.css, /@media \(orientation: landscape\)/);
  assert.match(files.css, /@media \(min-width: 1500px\)/);
  assert.doesNotMatch(files.css, /overflow:\s*visible/);
});

test("Offline-Cache enthält das sechste Modul vollständig auf Version 12", () => {
  for (const file of [
    "eindeutige-dreiecke.html",
    "unique-triangles.css",
    "src/unique-triangles-app.js",
    "src/unique-triangles-animation.js",
    "src/unique-triangles-geometry.js",
    "src/unique-triangles-state.js",
  ]) {
    assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  }
  assert.match(files.worker, /mathe-unterrichts-app-v44/);
  assert.match(files.app, /serviceWorker\.register/);
});

test("Modul zeigt keine Zahlenwerte, Aufgaben, Speicherung oder externen Aufrufe", () => {
  const runtime = Object.values(files).join("\n");
  assert.doesNotMatch(
    files.html,
    /Koordinate|Seitenlänge\s*=|Winkel\s*=|Berechne|Aufgabe|Quiz|Sinussatz/,
  );
  assert.doesNotMatch(files.html, /SSW ist kein Kongruenzsatz/);
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.doesNotMatch(runtime, /analytics|telemetry|track\(/i);
  assert.doesNotMatch(
    runtime,
    /(?:src|href)=["']https?:\/\/|fetch\(\s*["'`]https?:\/\//,
  );
});
