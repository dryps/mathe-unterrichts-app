import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  html: await readFile(new URL("../dreiecksungleichung.html", import.meta.url), "utf8"),
  app: await readFile(new URL("../src/triangle-inequality-app.js", import.meta.url), "utf8"),
  geometry: await readFile(
    new URL("../src/triangle-inequality-geometry.js", import.meta.url),
    "utf8",
  ),
  css: await readFile(new URL("../triangle-inequality.css", import.meta.url), "utf8"),
  worker: await readFile(new URL("../sw.js", import.meta.url), "utf8"),
};

test("Modul enthält drei Seiten, sechs große Schrittknöpfe und Reset", () => {
  assert.equal((files.html.match(/class="side-card"/g) ?? []).length, 3);
  assert.equal((files.html.match(/data-side-control/g) ?? []).length, 6);
  assert.match(files.html, /id="inequality-reset"/);
  assert.match(files.css, /\.stepper button[\s\S]*min-height: 62px/);
  assert.match(files.css, /touch-action: manipulation/);
  assert.doesNotMatch(files.html, /type="range"/);
});

test("Statussprache entspricht den drei verbindlichen Zuständen", () => {
  assert.match(files.app, /Dreieck möglich/);
  assert.match(files.app, /Kein echtes Dreieck/);
  assert.match(files.app, /Die drei Punkte liegen auf einer Geraden\./);
  assert.match(files.app, /Kein Dreieck möglich/);
  assert.match(
    files.app,
    /Die beiden kürzeren Seiten sind zusammen zu kurz\./,
  );
});

test("Ungleichung, feste Grundseite, Zirkelbögen und Schnittpunkte sind sichtbar", () => {
  assert.match(files.html, /id="inequality-equation"/);
  assert.match(files.html, /id="left-arc"/);
  assert.match(files.html, /id="right-arc"/);
  assert.match(files.html, /class="base-guide"/);
  assert.match(files.html, /id="intersection-upper"/);
  assert.match(files.html, /id="intersection-lower"/);
  assert.match(files.html, /id="degenerate-line"/);
});

test("Hochformat, Querformat, Klassenraum und kleine Breite besitzen Regeln", () => {
  assert.match(files.html, /viewBox="0 0 800 840"/);
  assert.match(files.css, /@media \(max-width: 900px\)/);
  assert.match(files.css, /@media \(max-width: 520px\)/);
  assert.match(files.css, /@media \(orientation: landscape\)/);
  assert.match(files.css, /font-size: clamp\(2rem, 5vw, 4\.15rem\)/);
});

test("Offline-Cache umfasst beide voneinander getrennten Module", () => {
  for (const file of [
    "index.html",
    "src/app.js",
    "src/geometry.js",
    "dreiecksungleichung.html",
    "triangle-inequality.css",
    "src/triangle-inequality-app.js",
    "src/triangle-inequality-geometry.js",
  ]) {
    assert.match(files.worker, new RegExp(file.replaceAll(".", "\\.")));
  }
  assert.match(files.app, /serviceWorker\.register/);
});

test("neues Modul nutzt keine Speicherung, Analyse oder externen URLs", () => {
  const runtime = `${files.html}\n${files.app}\n${files.geometry}\n${files.worker}`;
  assert.doesNotMatch(runtime, /localStorage|sessionStorage|indexedDB|document\.cookie/);
  assert.doesNotMatch(runtime, /analytics|telemetry|track\(/i);
  assert.doesNotMatch(
    runtime,
    /(?:src|href)=["']https?:\/\/|fetch\(\s*["'`]https?:\/\//,
  );
});
