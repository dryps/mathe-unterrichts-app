import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  home: await readFile(new URL("../index.html", import.meta.url), "utf8"),
  homeCss: await readFile(new URL("../home.css", import.meta.url), "utf8"),
  navigationCss: await readFile(new URL("../navigation.css", import.meta.url), "utf8"),
  shell: await readFile(new URL("../src/shell.js", import.meta.url), "utf8"),
  angles: await readFile(new URL("../winkelsumme.html", import.meta.url), "utf8"),
  inequality: await readFile(new URL("../dreiecksungleichung.html", import.meta.url), "utf8"),
  area: await readFile(new URL("../dreiecksflaeche.html", import.meta.url), "utf8"),
  circumcircle: await readFile(
    new URL("../mittelsenkrechten.html", import.meta.url),
    "utf8",
  ),
  worker: await readFile(new URL("../sw.js", import.meta.url), "utf8"),
  manifest: await readFile(new URL("../manifest.webmanifest", import.meta.url), "utf8"),
};

test("Startseite zeigt die verbindliche Hierarchie für Klasse 7 und Kapitel 2", () => {
  assert.match(files.home, /<h1>Mathe im Unterricht<\/h1>/);
  assert.match(files.home, /Interaktive Aha-Momente/);
  assert.match(files.home, /<p class="grade-label">Klasse 7<\/p>/);
  assert.equal((files.home.match(/class="chapter"/g) ?? []).length, 1);
  assert.match(files.home, /<h2 id="chapter-title">2\. Dreiecke<\/h2>/);
  assert.doesNotMatch(files.home, /Private Unterrichts-App|>Kapitel</);
  assert.doesNotMatch(files.home, /Rationale Zahlen|Klasse 8|Klasse 9|Klassenauswahl/);
  assert.doesNotMatch(files.home, /<ul|<ol/);
});

test("Startseite enthält genau die vier angenommenen großen Modulkarten", () => {
  assert.equal((files.home.match(/class="module-card"/g) ?? []).length, 4);
  assert.match(files.home, /href="\.\/winkelsumme\.html"/);
  assert.match(files.home, /Warum bleiben es immer 180°\?/);
  assert.match(files.home, /<span class="module-subtitle">Winkelsumme<\/span>/);
  assert.match(files.home, /href="\.\/dreiecksungleichung\.html"/);
  assert.match(files.home, /Wann kann überhaupt ein Dreieck entstehen\?/);
  assert.match(files.home, /<span class="module-subtitle">Dreiecksungleichung<\/span>/);
  assert.match(files.home, /href="\.\/dreiecksflaeche\.html"/);
  assert.match(files.home, /Warum wird bei der Dreiecksfläche durch 2 geteilt\?/);
  assert.match(files.home, /<span class="module-subtitle">Flächeninhalt<\/span>/);
  assert.match(files.home, /href="\.\/mittelsenkrechten\.html"/);
  assert.match(files.home, /Warum treffen sich die Mittelsenkrechten genau dort\?/);
  assert.match(
    files.home,
    /<span class="module-subtitle">Mittelsenkrechten und Umkreis<\/span>/,
  );
  assert.equal((files.home.match(/class="module-status"/g) ?? []).length, 4);
  assert.equal((files.home.match(/fertig/g) ?? []).length, 4);
});

test("Alle Module führen ausschließlich zur Übersicht Dreiecke zurück", () => {
  for (const module of [
    files.angles,
    files.inequality,
    files.area,
    files.circumcircle,
  ]) {
    assert.equal((module.match(/class="module-navigation"/g) ?? []).length, 1);
    assert.match(module, /class="module-back-link" href="\.\/#dreiecke">← Dreiecke<\/a>/);
    assert.doesNotMatch(module, /Suche|Einstellungen|Favoriten|Statistik|Anmelden/);
  }
});

test("Startseite ist für iPad, Querformat und Klassenraumbildschirm ausgelegt", () => {
  assert.match(files.homeCss, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(files.homeCss, /@media \(max-width: 720px\)/);
  assert.match(files.homeCss, /@media \(orientation: landscape\)/);
  assert.match(files.homeCss, /width: min\(100%, 1280px\)/);
  assert.match(files.homeCss, /min-height: clamp\(220px, 28vw, 330px\)/);
  assert.match(files.homeCss, /\.grade-label/);
  assert.match(files.navigationCss, /min-height: 46px/);
  assert.equal(JSON.parse(files.manifest).display, "standalone");
  assert.equal(JSON.parse(files.manifest).start_url, "./");
});

test("Gemeinsamer Offline-Cache enthält Übersicht, Navigation und alle vier Module", () => {
  for (const file of [
    "index.html",
    "home.css",
    "navigation.css",
    "src/shell.js",
    "winkelsumme.html",
    "styles.css",
    "src/app.js",
    "src/geometry.js",
    "dreiecksungleichung.html",
    "triangle-inequality.css",
    "src/triangle-inequality-app.js",
    "src/triangle-inequality-geometry.js",
    "dreiecksflaeche.html",
    "triangle-area.css",
    "src/triangle-area-app.js",
    "src/triangle-area-animation.js",
    "src/triangle-area-geometry.js",
    "src/triangle-area-state.js",
    "mittelsenkrechten.html",
    "circumcircle.css",
    "src/circumcircle-app.js",
    "src/circumcircle-geometry.js",
    "src/circumcircle-state.js",
    "manifest.webmanifest",
    "icon.svg",
  ]) {
    assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  }
  assert.match(files.shell, /serviceWorker\.register/);
  assert.match(files.worker, /mathe-unterrichts-app-v7/);
});

test("App-Struktur führt keine Speicherung oder externen Laufzeitaufrufe ein", () => {
  const runtime = [
    files.home,
    files.homeCss,
    files.navigationCss,
    files.shell,
    files.angles,
    files.inequality,
    files.area,
    files.circumcircle,
    files.worker,
  ].join("\n");
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.doesNotMatch(runtime, /analytics|telemetry|track\(/i);
  assert.doesNotMatch(
    runtime,
    /(?:src|href)=["']https?:\/\/|fetch\(\s*["'`]https?:\/\//,
  );
});
